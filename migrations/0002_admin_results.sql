-- CLFC First Goal Scorer — Admin Results System (Phase 2)

-- Track game results
CREATE TABLE IF NOT EXISTS game_results (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE REFERENCES games(id),
  winning_player_id TEXT NOT NULL REFERENCES players(id),
  winner_entry_id TEXT REFERENCES entries(id), -- NULL if jackpot
  total_prize_pool REAL NOT NULL,
  is_jackpot INTEGER NOT NULL DEFAULT 0,
  carry_over_amount REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_by TEXT -- Admin identifier
);

-- Add jackpot tracking to games
ALTER TABLE games ADD COLUMN starting_jackpot REAL DEFAULT 0;
ALTER TABLE games ADD COLUMN final_prize_pool REAL DEFAULT 0;
ALTER TABLE games ADD COLUMN winning_player_id TEXT REFERENCES players(id);
ALTER TABLE games ADD COLUMN result_status TEXT DEFAULT 'pending'; -- pending | result_set | jackpot

-- Add index for results
CREATE INDEX IF NOT EXISTS idx_game_results_game ON game_results(game_id);
