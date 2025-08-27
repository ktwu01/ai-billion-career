CREATE TABLE skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    dimension TEXT NOT NULL,
    category TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    current_level INTEGER CHECK (current_level >= 0 AND current_level <= 10),
    target_level INTEGER CHECK (target_level >= 0 AND target_level <= 10),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    evidence JSONB,
    assessment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);