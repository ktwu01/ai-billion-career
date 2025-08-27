-- Migration: add_setup_fields_to_user_profiles
-- Created at: 1755412189

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS expected_salary TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS professional_background TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS position_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS career_goal TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;;