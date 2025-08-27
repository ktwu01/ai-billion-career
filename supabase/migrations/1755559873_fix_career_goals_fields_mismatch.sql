-- Migration: fix_career_goals_fields_mismatch
-- Created at: 1755559873

-- Add missing columns that GoalsPage.tsx expects
ALTER TABLE career_goals 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT;

-- Update existing data to match new schema
UPDATE career_goals 
SET category = goal_type 
WHERE category IS NULL;

UPDATE career_goals 
SET priority = CASE 
  WHEN priority_level = 1 THEN 'low'
  WHEN priority_level = 2 THEN 'low'
  WHEN priority_level = 3 THEN 'medium'
  WHEN priority_level = 4 THEN 'high'
  WHEN priority_level = 5 THEN 'high'
  ELSE 'medium'
END
WHERE priority IS NULL;

-- Update status values to match GoalsPage.tsx expectations
UPDATE career_goals 
SET status = CASE 
  WHEN status = 'active' THEN 'not_started'
  WHEN status = 'paused' THEN 'on_hold'
  WHEN status = 'cancelled' THEN 'on_hold'
  ELSE status
END;;