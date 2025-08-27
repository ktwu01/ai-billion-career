-- Migration: add_missing_columns_to_user_profiles
-- Created at: 1755469684

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS target_salary BIGINT,
ADD COLUMN IF NOT EXISTS industry_preference TEXT,
ADD COLUMN IF NOT EXISTS salary_expectation TEXT,
ADD COLUMN IF NOT EXISTS background TEXT;

-- Update existing columns to match frontend usage
UPDATE user_profiles 
SET experience_years = work_experience_years 
WHERE experience_years IS NULL AND work_experience_years IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_years ON user_profiles(experience_years);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry_preference ON user_profiles(industry_preference);

-- Add constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT chk_experience_years_positive CHECK (experience_years >= 0),
ADD CONSTRAINT chk_target_salary_positive CHECK (target_salary >= 0);;