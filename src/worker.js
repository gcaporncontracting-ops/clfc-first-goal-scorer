// CLFC First Goal Scorer — Phase 1
//
// PIN auth reuses the SAME player PINs as Warriors-vote-v2, via the shared
// VOTES_KV namespace (read-only from this app — never .put()/.delete()
// anything in it). Looks up the reverse index `pinused:{pin}` -> voterSlug,
// same key VOTES_KV already maintains for its own change-pin feature.
//
// Mock Player HQ mode: since the real Player HQ API isn't available yet,
// getPlayersForGame() below draws 22 random names from each grade's real
// roster (also read from VOTES_KV, gradelist:{grade}), clearly flagged as
// mock/test data via games.is_mock=1 — never silently pretending to be real.

const ACTIVE_GRADES = ["League", "Reserves", "Colts", "Thirds"];
const ENTRY_FEE = 2;
const PAYID_EMAIL = "playersfund@clfc.com";
const EXPECTED_PLAYERS = 22;
const TESTING_MASTER_PIN = "0000";
const ADMIN_PASSCODE = "clfcgoals2026"; // stopgap ahead of the Phase 2 admin dashboard

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function uid() {
  return crypto.randomUUID();
}
function secureRandomIndex(n) {
  // Cryptographically secure random index in [0, n) — never Math.random().
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

// ---------------- Mock Player HQ service ----------------
// Conceptually PlayerHQService.getPlayersForGame(). This mock implementation
// draws from the real club roster (via the shared VOTES_KV) instead of
// placeholder names, so testing feels like the real thing. Swap this
// function's internals for a real Player HQ call later — nothing else in
// the app needs to change.
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

// Get (or lazily create) the current open mock game for a grade.
async function getOrCreateCurrentGame(env, grade) {
  const existing = await env.DB.prepare(
    `SELECT * FROM games WHERE grade = ? AND status = 'open' ORDER BY created_at DESC LIMIT 1`
  ).bind(grade).first();
  if (existing) return existing;

  const names = await mockGetPlayersForGrade(env, grade);
  if (names.length < EXPECTED_PLAYERS) {
    throw new Error(`Only found ${names.length} players for ${grade} — need ${EXPECTED_PLAYERS}. Not starting a draw with an incomplete list.`);
  }

  const gameId = uid();
  await env.DB.prepare(
    `INSERT INTO games (id, grade, home_team, away_team, game_date_time, status, is_mock) VALUES (?,?,?,?,?,?,1)`
  ).bind(gameId, grade, "Cockburn Lakes", "TBC (mock)", new Date().toISOString(), "open").run();

  const stmt = env.DB.prepare(
    `INSERT INTO players (id, name, grade, game_id, is_private, active) VALUES (?,?,?,?,0,1)`
  );
  const batch = names.map((name) => stmt.bind(uid(), name, grade, gameId));
  await env.DB.batch(batch);

  await audit(env.DB, "game_created", { entity_id: gameId, game_id: gameId, metadata: { grade, mock: true, playerCount: names.length } });

  return env.DB.prepare(`SELECT * FROM games WHERE id = ?`).bind(gameId).first();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // ---------- PIN auth (shared with Warriors-vote-v2) ----------
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

    // ---------- Current game + players for a grade ----------
    if (pathname === "/api/games/current" && request.method === "GET") {
      const grade = url.searchParams.get("grade");
      if (!grade || !ACTIVE_GRADES.includes(grade)) return json({ error: "Unknown grade" }, 400);
      try {
        const game = await getOrCreateCurrentGame(env, grade);
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

    // ---------- Spin: server picks the winner, always ----------
    if (pathname.match(/^\/api\/games\/[^/]+\/entries$/) && request.method === "POST") {
      const gameId = pathname.split("/")[3];
      const body = await request.json().catch(() => null);
      if (!body) return json({ error: "Invalid request" }, 400);
      const { fullName, voterSlug, pin } = body;

      if (!fullName || !fullName.trim()) return json({ error: "Name is required" }, 400);

      // Re-validate the PIN server-side on the actual spin request too —
      // never trust that a prior /api/auth/pin call is still "current."
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

      // find-or-create participant
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

      // Lock-out: any unpaid entry from a PAST draw blocks a new spin.
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

      // Already spun this game?
      const already = await env.DB.prepare(`SELECT * FROM entries WHERE game_id = ? AND participant_id = ?`)
        .bind(gameId, participant.id).first();
      if (already) return json({ error: "You've already spun for this draw." }, 409);

      // ---- The actual spin: private players give a free second chance ----
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
          continue; // spin again, this pick doesn't count as their entry
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

    // ---------- Live results table (polled) ----------
    if (pathname.match(/^\/api\/games\/[^/]+\/entries$/) && request.method === "GET") {
      const gameId = pathname.split("/")[3];
      const { results } = await env.DB.prepare(
        `SELECT e.id, p.full_name AS participant, pl.name AS player, e.payment_status, e.created_at
         FROM entries e
         JOIN participants p ON p.id = e.participant_id
         JOIN players pl ON pl.id = e.player_id
         WHERE e.game_id = ?
         ORDER BY e.created_at DESC`
      ).bind(gameId).all();
      return json({ entries: results });
    }

    // ---------- Participant reports they've paid (does NOT mark paid) ----------
    if (pathname.match(/^\/api\/entries\/[^/]+\/payment-reported$/) && request.method === "POST") {
      const entryId = pathname.split("/")[3];
      await env.DB.prepare(`UPDATE entries SET payment_reported_at = datetime('now') WHERE id = ?`).bind(entryId).run();
      await audit(env.DB, "payment_reported", { entity_id: entryId });
      return json({ ok: true, message: "Thanks — an admin will confirm your payment." });
    }

    // ---------- Admin stopgap: mark paid (full dashboard is Phase 2) ----------
    if (pathname === "/api/admin/mark-paid" && request.method === "POST") {
      const { entryId, passcode } = await request.json().catch(() => ({}));
      if (passcode !== ADMIN_PASSCODE) return json({ error: "Invalid passcode" }, 401);
      await env.DB.prepare(`UPDATE entries SET payment_status = 'paid' WHERE id = ?`).bind(entryId).run();
      await audit(env.DB, "payment_verified", { entity_id: entryId });
      return json({ ok: true });
    }

    return env.ASSETS.fetch(request);
  },
};
