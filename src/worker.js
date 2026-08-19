// PLACEHOLDER lockout image (served at /cobrakick.png) — replace this
// base64 string with the real cobrakick.png once Gav uploads it.
// To regenerate: base64 -w0 cobrakick.png
var COBRAKICK_PNG_B64 = "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";
var WARRIORS_HUB_BASE = "https://warriors-hub.gcaporncontracting.workers.dev";

// Mapping from FGS grade names to Warriors Hub API grades
var WARRIORS_HUB_GRADE_MAP = {
  "League": "League",
  "Reserves": "Reserves",
  "Colts": "Colts",
  "Thirds": "Thirds"
};

// Loading image (shown when team roster not live yet)
// Replace this base64 string with real loading.png when you have it
var LOADING_PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAABOYAAATmCAIAAAAKnjl9AAEAAE...[TRUNCATED_FOR_BREVITY]...";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";
var PLAYHQ_API_BASE = "https://api.playhq.com";
var CLUB_TEAMS = {
  // Verified live against the real PlayHQ API for the 2026 season on
  // 2026-08-14 — these are full team UUIDs, not the truncated fragments
  // that were here before (those were accidentally copied from PlayHQ
  // fixture-page URL slugs, not real team IDs, and never actually worked).
  "League": "046b90e4-54e4-4bf7-af9f-955b8ae7981e",
  // Budget Car and Truck Rental B Grade Men
  "Reserves": "5bf15ff7-0818-4082-9177-d88d822a99fc",
  // Budget Car and Truck Rental B Reserves Men
  "Colts": "a95954ed-ff52-4e15-82a3-80a9417d2a32",
  // EGT Drew Banfield Colts
  "Thirds": "696edf4b-d7e4-44bc-ae14-129cb746fc25"
  // Budget Car and Truck Rental E2 South Men
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
var NON_PLAYER_EXCLUSIONS = {
  // PlayHQ sometimes lists a club official (coach, runner, trainer, etc.)
  // with roleType "Player" for a grade even though they're not actually
  // playing. This filters them out of BOTH the First Goal wheel and
  // Player's Player voting for that grade, since both are built from the
  // same synced appearances list. Match is case-insensitive on full name.
  // Add more entries here as needed — one grade key, array of full names.
  "Reserves": ["Heath Thorpe"]
};
function isExcludedNonPlayer(grade, playerName) {
  const list = NON_PLAYER_EXCLUSIONS[grade];
  if (!list || !list.length) return false;
  const normalized = playerName.trim().toLowerCase();
  return list.some((n) => n.trim().toLowerCase() === normalized);
}
function slugify(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/'/g, "").replace(/\u2019/g, "");
}
async function generateUniqueVotingPin(env) {
  for (let i = 0; i < 20; i++) {
    const candidate = String(Math.floor(Math.random() * 1e4)).padStart(4, "0");
    if (candidate === "0000") continue;
    const clash = await env.DB.prepare(`SELECT slug FROM player_directory WHERE pin = ?`).bind(candidate).first();
    if (!clash) return candidate;
  }
  return null;
}
// Ensures every player on a synced team sheet has a player_directory
// identity (slug + PIN) so they can log in, spin the wheel, and be voted
// for. This used to also write a `gradelist:{grade}` list into VOTES_KV
// for the voting worker to read — that's gone now, since voting reads
// the team sheet (games/players) directly, same as everything else. This
// function's only job now is identity backfill, not roster maintenance.
async function ensureTeamSheetIdentities(env, grade, appearances) {
  const publicAppearances = appearances.filter((a) => a.visible !== false);
  const names = publicAppearances.map(
    (player) => player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : player.name || "Player"
  );
  const newlyRegistered = [];
  for (const name of names) {
    const slug = slugify(name);
    const existing = await env.DB.prepare(`SELECT slug, grades FROM player_directory WHERE slug = ?`).bind(slug).first();
    if (existing) {
      const grades = existing.grades ? JSON.parse(existing.grades) : [];
      if (!grades.includes(grade)) {
        grades.push(grade);
        await env.DB.prepare(`UPDATE player_directory SET grades = ? WHERE slug = ?`).bind(JSON.stringify(grades), slug).run();
      }
      continue;
    }
    const pin = await generateUniqueVotingPin(env);
    if (!pin) {
      console.error(`Could not generate a unique PIN for ${name} — skipped.`);
      continue;
    }
    try {
      await env.DB.prepare(
        `INSERT INTO player_directory (slug, full_name, pin, grades, match_status) VALUES (?, ?, ?, ?, 'matched')`
      ).bind(slug, name, pin, JSON.stringify([grade])).run();
      newlyRegistered.push({ name, pin });
    } catch (e) {
      console.error(`Failed to register ${name} in player_directory:`, e);
    }
  }
  if (newlyRegistered.length > 0) {
    try {
      const lines = newlyRegistered.map((p) => `${p.name}: ${p.pin}`).join("\n");
      await fetch("https://ntfy.sh/clfc-fgs-8f2k91x", {
        method: "POST",
        headers: { "Title": `${grade} — new hub logins registered`, "Priority": "default", "Tags": "id" },
        body: `${newlyRegistered.length} new player(s) from the ${grade} team sheet now have hub PINs (voting + kicker wheel). Hand out their PINs:
${lines}`
      });
    } catch (e) {
      console.error(`New-voter notification failed for ${grade}:`, e);
    }
  }
}
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
      const upcoming = games.filter((g) => (g.status === "UPCOMING" || g.status === "PENDING") && g.schedule).sort((a, b) => /* @__PURE__ */ new Date(`${a.schedule.date}T${a.schedule.time}`) - /* @__PURE__ */ new Date(`${b.schedule.date}T${b.schedule.time}`));
      const todayGame = upcoming[0];
      if (!todayGame) {
        console.log(`No upcoming game found for ${grade}.`);
        continue;
      }
      const gameId = todayGame.id;
      const gameDateTime = `${todayGame.schedule.date}T${todayGame.schedule.time}+08:00`;
      const opposingTeam = todayGame.competitors.find((c) => c.id !== teamId)?.name || "Away Team";
      console.log(`Found ${grade} game vs ${opposingTeam} at ${gameDateTime} (Game ID: ${gameId})`);
      const summaryData = await fetchPlayHQ(`/v2/games/${gameId}/summary`, apiKey);
      const appearances = summaryData.data?.appearances || [];
      const clubAppearances = appearances.filter((a) => {
        if (a.teamId !== teamId || a.roleType !== "Player") return false;
        const nm = a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.name || "Player";
        return !isExcludedNonPlayer(grade, nm);
      });
      if (clubAppearances.length === 0) {
        console.log(`No player appearances found for ${grade} yet.`);
        continue;
      }
      const existingGame = await env.DB.prepare(`SELECT id FROM games WHERE grade = ? AND game_date_time LIKE ?`).bind(grade, `${todayGame.schedule.date}%`).first();
      const wasAlreadySynced = existingGame ? (await env.DB.prepare(`SELECT COUNT(*) as n FROM players WHERE game_id = ?`).bind(existingGame.id).first()).n > 0 : false;
      const existingUnspunCount = existingGame ? (await env.DB.prepare(`SELECT COUNT(*) as n FROM players WHERE game_id = ? AND removed_from_wheel = 0`).bind(existingGame.id).first()).n : 0;
      let internalGameId;
      const [gy, gm, gd] = todayGame.schedule.date.split("-").map(Number);
      const deadlineDayUTC = new Date(Date.UTC(gy, gm - 1, gd));
      deadlineDayUTC.setUTCDate(deadlineDayUTC.getUTCDate() + 1);
      const deadlineDateStr = deadlineDayUTC.toISOString().split("T")[0];
      const deadlineISO = `${deadlineDateStr}T12:00:00+08:00`;
      if (existingGame) {
        internalGameId = existingGame.id;
        await env.DB.prepare(`UPDATE games SET away_team = ?, game_date_time = ?, payment_deadline_at = ?, status = 'open' WHERE id = ?`).bind(opposingTeam, gameDateTime, deadlineISO, internalGameId).run();
        await audit(env.DB, "sync_game_time_updated", { entity_id: internalGameId, game_id: internalGameId, metadata: { grade, opponent: opposingTeam, game_date_time: gameDateTime } });
      } else {
        internalGameId = crypto.randomUUID();
        const lastGame = await env.DB.prepare(
          `SELECT carry_over_amount FROM game_results gr JOIN games g ON g.id = gr.game_id WHERE g.grade = ? ORDER BY gr.created_at DESC LIMIT 1`
        ).bind(grade).first();
        const startingJackpot = lastGame ? lastGame.carry_over_amount : 0;
        await env.DB.prepare(
          `INSERT INTO games (id, grade, home_team, away_team, game_date_time, payment_deadline_at, status, is_mock, starting_jackpot) VALUES (?, ?, 'Cockburn Lakes', ?, ?, ?, 'open', 0, ?)`
        ).bind(internalGameId, grade, opposingTeam, gameDateTime, deadlineISO, startingJackpot).run();
        await audit(env.DB, "sync_game_time_logged", { entity_id: internalGameId, game_id: internalGameId, metadata: { grade, opponent: opposingTeam, game_date_time: gameDateTime, source: "playhq_sync" } });
      }
      const MIN_SANE_ROSTER = 10;
      const suspiciousShrink = existingUnspunCount >= MIN_SANE_ROSTER && clubAppearances.length < existingUnspunCount * 0.6;
      if (suspiciousShrink) {
        console.warn(`Skipping player-list update for ${grade}: PlayHQ returned only ${clubAppearances.length} appearances vs ${existingUnspunCount} already on the wheel — looks incomplete, not overwriting.`);
        try {
          await fetch("https://ntfy.sh/clfc-fgs-8f2k91x", {
            method: "POST",
            headers: { "Title": `${grade} sync looked incomplete`, "Priority": "high", "Tags": "warning" },
            body: `PlayHQ returned only ${clubAppearances.length} players for ${grade}, vs ${existingUnspunCount} already on the wheel. Skipped overwriting the roster — check PlayHQ manually if this keeps happening.`
          });
        } catch (e) {
          console.error(`Incomplete-sync notification failed for ${grade}:`, e);
        }
      } else {
        await env.DB.prepare(`DELETE FROM players WHERE game_id = ? AND removed_from_wheel = 0`).bind(internalGameId).run();
        for (const player of clubAppearances) {
          const playerName = player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : player.name || "Player";
          const isPrivate = player.visible === false ? 1 : 0;
          const existingRow = await env.DB.prepare(
            `SELECT id FROM players WHERE game_id = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?))`
          ).bind(internalGameId, playerName).first();
          if (existingRow) continue;
          await env.DB.prepare(
            `INSERT INTO players (id, name, grade, game_id, is_private, active) VALUES (?, ?, ?, ?, ?, 1)`
          ).bind(crypto.randomUUID(), playerName, grade, internalGameId, isPrivate).run();
        }
        console.log(`Successfully synced ${clubAppearances.length} players for ${grade}.`);
      }
      try {
        await ensureTeamSheetIdentities(env, grade, clubAppearances);
      } catch (e) {
        console.error(`Identity backfill failed for ${grade}:`, e);
      }
      if (!wasAlreadySynced) {
        try {
          await fetch("https://ntfy.sh/clfc-fgs-8f2k91x", {
            method: "POST",
            headers: { "Title": `${grade} team list is up!`, "Priority": "high", "Tags": "soccer" },
            body: `${grade} vs ${opposingTeam} — ${clubAppearances.length} players synced. Wheel is open!`
          });
        } catch (e) {
          console.error(`Notification push failed for ${grade}:`, e);
        }
      }
    } catch (e) {
      console.error(`Error syncing grade ${grade}:`, e);
    }
  }
}
var ACTIVE_GRADES = ["League", "Reserves", "Colts", "Thirds"];
var ENTRY_FEE = 5;
var PAYID_EMAIL = "playersfund@clfc.com";
var EXPECTED_PLAYERS = 22;
var TESTING_MASTER_PIN = "0000";
var ADMIN_PASSCODE = "94172079"; // Standardized to 94172079
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json", 
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400"
    }
  });
}
function uid() {
  return crypto.randomUUID();
}
function secureRandomIndex(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}
async function audit(db, event_type, { entity_id = null, participant_id = null, game_id = null, metadata = null } = {}) {
  await db.prepare(`INSERT INTO audit_log (event_type, entity_id, participant_id, game_id, metadata) VALUES (?,?,?,?,?)`).bind(event_type, entity_id, participant_id, game_id, metadata ? JSON.stringify(metadata) : null).run();
}
async function mockGetPlayersForGrade(env, grade) {
  const { results } = await env.DB.prepare(
    `SELECT full_name FROM player_directory WHERE grades LIKE ?`
  ).bind(`%"${grade}"%`).all();
  const roster = (results || []).map((r) => r.full_name);
  const shuffled = [...roster];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(EXPECTED_PLAYERS, shuffled.length));
}
async function getCurrentGame(env, grade) {
  const existing = await env.DB.prepare(
    `SELECT * FROM games WHERE grade = ? AND status != 'closed' ORDER BY created_at DESC LIMIT 1`
  ).bind(grade).first();
  return existing || null;
}
// ---------------- Admin wheel lockout (manual, global) ----------------
// Replaces the old automatic "lock the wheel once kickoff time passes"
// behaviour. Admin now flips this on/off by hand from the dashboard; when
// it's on, every grade's wheel shows the lockout image instead of letting
// anyone spin. Stored as a single flag in VOTES_KV since it applies across
// all grades, not to one specific game row.
var WHEEL_LOCKOUT_KV_KEY = "wheel_lockout";
async function getWheelLockout(env) {
  const val = await env.VOTES_KV.get(WHEEL_LOCKOUT_KV_KEY);
  return val === "1";
}
async function setWheelLockout(env, locked) {
  await env.VOTES_KV.put(WHEEL_LOCKOUT_KV_KEY, locked ? "1" : "0");
}
async function handleScheduledSync(env, event) {
  if (event.cron === "30 1 * * 6") {
    const missing = [];
    for (const grade of ACTIVE_GRADES) {
      const game = await getCurrentGame(env, grade);
      if (!game) missing.push(grade);
    }
    if (missing.length === 0) {
      console.log("9:30am follow-up sync skipped — every grade already has a game from the 8am run.");
      return;
    }
    console.log(`9:30am follow-up sync running — still missing: ${missing.join(", ")}`);
  }
  await syncSaturdayGames(env);
}
var SYNC_COOLDOWN_MS = 5 * 60 * 1e3;
async function maybeLazySync(env, ctx) {
  try {
    const last = await env.VOTES_KV.get("lastAutoSyncAttempt");
    const lastTs = last ? parseInt(last, 10) : 0;
    if (Date.now() - lastTs < SYNC_COOLDOWN_MS) return;
    await env.VOTES_KV.put("lastAutoSyncAttempt", String(Date.now()));
    ctx.waitUntil(syncSaturdayGames(env));
  } catch (e) {
    console.error("Lazy sync trigger failed:", e);
  }
}
var worker_default = {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduledSync(env, event));
  },
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    const response = await handleFetch(request, env, ctx);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    newHeaders.set("Access-Control-Max-Age", "86400");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
// export default worker_default;

async function handleFetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    if (new URL(request.url).pathname === "/cobrakick.png") {
      const bytes = Uint8Array.from(atob(COBRAKICK_PNG_B64), (c) => c.charCodeAt(0));
      return new Response(bytes, {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" }
      });
    }    if (new URL(request.url).pathname === "/loading.png") {
      const bytes = Uint8Array.from(atob(LOADING_PNG_B64), (c) => c.charCodeAt(0));
      return new Response(bytes, {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" }
      });
    }

    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/api/auth/pin" && request.method === "POST") {
      const { pin, adminPasscode } = await request.json().catch(() => ({}));
      if (!pin || !/^\d{4}$/.test(pin)) return json({ error: "Enter a 4-digit PIN" }, 400);
      if (pin === TESTING_MASTER_PIN) {
        await audit(env.DB, "authentication", { metadata: { mode: "testing_pin" } });
        return json({ ok: true, testingMode: true, voterSlug: null, fullName: null });
      }
      const voterRow = await env.DB.prepare(`SELECT slug, full_name FROM player_directory WHERE pin = ?`).bind(pin).first();
      if (!voterRow) return json({ error: "Incorrect PIN" }, 401);
      const voterSlug = voterRow.slug;
      const fullName = voterRow.full_name || voterSlug;
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
        const game = await getCurrentGame(env, grade);
        if (!game) {
          await maybeLazySync(env, ctx);
          return json({ ready: false, grade });
        }
        // No more auto-locking on kickoff time — the wheel now only locks
        // when admin explicitly confirms a result (status stays 'open'
        // until then) or flips the manual lockout toggle below.
        const entries = await env.DB.prepare(`SELECT COUNT(*) as count FROM entries WHERE game_id = ?`).bind(game.id).first();
        game.final_prize_pool = entries.count * ENTRY_FEE + (game.starting_jackpot || 0);
        game.wheel_locked_out = await getWheelLockout(env);
        return json({ ready: true, game });
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
      const { fullName, voterSlug, pin, adminPasscode } = body;
      if (!fullName || !fullName.trim()) return json({ error: "Name is required" }, 400);
      let confirmedSlug = null;
      if (pin === TESTING_MASTER_PIN) {
        if (adminPasscode !== ADMIN_PASSCODE) return json({ error: "PIN could not be re-verified" }, 401);
        confirmedSlug = null;
      } else if (pin) {
        const row = await env.DB.prepare(`SELECT slug FROM player_directory WHERE pin = ?`).bind(pin).first();
        confirmedSlug = row ? row.slug : null;
        if (!confirmedSlug) return json({ error: "PIN could not be re-verified" }, 401);
      } else {
        return json({ error: "PIN is required" }, 400);
      }
      const game = await env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
      if (!game) return json({ error: "Draw not found" }, 404);
      if (await getWheelLockout(env)) {
        return json({ error: "The wheel has been locked out by admin." }, 403);
      }
      if (game.status !== "open") return json({ error: "This draw is not open for spins" }, 403);
      const rosteredHere = await env.DB.prepare(
        `SELECT id FROM players WHERE game_id = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?))`
      ).bind(gameId, fullName).first();
      if (rosteredHere) {
        return json({ error: `${fullName.trim()} is playing ${game.grade} this week, so you can't spin the ${game.grade} wheel — you can spin a grade you're not playing in.` }, 403);
      }
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
      if (!game) {
        await maybeLazySync(env, ctx);
        return json({ error: "No active game found", noGame: true, wheelLockout: await getWheelLockout(env) }, 200);
      }
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
      return json({ game, players, entries, result, wheelLockout: await getWheelLockout(env) });
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
    if (pathname === "/api/admin/toggle-lockout" && request.method === "POST") {
      const { passcode, locked } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      await setWheelLockout(env, !!locked);
      await audit(env.DB, "wheel_lockout_toggled", { metadata: { locked: !!locked } });
      return json({ ok: true, locked: !!locked });
    }
    if (pathname === "/api/admin/toggle-payment" && request.method === "POST") {
      const { entryId, passcode, status } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      if (!entryId || !status) return json({ error: "Missing entryId or status" }, 400);
      await env.DB.prepare(`UPDATE entries SET payment_status = ? WHERE id = ?`).bind(status, entryId).run();
      await audit(env.DB, "payment_status_toggled", { entity_id: entryId, metadata: { status } });
      return json({ ok: true });
    }
    if (pathname === "/api/admin/clear-spins" && request.method === "POST") {
      const { passcode, gameId } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      if (!gameId) return json({ error: "Missing gameId" }, 400);
      const game = await env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
      if (!game) return json({ error: "Game not found" }, 404);
      const entryCountRow = await env.DB.prepare(`SELECT COUNT(*) as n FROM entries WHERE game_id = ?`).bind(gameId).first();
      const clearedCount = entryCountRow ? entryCountRow.n : 0;
      await env.DB.prepare(`DELETE FROM game_results WHERE game_id = ?`).bind(gameId).run();
      await env.DB.prepare(`DELETE FROM entries WHERE game_id = ?`).bind(gameId).run();
      await env.DB.prepare(`UPDATE players SET removed_from_wheel = 0 WHERE game_id = ?`).bind(gameId).run();
      await env.DB.prepare(`
        UPDATE games SET 
          status = 'open', 
          winning_player_id = NULL, 
          final_prize_pool = NULL, 
          result_status = NULL 
        WHERE id = ?
      `).bind(gameId).run();
      await audit(env.DB, "spins_cleared", {
        game_id: gameId,
        metadata: { grade: game.grade, entriesCleared: clearedCount }
      });
      return json({ ok: true, cleared: clearedCount });
    }
    if (pathname === "/api/admin/sync-playhq" && request.method === "POST") {
      const { passcode } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      try {
        await syncSaturdayGames(env);
        return json({ ok: true, message: "Sync complete — check logs / current games for results." });
      } catch (e) {
        return json({ error: "Sync failed: " + e.message }, 500);
      }
    }
    if (pathname === "/api/admin/create-mock-game" && request.method === "POST") {
      const { passcode, grade } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      if (!grade || !ACTIVE_GRADES.includes(grade)) return json({ error: "Unknown grade" }, 400);
      try {
        const names = await mockGetPlayersForGrade(env, grade);
        if (names.length < EXPECTED_PLAYERS) {
          return json({ error: `Only found ${names.length} players for ${grade} — need ${EXPECTED_PLAYERS}.` }, 400);
        }
        const gameId = uid();
        // Kickoff is just informational now — the wheel no longer
        // auto-locks based on this time. Six hours out is a sensible
        // default fixture time for a mock game.
        const kickoff = /* @__PURE__ */ new Date();
        kickoff.setHours(kickoff.getHours() + 6);
        const deadline = /* @__PURE__ */ new Date();
        deadline.setDate(deadline.getDate() + 2);
        await env.DB.prepare(
          `INSERT INTO games (id, grade, home_team, away_team, game_date_time, payment_deadline_at, status, is_mock, starting_jackpot) VALUES (?,?,?,?,?,?,'open',1,0)`
        ).bind(gameId, grade, "Cockburn Lakes", "TBC (mock)", kickoff.toISOString(), deadline.toISOString()).run();
        const stmt = env.DB.prepare(`INSERT INTO players (id, name, grade, game_id, is_private, active) VALUES (?,?,?,?,0,1)`);
        await env.DB.batch(names.map((name) => stmt.bind(uid(), name, grade, gameId)));
        await audit(env.DB, "game_created", { entity_id: gameId, game_id: gameId, metadata: { grade, mock: true, playerCount: names.length } });
        return json({ ok: true, gameId });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    return new Response(INDEX_HTML_CONTENT, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, must-revalidate"
      }
    });
  }
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
  .wrap{max-width:520px;margin:0 auto;padding:24px 18px 60px;position:relative;}
  .fgs-home-link{
    position:absolute;top:8px;left:18px;
    font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
    color:rgba(255,255,255,.75);text-decoration:none;
    background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);
    padding:6px 12px;border-radius:999px;
  }
  .fgs-home-link:hover{background:rgba(255,255,255,.2);}
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

  .beta-banner{
    background:#eef2ff;border:2px solid var(--blue);border-radius:14px;
    padding:16px 16px;margin-bottom:16px;color:var(--ink);
  }
  .beta-banner p{margin:0 0 8px;font-size:13px;line-height:1.5;color:#2a2a2a;}
  .beta-banner p:first-child{margin-top:2px;}
  .beta-banner p:last-child{margin-bottom:12px;}
  .beta-banner strong{color:var(--red);}
  .beta-banner button.primary{margin-top:0;}

  .league-cost-banner{
    background:#fff0f0;border:2px solid var(--red);border-radius:14px;
    padding:16px 16px;margin-bottom:16px;color:var(--ink);
  }
  .league-cost-banner p{margin:0;font-size:13.5px;line-height:1.55;font-weight:600;color:#7a1010;}

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



  .share-btn{
    width:100%;margin-top:14px;font-family:'JetBrains Mono',monospace;font-weight:700;
    letter-spacing:.04em;text-transform:uppercase;background:#0084ff;color:#fff;border:none;
    border-radius:10px;padding:14px;font-size:14px;cursor:pointer;box-shadow:0 6px 0 #005fb8;
    display:flex;align-items:center;justify-content:center;gap:8px;
  }
  .share-btn:active{transform:translateY(3px);box-shadow:0 3px 0 #005fb8;}

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

  /* Celebratory admin result banner, shown once a grade's winner is confirmed */
  @keyframes adminWinnerGlow{
    0%,100%{box-shadow:0 10px 24px rgba(0,0,0,.35), 0 0 0 rgba(242,177,52,0);}
    50%{box-shadow:0 10px 30px rgba(0,0,0,.4), 0 0 26px rgba(242,177,52,.55);}
  }
  .admin-winner-banner{
    background:linear-gradient(135deg, #1c7a3d 0%, #0d4d24 100%);
    border:3px solid var(--gold);border-radius:16px;padding:22px 18px;
    text-align:center;margin-bottom:16px;position:relative;overflow:hidden;
    animation:adminWinnerGlow 2.6s ease-in-out infinite;
  }
  .admin-winner-trophy{font-size:38px;line-height:1;margin-bottom:6px;}
  .admin-winner-eyebrow{
    font-family:'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;
    font-size:11px;color:var(--gold);margin-bottom:8px;font-weight:700;
  }
  .admin-winner-player{
    font-family:'Anton',sans-serif;text-transform:uppercase;font-size:28px;color:#fff;
    margin-bottom:6px;text-shadow:0 2px 6px rgba(0,0,0,.3);
  }
  .admin-winner-sub{font-size:13.5px;color:rgba(255,255,255,.9);}
  .admin-winner-sub b{color:var(--gold);}
  .admin-jackpot-banner{
    background:linear-gradient(135deg, var(--gold) 0%, #c98f1a 100%);
    border:3px solid var(--navy);border-radius:16px;padding:22px 18px;
    text-align:center;margin-bottom:16px;
    animation:adminWinnerGlow 2.6s ease-in-out infinite;
  }
  .admin-jackpot-banner .admin-winner-trophy{font-size:38px;}
  .admin-jackpot-banner .admin-winner-eyebrow{color:var(--navy-deep);}
  .admin-jackpot-banner .admin-winner-player{color:var(--navy-deep);text-shadow:none;}
  .admin-jackpot-banner .admin-winner-sub{color:var(--navy-deep);}

  .locked-icon{font-size:40px;margin-bottom:10px;}
  .locked-image{max-width:260px;width:100%;height:auto;margin-bottom:10px;border-radius:10px;}
  .loading-image{max-width:260px;width:100%;height:auto;margin-bottom:10px;border-radius:10px;}
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

  .btn-danger{
    width:100%;margin-top:0;margin-bottom:16px;font-family:'JetBrains Mono',monospace;font-weight:700;
    letter-spacing:.04em;text-transform:uppercase;background:#7a1010;color:#fff;border:none;
    border-radius:10px;padding:12px;font-size:12.5px;cursor:pointer;box-shadow:0 6px 0 #4a0808;
  }
  .btn-danger:active{transform:translateY(3px);box-shadow:0 3px 0 #4a0808;}
  .btn-danger:disabled{opacity:.5;cursor:not-allowed;}
</style>
</head>
<body>
<div class="wrap" id="app"></div>
<a href="#" class="admin-login-link" id="adminLoginLink">ADMIN</a>

<script>
const app = document.getElementById("app");
const STORAGE_KEY = "clfc_fgs_session";
const ADMIN_KEY = "clfc_fgs_admin_pass";
const PERSISTED_AUTH_KEY = "clfc_fgs_auth";
let currentAdminGrade = null;
let activePollInterval = null;

function heroHTML(sub){
  return \`
    <a href="https://warriors-hub.gcaporncontracting.workers.dev/" class="fgs-home-link">\u2190 Home</a>
    <p class="eyebrow">Cockburn Lakes F.C.</p>
    <h1 class="title">First Goal Scorer</h1>
    <p class="subtitle">\${sub}</p>
  \`;
}

function getSession(){
  try{ return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"); }catch(e){ return null; }
}
function setSession(s){ sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function clearSession(){ sessionStorage.removeItem(STORAGE_KEY); }
function getPersistedAuth(){
  try{ return JSON.parse(localStorage.getItem(PERSISTED_AUTH_KEY) || "null"); }catch(e){ return null; }
}
function savePersistentAuth(auth){
  localStorage.setItem(PERSISTED_AUTH_KEY, JSON.stringify(auth));
}

async function main(){
  const session = getSession();
  if (session && session.grade && session.gameId){
    renderGradeSpin(session.grade, session.gameId, session);
    return;
  }
  const persistedAuth = getPersistedAuth();
  if (persistedAuth){
    setSession(persistedAuth);
    renderGradeSelect();
    return;
  }
  renderPinScreen();
}

// ---------------- Step 1: PIN ----------------
function renderPinScreen(){
  const betaDismissed = localStorage.getItem("clfc_fgs_beta_banner_dismissed") === "1";
  app.innerHTML = \`
    \${heroHTML("Enter your PIN to get started")}
    \${betaDismissed ? "" : \`
    <div class="beta-banner" id="betaBanner">
      <p>Right now, the more people using this helps to iron out the creases. Please tell me if it acts weird.</p>
      <p><strong>Spins are for fun on Colts and Ressies.</strong> League spins are <strong>$5, winner takes all</strong>.</p>
      <button class="primary" id="betaDismissBtn" style="background:var(--blue);box-shadow:0 6px 0 #123597;">I understand</button>
    </div>
    \`}
    <div class="card">
      <label for="pinInput">Your PIN</label>
      <input type="tel" id="pinInput" inputmode="numeric" maxlength="4" placeholder="\u2022\u2022\u2022\u2022">
      <button class="primary" id="pinBtn">Continue</button>
      <div id="pinError"></div>
    </div>
  \`;
  if (!betaDismissed){
    document.getElementById("betaDismissBtn").addEventListener("click", ()=>{
      localStorage.setItem("clfc_fgs_beta_banner_dismissed", "1");
      document.getElementById("betaBanner").remove();
    });
  }
  const btn = document.getElementById("pinBtn");
  btn.addEventListener("click", async ()=>{
    const pin = document.getElementById("pinInput").value.trim();
    const errBox = document.getElementById("pinError");
    errBox.innerHTML = "";
    if (!/^\\d{4}$/.test(pin)){ errBox.innerHTML = \`<p class="error">Enter a 4-digit PIN.</p>\`; return; }
    let adminPasscode = null;
    if (pin === "0000"){
      adminPasscode = prompt("Admin passcode:");
      if (!adminPasscode) return;
    }
    btn.disabled = true;
    try{
      const res = await fetch("/api/auth/pin", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ pin, adminPasscode }) });
      const data = await res.json();
      if (!res.ok){ errBox.innerHTML = \`<p class="error">\${data.error}</p>\`; btn.disabled = false; return; }
      const auth = { pin, adminPasscode, voterSlug: data.voterSlug, fullName: data.fullName, testingMode: data.testingMode };
      setSession(auth);
      savePersistentAuth(auth);
      if (data.fullName){
        renderGradeSelect();
      } else {
        renderNameScreen(data);
      }
    }catch(e){
      errBox.innerHTML = \`<p class="error">Network error \u2014 try again.</p>\`;
      btn.disabled = false;
    }
  });
}

// ---------------- Step 2: name (admin testing path only) ----------------
function renderNameScreen(auth){
  const known = !!auth.fullName;
  app.innerHTML = \`
    \${heroHTML("Your Name")}
    <div class="info-banner">
      <div class="info-banner-title">Admin testing</div>
      <p>This only shows up on the admin passcode path \u2014 everyone else is identified automatically from their real PIN.</p>
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
    savePersistentAuth(session);
    renderGradeSelect();
  });
}

// ---------------- Step 3: grade ----------------
async function renderGradeSelect(){
  const grades = ["League","Reserves","Colts","Thirds"];
  const session = getSession();
  
  app.innerHTML = \`
    \${heroHTML("Pick your grade")}
    <div id="leagueCostBannerArea"></div>
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
            btn.innerHTML += "<br><span style='font-size:10px;'>SPUN \u2014 view results</span>";
        }
    } catch(e) {}
  }

  function goToGrade(grade, data){
    const session2 = getSession();
    session2.grade = grade;
    session2.gameId = data.game.id;
    setSession(session2);
    renderGradeSpin(grade, data.game.id, session2);
  }

  document.querySelectorAll(".grade-btn").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const grade = btn.dataset.grade;
      if (spunGrades[grade]) {
        renderLockedOutSummary(grade, session);
        return;
      }
      const statusEl = document.getElementById("gradeStatus");
      const bannerArea = document.getElementById("leagueCostBannerArea");
      bannerArea.innerHTML = "";
      statusEl.textContent = "Loading players...";
      try{
        const res = await fetch(\`/api/games/current?grade=\${grade}\`);
        const data = await res.json();
        if (!res.ok){ statusEl.textContent = data.error; return; }
        if (!data.ready){ renderNotReady(grade, session); return; }
        statusEl.textContent = "";
        if (grade === "League"){
          // League costs real money \u2014 show this warning right here on
          // the grade-select page and require a deliberate "Continue"
          // before the wheel loads, instead of jumping straight in.
          bannerArea.innerHTML = \`
            <div class="league-cost-banner" id="leagueCostBanner">
              <p>If you spin this wheel, it will cost you $5 and if you commit to spin and don't pay you aren't playing again. Winner takes all.</p>
              <button class="primary" id="leagueContinueBtn" style="margin-top:14px;background:var(--red);box-shadow:0 6px 0 #9c1c1c;">Continue to League wheel</button>
            </div>
          \`;
          document.getElementById("leagueContinueBtn").addEventListener("click", ()=> goToGrade(grade, data));
          bannerArea.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          goToGrade(grade, data);
        }
      }catch(e){
        statusEl.textContent = "Network error \u2014 try again.";
      }
    });
  });
}

// ---------------- Not ready: shown when a grade's team list isn't up yet ----------------
function renderNotReady(grade, session){
  app.innerHTML = \`
    \${heroHTML(grade + " \u2014 teams not up yet")}
    <div class="card">
      <div class="locked-note">
        <strong>\${grade}'s team hasn't been posted on PlayHQ yet.</strong>
        <p style="margin:10px 0 0;">Betting opens as soon as Cockburn's team list goes up \u2014 usually by <strong>Saturday 9am</strong>. Check back then.</p>
      </div>
      <button class="primary" id="backBtn" style="margin-top:18px;background:var(--navy);box-shadow:0 6px 0 var(--navy-deep);">Back to grades</button>
    </div>
  \`;
  document.getElementById("backBtn").addEventListener("click", ()=>{
    const persistedAuth = getPersistedAuth();
    clearSession();
    if (persistedAuth) {
      setSession(persistedAuth);
    }
    renderGradeSelect();
  });
}

// ---------------- Locked-out summary: shown when a grade is already SPUN ----------------
async function renderLockedOutSummary(grade, session){
  app.innerHTML = \`\${heroHTML(grade + " \u2014 you've already spun")}<div class="card"><p class="muted">Loading...</p></div>\`;

  try{
    const gameRes = await fetch(\`/api/games/current?grade=\${grade}\`);
    const gameData = await gameRes.json();
    if (!gameData.ready || !gameData.game){
      app.innerHTML = \`\${heroHTML(grade)}<div class="card"><p class="error">This draw is no longer available \u2014 try going back to grades.</p></div>\`;
      return;
    }
    const game = gameData.game;
    const winningAmount = (game.final_prize_pool || 0);

    const entriesRes = await fetch(\`/api/games/\${game.id}/entries\`);
    const entriesData = await entriesRes.json();
    const entries = entriesData.entries || [];
    const result = entriesData.gameResult;

    const resultBannerHTML = result ? (
      result.is_jackpot ? \`
        <div class="admin-jackpot-banner">
          <div class="admin-winner-trophy">\u{1F4B0}</div>
          <div class="admin-winner-eyebrow">Jackpot \u2014 no one picked it</div>
          <div class="admin-winner-player">\${result.player_name}</div>
          <div class="admin-winner-sub">$\${(result.carry_over_amount || 0).toFixed(2)} carries over to next round</div>
        </div>
      \` : \`
        <div class="admin-winner-banner">
          <div class="admin-winner-trophy">\u{1F3C6}</div>
          <div class="admin-winner-eyebrow">Winner confirmed!</div>
          <div class="admin-winner-player">\${result.winner_name}</div>
          <div class="admin-winner-sub">Picked <b>\${result.player_name}</b> \u2014 $\${(result.total_prize_pool || 0).toFixed(2)} won</div>
        </div>
      \`
    ) : \`
      <div class="pot-box">
        <div class="pot-label">Current winning amount</div>
        <div class="pot-amount">$\${winningAmount.toFixed(2)}</div>
        <div class="pot-sub">From \${entries.length} \${entries.length === 1 ? 'entry' : 'entries'} \u2014 winner is whoever's player scores first</div>
      </div>
    \`;

    app.innerHTML = \`
      \${heroHTML(grade + " \u2014 you've already spun")}
      <div class="card">
        <div class="locked-note">
          \${result ? \`This round for <strong>\${grade}</strong> is complete \u2014 see the result below.\` : \`You've already spun for <strong>\${grade}</strong> this round \u2014 you're locked out of this grade until the next round opens.\`}
        </div>
        \${resultBannerHTML}
        <div class="results-title" style="color:var(--navy);margin-top:20px;">All spins \u2014 \${grade}</div>
        <table class="results" id="lockedResultsTable">
          <thead><tr><th>Participant</th><th>Player</th><th>Payment</th></tr></thead>
          <tbody>
            \${entries.map(e=>\`
              <tr class="\${result && !result.is_jackpot && e.player === result.player_name ? 'winner-row' : ''}">
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
    document.getElementById("backToGradesBtn").addEventListener("click", ()=>{
      const persistedAuth = getPersistedAuth();
      clearSession();
      if (persistedAuth) {
        setSession(persistedAuth);
      }
      renderGradeSelect();
    });
  }catch(e){
    app.innerHTML = \`\${heroHTML(grade)}<div class="card"><p class="error">Could not load results \u2014 try again.</p></div>\`;
  }
}

// ---------------- Step 4: wheel + spin ----------------
async function renderGradeSpin(grade, gameId, session){
  app.innerHTML = \`\${heroHTML("Loading wheel...")}\`;
  const playersRes = await fetch(\`/api/games/\${gameId}/players\`).then(r=>r.json());
  const players = playersRes.players || [];
  
  const gameRes = await fetch(\`/api/games/current?grade=\${grade}\`).then(r=>r.json());
  if (!gameRes.ready || !gameRes.game){
    clearSession();
    renderNotReady(grade, session);
    return;
  }
  const game = gameRes.game;
  // Locked either because admin has confirmed a result for this game, or
  // because admin has flipped the global "lock out the wheel" toggle.
  const isLocked = game.status === 'locked' || !!game.wheel_locked_out;

  app.innerHTML = \`
    \${heroHTML(grade + (isLocked ? " \u2014 Locked" : " \u2014 spin to find your player"))}
    <div id="resultBannerArea"></div>
    <div class="card">
      \${isLocked ? \`
        <div class="center">
          <img class="locked-image" src="/cobrakick.png" alt="Wheel locked">
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
    <div class="center"><a class="back-link" id="startOverLink">← Back to grades</a></div>
  \`;

  document.getElementById("startOverLink").addEventListener("click", (e)=>{
    e.preventDefault();
    console.log("Start over clicked");
    if (activePollInterval) clearInterval(activePollInterval);
    clearSession();
    console.log("Session cleared");
    const persistedAuth = getPersistedAuth();
    console.log("Persisted auth:", persistedAuth);
    if (persistedAuth){
      setSession(persistedAuth);
      console.log("Session restored from persisted auth");
    } else {
      console.log("No persisted auth found!");
    }
    console.log("About to call renderGradeSelect");
    renderGradeSelect();
    console.log("renderGradeSelect called");
  });

  if (!isLocked) {
    // Real names, used to match the backend's final result to a wheel
    // slot. Private/hidden players keep their real name here so indexOf
    // matching still works if one is ever the eventual (non-private)
    // pick's neighbour \u2014 but they NEVER get their real name rendered.
    let wheelOptions = players.map(p=>p.name);
    // What's actually drawn on the wheel \u2014 private players show as
    // "Re-Spin" instead of their real name, so a hidden/private profile's
    // name is never displayed, even before anyone spins.
    let wheelLabels = players.map(p=> p.is_private ? "Re-Spin" : p.name);
    drawWheel(wheelLabels);
    
    document.getElementById("spinBtn").addEventListener("click", async ()=>{
      const btn = document.getElementById("spinBtn");
      const errBox = document.getElementById("spinError");
      btn.disabled = true;
      errBox.innerHTML = "";
      btn.textContent = "Spinning...";
      // The live results table below polls every 6s, but the spin
      // animation takes 7.5s \u2014 that poll could reveal this entry in the
      // table while the wheel is still visibly spinning. Pause it for the
      // duration of the spin so nothing can appear early.
      if (activePollInterval) { clearInterval(activePollInterval); activePollInterval = null; }
      try{
        const res = await fetch(\`/api/games/\${gameId}/entries\`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ fullName: session.fullName, voterSlug: session.voterSlug, pin: session.pin, adminPasscode: session.adminPasscode })
        });
        const data = await res.json();
        if (!res.ok){
          errBox.innerHTML = \`<p class="error">\${data.error}</p>\`;
          btn.textContent = "Spin the wheel"; btn.disabled = false;
          activePollInterval = setInterval(()=>pollResults(gameId), 6000);
          return;
        }

        // If the backend hit one or more private/hidden players while
        // resolving the spin, it silently re-picks until it lands on a
        // real, announceable player \u2014 that's what guarantees the person
        // always ends up with a valid result. To make that re-spin
        // VISIBLE rather than invisible, we first animate a quick landing
        // on a "Re-Spin" slot (if one's still on this wheel), then spin
        // again for the real result.
        if (data.secondChances > 0) {
          const reSpinIndex = wheelLabels.indexOf("Re-Spin");
          if (reSpinIndex !== -1) {
            await spinWheel(reSpinIndex, wheelOptions.length, 3200);
            btn.textContent = "Re-Spin! Spinning again...";
            await new Promise(r => setTimeout(r, 900));
          }
        }

        const targetPlayer = data.player.name;
        const targetIndex = wheelOptions.indexOf(targetPlayer);
        
        await spinWheel(targetIndex, wheelOptions.length);
        
        setTimeout(() => {
          renderResult(data, grade);
          pollResults(gameId);
          activePollInterval = setInterval(()=>pollResults(gameId), 6000);
        }, 800);
      }catch(e){
        errBox.innerHTML = \`<p class="error">Network error \u2014 try again.</p>\`;
        btn.textContent = "Spin the wheel";
        btn.disabled = false;
        activePollInterval = setInterval(()=>pollResults(gameId), 6000);
      }
    });
  }

  pollResults(gameId);
  if (activePollInterval) clearInterval(activePollInterval);
  activePollInterval = setInterval(()=>pollResults(gameId), 6000);
}

function renderResult(data, grade){
  const area = document.getElementById("resultArea");
  const shareText = \`I just spun First Goal for \${grade} and got \${data.player.name}! \u{1F3C8} First goal wins it all \u2014 spin yours: \`;
  const shareUrl = window.location.origin + "/";
  const reSpinNote = data.secondChances > 0
    ? \`<p class="final-note" style="color:var(--navy);font-style:normal;font-weight:600;">You landed on Re-Spin first \u2014 that's a private profile we don't reveal, so you were automatically re-spun \${data.secondChances > 1 ? \`(\${data.secondChances} times) \` : ""}to a valid player.</p>\`
    : "";
  area.innerHTML = \`
    <div class="result-box">
      <div class="big-tick">\u2713</div>
      <h2>You got</h2>
      <div class="player-name">\${data.player.name}</div>
      <button class="share-btn" id="shareResultBtn">\u{1F4E4} Share to footy club chat</button>
      \${reSpinNote}
      <p class="final-note">\${data.message}</p>
    </div>
  \`;
  document.getElementById("shareResultBtn").addEventListener("click", async ()=>{
    // Web Share API opens the phone's native share sheet \u2014 the person
    // picks Messenger themselves, then picks the club group chat. There's
    // no way for a web app to auto-post into a specific Messenger group
    // without a registered bot integration, so this two-tap flow is the
    // real, working version of "share to the club chat."
    if (navigator.share){
      try{
        await navigator.share({ text: shareText, url: shareUrl });
      }catch(e){ /* user cancelled the share sheet \u2014 not an error */ }
    } else {
      // Desktop / unsupported browser fallback: open Messenger's own
      // share deep link directly with the text pre-filled.
      const messengerUrl = \`https://www.facebook.com/dialog/send?link=\${encodeURIComponent(shareUrl)}&app_id=0&redirect_uri=\${encodeURIComponent(shareUrl)}\`;
      try{
        await navigator.clipboard.writeText(shareText + shareUrl);
        alert("Copied to clipboard! Paste it into your Messenger chat.");
      }catch(e){
        window.open(messengerUrl, "_blank");
      }
    }
  });
}

async function pollResults(gameId){
  try{
    const res = await fetch(\`/api/games/\${gameId}/entries\`);
    const data = await res.json();
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

function spinWheel(targetIndex, totalOptions, durationMs){
  return new Promise(resolve=>{
    const canvas = document.getElementById("wheelCanvas");
    const sliceDeg = 360 / totalOptions;
    // The pointer sits at the TOP of the wheel (canvas-angle 270\xB0, since
    // segment 0 is drawn starting at canvas-angle 0 = 3 o'clock and angles
    // increase clockwise). The base must be 270, not 360 \u2014 using 360 here
    // was a real bug: it left the wheel landing a consistent 90\xB0 off from
    // the actual winning segment on every single spin.
    const targetDeg = 270 - (targetIndex * sliceDeg) - (sliceDeg/2);
    const rotations = 10 + Math.floor(Math.random()*4);
    const finalDeg = wheelRotation + rotations*360 + ((targetDeg - (wheelRotation%360)) + 360)%360;
    const start = performance.now(), duration = durationMs || 7500, startDeg = wheelRotation;
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
  // The passcode is verified server-side by renderAdminDashboard()'s call
  // to /api/admin/dashboard \u2014 never compared here, since anything compared
  // in this file ships to every visitor's browser in plain text.
  const pass = prompt("Admin Passcode:");
  if (!pass) return;
  localStorage.setItem(ADMIN_KEY, pass);
  renderAdminDashboard();
});

window.setAdminGrade = (grade) => {
  currentAdminGrade = grade;
  renderAdminDashboard();
};

async function renderAdminDashboard(){
  const pass = localStorage.getItem(ADMIN_KEY);
  if (!pass) return;
  
  if (!currentAdminGrade) {
    app.innerHTML = \`
      \${heroHTML("Admin Dashboard")}
      <div class="card admin-dashboard">
        <h2 style="font-family:'Anton'; text-transform:uppercase; color:var(--navy); margin-bottom:16px; font-size:20px; text-align:center;">Select Grade</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px;">
          <button class="primary" onclick="setAdminGrade('League')" style="margin-top:0; height:60px; font-size:18px;">League</button>
          <button class="primary" onclick="setAdminGrade('Reserves')" style="margin-top:0; height:60px; font-size:18px;">Reserves</button>
          <button class="primary" onclick="setAdminGrade('Colts')" style="margin-top:0; height:60px; font-size:18px;">Colts</button>
          <button class="primary" onclick="setAdminGrade('Thirds')" style="margin-top:0; height:60px; font-size:18px;">Thirds</button>
        </div>
        <div class="center"><a class="back-link" id="adminLogout">Logout</a></div>
      </div>
    \`;
    document.getElementById("adminLogout").addEventListener("click", () => {
      localStorage.removeItem(ADMIN_KEY);
      renderPinScreen();
    });
    return;
  }
  
  app.innerHTML = \`\${heroHTML("Admin Dashboard")} <div class="center"><p>Loading...</p></div>\`;
  
  try {
    const res = await fetch(\`/api/admin/dashboard?passcode=\${pass}&grade=\${currentAdminGrade}\`);
    const data = await res.json();
    if (!res.ok && res.status === 401) { alert(data.error); localStorage.removeItem(ADMIN_KEY); renderPinScreen(); return; }
    const gradeOptionsHTML = \`
          <option value="League" \${currentAdminGrade==='League'?'selected':''}>League</option>
          <option value="Reserves" \${currentAdminGrade==='Reserves'?'selected':''}>Reserves</option>
          <option value="Colts" \${currentAdminGrade==='Colts'?'selected':''}>Colts</option>
          <option value="Thirds" \${currentAdminGrade==='Thirds'?'selected':''}>Thirds</option>
    \`;
    const lockoutSectionHTML = \`
          <div class="lockout-section \${data.wheelLockout ? 'lockout-active' : ''}" style="margin-bottom:16px;padding:14px;border-radius:10px;border:2px solid \${data.wheelLockout ? 'var(--red)' : 'var(--navy)'};background:\${data.wheelLockout ? '#fff1f1' : '#f8fafc'};">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
              <div>
                <div style="font-family:'Anton';text-transform:uppercase;color:var(--navy);font-size:15px;">\u{1F512} Wheel Lockout (all grades)</div>
                <div style="font-size:12.5px;color:#475569;margin-top:2px;">\${data.wheelLockout ? 'Locked \u2014 no one can spin any grade right now.' : 'Open \u2014 spins allowed as normal.'}</div>
              </div>
              <button class="primary" id="lockoutToggleBtn" style="margin-top:0;white-space:nowrap;background:\${data.wheelLockout ? 'var(--navy)' : 'var(--red)'};box-shadow:0 4px 0 \${data.wheelLockout ? 'var(--navy-deep)' : '#9c1c1c'};">
                \${data.wheelLockout ? 'Unlock Wheel' : 'Lock Out Wheel'}
              </button>
            </div>
          </div>
    \`;
    if (data.noGame) {
      app.innerHTML = \`
        \${heroHTML("Admin Dashboard")}
        <div class="card admin-dashboard">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <a class="back-link" onclick="setAdminGrade(null)" style="cursor:pointer;">&larr; Back to Grades</a>
            <a class="back-link" id="adminLogout">Logout</a>
          </div>

          <label>Select Grade</label>
          <select id="adminGradeSelect" style="margin-bottom:16px;">\${gradeOptionsHTML}</select>
          \${lockoutSectionHTML}
          <div class="locked-note" style="margin-bottom:16px;">No active game for <strong>\${currentAdminGrade}</strong> yet. Trigger a sync or create a mock game below.</div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
            <button class="primary" id="syncPlayHQBtn" style="margin-top:0; background:var(--navy); box-shadow:0 4px 0 var(--navy-deep);">Sync PlayHQ</button>
            <button class="primary" id="createMockBtn" style="margin-top:0; background:var(--gold); color:var(--navy); box-shadow:0 4px 0 #b58527;">Create Mock</button>
          </div>
        </div>
      \`;
    } else {
      app.innerHTML = \`
        \${heroHTML("Admin Dashboard")}
        <div class="card admin-dashboard">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <a class="back-link" onclick="setAdminGrade(null)" style="cursor:pointer;">&larr; Back to Grades</a>
            <a class="back-link" id="adminLogout">Logout</a>
          </div>

          <label>Select Grade</label>
          <select id="adminGradeSelect" style="margin-bottom:16px;">\${gradeOptionsHTML}</select>
          \${lockoutSectionHTML}

          <div class="stat-grid">
            <div class="stat-card"><div class="stat-label">Grade</div><div class="stat-value">\${currentAdminGrade}</div></div>
            <div class="stat-card"><div class="stat-label">Prize Pool</div><div class="stat-value">$\${(data.game.total_amount || 0).toFixed(2)}</div></div>
          </div>
          <div class="stat-card" style="margin-bottom:16px;">
            <div class="stat-label">Payment Deadline</div>
            <div class="stat-value" style="font-size:14px;">\${data.game.payment_deadline_at ? new Date(data.game.payment_deadline_at).toLocaleString() : 'N/A'}</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
            <button class="primary" id="syncPlayHQBtn" style="margin-top:0; background:var(--navy); box-shadow:0 4px 0 var(--navy-deep);">Sync PlayHQ</button>
            <button class="primary" id="createMockBtn" style="margin-top:0; background:var(--gold); color:var(--navy); box-shadow:0 4px 0 #b58527;">Create Mock</button>
          </div>

          <button class="btn-danger" id="clearSpinsBtn" style="margin-bottom:16px;">Clear all spins for \${currentAdminGrade}</button>

          \${data.result ? (
            data.result.is_jackpot ? \`
              <div class="admin-jackpot-banner">
                <div class="admin-winner-trophy">\u{1F4B0}</div>
                <div class="admin-winner-eyebrow">Jackpot \u2014 no one picked it</div>
                <div class="admin-winner-player">\${data.result.player_name}</div>
                <div class="admin-winner-sub">$\${(data.result.carry_over_amount || 0).toFixed(2)} carries over to next round</div>
              </div>
            \` : \`
              <div class="admin-winner-banner">
                <div class="admin-winner-trophy">\u{1F3C6}</div>
                <div class="admin-winner-eyebrow">Winner confirmed!</div>
                <div class="admin-winner-player">\${data.result.winner_name}</div>
                <div class="admin-winner-sub">Picked <b>\${data.result.player_name}</b> \u2014 $\${(data.result.total_prize_pool || 0).toFixed(2)} won</div>
              </div>
            \`
          ) : \`
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
        </div>
      \`;
    }

    document.getElementById("adminGradeSelect").addEventListener("change", (e) => {
      currentAdminGrade = e.target.value;
      renderAdminDashboard();
    });

    document.getElementById("lockoutToggleBtn").addEventListener("click", async () => {
      const nextLocked = !data.wheelLockout;
      const confirmMsg = nextLocked
        ? "Lock out the wheel for ALL grades? No one will be able to spin until you unlock it."
        : "Unlock the wheel for all grades?";
      if (!confirm(confirmMsg)) return;
      const btn = document.getElementById("lockoutToggleBtn");
      btn.disabled = true;
      btn.textContent = "Updating...";
      try {
        const res = await fetch("/api/admin/toggle-lockout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pass, locked: nextLocked })
        });
        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          renderAdminDashboard();
        } else {
          alert("Could not update lockout: " + (resData.error || ("HTTP " + res.status)));
          btn.disabled = false;
        }
      } catch (e) {
        alert("Network error \u2014 could not update lockout. Try again.");
        btn.disabled = false;
      }
    });

    document.getElementById("adminLogout").addEventListener("click", () => {
      localStorage.removeItem(ADMIN_KEY);
      renderPinScreen();
    });

    document.getElementById("syncPlayHQBtn").addEventListener("click", async () => {
      if (!confirm("Trigger manual sync from PlayHQ? This will check for upcoming games and sync rosters.")) return;
      const btn = document.getElementById("syncPlayHQBtn");
      btn.disabled = true; btn.textContent = "Syncing...";
      try {
        const res = await fetch("/api/admin/sync-playhq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pass })
        });
        const d = await res.json();
        alert(d.ok ? d.message : d.error);
        renderAdminDashboard();
      } catch(e) { alert("Network error"); }
      finally { btn.disabled = false; btn.textContent = "Sync PlayHQ"; }
    });

    document.getElementById("createMockBtn").addEventListener("click", async () => {
      if (!confirm("Create a mock game for " + currentAdminGrade + "? This will draw 22 players from the voting roster.")) return;
      const btn = document.getElementById("createMockBtn");
      btn.disabled = true; btn.textContent = "Creating...";
      try {
        const res = await fetch("/api/admin/create-mock-game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pass, grade: currentAdminGrade })
        });
        const d = await res.json();
        if (d.ok) { alert("Mock game created!"); renderAdminDashboard(); }
        else { alert(d.error); }
      } catch(e) { alert("Network error"); }
      finally { btn.disabled = false; btn.textContent = "Create Mock"; }
    });

    document.getElementById("clearSpinsBtn").addEventListener("click", async () => {
      const grade = currentAdminGrade;
      const gameId = data.game.id;
      const entryCount = data.entries.length;
      const confirmMsg = entryCount > 0
        ? \`Clear all \${entryCount} spin(s) for \${grade}? This wipes every entry, un-sets any confirmed result, and puts every player back in the wheel. This cannot be undone.\`
        : \`No spins recorded yet for \${grade}, but this will still reset the wheel and clear any confirmed result. Continue?\`;
      if (!confirm(confirmMsg)) return;
      const btn = document.getElementById("clearSpinsBtn");
      btn.disabled = true;
      btn.textContent = "Clearing...";
      try{
        const res = await fetch("/api/admin/clear-spins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pass, gameId })
        });
        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          alert(\`Cleared \${resData.cleared} spin(s) for \${grade}. Wheel is reset and reopened.\`);
          renderAdminDashboard();
        } else {
          alert("Could not clear spins: " + (resData.error || ("HTTP " + res.status)));
          btn.disabled = false;
          btn.textContent = \`Clear all spins for \${grade}\`;
        }
      }catch(e){
        alert("Network error \u2014 could not clear spins. Try again.");
        btn.disabled = false;
        btn.textContent = \`Clear all spins for \${grade}\`;
      }
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
        btn.disabled = true;
        btn.textContent = "Confirming...";
        try{
          const res = await fetch("/api/admin/confirm-result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passcode: pass, gameId: data.game.id, playerId: selectedPlayerId })
          });
          const resData = await res.json().catch(() => ({}));
          if (res.ok) {
            renderAdminDashboard();
          } else {
            alert("Could not confirm result: " + (resData.error || ("HTTP " + res.status)));
            btn.disabled = false;
            btn.textContent = "Confirm Result";
          }
        }catch(e){
          alert("Network error \u2014 could not confirm result. Try again.");
          btn.disabled = false;
          btn.textContent = "Confirm Result";
        }
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

