CREATE INDEX IF NOT EXISTS idx_messages_ip_hash_created_at
ON messages (ip_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_ip_hash_content_created_at
ON messages (ip_hash, content, created_at);
