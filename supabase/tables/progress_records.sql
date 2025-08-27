CREATE TABLE progress_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    dimension TEXT NOT NULL,
    indicator TEXT NOT NULL,
    score DECIMAL(4,2) CHECK (score >= 0 AND score <= 10),
    target_score DECIMAL(4,2) CHECK (target_score >= 0 AND target_score <= 10),
    evidence JSONB,
    metadata JSONB,
    record_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);