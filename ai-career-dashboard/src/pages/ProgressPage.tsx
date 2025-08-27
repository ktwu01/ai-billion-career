import React, { useState, useEffect } from 'react'
import { TrendingUp, Award, Calendar, CheckCircle, Target, BarChart3 } from 'lucide-react'
import { SkillsRadarChart, ProgressChart, type SkillData, type ProgressData } from '../components/charts'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function ProgressPage() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [skillsData, setSkillsData] = useState<SkillData[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [stats, setStats] = useState({
    overallProgress: 0,
    skillsProgress: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    learningHours: 0,
    achievements: 0
  })

  useEffect(() => {
    if (user) {
      fetchProgressData()
    }
  }, [user])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      
      // Fetch goals data
      const { data: goals } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user?.id)
      
      // Fetch assessments data
      const { data: assessments } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('user_id', user?.id)
      
      // Fetch achievements data
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)
      
      // Fetch learning activities
      const { data: activities } = await supabase
        .from('learning_activities')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      
      // Calculate basic stats
      const totalGoals = goals?.length || 0
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
      const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
      
      // Calculate learning hours (simplified)
      const learningHours = activities?.reduce((sum, activity) => {
        return sum + (activity.duration_minutes || 0)
      }, 0) || 0
      
      // Build skills data for radar chart
      const skillsMap = new Map<string, { total: number, count: number }>()
      if (assessments && assessments.length > 0) {
        assessments.forEach(assessment => {
          const category = assessment.category || assessment.dimension
          if (!skillsMap.has(category)) {
            skillsMap.set(category, { total: 0, count: 0 })
          }
          const existing = skillsMap.get(category)!
          existing.total += assessment.current_level * 10 // Convert to 0-100 scale
          existing.count += 1
        })
      }
      
      const skillsData: SkillData[] = Array.from(skillsMap.entries()).map(([category, data]) => ({
        category,
        level: Math.round(data.total / data.count)
      }))
      
      // Build progress data for bar chart
      const progressData: ProgressData[] = Array.from(skillsMap.entries()).map(([category, data]) => ({
        category,
        value: Math.round(data.total / data.count),
        target: 80, // Default target
        maxValue: 100
      }))
      
      // Use fallback data if no real data available
      if (skillsData.length === 0) {
        const fallbackSkills = [
          { category: 'Technical Skills', level: 85 },
          { category: 'Project Management', level: 72 },
          { category: 'Leadership', level: 68 },
          { category: 'Business Acumen', level: 58 }
        ]
        setSkillsData(fallbackSkills)
        setProgressData(fallbackSkills.map(skill => ({
          category: skill.category,
          value: skill.level,
          target: 80,
          maxValue: 100
        })))
      } else {
        setSkillsData(skillsData)
        setProgressData(progressData)
      }
      
      setStats({
        overallProgress,
        skillsProgress: skillsData.length > 0 ? Math.round(skillsData.reduce((sum, skill) => sum + skill.level, 0) / skillsData.length) : 85,
        goalsCompleted: completedGoals,
        totalGoals,
        learningHours: Math.round(learningHours / 60), // Convert to hours
        achievements: achievements?.length || 0
      })
      
    } catch (error) {
      console.error('Error fetching progress data:', error)
      // Set fallback data on error
      const fallbackSkills = [
        { category: 'Technical Skills', level: 85 },
        { category: 'Project Management', level: 72 },
        { category: 'Leadership', level: 68 },
        { category: 'Business Acumen', level: 58 }
      ]
      setSkillsData(fallbackSkills)
      setProgressData(fallbackSkills.map(skill => ({
        category: skill.category,
        value: skill.level,
        target: 80,
        maxValue: 100
      })))
      setStats({
        overallProgress: 72,
        skillsProgress: 85,
        goalsCompleted: 12,
        totalGoals: 18,
        learningHours: 156,
        achievements: 8
      })
    } finally {
      setLoading(false)
    }
  }

  const recentActivities = [
    {
      id: 1,
      type: 'skill',
      title: 'Completed Advanced Python Course',
      date: '2025-01-15',
      progress: 100,
      category: 'Technical Skills'
    },
    {
      id: 2,
      type: 'goal',
      title: 'Monthly Learning Goals',
      date: '2025-01-14',
      progress: 80,
      category: 'Learning Plan'
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Project Management Assessment',
      date: '2025-01-12',
      progress: 90,
      category: 'Capability Assessment'
    },
    {
      id: 4,
      type: 'certification',
      title: 'AWS Certification Exam',
      date: '2025-01-10',
      progress: 65,
      category: 'Professional Certification'
    }
  ]

  const skillCategories = [
    {
      name: 'Technical Skills',
      progress: 85,
      color: 'bg-blue-500',
      skills: ['Programming', 'Algorithms', 'System Design']
    },
    {
      name: 'Project Management',
      progress: 72,
      color: 'bg-green-500',
      skills: ['Agile Development', 'Team Management', 'Risk Control']
    },
    {
      name: 'Leadership',
      progress: 68,
      color: 'bg-purple-500',
      skills: ['Communication', 'Decision Making', 'Team Motivation']
    },
    {
      name: 'Business Acumen',
      progress: 58,
      color: 'bg-orange-500',
      skills: ['Market Analysis', 'Product Strategy', 'Cost Control']
    }
  ]

  const milestones = [
    {
      id: 1,
      title: 'Complete Machine Learning Specialization',
      date: '2025-01-15',
      status: 'completed',
      description: 'Master deep learning fundamentals and practical applications'
    },
    {
      id: 2,
      title: 'Obtain Project Management Certification',
      date: '2025-02-01',
      status: 'in_progress',
      description: 'Enhance project management and team collaboration skills'
    },
    {
      id: 3,
      title: 'Achieve 80% Technical Interview Success Rate',
      date: '2025-03-15',
      status: 'pending',
      description: 'Excel in interviews at top tech companies'
    },
    {
      id: 4,
      title: 'Reach Target Salary Range',
      date: '2025-06-30',
      status: 'pending',
      description: 'Successfully transition to a position within target salary range'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Progress Tracking Center</h1>
        <p className="text-xl opacity-90">
          Real-time monitoring of your growth trajectory, data-driven career development decisions
        </p>
        
        {/* Development Notice */}
        <div className="mt-4 p-4 bg-yellow-600/90 rounded-lg border border-yellow-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-yellow-900 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-100">
                This section is under development! data may not true.
              </p>
              <p className="text-xs text-yellow-200 mt-1">
                Check back soon for exciting new features and improvements.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <div className="text-sm opacity-80">Overall Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.goalsCompleted}/{stats.totalGoals}</div>
            <div className="text-sm opacity-80">Completed Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.learningHours}</div>
            <div className="text-sm opacity-80">Learning Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.achievements}</div>
            <div className="text-sm opacity-80">Achievement Badges</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'skills', name: 'Skills Progress' },
              { id: 'activities', name: 'Recent Activities' },
              { id: 'milestones', name: 'Milestones' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Search Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Search</h3>
                  <div className="h-80 flex flex-col items-center justify-center border border-gray-600 rounded-lg bg-gray-700">
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-300 mb-3">This section is under development!</h4>
                      <p className="text-sm text-gray-500 max-w-md">
                        Check back soon for exciting new features and improvements.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Search</h3>
                  <div className="h-80 flex flex-col items-center justify-center border border-gray-600 rounded-lg bg-gray-700">
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-300 mb-3">This section is under development!</h4>
                      <p className="text-sm text-gray-500 max-w-md">
                        Check back soon for exciting new features and improvements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'skills' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-200">Skill Development Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skillCategories.map((category, index) => (
                  <div key={index} className="border border-gray-600 rounded-lg p-6 bg-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-200">{category.name}</h3>
                      <span className="text-2xl font-bold text-gray-300">{category.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-600 rounded-full h-3 mb-4">
                      <div 
                        className={`${category.color} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${category.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-300">Included Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill, skillIndex) => (
                          <span 
                            key={skillIndex}
                            className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'activities' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-200">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                        {activity.type === 'skill' && <TrendingUp className="h-5 w-5 text-blue-400" />}
                        {activity.type === 'goal' && <Target className="h-5 w-5 text-green-400" />}
                        {activity.type === 'assessment' && <BarChart3 className="h-5 w-5 text-purple-400" />}
                        {activity.type === 'certification' && <Award className="h-5 w-5 text-orange-400" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">{activity.title}</h3>
                        <p className="text-sm text-gray-400">{activity.category} • {activity.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-200">{activity.progress}%</div>
                        <div className="w-20 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {activity.progress === 100 && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'milestones' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-200">Milestone Timeline</h2>
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {index !== milestones.length - 1 && (
                      <div className="absolute left-4 top-8 w-px h-16 bg-gray-600"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {milestone.status === 'completed' && <CheckCircle className="h-5 w-5 text-white" />}
                        {milestone.status === 'in_progress' && <Calendar className="h-5 w-5 text-white" />}
                        {milestone.status === 'pending' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-200">{milestone.title}</h3>
                          <span className="text-sm text-gray-400">{milestone.date}</span>
                        </div>
                        <p className="text-gray-300 mt-1">{milestone.description}</p>
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                          milestone.status === 'completed' ? 'bg-green-800 text-green-200' :
                          milestone.status === 'in_progress' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {milestone.status === 'completed' ? 'Completed' :
                           milestone.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}