var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/playhq_sync.js
var PLAYHQ_API_BASE = "https://api.playhq.com";
var CLUB_TEAMS = {
  "League": "046b90e4",
  // B Grade Men
  "Reserves": "5bf15ff7",
  // B Reserves Men
  "Colts": "a95954ed",
  // EGT Drew Banfield Colts
  "Thirds": "696edf4b"
  // E2 South Men
};
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
__name(fetchPlayHQ, "fetchPlayHQ");
async function syncSaturdayGames(env) {
  const apiKey = env.PLAYHQ_API_KEY;
  if (!apiKey) {
    console.warn("PlayHQ API key not configured. Skipping sync.");
    return;
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  console.log(`Starting PlayHQ sync for date: ${todayStr}`);
  for (const [grade, teamId] of Object.entries(CLUB_TEAMS)) {
    if (!teamId) {
      console.log(`Skipping ${grade} — team ID not configured.`);
      continue;
    }
    try {
      const fixtureData = await fetchPlayHQ(`/v1/teams/${teamId}/fixture`, apiKey);
      const games = fixtureData.data || [];
      const todayGame = games.find((g) => g.schedule && g.schedule.date === todayStr);
      if (!todayGame) {
        console.log(`No game found for ${grade} today (${todayStr}).`);
        continue;
      }
      const gameId = todayGame.id;
      const gameDateTime = `${todayGame.schedule.date}T${todayGame.schedule.time}Z`;
      const opposingTeam = todayGame.competitors.find((c) => c.id !== teamId)?.name || "Away Team";
      console.log(`Found ${grade} game vs ${opposingTeam} at ${gameDateTime} (Game ID: ${gameId})`);
      const summaryData = await fetchPlayHQ(`/v2/games/${gameId}/summary`, apiKey);
      const appearances = summaryData.data?.appearances || [];
      const clubAppearances = appearances.filter((a) => a.teamId === teamId);
      if (clubAppearances.length === 0) {
        console.log(`No player appearances found for ${grade} yet.`);
        continue;
      }
      const existingGame = await env.DB.prepare(`SELECT id FROM games WHERE grade = ? AND game_date_time LIKE ?`).bind(grade, `${todayStr}%`).first();
      let internalGameId;
      const sundayDeadline = new Date(todayStr);
      sundayDeadline.setDate(sundayDeadline.getDate() + 1);
      sundayDeadline.setHours(12, 0, 0, 0);
      const deadlineISO = sundayDeadline.toISOString();
      if (existingGame) {
        internalGameId = existingGame.id;
        await env.DB.prepare(`UPDATE games SET away_team = ?, game_date_time = ?, payment_deadline_at = ?, status = 'open' WHERE id = ?`).bind(opposingTeam, gameDateTime, deadlineISO, internalGameId).run();
      } else {
        internalGameId = crypto.randomUUID();
        const lastGame = await env.DB.prepare(
          `SELECT carry_over_amount FROM game_results gr JOIN games g ON g.id = gr.game_id WHERE g.grade = ? ORDER BY gr.created_at DESC LIMIT 1`
        ).bind(grade).first();
        const startingJackpot = lastGame ? lastGame.carry_over_amount : 0;
        await env.DB.prepare(
          `INSERT INTO games (id, grade, home_team, away_team, game_date_time, payment_deadline_at, status, is_mock, starting_jackpot) VALUES (?, ?, 'Cockburn Lakes', ?, ?, ?, 'open', 0, ?)`
        ).bind(internalGameId, grade, opposingTeam, gameDateTime, deadlineISO, startingJackpot).run();
      }
      await env.DB.prepare(`DELETE FROM players WHERE game_id = ? AND removed_from_wheel = 0`).bind(internalGameId).run();
      for (const player of clubAppearances) {
        const playerName = player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : player.name || "Player";
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
__name(syncSaturdayGames, "syncSaturdayGames");

// src/worker.js
var ACTIVE_GRADES = ["League", "Reserves", "Colts", "Thirds"];
var ENTRY_FEE = 2;
var PAYID_EMAIL = "playersfund@clfc.com";
var EXPECTED_PLAYERS = 22;
var TESTING_MASTER_PIN = "0000";
var ADMIN_PASSCODE = "clfcgoals2026";
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
__name(json, "json");
function uid() {
  return crypto.randomUUID();
}
__name(uid, "uid");
function secureRandomIndex(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}
__name(secureRandomIndex, "secureRandomIndex");
async function audit(db, event_type, { entity_id = null, participant_id = null, game_id = null, metadata = null } = {}) {
  await db.prepare(`INSERT INTO audit_log (event_type, entity_id, participant_id, game_id, metadata) VALUES (?,?,?,?,?)`).bind(event_type, entity_id, participant_id, game_id, metadata ? JSON.stringify(metadata) : null).run();
}
__name(audit, "audit");
async function mockGetPlayersForGrade(env, grade) {
  const raw = await env.VOTES_KV.get(`gradelist:${grade}`);
  const roster = raw ? JSON.parse(raw) : [];
  const shuffled = [...roster];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(EXPECTED_PLAYERS, shuffled.length));
}
__name(mockGetPlayersForGrade, "mockGetPlayersForGrade");
async function getOrCreateCurrentGame(env, grade) {
  const existing = await env.DB.prepare(
    `SELECT * FROM games WHERE grade = ? AND status != 'closed' ORDER BY created_at DESC LIMIT 1`
  ).bind(grade).first();
  if (existing) return existing;
  const names = await mockGetPlayersForGrade(env, grade);
  if (names.length < EXPECTED_PLAYERS) {
    throw new Error(`Only found ${names.length} players for ${grade} — need ${EXPECTED_PLAYERS}. Not starting a draw with an incomplete list.`);
  }
  const lastGame = await env.DB.prepare(
    `SELECT carry_over_amount FROM game_results gr 
     JOIN games g ON g.id = gr.game_id 
     WHERE g.grade = ? ORDER BY gr.created_at DESC LIMIT 1`
  ).bind(grade).first();
  const startingJackpot = lastGame ? lastGame.carry_over_amount : 0;
  const now = /* @__PURE__ */ new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  sunday.setHours(12, 0, 0, 0);
  const deadlineISO = sunday.toISOString();
  const gameId = uid();
  await env.DB.prepare(
    `INSERT INTO games (id, grade, home_team, away_team, game_date_time, payment_deadline_at, status, is_mock, starting_jackpot) VALUES (?,?,?,?,?,?,'open',1,?)`
  ).bind(gameId, grade, "Cockburn Lakes", "TBC (mock)", (/* @__PURE__ */ new Date()).toISOString(), deadlineISO, startingJackpot).run();
  const stmt = env.DB.prepare(
    `INSERT INTO players (id, name, grade, game_id, is_private, active) VALUES (?,?,?,?,0,1)`
  );
  const batch = names.map((name) => stmt.bind(uid(), name, grade, gameId));
  await env.DB.batch(batch);
  await audit(env.DB, "game_created", { entity_id: gameId, game_id: gameId, metadata: { grade, mock: true, playerCount: names.length } });
  return env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
}
__name(getOrCreateCurrentGame, "getOrCreateCurrentGame");
var worker_default = {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(syncSaturdayGames(env));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/api/auth/pin" && request.method === "POST") {
      const { pin } = await request.json().catch(() => ({}));
      if (!pin || !/^\d{4}$/.test(pin)) return json({ error: "Enter a 4-digit PIN" }, 400);
      if (pin === TESTING_MASTER_PIN) {
        await audit(env.DB, "authentication", { metadata: { mode: "testing_pin" } });
        return json({ ok: true, testingMode: true, voterSlug: null, fullName: null });
      }
      const voterSlug = await env.VOTES_KV.get(`pinused:${pin}`);
      if (!voterSlug) return json({ error: "Incorrect PIN" }, 401);
      const fullName = await env.VOTES_KV.get(`name:${voterSlug}`) || voterSlug;
      await audit(env.DB, "authentication", { metadata: { voterSlug } });
      return json({ ok: true, testingMode: false, voterSlug, fullName });
    }
    if (pathname === "/api/games/check-spin" && request.method === "GET") {
      const grade = url.searchParams.get("grade");
      const voterSlug = url.searchParams.get("voterSlug");
      const fullName = url.searchParams.get("fullName");
      if (!grade) return json({ error: "Grade required" }, 400);
      const game = await env.DB.prepare(
        `SELECT id FROM games WHERE grade = ? AND status != 'closed' ORDER BY created_at DESC LIMIT 1`
      ).bind(grade).first();
      if (!game) return json({ hasSpun: false });
      let hasSpun = false;
      if (voterSlug) {
        const entry = await env.DB.prepare(
          `SELECT e.id FROM entries e JOIN participants p ON p.id = e.participant_id WHERE e.game_id = ? AND p.voter_slug = ?`
        ).bind(game.id, voterSlug).first();
        hasSpun = !!entry;
      } else if (fullName) {
        const entry = await env.DB.prepare(
          `SELECT e.id FROM entries e JOIN participants p ON p.id = e.participant_id WHERE e.game_id = ? AND p.full_name = ?`
        ).bind(game.id, fullName).first();
        hasSpun = !!entry;
      }
      return json({ hasSpun });
    }
    if (pathname === "/api/games/current" && request.method === "GET") {
      const grade = url.searchParams.get("grade");
      if (!grade || !ACTIVE_GRADES.includes(grade)) return json({ error: "Unknown grade" }, 400);
      try {
        const game = await getOrCreateCurrentGame(env, grade);
        if (game.status === "open" && game.game_date_time) {
          const startTime = new Date(game.game_date_time).getTime();
          if (Date.now() >= startTime) {
            await env.DB.prepare(`UPDATE games SET status = 'locked' WHERE id = ?`).bind(game.id).run();
            game.status = "locked";
          }
        }
        const entries = await env.DB.prepare(`SELECT COUNT(*) as count FROM entries WHERE game_id = ?`).bind(game.id).first();
        game.final_prize_pool = entries.count * ENTRY_FEE + (game.starting_jackpot || 0);
        return json({ game });
      } catch (e) {
        return json({ error: e.message }, 503);
      }
    }
    if (pathname.match(/^\/api\/games\/[^/]+\/players$/) && request.method === "GET") {
      const gameId = pathname.split("/")[3];
      const { results } = await env.DB.prepare(
        `SELECT id, name, is_private FROM players WHERE game_id = ? AND removed_from_wheel = 0 ORDER BY name`
      ).bind(gameId).all();
      return json({ players: results });
    }
    if (pathname.match(/^\/api\/games\/[^/]+\/entries$/) && request.method === "POST") {
      const gameId = pathname.split("/")[3];
      const body = await request.json().catch(() => null);
      if (!body) return json({ error: "Invalid request" }, 400);
      const { fullName, voterSlug, pin } = body;
      if (!fullName || !fullName.trim()) return json({ error: "Name is required" }, 400);
      let confirmedSlug = null;
      if (pin === TESTING_MASTER_PIN) {
        confirmedSlug = null;
      } else if (pin) {
        confirmedSlug = await env.VOTES_KV.get(`pinused:${pin}`);
        if (!confirmedSlug) return json({ error: "PIN could not be re-verified" }, 401);
      } else {
        return json({ error: "PIN is required" }, 400);
      }
      const game = await env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
      if (!game) return json({ error: "Draw not found" }, 404);
      if (game.status !== "open") return json({ error: "This draw is not open for spins" }, 403);
      let participant;
      if (confirmedSlug) {
        participant = await env.DB.prepare(`SELECT * FROM participants WHERE voter_slug = ?`).bind(confirmedSlug).first();
      } else {
        participant = await env.DB.prepare(`SELECT * FROM participants WHERE full_name = ? AND voter_slug IS NULL`).bind(fullName.trim()).first();
      }
      if (!participant) {
        const pid = uid();
        await env.DB.prepare(`INSERT INTO participants (id, full_name, voter_slug) VALUES (?,?,?)`).bind(pid, fullName.trim(), confirmedSlug).run();
        participant = { id: pid, full_name: fullName.trim(), voter_slug: confirmedSlug };
      }
      const already = await env.DB.prepare(`SELECT * FROM entries WHERE game_id = ? AND participant_id = ?`).bind(gameId, participant.id).first();
      if (already) return json({ error: "You've already spun for this grade." }, 409);
      let finalPlayer = null;
      let secondChances = 0;
      for (let attempt = 0; attempt < 30; attempt++) {
        const { results: pool } = await env.DB.prepare(
          `SELECT * FROM players WHERE game_id = ? AND removed_from_wheel = 0`
        ).bind(gameId).all();
        if (pool.length === 0) return json({ error: "No players remain in this draw." }, 409);
        const idx = secureRandomIndex(pool.length);
        const picked = pool[idx];
        if (picked.is_private) {
          await env.DB.prepare(`UPDATE players SET removed_from_wheel = 1 WHERE id = ?`).bind(picked.id).run();
          await audit(env.DB, "private_player_second_chance", { entity_id: picked.id, participant_id: participant.id, game_id: gameId });
          secondChances++;
          continue;
        }
        finalPlayer = picked;
        break;
      }
      if (!finalPlayer) return json({ error: "Could not resolve a valid pick — try again." }, 500);
      await env.DB.prepare(`UPDATE players SET removed_from_wheel = 1 WHERE id = ?`).bind(finalPlayer.id).run();
      const entryId = uid();
      await env.DB.prepare(
        `INSERT INTO entries (id, game_id, participant_id, player_id, entry_fee, payment_status, spin_completed_at)
         VALUES (?,?,?,?,?,'pending', datetime('now'))`
      ).bind(entryId, gameId, participant.id, finalPlayer.id, ENTRY_FEE).run();
      await audit(env.DB, "entry_created", {
        entity_id: entryId,
        participant_id: participant.id,
        game_id: gameId,
        metadata: { player: finalPlayer.name, secondChances }
      });
      return json({
        entryId,
        player: { name: finalPlayer.name },
        secondChances,
        entryFee: ENTRY_FEE,
        payIdEmail: PAYID_EMAIL,
        message: "This selection is final and cannot be changed."
      });
    }
    if (pathname.match(/^\/api\/games\/[^/]+\/entries$/) && request.method === "GET") {
      const gameId = pathname.split("/")[3];
      const { results: entries } = await env.DB.prepare(
        `SELECT e.id, p.full_name AS participant, pl.name AS player, e.payment_status, e.created_at
         FROM entries e
         JOIN participants p ON p.id = e.participant_id
         JOIN players pl ON pl.id = e.player_id
         WHERE e.game_id = ?
         ORDER BY e.created_at DESC`
      ).bind(gameId).all();
      const gameResult = await env.DB.prepare(`
        SELECT gr.*, p.full_name as winner_name, pl.name as player_name
        FROM game_results gr
        LEFT JOIN entries e ON e.id = gr.winner_entry_id
        LEFT JOIN participants p ON p.id = e.participant_id
        LEFT JOIN players pl ON pl.id = gr.winning_player_id
        WHERE gr.game_id = ?
      `).bind(gameId).first();
      return json({ entries, gameResult });
    }
    if (pathname.match(/^\/api\/entries\/[^/]+\/payment-reported$/) && request.method === "POST") {
      const entryId = pathname.split("/")[3];
      await env.DB.prepare(`UPDATE entries SET payment_reported_at = datetime('now') WHERE id = ?`).bind(entryId).run();
      await audit(env.DB, "payment_reported", { entity_id: entryId });
      return json({ ok: true, message: "Thanks — an admin will confirm your payment." });
    }
    if (pathname === "/api/admin/auth" && request.method === "POST") {
      const { passcode } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      return json({ ok: true });
    }
    if (pathname === "/api/admin/dashboard" && request.method === "GET") {
      const passcode = url.searchParams.get("passcode");
      const grade = url.searchParams.get("grade");
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      const expiredGames = await env.DB.prepare(
        `SELECT g.id, g.grade, gr.total_prize_pool 
         FROM games g 
         JOIN game_results gr ON g.id = gr.game_id 
         WHERE g.status = 'locked' AND g.payment_deadline_at < datetime('now') 
         AND gr.is_jackpot = 0 AND (SELECT payment_status FROM entries WHERE id = gr.winner_entry_id) = 'pending'`
      ).all();
      for (const g of expiredGames.results || []) {
        await env.DB.prepare(`UPDATE game_results SET is_jackpot = 1, carry_over_amount = total_prize_pool WHERE game_id = ?`).bind(g.id).run();
        await env.DB.prepare(`UPDATE games SET result_status = 'jackpot' WHERE id = ?`).bind(g.id).run();
        await audit(env.DB, "deadline_jackpot", { game_id: g.id, metadata: { reason: "payment_deadline_expired" } });
      }
      let query = `
        SELECT g.*, 
               (SELECT COUNT(*) FROM entries WHERE game_id = g.id) as total_bets,
               (SELECT COUNT(*) * entry_fee FROM entries WHERE game_id = g.id) + starting_jackpot as total_amount
        FROM games g 
        WHERE status != 'closed' 
      `;
      let params = [];
      if (grade) {
        query += ` AND grade = ? `;
        params.push(grade);
      }
      query += ` ORDER BY created_at DESC LIMIT 1`;
      const game = await env.DB.prepare(query).bind(...params).first();
      if (!game) return json({ error: "No active game found" }, 404);
      const { results: players } = await env.DB.prepare(`
        SELECT id, name FROM players WHERE game_id = ? ORDER BY name ASC
      `).bind(game.id).all();
      const { results: entries } = await env.DB.prepare(`
        SELECT e.id, p.full_name AS participant, pl.name AS player, e.payment_status
        FROM entries e
        JOIN participants p ON p.id = e.participant_id
        JOIN players pl ON pl.id = e.player_id
        WHERE e.game_id = ?
        ORDER BY e.created_at DESC
      `).bind(game.id).all();
      const result = await env.DB.prepare(`
        SELECT gr.*, pl.name as player_name, p.full_name as winner_name
        FROM game_results gr
        JOIN players pl ON pl.id = gr.winning_player_id
        LEFT JOIN entries e ON e.id = gr.winner_entry_id
        LEFT JOIN participants p ON p.id = e.participant_id
        WHERE gr.game_id = ?
      `).bind(game.id).first();
      return json({ game, players, entries, result });
    }
    if (pathname === "/api/admin/confirm-result" && request.method === "POST") {
      const { passcode, gameId, playerId } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      if (!gameId || !playerId) return json({ error: "Missing gameId or playerId" }, 400);
      const game = await env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
      if (!game) return json({ error: "Game not found" }, 404);
      if (game.status === "closed") return json({ error: "Game already closed" }, 400);
      const existingResult = await env.DB.prepare(`SELECT id FROM game_results WHERE game_id = ?`).bind(gameId).first();
      if (existingResult) return json({ error: "Result already confirmed for this game" }, 400);
      const { results: entries } = await env.DB.prepare(`SELECT * FROM entries WHERE game_id = ?`).bind(gameId).all();
      const totalAmount = entries.reduce((sum, e) => sum + e.entry_fee, 0) + (game.starting_jackpot || 0);
      const winnerEntry = entries.find((e) => e.player_id === playerId);
      const isJackpot = !winnerEntry;
      const resultId = uid();
      await env.DB.prepare(`
        INSERT INTO game_results (id, game_id, winning_player_id, winner_entry_id, total_prize_pool, is_jackpot, carry_over_amount, confirmed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'admin')
      `).bind(
        resultId,
        gameId,
        playerId,
        winnerEntry ? winnerEntry.id : null,
        totalAmount,
        isJackpot ? 1 : 0,
        isJackpot ? totalAmount : 0
      ).run();
      await env.DB.prepare(`
        UPDATE games SET 
          status = 'locked', 
          winning_player_id = ?, 
          final_prize_pool = ?, 
          result_status = ? 
        WHERE id = ?
      `).bind(playerId, totalAmount, isJackpot ? "jackpot" : "result_set", gameId).run();
      await audit(env.DB, "result_confirmed", {
        entity_id: resultId,
        game_id: gameId,
        metadata: { playerId, isJackpot, totalAmount }
      });
      return json({ ok: true });
    }
    if (pathname === "/api/admin/toggle-payment" && request.method === "POST") {
      const { entryId, passcode, status } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      if (!entryId || !status) return json({ error: "Missing entryId or status" }, 400);
      await env.DB.prepare(`UPDATE entries SET payment_status = ? WHERE id = ?`).bind(status, entryId).run();
      await audit(env.DB, "payment_status_toggled", { entity_id: entryId, metadata: { status } });
      return json({ ok: true });
    }
    return new Response(INDEX_HTML_CONTENT, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, must-revalidate"
      }
    });
  }
};
var INDEX_HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CLFC First Goal Scorer</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;600;700&family=Work+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --navy:#132a6e; --navy-deep:#0b1c4d; --red:#d62828; --blue:#1d4fd8; --gold:#f2b134;
    --ink:#14161c; --paper:#f6f3ec; --line:rgba(20,22,28,.14);
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{
    font-family:'Work Sans', sans-serif; color:#fff; min-height:100vh;
    background:linear-gradient(180deg, var(--navy-deep) 0%, #0d234f 40%, #123267 100%);
  }
  .wrap{max-width:520px;margin:0 auto;padding:24px 18px 60px;}
  .eyebrow{
    font-family:'JetBrains Mono',monospace;letter-spacing:.2em;text-transform:uppercase;
    font-size:11px;color:var(--gold);text-align:center;margin:0 0 6px;
  }
  h1.title{
    font-family:'Anton',sans-serif;text-transform:uppercase;text-align:center;
    font-size:clamp(26px,7vw,38px);margin:0 0 6px;line-height:1;
  }
  .subtitle{text-align:center;font-size:13.5px;color:rgba(255,255,255,.75);margin:0 0 26px;}
  .info-banner{
    background:#fffbeb;border:2px solid var(--gold);border-radius:14px;
    padding:16px 16px;margin-bottom:16px;color:var(--ink);
  }
  .info-banner-title{
    font-family:'JetBrains Mono',monospace;font-weight:800;letter-spacing:.04em;text-transform:uppercase;
    font-size:12px;color:#92400e;margin-bottom:8px;
  }
  .info-banner p{margin:0 0 8px;font-size:13px;line-height:1.5;color:#3a3320;}
  .info-banner p:last-child{margin-bottom:0;}
  .info-banner strong{color:var(--navy);}

  .card{
    background:var(--paper);border-radius:16px;padding:24px 20px;color:var(--ink);
    box-shadow:0 18px 40px rgba(0,0,0,.35);
  }
  label{display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--navy);margin:14px 0 6px;}
  input[type=text],input[type=tel],input[type=password],select{
    width:100%;font-size:17px;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;
    background:#fff;color:var(--ink);text-align:center;
  }
  input[type=text],input[type=tel]{letter-spacing:2px;}
  input#nameInput, input#playerSearch{letter-spacing:normal;text-align:left;font-size:16px;}
  button.primary{
    width:100%;margin-top:18px;font-family:'JetBrains Mono',monospace;font-weight:700;
    letter-spacing:.04em;text-transform:uppercase;background:var(--red);color:#fff;border:none;
    border-radius:10px;padding:14px;font-size:14.5px;cursor:pointer;box-shadow:0 6px 0 #9c1c1c;
  }
  button.primary:active{transform:translateY(3px);box-shadow:0 3px 0 #9c1c1c;}
  button.primary:disabled{opacity:.5;cursor:not-allowed;}
  .error{color:var(--red);font-size:13.5px;font-weight:600;margin-top:12px;text-align:center;}
  .muted{color:#5a5a5a;font-size:13px;text-align:center;margin-top:10px;}

  .grade-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;}
  .grade-btn{
    background:var(--navy);color:#fff;border:none;border-radius:12px;padding:20px 10px;
    font-family:'Anton',sans-serif;text-transform:uppercase;font-size:17px;cursor:pointer;
  }
  .grade-btn:active{transform:scale(.97);}
  .grade-btn:disabled{background:#ccc;opacity:0.6;cursor:not-allowed;}
  .grade-btn-spun{background:#5a6478;}

  .locked-note{background:#fffbeb;border:2px solid var(--gold);border-radius:10px;padding:12px 14px;font-size:13.5px;line-height:1.5;color:#3a3320;}
  .pot-box{background:var(--navy);border-radius:12px;padding:18px;text-align:center;margin-top:16px;}
  .pot-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.7);}
  .pot-amount{font-family:'Anton',sans-serif;font-size:38px;color:var(--gold);margin:6px 0;}
  .pot-sub{font-size:12px;color:rgba(255,255,255,.65);}

  .spin-meta{background:#fff;border:1.5px solid var(--line);border-radius:10px;padding:12px 14px;margin:14px 0;font-size:14px;}
  .spin-meta div{display:flex;justify-content:space-between;padding:3px 0;}
  .spin-meta b{color:var(--navy);}

  .wheel-wrap{position:relative;width:min(84vw,340px);aspect-ratio:1;margin:20px auto 0;}
  .wheel-wrap canvas{width:100%;height:100%;border-radius:50%;box-shadow:0 0 0 6px var(--navy),0 12px 30px rgba(0,0,0,.35);}
  .wheel-wrap .pointer{
    position:absolute;top:-16px;left:50%;transform:translateX(-50%);width:0;height:0;
    border-left:16px solid transparent;border-right:16px solid transparent;border-top:30px solid var(--red);
    z-index:5;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4));
  }

  .result-box{text-align:center;margin-top:20px;}
  .result-box .big-tick{font-size:44px;color:#1c7a3d;}
  .result-box h2{font-family:'Anton',sans-serif;text-transform:uppercase;margin:6px 0 4px;font-size:22px;color:var(--navy);}
  .result-box .player-name{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:30px;color:var(--red);margin:6px 0 14px;}
  .final-note{font-size:12.5px;color:#8a8370;font-style:italic;margin-top:10px;}

  .pay-box{background:var(--paper);border:2px solid var(--gold);border-radius:12px;padding:16px;margin-top:16px;}
  .pay-box h3{margin:0 0 8px;font-family:'Anton',sans-serif;text-transform:uppercase;font-size:16px;color:var(--navy);}
  .pay-box .payid{font-family:'JetBrains Mono',monospace;font-size:15px;background:#fff;padding:8px 10px;border-radius:8px;display:inline-block;margin:6px 0;}

  .results-title{
    font-family:'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;
    font-size:12px;color:rgba(255,255,255,.7);margin:26px 0 10px;text-align:center;
  }
  table.results{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;font-size:13px;color:var(--ink);}
  table.results th{
    text-align:left;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.05em;text-transform:uppercase;
    color:#6b6455;border-bottom:2px solid var(--navy);padding:8px 8px;background:var(--paper);
  }
  table.results td{padding:8px;border-bottom:1px solid var(--line);}
  .pay-pending{color:var(--red);font-weight:700;font-size:11px;text-transform:uppercase;}
  .pay-paid{color:#1c7a3d;font-weight:700;font-size:11px;text-transform:uppercase;}
  .back-link{
    display:inline-block;margin-top:18px;font-family:'JetBrains Mono',monospace;font-size:12px;
    color:rgba(255,255,255,.7);text-decoration:none;text-align:center;
    cursor:pointer;
  }
  .center{text-align:center;}

  /* Winner/Jackpot Styles */
  .winner-banner{background:#1c7a3d;color:#fff;padding:12px;border-radius:10px;margin-bottom:16px;text-align:center;}
  .jackpot-banner{background:var(--gold);color:var(--navy);padding:12px;border-radius:10px;margin-bottom:16px;text-align:center;}
  .banner-title{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:20px;margin-bottom:4px;}
  .winner-row{background:#e8f5e9 !important;font-weight:700;}
  
  .locked-icon{font-size:40px;margin-bottom:10px;}
  .win-amount{font-family:'Anton',sans-serif;font-size:32px;color:var(--gold);margin:10px 0;}

  /* Admin Styles */
  .admin-login-link{
    position:fixed;bottom:10px;right:10px;font-size:10px;color:rgba(255,255,255,.3);
    text-decoration:none;font-family:'JetBrains Mono',monospace;
  }
  .admin-dashboard .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
  .admin-dashboard .stat-card{background:#fff;padding:12px;border-radius:10px;text-align:center;border:1px solid var(--line);}
  .admin-dashboard .stat-label{font-size:10px;text-transform:uppercase;color:#666;margin-bottom:4px;}
  .admin-dashboard .stat-value{font-family:'Anton',sans-serif;font-size:18px;color:var(--navy);}
  .player-select-wrap{position:relative;}
  .player-results-list{
    position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid var(--line);
    max-height:200px;overflow-y:auto;z-index:100;border-radius:0 0 10px 10px;display:none;
  }
  .player-result-item{padding:10px;cursor:pointer;border-bottom:1px solid var(--line);color:var(--ink);}
  .player-result-item:hover{background:var(--paper);}
  
  .btn-toggle{
    font-size:9px; padding:4px 8px; border-radius:6px; border:1px solid var(--line);
    background:var(--paper); color:var(--navy); cursor:pointer; font-weight:700;
    text-transform:uppercase; margin-top:4px; display:block;
  }
  .btn-toggle:hover{background:#eee;}
</style>
</head>
<body>
<div class="wrap" id="app"></div>
<a href="#" class="admin-login-link" id="adminLoginLink">ADMIN</a>

<script>
const app = document.getElementById("app");
const STORAGE_KEY = "clfc_fgs_session";
const ADMIN_KEY = "clfc_fgs_admin_pass";
let currentAdminGrade = "League";
let activePollInterval = null;

function heroHTML(sub){
  return \`
    <p class="eyebrow">Cockburn Lakes F.C.</p>
    <h1 class="title">First Goal Scorer</h1>
    <p class="subtitle">\${sub}</p>
  \`;
}

function getSession(){
  try{ return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"); }catch(e){ return null; }
}
function setSession(s){ sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

async function main(){
  const session = getSession();
  if (session && session.grade && session.gameId){
    renderGradeSpin(session.grade, session.gameId, session);
    return;
  }
  renderPinScreen();
}

// ---------------- Step 1: PIN ----------------
function renderPinScreen(){
  app.innerHTML = \`
    \${heroHTML("Enter your PIN to get started")}
    <div class="info-banner">
      <div class="info-banner-title">⚠ Testing mode</div>
      <p>The PIN is currently <strong>0000</strong> for testing. In future, your PIN will be the same one you use for Player's Player voting and for this app.</p>
      <p>You get <strong>1 spin per grade</strong>. After spinning, you're locked out of that grade until the next round opens.</p>
      <p>Any <strong>unpaid entry locks you out</strong> of all future spins until an admin confirms your payment.</p>
    </div>
    <div class="card">
      <label for="pinInput">Your PIN</label>
      <input type="tel" id="pinInput" inputmode="numeric" maxlength="4" placeholder="••••">
      <button class="primary" id="pinBtn">Continue</button>
      <div id="pinError"></div>
    </div>
  \`;
  const btn = document.getElementById("pinBtn");
  btn.addEventListener("click", async ()=>{
    const pin = document.getElementById("pinInput").value.trim();
    const errBox = document.getElementById("pinError");
    errBox.innerHTML = "";
    if (!/^\\d{4}$/.test(pin)){ errBox.innerHTML = \`<p class="error">Enter a 4-digit PIN.</p>\`; return; }
    btn.disabled = true;
    try{
      const res = await fetch("/api/auth/pin", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ pin }) });
      const data = await res.json();
      if (!res.ok){ errBox.innerHTML = \`<p class="error">\${data.error}</p>\`; btn.disabled = false; return; }
      setSession({ pin, voterSlug: data.voterSlug, fullName: data.fullName, testingMode: data.testingMode });
      if (data.fullName){
        const session = getSession();
        session.fullName = data.fullName;
        setSession(session);
        renderGradeSelect();
      } else {
        renderNameScreen(data);
      }
    }catch(e){
      errBox.innerHTML = \`<p class="error">Network error — try again.</p>\`;
      btn.disabled = false;
    }
  });
}

// ---------------- Step 2: name ----------------
function renderNameScreen(auth){
  const known = !!auth.fullName;
  app.innerHTML = \`
    \${heroHTML("Your Name")}
    <div class="info-banner">
      <div class="info-banner-title">Testing Phase Info</div>
      <p>In future, only your PIN will be required as it will be linked to your name.</p>
    </div>
    <div class="card">
      <label for="nameInput">Full name</label>
      <input type="text" id="nameInput" value="\${known ? auth.fullName : ""}" placeholder="Your full name">
      <button class="primary" id="nameBtn">Continue</button>
      <div id="nameError"></div>
    </div>
  \`;
  document.getElementById("nameBtn").addEventListener("click", ()=>{
    const name = document.getElementById("nameInput").value.trim();
    const errBox = document.getElementById("nameError");
    if (!name){ errBox.innerHTML = \`<p class="error">Name can't be blank.</p>\`; return; }
    const session = getSession();
    session.fullName = name;
    setSession(session);
    renderGradeSelect();
  });
}

// ---------------- Step 3: grade ----------------
async function renderGradeSelect(){
  const grades = ["League","Reserves","Colts","Thirds"];
  const session = getSession();
  
  app.innerHTML = \`
    \${heroHTML("Pick your grade")}
    <div class="card">
      <div class="grade-grid">
        \${grades.map(g=>\`<button class="grade-btn" id="btn-\${g}" data-grade="\${g}">\${g}</button>\`).join("")}
      </div>
      <p class="muted" id="gradeStatus"></p>
    </div>
  \`;
  
  // Check spin status for each grade
  const spunGrades = {};
  for(const g of grades) {
    try {
        const res = await fetch(\`/api/games/check-spin?grade=\${g}&voterSlug=\${session.voterSlug || ""}&fullName=\${session.fullName || ""}\`);
        const data = await res.json();
        if (data.hasSpun) {
            spunGrades[g] = true;
            const btn = document.getElementById(\`btn-\${g}\`);
            btn.classList.add("grade-btn-spun");
            btn.innerHTML += "<br><span style='font-size:10px;'>SPUN — view results</span>";
        }
    } catch(e) {}
  }

  document.querySelectorAll(".grade-btn").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const grade = btn.dataset.grade;
      if (spunGrades[grade]) {
        renderLockedOutSummary(grade, session);
        return;
      }
      const statusEl = document.getElementById("gradeStatus");
      statusEl.textContent = "Loading players...";
      try{
        const res = await fetch(\`/api/games/current?grade=\${grade}\`);
        const data = await res.json();
        if (!res.ok){ statusEl.textContent = data.error; return; }
        const session = getSession();
        session.grade = grade;
        session.gameId = data.game.id;
        setSession(session);
        renderGradeSpin(grade, data.game.id, session);
      }catch(e){
        statusEl.textContent = "Network error — try again.";
      }
    });
  });
}

// ---------------- Locked-out summary: shown when a grade is already SPUN ----------------
async function renderLockedOutSummary(grade, session){
  app.innerHTML = \`\${heroHTML(grade + " — you've already spun")}<div class="card"><p class="muted">Loading...</p></div>\`;

  try{
    const gameRes = await fetch(\`/api/games/current?grade=\${grade}\`);
    const gameData = await gameRes.json();
    const game = gameData.game;
    const winningAmount = (game.final_prize_pool || 0);

    const entriesRes = await fetch(\`/api/games/\${game.id}/entries\`);
    const entriesData = await entriesRes.json();
    const entries = entriesData.entries || [];

    app.innerHTML = \`
      \${heroHTML(grade + " — you've already spun")}
      <div class="card">
        <div class="locked-note">
          You've already spun for <strong>\${grade}</strong> this round — you're locked out of this grade until the next round opens.
        </div>
        <div class="pot-box">
          <div class="pot-label">Current winning amount</div>
          <div class="pot-amount">$\${winningAmount.toFixed(2)}</div>
          <div class="pot-sub">From \${entries.length} \${entries.length === 1 ? 'entry' : 'entries'} — winner is whoever's player scores first</div>
        </div>
        <div class="results-title" style="color:var(--navy);margin-top:20px;">All spins — \${grade}</div>
        <table class="results" id="lockedResultsTable">
          <thead><tr><th>Participant</th><th>Player</th><th>Payment</th></tr></thead>
          <tbody>
            \${entries.map(e=>\`
              <tr>
                <td>\${e.participant}</td>
                <td>\${e.player}</td>
                <td><span class="\${e.payment_status==='paid'?'pay-paid':'pay-pending'}">\${e.payment_status}</span></td>
              </tr>
            \`).join("")}
          </tbody>
        </table>
        <button class="primary" id="backToGradesBtn" style="margin-top:18px;background:var(--navy);box-shadow:0 6px 0 var(--navy-deep);">Back to grades</button>
      </div>
    \`;
    document.getElementById("backToGradesBtn").addEventListener("click", ()=> renderGradeSelect());
  }catch(e){
    app.innerHTML = \`\${heroHTML(grade)}<div class="card"><p class="error">Could not load results — try again.</p></div>\`;
  }
}

// ---------------- Step 4: wheel + spin ----------------
async function renderGradeSpin(grade, gameId, session){
  app.innerHTML = \`\${heroHTML("Loading wheel...")}\`;
  const playersRes = await fetch(\`/api/games/\${gameId}/players\`).then(r=>r.json());
  const players = playersRes.players || [];
  
  const gameRes = await fetch(\`/api/games/current?grade=\${grade}\`).then(r=>r.json());
  const game = gameRes.game;
  const isLocked = game.status === 'locked';

  app.innerHTML = \`
    \${heroHTML(grade + (isLocked ? " — Locked" : " — spin to find your player"))}
    <div id="resultBannerArea"></div>
    <div class="card">
      \${isLocked ? \`
        <div class="center">
          <div class="locked-icon">🔒</div>
          <h2>Game Locked</h2>
          <div class="win-amount">TO WIN: $\${(game.final_prize_pool || 0).toFixed(2)}</div>
        </div>
      \` : \`
        <div class="spin-meta">
          <div><span>Your name</span><b>\${session.fullName}</b></div>
          <div><span>Grade</span><b>\${grade}</b></div>
          <div><span>Players remaining</span><b id="playersRemaining">\${players.length}</b></div>
        </div>
        <div class="wheel-wrap">
          <div class="pointer"></div>
          <canvas id="wheelCanvas"></canvas>
        </div>
        <button class="primary" id="spinBtn" style="margin-top:20px;">Spin the wheel</button>
      \`}
      <div id="spinError"></div>
      <div id="resultArea"></div>
    </div>
    <div class="results-title">Live results — \${grade}</div>
    <table class="results" id="resultsTable"><tbody><tr><td class="muted">Loading...</td></tr></tbody></table>
    <div class="center"><a class="back-link" id="startOverLink">Start over</a></div>
  \`;

  document.getElementById("startOverLink").addEventListener("click", ()=>{
    if (activePollInterval) clearInterval(activePollInterval);
    sessionStorage.removeItem(STORAGE_KEY);
    main();
  });

  if (!isLocked) {
    let wheelOptions = players.map(p=>p.name);
    drawWheel(wheelOptions);
    
    document.getElementById("spinBtn").addEventListener("click", async ()=>{
      const btn = document.getElementById("spinBtn");
      const errBox = document.getElementById("spinError");
      btn.disabled = true;
      errBox.innerHTML = "";
      btn.textContent = "Spinning...";
      try{
        const res = await fetch(\`/api/games/\${gameId}/entries\`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ fullName: session.fullName, voterSlug: session.voterSlug, pin: session.pin })
        });
        const data = await res.json();
        if (!res.ok){ errBox.innerHTML = \`<p class="error">\${data.error}</p>\`; btn.textContent = "Spin the wheel"; btn.disabled = false; return; }
        
        const targetPlayer = data.player.name;
        const targetIndex = wheelOptions.indexOf(targetPlayer);
        
        await spinWheel(targetIndex, wheelOptions.length);
        
        setTimeout(() => {
          renderResult(data);
          pollResults(gameId);
        }, 800);
      }catch(e){
        errBox.innerHTML = \`<p class="error">Network error — try again.</p>\`;
        btn.textContent = "Spin the wheel";
        btn.disabled = false;
      }
    });
  }

  pollResults(gameId);
  if (activePollInterval) clearInterval(activePollInterval);
  activePollInterval = setInterval(()=>pollResults(gameId), 6000);
}

function renderResult(data){
  const area = document.getElementById("resultArea");
  area.innerHTML = \`
    <div class="result-box">
      <div class="big-tick">✓</div>
      <h2>You got</h2>
      <div class="player-name">\${data.player.name}</div>
      <div class="pay-box">
        <h3>To confirm entry, Pay $\${data.entryFee}</h3>
        <p>Pay via PayID to:</p>
        <div class="payid">\${data.payIdEmail}</div>
        <p>Use <strong>\${data.player.name}</strong> as reference.</p>
        <button class="primary" id="paidBtn" style="background:var(--blue);box-shadow:0 6px 0 #123597;">I've Paid</button>
      </div>
      <p class="final-note">\${data.message}</p>
    </div>
  \`;
  document.getElementById("paidBtn").addEventListener("click", async ()=>{
    const btn = document.getElementById("paidBtn");
    btn.disabled = true;
    btn.textContent = "Reporting...";
    await fetch(\`/api/entries/\${data.entryId}/payment-reported\`, { method:"POST" });
    btn.textContent = "Reported!";
    btn.style.background = "#1c7a3d";
    btn.style.boxShadow = "0 6px 0 #114d26";
  });
}

async function pollResults(gameId){
  try{
    const res = await fetch(\`/api/games/\${gameId}/entries\`);
    const data = await res.json();
    const table = document.getElementById("resultsTable");
    const bannerArea = document.getElementById("resultBannerArea");
    
    if (data.gameResult){
      if (data.gameResult.is_jackpot){
        bannerArea.innerHTML = \`<div class="jackpot-banner"><div class="banner-title">JACKPOT!</div>No one picked the winner. $\${data.gameResult.carry_over_amount.toFixed(2)} carries over.</div>\`;
      } else {
        bannerArea.innerHTML = \`<div class="winner-banner"><div class="banner-title">WINNER!</div>\${data.gameResult.winner_name} wins with \${data.gameResult.player_name}!</div>\`;
      }
    } else {
      bannerArea.innerHTML = "";
    }

    if (!data.entries || data.entries.length === 0){
      table.innerHTML = \`<tbody><tr><td class="muted">No entries yet.</td></tr></tbody>\`;
      return;
    }

    let html = \`<thead><tr><th>Participant</th><th>Player</th><th>Payment</th></tr></thead><tbody>\`;
    data.entries.forEach(e=>{
      const isWinner = data.gameResult && e.id === data.gameResult.winner_entry_id;
      html += \`<tr class="\${isWinner ? 'winner-row' : ''}">
        <td>\${e.participant}</td>
        <td>\${e.player}</td>
        <td><span class="pay-\${e.payment_status}">\${e.payment_status}</span></td>
      </tr>\`;
    });
    html += \`</tbody>\`;
    table.innerHTML = html;
  }catch(e){}
}

let wheelRotation = 0;
function drawWheel(options){
  const canvas = document.getElementById("wheelCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width = 800, h = canvas.height = 800;
  const cx = w/2, cy = h/2, rad = w/2 - 10;
  const slice = (Math.PI*2)/options.length;

  ctx.clearRect(0,0,w,h);
  options.forEach((opt, i)=>{
    const ang = i*slice;
    ctx.beginPath();
    ctx.fillStyle = i%2===0 ? "#132a6e" : "#1d4fd8";
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,rad,ang,ang+slice);
    ctx.fill();

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(ang + slice/2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px 'JetBrains Mono'";
    ctx.fillText(opt, rad-30, 8);
    ctx.restore();
  });
}

function spinWheel(targetIndex, totalOptions){
  return new Promise(resolve=>{
    const canvas = document.getElementById("wheelCanvas");
    const sliceDeg = 360 / totalOptions;
    const targetDeg = 360 - (targetIndex * sliceDeg) - (sliceDeg/2);
    const rotations = 10 + Math.floor(Math.random()*4);
    const finalDeg = wheelRotation + rotations*360 + ((targetDeg - (wheelRotation%360)) + 360)%360;
    const start = performance.now(), duration = 7500, startDeg = wheelRotation;
    function frame(t){
      const elapsed = t-start, progress = Math.min(elapsed/duration,1);
      const eased = 1 - Math.pow(1-progress,4);
      wheelRotation = startDeg + (finalDeg-startDeg)*eased;
      canvas.style.transform = \`rotate(\${wheelRotation}deg)\`;
      if (progress<1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

// ---------------- Admin Logic ----------------
document.getElementById("adminLoginLink").addEventListener("click", (e)=>{
  e.preventDefault();
  const pass = prompt("Admin Passcode:");
  if (pass === "clfcgoals2026") {
    localStorage.setItem(ADMIN_KEY, pass);
    renderAdminDashboard();
  }
});

async function renderAdminDashboard(){
  const pass = localStorage.getItem(ADMIN_KEY);
  if (!pass) return;
  
  app.innerHTML = \`\${heroHTML("Admin Dashboard")} <div class="center"><p>Loading...</p></div>\`;
  
  try {
    const res = await fetch(\`/api/admin/dashboard?passcode=\${pass}&grade=\${currentAdminGrade}\`);
    const data = await res.json();
    if (!res.ok) { alert(data.error); renderPinScreen(); return; }

    app.innerHTML = \`
      \${heroHTML("Admin Dashboard")}
      <div class="card admin-dashboard">
        <label>Select Grade</label>
        <select id="adminGradeSelect" style="margin-bottom:16px;">
          <option value="League" \${currentAdminGrade==='League'?'selected':''}>League</option>
          <option value="Reserves" \${currentAdminGrade==='Reserves'?'selected':''}>Reserves</option>
          <option value="Colts" \${currentAdminGrade==='Colts'?'selected':''}>Colts</option>
          <option value="Thirds" \${currentAdminGrade==='Thirds'?'selected':''}>Thirds</option>
        </select>

        <div class="stat-grid">
          <div class="stat-card"><div class="stat-label">Grade</div><div class="stat-value">\${currentAdminGrade}</div></div>
          <div class="stat-card"><div class="stat-label">Prize Pool</div><div class="stat-value">$\${(data.game.total_amount || 0).toFixed(2)}</div></div>
        </div>
        <div class="stat-card" style="margin-bottom:16px;">
          <div class="stat-label">Payment Deadline</div>
          <div class="stat-value" style="font-size:14px;">\${data.game.payment_deadline_at ? new Date(data.game.payment_deadline_at).toLocaleString() : 'N/A'}</div>
        </div>

        \${data.result ? \`
          <div class="winner-banner">Result: \${data.result.player_name} (\${data.result.winner_name || 'JACKPOT'})</div>
        \` : \`
          <label>Enter First Goal Scorer</label>
          <div class="player-select-wrap">
            <input type="text" id="playerSearch" placeholder="Search player name...">
            <div id="playerList" class="player-results-list"></div>
          </div>
          <button class="primary" id="confirmResultBtn" disabled>Confirm Result</button>
        \`}

        <h3 style="margin-top:24px; font-family:'Anton'; text-transform:uppercase; color:var(--navy);">Manage Payments</h3>
        <table class="results" style="margin-top:10px;">
          <thead><tr><th>Name</th><th>Player</th><th>Status</th></tr></thead>
          <tbody>
            \${data.entries.map(e => \`
              <tr>
                <td>\${e.participant}</td>
                <td>\${e.player}</td>
                <td>
                  <span class="pay-\${e.payment_status}">\${e.payment_status}</span>
                  <button class="btn-toggle" onclick="togglePayment('\${e.id}', '\${e.payment_status==='paid'?'pending':'paid'}')">
                    Mark as \${e.payment_status==='paid'?'PENDING':'PAID'}
                  </button>
                </td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
        
        <div class="center"><a class="back-link" id="adminLogout">Logout</a></div>
      </div>
    \`;

    document.getElementById("adminGradeSelect").addEventListener("change", (e) => {
      currentAdminGrade = e.target.value;
      renderAdminDashboard();
    });

    document.getElementById("adminLogout").addEventListener("click", () => {
      localStorage.removeItem(ADMIN_KEY);
      renderPinScreen();
    });

    if (!data.result) {
      const search = document.getElementById("playerSearch");
      const list = document.getElementById("playerList");
      const btn = document.getElementById("confirmResultBtn");
      let selectedPlayerId = null;

      search.addEventListener("input", () => {
        const val = search.value.toLowerCase();
        const filtered = data.players.filter(p => p.name.toLowerCase().includes(val));
        list.innerHTML = filtered.map(p => \`<div class="player-result-item" data-id="\${p.id}">\${p.name}</div>\`).join('');
        list.style.display = filtered.length ? 'block' : 'none';
      });

      list.addEventListener("click", (e) => {
        if (e.target.classList.contains("player-result-item")) {
          selectedPlayerId = e.target.dataset.id;
          search.value = e.target.textContent;
          list.style.display = 'none';
          btn.disabled = false;
        }
      });

      btn.addEventListener("click", async () => {
        if (!confirm("Are you sure? This will lock the game and calculate winners.")) return;
        const res = await fetch("/api/admin/confirm-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pass, gameId: data.game.id, playerId: selectedPlayerId })
        });
        if (res.ok) renderAdminDashboard();
      });
    }

  } catch (e) { console.error(e); }
}

window.togglePayment = async (entryId, newStatus) => {
  const pass = localStorage.getItem(ADMIN_KEY);
  await fetch("/api/admin/toggle-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode: pass, entryId, status: newStatus })
  });
  renderAdminDashboard();
};

main();
<\/script>
</body>
</html>
`;
export {
  worker_default as default
};
