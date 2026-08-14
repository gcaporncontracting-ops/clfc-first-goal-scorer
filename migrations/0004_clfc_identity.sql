-- CLFC Identity Migration (Internal ID CLFC-XXXX, PIN authentication, PlayHQ UID mapping)

CREATE TABLE IF NOT EXISTS club_members (
  internal_id TEXT PRIMARY KEY, -- e.g. CLFC-0001
  full_name TEXT NOT NULL,
  pin TEXT NOT NULL, -- 4-digit PIN credential
  playhq_id TEXT NOT NULL, -- PlayHQ UID
  teams TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_club_members_pin ON club_members(pin);
CREATE INDEX IF NOT EXISTS idx_club_members_playhq ON club_members(playhq_id);
