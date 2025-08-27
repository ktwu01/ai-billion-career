CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    assessment_type TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer_value JSONB NOT NULL,
    answer_score INTEGER,
    dimension TEXT,
    sub_dimension TEXT,
    assessment_session_id UUID,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);