import React, { useEffect, useState } from 'react'
import {
  TrendingUp,
  Target,
  Brain,
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Zap,
  BookOpen,
  LineChart,
  BarChart3,
  FileText,
  CalendarDays,
  Download,
  Users,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { SkillsRadarChart, DashboardMetrics, type SkillData, type MetricData } from '../components/charts'

// Helper function to calculate time ago
const getTimeAgo = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

// Status mapping from database to frontend for consistency with GoalsPage
const mapStatusFromDatabase = (databaseStatus: string): string => {
  const statusMapping: { [key: string]: string } = {
    'active': 'in_progress', // Active goals are considered in progress for dashboard
    'completed': 'completed',
    'paused': 'on_hold',
    'cancelled': 'on_hold'
  }
  return statusMapping[databaseStatus] || 'not_started'
}

interface TwitterActivity {
  id: string
  mentor_name: string
  mentor_title: string
  mentor_avatar: string
  twitter_handle: string
  content: string
  timestamp: string
}

interface DashboardStats {
  totalGoals: number
  completedGoals: number
  avgAssessmentScore: number
  activeRecommendations: number
  targetSalary: number
  currentProgress: number
  goalsCompletedThisWeek: number
  currentRole: string
}

interface RecentProgressItem {
  id: string
  type: 'goal' | 'learning' | 'achievement'
  title: string
  status: string
  updatedAt: string
  icon: 'CheckCircle' | 'BookOpen' | 'Target' | 'Award'
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    avgAssessmentScore: 0,
    activeRecommendations: 0,
    targetSalary: 0,
    currentProgress: 0,
    goalsCompletedThisWeek: 0,
    currentRole: ''
  })
  const [skillsData, setSkillsData] = useState<SkillData[]>([])
  const [metricsData, setMetricsData] = useState<MetricData[]>([])
  const [recentProgress, setRecentProgress] = useState<RecentProgressItem[]>([])
  const [twitterActivities, setTwitterActivities] = useState<TwitterActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [twitterLoading, setTwitterLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchTwitterActivities()
    }
  }, [user])

  const fetchDashboardData = async () => {
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
      
      // Fetch recommendations data
      const { data: recommendations } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
      
      // Fetch user profile data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      // Fetch learning activities data
      const { data: learningActivities } = await supabase
        .from('learning_activities')
        .select('*')
        .eq('user_id', user?.id)

      // Fetch achievements data
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)

      // Calculate goals completed this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const goalsCompletedThisWeek = goals?.filter(goal => {
        const isCompleted = mapStatusFromDatabase(goal.status) === 'completed'
        const updatedThisWeek = new Date(goal.updated_at) >= oneWeekAgo
        return isCompleted && updatedThisWeek
      }).length || 0

      // Build recent progress items
      const progressItems: RecentProgressItem[] = []
      
      // Add goal updates (recent status changes)
      if (goals) {
        goals
          .map(goal => ({ ...goal, mappedStatus: mapStatusFromDatabase(goal.status) })) // Map status first
          .filter(goal => goal.mappedStatus === 'completed' || goal.mappedStatus === 'in_progress')
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3)
          .forEach(goal => {
            progressItems.push({
              id: goal.id,
              type: 'goal',
              title: goal.mappedStatus === 'completed' ? 
                `Completed Goal: ${goal.title}` : 
                `Updated Goal: ${goal.title}`,
              status: goal.mappedStatus,
              updatedAt: goal.updated_at,
              icon: goal.mappedStatus === 'completed' ? 'CheckCircle' : 'Target'
            })
          })
      }
      
      // Add learning activities
      if (learningActivities) {
        learningActivities
          .filter(activity => activity.status === 'completed' || activity.status === 'in_progress')
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 2)
          .forEach(activity => {
            progressItems.push({
              id: activity.id,
              type: 'learning',
              title: activity.status === 'completed' ? 
                `Completed Course: ${activity.title}` : 
                `Learning: ${activity.title}`,
              status: activity.status,
              updatedAt: activity.updated_at,
              icon: 'BookOpen'
            })
          })
      }
      
      // Add achievements
      if (achievements) {
        achievements
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 2)
          .forEach(achievement => {
            progressItems.push({
              id: achievement.id,
              type: 'achievement',
              title: `Earned Achievement: ${achievement.title}`,
              status: 'completed',
              updatedAt: achievement.created_at,
              icon: 'Award'
            })
          })
      }
      
      // Sort all progress items by date and take top 5
      const sortedProgress = progressItems
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
      
      setRecentProgress(sortedProgress)
      
      // Set fallback data for Recent Progress if no data available
      if (sortedProgress.length === 0) {
        setRecentProgress([
          {
            id: 'fallback-1',
            type: 'goal',
            title: 'No recent activity yet',
            status: 'not_started',
            updatedAt: new Date().toISOString(),
            icon: 'Target'
          }
        ])
      }

      // Calculate stats
      const totalGoals = goals?.length || 0
      const completedGoals = goals?.filter(g => mapStatusFromDatabase(g.status) === 'completed').length || 0
      
      // Calculate average assessment score from real data
      let avgScore = 75 // Default
      if (assessments && assessments.length > 0) {
        const totalScore = assessments.reduce((sum, assessment) => sum + (assessment.current_level * 10), 0)
        avgScore = Math.round(totalScore / assessments.length)
      }
      
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
      
      // Use default skills data if no assessments available
      if (skillsData.length === 0) {
        setSkillsData([
          { category: 'Technical Skills', level: 85 },
          { category: 'Project Management', level: 72 },
          { category: 'Leadership', level: 68 },
          { category: 'Business Acumen', level: 58 },
          { category: 'Communication', level: 75 },
          { category: 'Innovation', level: 80 }
        ])
      } else {
        setSkillsData(skillsData)
      }
      
      const currentProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
      
      // Get target salary from multiple possible fields
      let targetSalary = 0 // Default 0 to indicate not set
      
      if (profile?.target_salary) {
        targetSalary = profile.target_salary
      } else if (profile?.expected_salary) {
        // Try to extract numeric value from expected_salary text field
        const salaryText = profile.expected_salary.toLowerCase()
        if (salaryText.includes('万')) {
          const match = salaryText.match(/(\d+)万?/)
          if (match) {
            targetSalary = parseInt(match[1]) * 10000
          }
        } else if (salaryText.includes('k')) {
          const match = salaryText.match(/(\d+)k?/)
          if (match) {
            targetSalary = parseInt(match[1]) * 1000
          }
        } else {
          // Try to extract plain number
          const match = salaryText.match(/(\d+)/)
          if (match) {
            const num = parseInt(match[1])
            // Assume if number is less than 1000, it's in thousands
            targetSalary = num < 1000 ? num * 1000 : num
          }
        }
      }
      
      // Build metrics data
      const metricsData: MetricData[] = [
        {
          title: 'Goal Progress',
          value: currentProgress,
          target: 80,
          format: 'percentage',
          trend: currentProgress > 50 ? 'up' : 'neutral'
        },
        {
          title: 'Overall Score',
          value: avgScore,
          suffix: '/100',
          trend: avgScore > 70 ? 'up' : 'neutral'
        },
        {
          title: 'Target Salary',
          value: targetSalary > 0 ? targetSalary : 0,
          prefix: targetSalary > 0 ? '$' : '',
          format: targetSalary > 0 ? 'currency' : 'none',
          displayText: targetSalary > 0 ? undefined : 'Not Set',
          trend: 'neutral'
        },
        {
          title: 'AI Recommendations',
          value: recommendations?.length || 0,
          suffix: ' items',
          trend: 'neutral'
        }
      ]
      
      setStats({
        totalGoals,
        completedGoals,
        avgAssessmentScore: avgScore,
        activeRecommendations: 5, // Static count matching RecommendationsPage
        targetSalary,
        currentProgress,
        goalsCompletedThisWeek,
        currentRole: profile?.current_role || 'Not Set'
      })
      
      setMetricsData(metricsData)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data on error
      setRecentProgress([
        {
          id: 'error-fallback',
          type: 'goal',
          title: 'Unable to load recent progress',
          status: 'not_started',
          updatedAt: new Date().toISOString(),
          icon: 'Target'
        }
      ])
      setSkillsData([
        { category: 'Technical Skills', level: 85 },
        { category: 'Project Management', level: 72 },
        { category: 'Leadership', level: 68 },
        { category: 'Business Acumen', level: 58 },
        { category: 'Communication', level: 75 },
        { category: 'Innovation', level: 80 }
      ])
      setMetricsData([
        {
          title: 'Goal Progress',
          value: 72,
          target: 80,
          format: 'percentage',
          trend: 'up'
        },
        {
          title: 'Overall Score',
          value: 85,
          suffix: '/100',
          trend: 'up'
        },
        {
          title: 'Target Salary',
          value: 0,
          prefix: '',
          format: 'none',
          displayText: 'Not Set',
          trend: 'neutral'
        },
        {
          title: 'AI Recommendations',
          value: 8,
          suffix: ' items',
          trend: 'neutral'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchTwitterActivities = async () => {
    try {
      setTwitterLoading(true)
      
      const { data, error } = await supabase.functions.invoke('twitter-activities')
      
      if (error) {
        console.error('Error fetching Twitter activities:', error)
        return
      }
      
      setTwitterActivities(data.data.activities || [])
      
    } catch (error) {
      console.error('Error fetching Twitter activities:', error)
    } finally {
      setTwitterLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Goal Progress',
      value: `${stats.currentProgress}%`,
      subtitle: `${stats.completedGoals}/${stats.totalGoals} Completed`,
      icon: Target,
      trend: stats.currentProgress > 50 ? 'up' : 'neutral',
      bgColor: 'bg-secondary',
      iconColor: 'text-accent'
    },
    {
      title: 'Target Salary',
      value: stats.targetSalary > 0 ? `$${(stats.targetSalary / 1000).toFixed(0)}K` : 'Not Set',
      subtitle: stats.targetSalary > 0 ? 'Salary Target' : 'Please set your target salary in Profile',
      icon: DollarSign,
      trend: 'neutral',
      bgColor: 'bg-gray-800',
      iconColor: 'text-accent'
    },
    {
      title: 'AI Recommendations',
      value: stats.activeRecommendations,
      subtitle: 'Pending recommendations',
      icon: Award,
      trend: 'neutral',
      bgColor: 'bg-gray-800',
      iconColor: 'text-accent'
    },
    {
      title: 'Current Role',
      value: stats.currentRole,
      subtitle: 'Current Position',
      icon: Users,
      trend: 'neutral',
      bgColor: 'bg-gray-800',
      iconColor: 'text-accent'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spin-enhanced rounded-full h-32 w-32 border-b-2 border-accent glow-on-hover"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6 text-secondary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium mb-2 gradient-text float-animation">
              Welcome back, {user?.user_metadata?.full_name || 'User'}
            </h1>
            <p className="text-lg text-accent shimmer">
              Let's continue working towards your goals today
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2 hover-lift glow-on-hover">
                <CheckCircle className="h-4 w-4 text-accent pulse-gentle" />
                <span className="text-accent text-sm count-animation">
                  {stats.goalsCompletedThisWeek > 0 
                    ? `Completed ${stats.goalsCompletedThisWeek} goal${stats.goalsCompletedThisWeek > 1 ? 's' : ''} this week`
                    : "No goals completed this week yet"
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block hover-lift">
            <div className="w-24 h-24 glassmorphism rounded-full flex items-center justify-center shadow-glow">
              <TrendingUp className="h-10 w-10 text-accent float-animation" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div 
              key={index} 
              className="glassmorphism enhanced-card shadow-enhanced hover-lift glow-on-hover rounded-xl p-5 h-36 transition-all duration-300"
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-sm font-medium text-accent gradient-text">{card.title}</p>
                  <p className="text-xl font-medium text-secondary-foreground mt-1 count-animation">
                    {card.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <p className="text-xs text-gray-500 mr-2 shimmer">{card.subtitle}</p>
                    {card.trend === 'up' && (
                      <span className="text-accent flex items-center text-xs pulse-gentle">
                        <ArrowUpRight className="h-3 w-3 mr-1 icon-bounce" />
                        <span>Growth</span>
                      </span>
                    )}
                    {card.trend === 'down' && (
                      <span className="text-accent flex items-center text-xs pulse-gentle">
                        <ArrowUpRight className="h-3 w-3 mr-1 rotate-180 icon-bounce" />
                        <span>Decline</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="glassmorphism p-3 rounded-md shadow-enhanced hover-lift">
                  <Icon className={`h-5 w-5 ${card.iconColor} float-animation`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Progress */}
        <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-5 transition-all duration-300">
          <h3 className="text-base font-medium text-secondary-foreground mb-4 flex items-center gradient-text">
            <CalendarDays className="h-4 w-4 mr-2 text-accent pulse-gentle" />
            Recent Progress
          </h3>
          <div className="space-y-3">
            {recentProgress.length > 0 ? (
              recentProgress.map((item) => {
                const getIconComponent = (iconName: string) => {
                  switch (iconName) {
                    case 'CheckCircle': return CheckCircle
                    case 'BookOpen': return BookOpen
                    case 'Target': return Target
                    case 'Award': return Award
                    default: return Target
                  }
                }
                
                const IconComponent = getIconComponent(item.icon)
                const timeAgo = getTimeAgo(item.updatedAt)
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 glassmorphism rounded-md hover-lift glow-on-hover transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-4 w-4 text-accent float-animation" />
                      <span className="text-sm text-gray-300 shimmer">{item.title}</span>
                    </div>
                    <span className="text-xs text-gray-500 count-animation">{timeAgo}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4 hover-lift">
                <Target className="h-8 w-8 text-gray-500 mx-auto mb-2 pulse-gentle" />
                <p className="text-sm text-gray-500 gradient-text">No recent progress yet</p>
                <p className="text-xs text-gray-600 mt-1 shimmer">Start setting goals to track your progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Followed Mentors Activities */}
        <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-5 transition-all duration-300">
          <h3 className="text-base font-medium text-secondary-foreground mb-4 flex items-center gradient-text">
            <Users className="h-4 w-4 mr-2 text-accent pulse-gentle" />
            Followed Mentors
          </h3>
          
          {twitterLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="spin-enhanced rounded-full h-8 w-8 border-b-2 border-accent glow-on-hover"></div>
            </div>
          ) : twitterActivities.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {twitterActivities.map((activity) => (
                <div key={activity.id} className="p-4 glassmorphism rounded-md hover-lift glow-on-hover transition-all duration-300">
                  {/* Mentor Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center shadow-enhanced">
                      <Users className="h-5 w-5 text-accent float-animation" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-secondary-foreground gradient-text">{activity.mentor_name}</h4>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500 count-animation">{getTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-400 shimmer">{activity.mentor_title}</p>
                    </div>
                    <a
                      href={`https://twitter.com/${activity.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-gray-600/50 transition-all duration-300 hover-lift"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-accent icon-bounce" />
                    </a>
                  </div>
                  
                  {/* Tweet Content */}
                  <p className="text-gray-300 text-sm leading-relaxed shimmer">
                    {activity.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 hover-lift">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 float-animation" />
              <h4 className="text-lg font-medium text-gray-300 mb-2 gradient-text">No Followed Mentors</h4>
              <p className="text-sm text-gray-500 mb-4 shimmer">
                Follow mentors to see their latest insights and updates here
              </p>
              <a
                href="/mentors"
                className="btn-primary inline-flex items-center space-x-2 px-4 py-2 rounded-md hover-lift transition-all duration-300"
              >
                <Users className="h-4 w-4 icon-bounce" />
                <span>Discover Mentors</span>
              </a>
            </div>
          )}
        </div>
      </div>




    </div>
  )
}
