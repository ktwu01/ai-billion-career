-- Migration: fix_user_profiles_duplicate_records_v2
-- Created at: 1755454479

-- 首先清理重复的用户记录，保留最新创建的一条记录
WITH duplicate_users AS (
  SELECT user_id, 
         MAX(created_at) as latest_created_at,
         COUNT(*) as record_count
  FROM user_profiles
  GROUP BY user_id
  HAVING COUNT(*) > 1
),
records_to_keep AS (
  SELECT DISTINCT ON (up.user_id) up.id
  FROM user_profiles up
  JOIN duplicate_users du ON up.user_id = du.user_id
  WHERE up.created_at = du.latest_created_at
  ORDER BY up.user_id, up.created_at DESC
),
records_to_delete AS (
  SELECT up.id
  FROM user_profiles up
  JOIN duplicate_users du ON up.user_id = du.user_id
  WHERE up.id NOT IN (SELECT id FROM records_to_keep)
)
DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM records_to_delete);

-- 添加唯一约束防止将来出现重复记录
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_user_id UNIQUE (user_id);;