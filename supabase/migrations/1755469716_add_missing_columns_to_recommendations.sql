-- Migration: add_missing_columns_to_recommendations
-- Created at: 1755469716

-- Add missing columns to recommendations table
ALTER TABLE recommendations 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recommendation_text TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing records to have is_active = true
UPDATE recommendations 
SET is_active = true 
WHERE is_active IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendations_is_active ON recommendations(is_active);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id_active ON recommendations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);

-- Add some default values for better data consistency
UPDATE recommendations 
SET recommendation_text = content::text 
WHERE recommendation_text IS NULL AND content IS NOT NULL;

UPDATE recommendations 
SET category = recommendation_type 
WHERE category IS NULL AND recommendation_type IS NOT NULL;;