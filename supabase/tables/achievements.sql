CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    achievement_date DATE,
    recognition_level TEXT,
    award_name TEXT,
    issuing_organization TEXT,
    certificate_url TEXT,
    impact_metrics JSONB,
    skills_demonstrated TEXT[],
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public',
    'private',
    'network')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);