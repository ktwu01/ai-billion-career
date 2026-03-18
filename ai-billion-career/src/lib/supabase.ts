import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

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
  current_role_field?: string
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