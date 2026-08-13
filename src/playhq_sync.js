// PlayHQ Integration for Cockburn Lakes F.C. First Goal Scorer
// Scheduled to run every Saturday morning via Cloudflare Worker Cron Trigger (e.g. "0 6 * * 6")

const PLAYHQ_API_BASE = "https://api.playhq.com";

// Configuration for Cockburn Lakes teams (to be populated with real IDs)
const CLUB_TEAMS = {
  "League": "046b90e4",   // B Grade Men
  "Reserves": "5bf15ff7", // B Reserves Men
  "Colts": "a95954ed",    // EGT Drew Banfield Colts
  "Thirds": "696edf4b"    // E2 South Men
};

const ORG_ID = "89b6bccc-ad76-4766-8b96-9f1fc00738ec";
const COMP_ID = "a67f1c0b-a4b9-412c-b3fc-1302e24b437d";

async function fetchPlayHQ(endpoint, apiKey, tenant = "afl") {
  const res = await fetch(`${PLAYHQ_API_BASE}${endpoint}`, {
    headers: {
      "Accept": "application/json",
      "x-api-key": apiKey,
      "x-phq-tenant": tenant
    }
  });
  if (!res.ok) {
    throw new Error(`PlayHQ API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function syncSaturdayGames(env) {
  const apiKey = env.PLAYHQ_API_KEY;
  if (!apiKey) {
    console.warn("PlayHQ API key not configured. Skipping sync.");
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  console.log(`Starting PlayHQ sync for date: ${todayStr}`);

  for (const [grade, teamId] of Object.entries(CLUB_TEAMS)) {
    if (!teamId) {
      console.log(`Skipping ${grade} — team ID not configured.`);
      continue;
    }

    try {
      // 1. Fetch fixture for team
      const fixtureData = await fetchPlayHQ(`/v1/teams/${teamId}/fixture`, apiKey);
      const games = fixtureData.data || [];

      // Find game for today
      const todayGame = games.find(g => g.schedule && g.schedule.date === todayStr);
      if (!todayGame) {
        console.log(`No game found for ${grade} today (${todayStr}).`);
        continue;
      }

      const gameId = todayGame.id;
      const gameDateTime = `${todayGame.schedule.date}T${todayGame.schedule.time}Z`;
      const opposingTeam = todayGame.competitors.find(c => c.id !== teamId)?.name || "Away Team";

      console.log(`Found ${grade} game vs ${opposingTeam} at ${gameDateTime} (Game ID: ${gameId})`);

      // 2. Fetch game summary (team sheet / lineup)
      const summaryData = await fetchPlayHQ(`/v2/games/${gameId}/summary`, apiKey);
      const appearances = summaryData.data?.appearances || [];

      // Filter appearances for Cockburn Lakes team
      const clubAppearances = appearances.filter(a => a.teamId === teamId);
      
      if (clubAppearances.length === 0) {
        console.log(`No player appearances found for ${grade} yet.`);
        continue;
      }

      // 3. Update or insert game in D1
      const existingGame = await env.DB.prepare(`SELECT id FROM games WHERE grade = ? AND game_date_time LIKE ?`)
        .bind(grade, `${todayStr}%`).first();

      let internalGameId;
      if (existingGame) {
        internalGameId = existingGame.id;
        await env.DB.prepare(`UPDATE games SET away_team = ?, game_date_time = ?, status = 'open' WHERE id = ?`)
          .bind(opposingTeam, gameDateTime, internalGameId).run();
      } else {
        internalGameId = crypto.randomUUID();
        // Carry over jackpot
        const lastGame = await env.DB.prepare(
          `SELECT carry_over_amount FROM game_results gr JOIN games g ON g.id = gr.game_id WHERE g.grade = ? ORDER BY gr.created_at DESC LIMIT 1`
        ).bind(grade).first();
        const startingJackpot = lastGame ? lastGame.carry_over_amount : 0;

        await env.DB.prepare(
          `INSERT INTO games (id, grade, home_team, away_team, game_date_time, status, is_mock, starting_jackpot) VALUES (?, ?, 'Cockburn Lakes', ?, ?, 'open', 0, ?)`
        ).bind(internalGameId, grade, opposingTeam, gameDateTime, startingJackpot).run();
      }

      // 4. Update players roster
      // Clear old unspun players for this game or insert new ones
      await env.DB.prepare(`DELETE FROM players WHERE game_id = ? AND removed_from_wheel = 0`).bind(internalGameId).run();

      for (const player of clubAppearances) {
        const playerName = player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : (player.name || "Player");
        await env.DB.prepare(
          `INSERT INTO players (id, name, grade, game_id, is_private, active) VALUES (?, ?, ?, ?, 0, 1)`
        ).bind(crypto.randomUUID(), playerName, grade, internalGameId).run();
      }

      console.log(`Successfully synced ${clubAppearances.length} players for ${grade}.`);

    } catch (e) {
      console.error(`Error syncing grade ${grade}:`, e);
    }
  }
}
