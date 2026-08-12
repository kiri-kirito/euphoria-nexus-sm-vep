-- Chat message history for GlobalChatWidget + Socket.io persistence
-- Note: PostgreSQL does not support CREATE POLICY IF NOT EXISTS — use DROP + CREATE.

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL,
    sender_name VARCHAR(255),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_participants
    ON chat_messages (sender_id, receiver_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own chat messages" ON chat_messages;
CREATE POLICY "Users read own chat messages"
    ON chat_messages FOR SELECT
    USING (
        auth.uid() = sender_id
        OR auth.uid()::text = receiver_id
    );

DROP POLICY IF EXISTS "Users insert own chat messages" ON chat_messages;
CREATE POLICY "Users insert own chat messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
