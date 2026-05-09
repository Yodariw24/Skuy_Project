ALTER TABLE users ADD COLUMN is_two_fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN two_fa_secret VARCHAR(255);