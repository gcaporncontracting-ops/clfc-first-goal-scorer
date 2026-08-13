// CLFC First Goal Scorer — Phase 1
// Refined Game Cycle with Sunday 12pm Deadline and PlayHQ Integration

const ACTIVE_GRADES = ["League", "Reserves", "Colts", "Thirds"];
const ENTRY_FEE = 2;
const PAYID_EMAIL = "playersfund@clfc.com";
const EXPECTED_PLAYERS = 22;
const TESTING_MASTER_PIN = "0000";
const ADMIN_PASSCODE = "clfcgoals2026";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
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
  await db
    .prepare(`INSERT INTO audit_log (event_type, entity_id, participant_id, game_id, metadata) VALUES (?,?,?,?,?)`)
    .bind(event_type, entity_id, participant_id, game_id, metadata ? JSON.stringify(metadata) : null)
    .run();
}

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

  // Default deadline: next Sunday 12:00 PM
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  sunday.setHours(12, 0, 0, 0);
  const deadlineISO = sunday.toISOString();

  const gameId = uid();
  await env.DB.prepare(
    `INSERT INTO games (id, grade, home_team, away_team, game_date_time, payment_deadline_at, status, is_mock, starting_jackpot) VALUES (?,?,?,?,?,?,'open',1,?)`
  ).bind(gameId, grade, "Cockburn Lakes", "TBC (mock)", new Date().toISOString(), deadlineISO, startingJackpot).run();

  const stmt = env.DB.prepare(
    `INSERT INTO players (id, name, grade, game_id, is_private, active) VALUES (?,?,?,?,0,1)`
  );
  const batch = names.map((name) => stmt.bind(uid(), name, grade, gameId));
  await env.DB.batch(batch);

  await audit(env.DB, "game_created", { entity_id: gameId, game_id: gameId, metadata: { grade, mock: true, playerCount: names.length } });

  return env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
}

import { syncSaturdayGames } from "./playhq_sync.js";

export default {
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
      const fullName = (await env.VOTES_KV.get(`name:${voterSlug}`)) || voterSlug;

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
        
        if (game.status === 'open' && game.game_date_time) {
          const startTime = new Date(game.game_date_time).getTime();
          if (Date.now() >= startTime) {
            await env.DB.prepare(`UPDATE games SET status = 'locked' WHERE id = ?`).bind(game.id).run();
            game.status = 'locked';
          }
        }

        const entries = await env.DB.prepare(`SELECT COUNT(*) as count FROM entries WHERE game_id = ?`).bind(game.id).first();
        game.final_prize_pool = (entries.count * ENTRY_FEE) + (game.starting_jackpot || 0);
        
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
        await env.DB.prepare(`INSERT INTO participants (id, full_name, voter_slug) VALUES (?,?,?)`)
          .bind(pid, fullName.trim(), confirmedSlug).run();
        participant = { id: pid, full_name: fullName.trim(), voter_slug: confirmedSlug };
      }

      const already = await env.DB.prepare(`SELECT * FROM entries WHERE game_id = ? AND participant_id = ?`)
        .bind(gameId, participant.id).first();
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
        entity_id: entryId, participant_id: participant.id, game_id: gameId,
        metadata: { player: finalPlayer.name, secondChances },
      });

      return json({
        entryId,
        player: { name: finalPlayer.name },
        secondChances,
        entryFee: ENTRY_FEE,
        payIdEmail: PAYID_EMAIL,
        message: "This selection is final and cannot be changed.",
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

      // Sunday 12pm Jackpot logic
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
      if (game.status === 'closed') return json({ error: "Game already closed" }, 400);

      const existingResult = await env.DB.prepare(`SELECT id FROM game_results WHERE game_id = ?`).bind(gameId).first();
      if (existingResult) return json({ error: "Result already confirmed for this game" }, 400);

      const { results: entries } = await env.DB.prepare(`SELECT * FROM entries WHERE game_id = ?`).bind(gameId).all();
      const totalAmount = entries.reduce((sum, e) => sum + e.entry_fee, 0) + (game.starting_jackpot || 0);
      
      const winnerEntry = entries.find(e => e.player_id === playerId);
      const isJackpot = !winnerEntry;

      const resultId = uid();
      await env.DB.prepare(`
        INSERT INTO game_results (id, game_id, winning_player_id, winner_entry_id, total_prize_pool, is_jackpot, carry_over_amount, confirmed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'admin')
      `).bind(
        resultId, gameId, playerId, 
        winnerEntry ? winnerEntry.id : null, 
        totalAmount, isJackpot ? 1 : 0, 
        isJackpot ? totalAmount : 0
      ).run();

      await env.DB.prepare(`
        UPDATE games SET 
          status = 'locked', 
          winning_player_id = ?, 
          final_prize_pool = ?, 
          result_status = ? 
        WHERE id = ?
      `).bind(playerId, totalAmount, isJackpot ? 'jackpot' : 'result_set', gameId).run();

      await audit(env.DB, "result_confirmed", { 
        entity_id: resultId, game_id: gameId, 
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

    // Serve Frontend
    return new Response(INDEX_HTML_CONTENT, { headers: { "Content-Type": "text/html" } });
  }
};

const INDEX_HTML_CONTENT = REPLACE_ME;
