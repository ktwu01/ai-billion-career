-- Migration: create_mentors_and_follows_tables
-- Created at: 1755574414

-- 创建导师表
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    twitter_handle TEXT,
    avatar_url TEXT,
    category TEXT CHECK (category IN ('quotes', 'journey')) DEFAULT 'quotes',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户关注导师关系表
CREATE TABLE IF NOT EXISTS user_mentor_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mentor_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_mentor_follows_user_id ON user_mentor_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mentor_follows_mentor_id ON user_mentor_follows(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentors_category ON mentors(category);

-- 插入示例导师数据
INSERT INTO mentors (name, title, bio, twitter_handle, avatar_url, category) VALUES
('Sam Altman', 'OpenAI CEO', 'The best way to predict the future is to invent it. We are building AGI to benefit all of humanity.', 'sama', '/api/placeholder/64/64', 'quotes'),
('Zhang Yiming', 'ByteDance Founder', 'The ability to delay gratification determines the height of your life. Do difficult and right things, time will prove everything.', 'zhangyiming', '/api/placeholder/64/64', 'quotes'),
('Jensen Huang', 'NVIDIA CEO', 'AI is the most transformative technology of our time. Every company will become an AI company.', 'jensenhuang', '/api/placeholder/64/64', 'quotes'),
('Elon Musk', 'Tesla & SpaceX CEO', 'When something is important enough, you do it even if the odds are not in your favor.', 'elonmusk', '/api/placeholder/64/64', 'quotes'),
('Ruoming Pang', 'AI Research Scientist at Meta', 'AI Research Scientist at Meta''s Super intelligence lab. Focusing on cutting-edge artificial intelligence research, advancing super intelligence technology development and applications.', 'pangruoming', '/api/placeholder/64/64', 'journey'),
('Jiahui Yu', 'Member of Technical Staff at OpenAI', 'Member of Technical Staff at OpenAI, specializing in deep learning and high performance computing. I work on deep learning and high performance computing.', 'yujh', '/api/placeholder/64/64', 'journey');;