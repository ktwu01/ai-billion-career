-- Migration: add_current_role_to_user_profiles
-- Created at: 1755459486

-- 添加current_role列到user_profiles表
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS "current_role" TEXT;;