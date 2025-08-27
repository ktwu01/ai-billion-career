import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emywvwsqzixqsgfzadww.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVteXd2d3Nxeml4cXNnZnphZHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MDM4MzMsImV4cCI6MjA3MDk3OTgzM30.5Dr5TUnqlzdxh2giT0f2PZ6c01xWosREWG72142-4HE'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database tables
export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  current_role?: string
  experience_years?: number
  target_salary?: number
  industry_preference?: string
  skills_summary?: any
  career_journey?: string
  education_certifications?: string
  created_at: string
  updated_at: string
}

export interface SkillAssessment {
  id: string
  user_id: string
  assessment_type: 'technical' | 'leadership' | 'business' | 'project_management'
  scores: any
  analysis_result: any
  completed_at: string
  created_at: string
}

export interface CareerGoal {
  id: string
  user_id: string
  title: string
  description: string
  target_date: string
  category: 'salary' | 'skills' | 'position' | 'business'
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface Recommendation {
  id: string
  user_id: string
  type: 'career_path' | 'learning_resource' | 'skill_development' | 'networking'
  title: string
  description: string
  priority_score: number
  category: string
  action_items: any
  is_active: boolean
  created_at: string
}

export interface ProgressRecord {
  id: string
  user_id: string
  metric_type: string
  metric_value: number
  recorded_date: string
  notes?: string
  created_at: string
}