import React, { useState, useEffect } from 'react'
import { User, Save, Briefcase, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

export function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      } else if (data) {
        setProfile(data)
      } else {
        // Create initial profile if it doesn't exist
        setProfile({
          user_id: user?.id,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('Authentication failed, please log in again')
      }

      const updateData = {
        ...profile,
        user_id: currentUser.id,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(updateData)
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      setProfile(data || updateData)
      setMessage('Profile saved successfully!')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setMessage('Save failed: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spin-enhanced rounded-full h-32 w-32 border-b-2 border-accent glow-on-hover"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary-foreground gradient-text">Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 hover-lift"
          >
            <Save className="h-4 w-4 float-animation" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
            {message}
          </div>
        )}

        {/* Profile Photo */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="hover-lift">
            <div className="w-24 h-24 glassmorphism rounded-full flex items-center justify-center glow-on-hover shadow-enhanced">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile Photo" 
                  className="w-24 h-24 rounded-full object-cover float-animation"
                />
              ) : (
                <User className="h-12 w-12 text-accent pulse-gentle" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-secondary-foreground gradient-text count-animation">
              {profile.full_name || 'Name not set'}
            </h3>
            <p className="text-accent shimmer">{profile.current_role || 'Position not set'}</p>
            <p className="text-sm text-gray-500 hover-lift">{profile.email}</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hover-lift">
            <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300"
              placeholder="Enter your full name"
            />
          </div>

          <div className="hover-lift">
            <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
              Current Role
            </label>
            <input
              type="text"
              value={profile.current_role || ''}
              onChange={(e) => setProfile({...profile, current_role: e.target.value})}
              className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="hover-lift">
            <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
              Years of Experience
            </label>
            <input
              type="number"
              value={profile.experience_years || ''}
              onChange={(e) => setProfile({...profile, experience_years: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="hover-lift">
            <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
              Target Salary ($K)
            </label>
            <input
              type="number"
              value={profile.target_salary ? profile.target_salary / 10000 : ''}
              onChange={(e) => setProfile({...profile, target_salary: (parseInt(e.target.value) || 0) * 10000})}
              className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300"
              placeholder="100"
              min="0"
            />
          </div>

          <div className="md:col-span-2 hover-lift">
            <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
              Industry Preference
            </label>
            <select
              value={profile.industry_preference || ''}
              onChange={(e) => setProfile({...profile, industry_preference: e.target.value})}
              className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300"
            >
              <option value="">Select industry</option>
              <option value="ai_ml">AI/Machine Learning</option>
              <option value="software">Software Development</option>
              <option value="fintech">Financial Technology</option>
              <option value="blockchain">Blockchain</option>
              <option value="startup">Startup</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Career Journey */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
        <h2 className="text-xl font-semibold text-secondary-foreground mb-4 flex items-center gradient-text">
          <Briefcase className="h-5 w-5 mr-2 text-accent pulse-gentle" />
          Career Journey
        </h2>
        <div className="hover-lift">
          <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
            Professional Journey & Milestones
          </label>
          <textarea
            value={profile.career_journey || ''}
            onChange={(e) => setProfile({...profile, career_journey: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300 resize-none"
            placeholder="Describe your career milestones, key achievements, professional growth, and significant experiences that have shaped your career journey..."
          />
        </div>
      </div>

      {/* Education & Certifications */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
        <h2 className="text-xl font-semibold text-secondary-foreground mb-4 flex items-center gradient-text">
          <GraduationCap className="h-5 w-5 mr-2 text-accent float-animation" />
          Education & Certifications
        </h2>
        <div className="hover-lift">
          <label className="block text-sm font-medium text-secondary-foreground mb-2 gradient-text">
            Educational Background & Professional Certifications
          </label>
          <textarea
            value={profile.education_certifications || ''}
            onChange={(e) => setProfile({...profile, education_certifications: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 glassmorphism border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-secondary-foreground glow-on-hover transition-all duration-300 resize-none"
            placeholder="List your degrees, universities, professional certifications, relevant courses, training programs, and technical skills..."
          />
        </div>
      </div>
    </div>
  )
}