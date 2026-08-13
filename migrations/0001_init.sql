-- CLFC First Goal Scorer — D1 schema (Phase 1)

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  player_hq_game_id TEXT,
  grade TEXT NOT NULL,
  home_team TEXT,
  away_team TEXT,
  game_date_time TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open | locked | closed
  is_mock INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  player_hq_id TEXT,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  game_id TEXT NOT NULL REFERENCES games(id),
  is_private INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  removed_from_wheel INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  voter_slug TEXT, -- links to the shared VOTES_KV player identity, when known via real PIN
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id),
  participant_id TEXT NOT NULL REFERENCES participants(id),
  player_id TEXT NOT NULL REFERENCES players(id),
  entry_fee REAL NOT NULL DEFAULT 2,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending | paid
  payment_reported_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  spin_completed_at TEXT,
  UNIQUE(game_id, participant_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  entity_id TEXT,
  participant_id TEXT,
  game_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_entries_game ON entries(game_id);
CREATE INDEX IF NOT EXISTS idx_entries_participant ON entries(participant_id);
CREATE INDEX IF NOT EXISTS idx_games_grade_status ON games(grade, status);
