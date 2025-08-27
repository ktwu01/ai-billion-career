CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    recommendation_type TEXT NOT NULL,
    content JSONB NOT NULL,
    priority_score DECIMAL(4,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending',
    'viewed',
    'accepted',
    'rejected',
    'completed')),
    expires_at TIMESTAMP WITH TIME ZONE,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);