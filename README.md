# CLFC First Goal Scorer

A $2 first-goal-scorer draw app for Cockburn Lakes F.C. — spin a 22-player
wheel, winner takes 75% of the pot. Built on Cloudflare Workers + D1,
entirely on free-tier services (no paid Cloudflare features anywhere).

## Status: Phase 1 complete

**Working end-to-end right now, using mock Player HQ data:**
- PIN entry → name confirmation → grade selection → 22-player wheel → spin
- PIN auth is **shared with Warriors-vote-v2** — enter the same PIN you use
  to vote (or `0000` for testing). Read-only access via the shared
  `VOTES_KV` KV namespace.
- The server always picks the winner (via `crypto.getRandomValues`), never
  the browser — the frontend just animates to whatever the server already
  decided.
- Private-player "second chance" logic: if a private player is drawn, they're
  removed from the wheel and the participant spins again automatically,
  server-side, without it counting as their real entry.
- Once picked, a player is removed from that game's wheel — can't be drawn
  twice.
- Entries are immutable — no edit/delete/re-spin from the participant UI.
- Live results table via polling (every 6s) — no WebSockets, since those
  need Cloudflare's paid plan (Durable Objects). Polling achieves the same
  practical effect for free.
- $2 PayID payment instructions shown after every spin, `payment_status`
  starts `pending` and is never auto-marked paid by a button click.
- A participant with any unpaid entry from a past draw is blocked from
  spinning in a new one, until an admin marks it paid.

**Mock Player HQ mode:** since the real Player HQ API isn't available yet,
`mockGetPlayersForGrade()` in `src/worker.js` draws 22 real names at random
from each grade's actual roster (via the same shared `VOTES_KV`), rather
than placeholder names — every game created this way is flagged
`is_mock = 1` in the database, so it's never silently confused with a real
draw once Player HQ integration lands.

## Not yet built (see PROJECT_BRIEF.md)

- **Phase 2** — full admin dashboard (view/export entries, mark paid,
  reset/close draws with audited deletion)
- **Phase 3** — real Player HQ adapter, Saturday 7am cron check, full audit
  log coverage, PIN-attempt rate limiting, automated test suite

A minimal stopgap admin endpoint exists ahead of Phase 2 so testing isn't
blocked once someone has a pending entry:

```
POST /api/admin/mark-paid
{ "entryId": "...", "passcode": "94172079" }
```

## Setup

```bash
npm install     # none currently required — pure Worker, no build step
npx wrangler d1 execute clfc-first-goal-scorer --remote --file=migrations/0001_init.sql
npx wrangler deploy
```

`wrangler.toml` already has the D1 database ID and the shared `VOTES_KV`
namespace ID wired in.

## Project structure

```
src/worker.js       — all API routes, mock Player HQ service, spin logic
public/index.html   — mobile-first frontend (PIN → name → grade → wheel)
migrations/          — D1 schema
.env.example
```
