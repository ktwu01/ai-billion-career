CREATE TABLE network_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    contact_type TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_title TEXT,
    contact_company TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    relationship_strength INTEGER CHECK (relationship_strength >= 1 AND relationship_strength <= 5),
    last_interaction_date DATE,
    interaction_frequency TEXT,
    notes TEXT,
    tags TEXT[],
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);