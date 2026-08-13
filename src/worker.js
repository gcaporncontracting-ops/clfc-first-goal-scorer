// CLFC First Goal Scorer — Phase 1
//
// PIN auth reuses the SAME player PINs as Warriors-vote-v2, via the shared
// VOTES_KV namespace (read-only from this app — never .put()/.delete()
// anything in it). Looks up the reverse index `pinused:{pin}` -> voterSlug,
// same key VOTES_KV already maintains for its own change-pin feature.

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
    `SELECT * FROM games WHERE grade = ? AND status = 'open' ORDER BY created_at DESC LIMIT 1`
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

  const gameId = uid();
  await env.DB.prepare(
    `INSERT INTO games (id, grade, home_team, away_team, game_date_time, status, is_mock, starting_jackpot) VALUES (?,?,?,?,?,?,1,?)`
  ).bind(gameId, grade, "Cockburn Lakes", "TBC (mock)", new Date().toISOString(), "open", startingJackpot).run();

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
    // This runs on the schedule defined in wrangler.toml (8:00 AM and 9:30 AM AWST)
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
        
        // Auto-lock check based on game start time
        if (game.status === 'open' && game.game_date_time) {
          const startTime = new Date(game.game_date_time).getTime();
          const now = Date.now();
          if (now >= startTime) {
            await env.DB.prepare(`UPDATE games SET status = 'locked' WHERE id = ?`).bind(game.id).run();
            game.status = 'locked';
          }
        }

        // Calculate current prize pool (including starting jackpot)
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
      }
      if (!participant) {
        const pid = uid();
        await env.DB.prepare(`INSERT INTO participants (id, full_name, voter_slug) VALUES (?,?,?)`)
          .bind(pid, fullName.trim(), confirmedSlug).run();
        participant = { id: pid, full_name: fullName.trim(), voter_slug: confirmedSlug };
      }

      if (confirmedSlug) {
        const unpaid = await env.DB.prepare(
          `SELECT e.id FROM entries e
           JOIN participants p ON p.id = e.participant_id
           WHERE p.voter_slug = ? AND e.payment_status = 'pending' AND e.game_id != ?
           LIMIT 1`
        ).bind(confirmedSlug, gameId).first();
        if (unpaid) {
          return json({ error: `You have an unpaid $2 entry from a previous draw. Pay via PayID to ${PAYID_EMAIL} and ask an admin to confirm it before you can spin again.` }, 403);
        }
      }

      const already = await env.DB.prepare(`SELECT * FROM entries WHERE game_id = ? AND participant_id = ?`)
        .bind(gameId, participant.id).first();
      if (already) return json({ error: "You've already spun for this draw." }, 409);

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
        SELECT gr.*, p.full_name as winner_name
        FROM game_results gr
        LEFT JOIN entries e ON e.id = gr.winner_entry_id
        LEFT JOIN participants p ON p.id = e.participant_id
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

      // Check for games past deadline that are still 'locked' (result set but winner hasn't paid)
      const expiredGames = await env.DB.prepare(
        `SELECT g.id, g.grade, gr.total_prize_pool 
         FROM games g 
         JOIN game_results gr ON g.id = gr.game_id 
         WHERE g.status = 'locked' AND g.payment_deadline_at < datetime('now') 
         AND gr.is_jackpot = 0 AND (SELECT payment_status FROM entries WHERE id = gr.winner_entry_id) = 'pending'`
      ).all();

      for (const g of expiredGames.results || []) {
        // Jackpot it!
        await env.DB.prepare(`UPDATE game_results SET is_jackpot = 1, carry_over_amount = total_prize_pool WHERE game_id = ?`).bind(g.id).run();
        await env.DB.prepare(`UPDATE games SET result_status = 'jackpot' WHERE id = ?`).bind(g.id).run();
        await audit(env.DB, "deadline_jackpot", { game_id: g.id, metadata: { reason: "payment_deadline_expired" } });
      }

      let query = `
        SELECT g.*, 
               (SELECT COUNT(*) FROM entries WHERE game_id = g.id) as total_bets,
               (SELECT COUNT(*) * entry_fee FROM entries WHERE game_id = g.id) as total_amount
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
      await audit(env.DB, "payment_status_updated", { entity_id: entryId, metadata: { status } });
      return json({ ok: true });
    }

    // Default: Serve embedded index.html
    return new Response(INDEX_HTML_CONTENT, { headers: { 'Content-Type': 'text/html' } });
  }
};

const INDEX_HTML_CONTENT = `<!DOCTYPE html>
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
      <p><strong>15%</strong> of the pot goes to the players fund. Payouts are via PayID, or can be credited toward future spins.</p>
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
    if (!/^\d{4}$/.test(pin)){ errBox.innerHTML = \`<p class="error">Enter a 4-digit PIN.</p>\`; return; }
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
    \${heroHTML(known ? "Confirm your name" : "Enter your name to continue")}
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
function renderGradeSelect(){
  const grades = ["League","Reserves","Colts","Thirds"];
  app.innerHTML = \`
    \${heroHTML("Pick your grade")}
    <div class="card">
      <div class="grade-grid">
        \${grades.map(g=>\`<button class="grade-btn" data-grade="\${g}">\${g}</button>\`).join("")}
      </div>
      <p class="muted" id="gradeStatus"></p>
    </div>
  \`;
  document.querySelectorAll(".grade-btn").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const grade = btn.dataset.grade;
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

// ---------------- Step 4: wheel + spin ----------------
async function renderGradeSpin(grade, gameId, session){
  app.innerHTML = \`\${heroHTML("Loading wheel...")}\`;
  const playersRes = await fetch(\`/api/games/\${gameId}/players\`).then(r=>r.json());
  const players = playersRes.players || [];

  app.innerHTML = \`
    \${heroHTML(grade + " — spin to find your player")}
    <div id="resultBannerArea"></div>
    <div class="card">
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

  let wheelOptions = players.map(p=>p.name);
  drawWheel(wheelOptions);
  pollResults(gameId);
  if (activePollInterval) clearInterval(activePollInterval);
  activePollInterval = setInterval(()=>pollResults(gameId), 6000);

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
      if (!res.ok){
        errBox.innerHTML = \`<p class="error">\${data.error}</p>\`;
        btn.disabled = false; btn.textContent = "Spin the wheel";
        return;
      }
      if (activePollInterval) { clearInterval(activePollInterval); activePollInterval = null; }
      isSpinning = true;
      await animateWheelTo(wheelOptions, data.player.name);
      
      await new Promise(r => setTimeout(r, 800));
      
      isSpinning = false;
      renderResult(data);
      pollResults(gameId);
      activePollInterval = setInterval(()=>pollResults(gameId), 6000);
    }catch(e){
      errBox.innerHTML = \`<p class="error">Network error — try again.</p>\`;
      btn.disabled = false; btn.textContent = "Spin the wheel";
    }
  });
}

function renderResult(data){
  const box = document.getElementById("resultArea");
  const spinBtn = document.getElementById("spinBtn");
  if (spinBtn) spinBtn.style.display = "none";
  box.innerHTML = \`
    <div class="result-box">
      <div class="big-tick">✓</div>
      <h2>You got</h2>
      <div class="player-name">\${data.player.name}</div>
      <p class="final-note">This selection is final and cannot be changed.</p>
    </div>
    <div class="pay-box">
      <h3>Entry fee: $\${data.entryFee}</h3>
      <p>Please transfer $\${data.entryFee} using PayID to:</p>
      <div class="payid">\${data.payIdEmail}</div>
      <p class="muted" style="margin-top:8px;">Status: <strong style="color:var(--red);">Payment pending</strong> — an admin will confirm it.</p>
      <button class="primary" id="paidBtn" style="background:var(--navy);box-shadow:0 6px 0 var(--navy-deep);margin-top:10px;">I've paid</button>
    </div>
  \`;
  document.getElementById("paidBtn").addEventListener("click", async ()=>{
    const btn = document.getElementById("paidBtn");
    btn.disabled = true; btn.textContent = "Reporting...";
    await fetch(\`/api/entries/\${data.entryId}/payment-reported\`, { method:"POST" });
    btn.textContent = "Payment reported!";
  });
}

async function pollResults(gameId){
  try{
    const res = await fetch(\`/api/games/\${gameId}/entries\`);
    const data = await res.json();
    const table = document.getElementById("resultsTable");
    if (!table) return;
    
    if (!data.entries || data.entries.length === 0){
      table.innerHTML = \`<tbody><tr><td class="muted">No entries yet. Be the first!</td></tr></tbody>\`;
      return;
    }
    
    const bannerArea = document.getElementById("resultBannerArea");
    if (bannerArea && data.gameResult) {
      if (data.gameResult.is_jackpot) {
        bannerArea.innerHTML = \`
          <div class="jackpot-banner">
            <div class="banner-title">💰 JACKPOT</div>
            <div>Nobody selected the first goal scorer.</div>
            <div><strong>$\${data.gameResult.carry_over_amount.toFixed(2)}</strong> jackpotted to next week.</div>
          </div>
        \`;
      } else {
        bannerArea.innerHTML = \`
          <div class="winner-banner">
            <div class="banner-title">🏆 WE HAVE A WINNER</div>
            <div><strong>\${data.gameResult.winner_name}</strong> won $\${data.gameResult.total_prize_pool.toFixed(2)}</div>
          </div>
        \`;
      }
    }

    const session = getSession();
    table.innerHTML = \`
      <thead><tr><th>Participant</th><th>Player</th><th>Payment</th></tr></thead>
      <tbody>
        \${data.entries.filter(e => {
          if (isSpinning && e.participant === session.fullName) return false;
          return true;
        }).map(e=>{
          const isWinner = data.gameResult && !data.gameResult.is_jackpot && e.id === data.gameResult.winner_entry_id;
          return \`
          <tr class="\${isWinner ? 'winner-row' : ''}">
            <td>\${isWinner ? '🏆 ' : ''}\${e.participant}\${isWinner ? ' — WINNER' : ''}</td>
            <td>\${e.player}</td>
            <td>
              <span class="\${e.payment_status==='paid'?'pay-paid':'pay-pending'}">\${e.payment_status}</span>
              \${isWinner ? \`<div style="color:#1c7a3d; font-size:10px;">$\${data.gameResult.total_prize_pool.toFixed(2)} WON</div>\` : ''}
            </td>
          </tr>
        \`}).join("")}
      </tbody>
    \`;
  }catch(e){ console.error(e); }
}

// ---------------- Admin Logic ----------------
document.getElementById("adminLoginLink").addEventListener("click", (e)=>{
  e.preventDefault();
  renderAdminLogin();
});

function renderAdminLogin(){
  app.innerHTML = \`
    \${heroHTML("Administrator Login")}
    <div class="card">
      <label for="adminPass">Admin Password</label>
      <input type="password" id="adminPass" placeholder="••••••••">
      <button class="primary" id="adminLoginBtn">Login</button>
      <div id="adminError"></div>
      <div class="center"><a class="back-link" id="adminBack">Back to App</a></div>
    </div>
  \`;
  document.getElementById("adminBack").addEventListener("click", main);
  document.getElementById("adminLoginBtn").addEventListener("click", async ()=>{
    const passcode = document.getElementById("adminPass").value;
    const errBox = document.getElementById("adminError");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ passcode })
      });
      if (res.ok) {
        localStorage.setItem(ADMIN_KEY, passcode);
        renderAdminDashboard();
      } else {
        errBox.innerHTML = \`<p class="error">Invalid password</p>\`;
      }
    } catch(e) {
      errBox.innerHTML = \`<p class="error">Network error</p>\`;
    }
  });
}

async function renderAdminDashboard(grade = currentAdminGrade){
  const passcode = localStorage.getItem(ADMIN_KEY);
  if (!passcode) return renderAdminLogin();
  currentAdminGrade = grade;
  
  app.innerHTML = \`\${heroHTML("Loading Dashboard...")}\`;
  
  try {
    const res = await fetch(\`/api/admin/dashboard?passcode=\${passcode}&grade=\${grade}\`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    const { game, players, entries, result } = data;
    const grades = ["League","Reserves","Colts","Thirds"];
    
    app.innerHTML = \`
      \${heroHTML("Admin Dashboard")}
      <div class="admin-dashboard">
        <label>Select Grade</label>
        <select id="adminGradeSelect" style="margin-bottom:16px;">
          \${grades.map(g => \`<option value="\${g}" \${g === grade ? 'selected' : ''}>\${g}</option>\`).join("")}
        </select>

        <div class="stat-grid">
          <div class="stat-card"><div class="stat-label">Week</div><div class="stat-value">Current</div></div>
          <div class="stat-card"><div class="stat-label">Grade</div><div class="stat-value">\${game.grade}</div></div>
          <div class="stat-card"><div class="stat-label">Total Bets</div><div class="stat-value">\${game.total_bets}</div></div>
          <div class="stat-card"><div class="stat-label">Prize Pool</div><div class="stat-value">$\${game.total_amount.toFixed(2)}</div></div>
        </div>
        
        <div class="card">
          <label>Status: <span style="color:var(--red)">\${result ? 'RESULT CONFIRMED' : 'RESULT PENDING'}</span></label>
          
          \${result ? \`
            <div class="result-box" style="margin-top:0">
              <div class="stat-label">Official First Goal Scorer</div>
              <div class="player-name" style="font-size:24px">\${result.player_name}</div>
              <div class="stat-label">Outcome</div>
              <div class="stat-value" style="color:\${result.is_jackpot ? 'var(--gold)' : '#1c7a3d'}">
                \${result.is_jackpot ? 'JACKPOT' : 'WINNER'}
              </div>
              \${!result.is_jackpot ? \`<div class="stat-label">Winner: \${result.winner_name}</div>\` : ''}
              <div class="stat-label">Amount: $\${(result.is_jackpot ? result.carry_over_amount : result.total_prize_pool).toFixed(2)}</div>
            </div>
          \` : \`
            <label>Enter First Goal Scorer</label>
            <div class="player-select-wrap">
              <input type="text" id="playerSearch" placeholder="Search player name...">
              <div class="player-results-list" id="playerList"></div>
            </div>
            <input type="hidden" id="selectedPlayerId">
            <button class="primary" id="confirmResultBtn" disabled>Confirm First Goal Scorer</button>
          \`}
        </div>

        <div class="results-title" style="margin-top:20px;">Manage Payments — \${game.grade}</div>
        <table class="results">
          <thead><tr><th>Participant</th><th>Player</th><th>Payment</th></tr></thead>
          <tbody>
            \${entries.map(e => \`
              <tr>
                <td>\${e.participant}</td>
                <td>\${e.player}</td>
                <td>
                  <span class="\${e.payment_status==='paid'?'pay-paid':'pay-pending'}">\${e.payment_status}</span>
                  <button class="btn-toggle" data-id="\${e.id}" data-status="\${e.payment_status}">
                    Mark as \${e.payment_status === 'paid' ? 'PENDING' : 'PAID'}
                  </button>
                </td>
              </tr>
            \`).join("")}
          </tbody>
        </table>
        
        <div class="center" style="margin-top:20px;"><a class="back-link" id="adminLogout" style="color:var(--navy)">Logout</a></div>
      </div>
    \`;
    
    document.getElementById("adminGradeSelect").addEventListener("change", (e) => {
      renderAdminDashboard(e.target.value);
    });

    document.querySelectorAll(".btn-toggle").forEach(btn => {
      btn.addEventListener("click", async () => {
        const entryId = btn.dataset.id;
        const currentStatus = btn.dataset.status;
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
        btn.disabled = true;
        btn.textContent = "Updating...";
        
        try {
          const res = await fetch("/api/admin/toggle-payment", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ passcode, entryId, status: newStatus })
          });
          if (res.ok) {
            renderAdminDashboard(grade);
          } else {
            alert("Failed to update payment status");
            btn.disabled = false;
            btn.textContent = \`Mark as \${newStatus.toUpperCase()}\`;
          }
        } catch(e) {
          alert("Network error");
          btn.disabled = false;
        }
      });
    });

    document.getElementById("adminLogout").addEventListener("click", ()=>{
      localStorage.removeItem(ADMIN_KEY);
      main();
    });
    
    if (!result) {
      const searchInput = document.getElementById("playerSearch");
      const list = document.getElementById("playerList");
      const confirmBtn = document.getElementById("confirmResultBtn");
      const idInput = document.getElementById("selectedPlayerId");
      
      searchInput.addEventListener("input", ()=>{
        const val = searchInput.value.toLowerCase();
        const matches = players.filter(p => p.name.toLowerCase().includes(val));
        if (val && matches.length > 0) {
          list.innerHTML = matches.map(p => \`<div class="player-result-item" data-id="\${p.id}">\${p.name}</div>\`).join("");
          list.style.display = "block";
        } else {
          list.style.display = "none";
        }
      });
      
      list.addEventListener("click", (e)=>{
        if (e.target.classList.contains("player-result-item")) {
          searchInput.value = e.target.textContent;
          idInput.value = e.target.dataset.id;
          list.style.display = "none";
          confirmBtn.disabled = false;
        }
      });
      
      confirmBtn.addEventListener("click", ()=>{
        renderConfirmScreen(game, searchInput.value, idInput.value);
      });
    }
    
  } catch(e) {
    app.innerHTML = \`<div class="card"><p class="error">\${e.message}</p><div class="center"><a class="back-link" onclick="location.reload()">Retry</a></div></div>\`;
  }
}

function renderConfirmScreen(game, playerName, playerId){
  app.innerHTML = \`
    \${heroHTML("Confirm Result")}
    <div class="card center">
      <p>You are about to confirm:</p>
      <div class="stat-label">First Goal Scorer</div>
      <div class="player-name" style="font-size:28px">\${playerName}</div>
      <p>Are you sure this is the official first goal scorer?</p>
      <button class="primary" id="finalConfirmBtn">Confirm Result</button>
      <button class="primary" id="cancelConfirmBtn" style="background:#666;box-shadow:0 6px 0 #444">Cancel</button>
    </div>
  \`;
  
  document.getElementById("cancelConfirmBtn").addEventListener("click", () => renderAdminDashboard(game.grade));
  document.getElementById("finalConfirmBtn").addEventListener("click", async ()=>{
    const btn = document.getElementById("finalConfirmBtn");
    btn.disabled = true; btn.textContent = "Processing...";
    const passcode = localStorage.getItem(ADMIN_KEY);
    
    try {
      const res = await fetch("/api/admin/confirm-result", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ passcode, gameId: game.id, playerId })
      });
      if (res.ok) {
        renderAdminDashboard(game.grade);
      } else {
        const data = await res.json();
        alert(data.error || "Error confirming result");
        btn.disabled = false; btn.textContent = "Confirm Result";
      }
    } catch(e) {
      alert("Network error");
      btn.disabled = false; btn.textContent = "Confirm Result";
    }
  });
}

// ---------------- Wheel drawing ----------------
const wheelColors = ['#d62828', '#ffffff', '#1d4fd8'];
let wheelRotation = 0;
let activePollInterval = null;
let isSpinning = false;

function drawWheel(options){
  const canvas = document.getElementById("wheelCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = 640;
  canvas.width = size; canvas.height = size;
  const center = size/2, radius = size/2 - 4, hubRadius = 40;
  ctx.clearRect(0,0,size,size);
  const slice = (Math.PI*2) / Math.max(options.length,1);

  options.forEach((name, i)=>{
    const start = i*slice, end = start+slice;
    const bg = wheelColors[i % wheelColors.length];
    ctx.beginPath(); ctx.moveTo(center,center); ctx.arc(center,center,radius,start,end); ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = '#0b1c4d'; ctx.lineWidth = 2; ctx.stroke();

    const textColor = bg === '#ffffff' ? '#132a6e' : '#ffffff';
    const mid = start + slice/2;
    const startRadius = radius - 16;
    const innerLimit = hubRadius + 12;
    const maxRunLength = startRadius - innerLimit;

    ctx.save();
    ctx.translate(center + Math.cos(mid)*startRadius, center + Math.sin(mid)*startRadius);
    ctx.rotate(mid + Math.PI);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;

    let fontSize = 24;
    while (fontSize >= 11){
      ctx.font = \`bold \${fontSize}px 'Work Sans', Arial\`;
      if (ctx.measureText(name).width <= maxRunLength) break;
      fontSize -= 1;
    }
    ctx.font = \`bold \${fontSize}px 'Work Sans', Arial\`;
    ctx.fillText(name, 0, 0);
    ctx.restore();
  });

  ctx.beginPath(); ctx.arc(center,center,hubRadius,0,Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle='#132a6e'; ctx.lineWidth=4; ctx.stroke();
}

function animateWheelTo(options, winnerName){
  return new Promise(resolve=>{
    const canvas = document.getElementById("wheelCanvas");
    const idx = Math.max(0, options.indexOf(winnerName));
    const slice = 360/options.length;
    const targetDeg = 270 - (idx*slice + slice/2);
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

main();
</script>
</body>
</html>
`;
