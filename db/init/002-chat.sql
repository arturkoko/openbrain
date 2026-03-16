-- Chat messages table for AI conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT,
    tool_calls JSONB,
    tool_call_id TEXT,
    images TEXT[],
    audio_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
