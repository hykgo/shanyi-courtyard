ALTER TABLE messages ADD COLUMN owner_token_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_owner_token_hash
ON messages (owner_token_hash);
