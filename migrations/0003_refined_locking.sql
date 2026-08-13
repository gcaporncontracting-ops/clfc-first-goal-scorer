-- Add deadline tracking to games
ALTER TABLE games ADD COLUMN payment_deadline_at DATETIME;

-- We can already track per-grade locking using the existing entries table 
-- (game_id + participant_id is unique per entry, and game_id is tied to a grade).
-- However, we should ensure the Sunday 12pm logic is handled in the worker.
