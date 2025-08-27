import React, { useState } from 'react'
import { Lightbulb, Star, ExternalLink, BookOpen, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function RecommendationsPage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('all')
  const [addingToGoals, setAddingToGoals] = useState<number | null>(null)
  const [addedGoals, setAddedGoals] = useState<Set<number>>(new Set())
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const recommendations = [
    {
      id: 1,
      type: 'career_path',
      title: 'AI Algorithm Engineer Transition Path',
      description: 'Based on your technical background, recommend transitioning to AI Algorithm Engineer with expected 50-100% salary increase',
      priority: 95,
      category: 'Career Path',
      actionItems: [
        'Learn machine learning algorithms',
        'Master Python/TensorFlow',
        'Participate in AI project implementations',
        'Obtain relevant certifications'
      ],
      estimatedTime: '6-12 months',
      difficulty: 'hard'
    },
    {
      id: 2,
      type: 'learning_resource',
      title: 'Deep Learning Specialization Course',
      description: 'Recommend Stanford CS229 Machine Learning course and Andrew Ng\'s Deep Learning Specialization',
      priority: 88,
      category: 'Learning Resources',
      actionItems: [
        'Complete linear algebra review',
        'Learn probability and statistics basics',
        'Practice programming assignments'
      ],
      estimatedTime: '3-4 months',
      difficulty: 'medium'
    },
    {
      id: 3,
      type: 'skill_development',
      title: 'Leadership Skills Enhancement',
      description: 'Attend leadership training courses to improve team management and communication coordination abilities',
      priority: 75,
      category: 'Skill Development',
      actionItems: [
        'Attend management training',
        'Find a mentor',
        'Take on more responsibilities in projects'
      ],
      estimatedTime: '2-3 months',
      difficulty: 'easy'
    },
    {
      id: 4,
      type: 'networking',
      title: 'Industry Network Expansion',
      description: 'Attend AI industry conferences and technical meetups to build professional network',
      priority: 82,
      category: 'Professional Network',
      actionItems: [
        'Attend NeurIPS, ICML and other conferences',
        'Join AI professional communities',
        'Publish technical blogs',
        'Connect with industry experts'
      ],
      estimatedTime: 'Ongoing',
      difficulty: 'medium'
    },
    {
      id: 5,
      type: 'career_path',
      title: 'Entrepreneurship Direction Exploration',
      description: 'Consider founding your own AI startup company or joining early-stage startup teams',
      priority: 70,
      category: 'Career Path',
      actionItems: [
        'Learn business knowledge',
        'Connect with investors',
        'Develop MVP product',
        'Build initial team'
      ],
      estimatedTime: '1-2 years',
      difficulty: 'hard'
    }
  ]

  const categories = [
    { id: 'all', name: 'All', icon: Lightbulb },
    { id: 'Career Path', name: 'Career Path', icon: TrendingUp },
    { id: 'Learning Resources', name: 'Learning Resources', icon: BookOpen },
    { id: 'Skill Development', name: 'Skill Development', icon: Star },
    { id: 'Professional Network', name: 'Professional Network', icon: Users }
  ]

  const filteredRecommendations = activeCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeCategory)

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'text-red-600 bg-red-100'
    if (priority >= 80) return 'text-orange-600 bg-orange-100'
    if (priority >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy'
      case 'medium': return 'Medium'
      case 'hard': return 'Hard'
      default: return 'Unknown'
    }
  }

  // Function to add recommendation to goals
  const addRecommendationToGoals = async (recommendation: any) => {
    if (!user) {
      setFeedback({ type: 'error', message: 'Please log in to add goals' })
      return
    }

    setAddingToGoals(recommendation.id)
    setFeedback(null)

    try {
      // Determine goal type based on recommendation type
      let goalType = 'skill_development'
      if (recommendation.type === 'career_path') {
        goalType = 'career_advancement'
      } else if (recommendation.type === 'learning_resource') {
        goalType = 'learning'
      } else if (recommendation.type === 'networking') {
        goalType = 'networking'
      }

      // Create goal object
      const newGoal = {
        user_id: user.id,
        goal_type: goalType,
        title: recommendation.title,
        description: recommendation.description,
        priority_level: recommendation.priority >= 90 ? 5 : 
                       recommendation.priority >= 80 ? 4 : 
                       recommendation.priority >= 70 ? 3 : 2,
        status: 'active',
        progress_percentage: 0,
        milestones: recommendation.actionItems || []
      }

      // Insert into career_goals table
      const { error } = await supabase
        .from('career_goals')
        .insert([newGoal])

      if (error) {
        throw error
      }

      // Mark as added
      setAddedGoals(prev => new Set([...prev, recommendation.id]))
      setFeedback({ 
        type: 'success', 
        message: `"${recommendation.title}" has been added to your goals successfully!` 
      })

    } catch (error) {
      console.error('Error adding recommendation to goals:', error)
      setFeedback({ 
        type: 'error', 
        message: 'Failed to add goal. Please try again.' 
      })
    } finally {
      setAddingToGoals(null)
    }
  }

  // Auto-hide feedback after 5 seconds
  React.useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glassmorphism bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-2xl p-8 text-white relative overflow-hidden enhanced-card">
        <h1 className="text-3xl font-bold mb-2 gradient-text float-animation">Personalized Recommendation Engine</h1>
        <p className="text-xl opacity-90 shimmer">
          Tailored development recommendations based on your ability assessment and career goals
        </p>
        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center space-x-2 hover-lift glow-on-hover">
            <Lightbulb className="h-5 w-5 pulse-gentle" />
            <span className="count-animation">{recommendations.length} Recommendations</span>
          </div>
          <div className="flex items-center space-x-2 hover-lift glow-on-hover">
            <Star className="h-5 w-5 float-animation" />
            <span>Smart Matching</span>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`p-4 rounded-lg border ${
          feedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4 gradient-text">Recommendation Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover-lift glow-on-hover ${
                  activeCategory === category.id
                    ? 'btn-primary shadow-glow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-enhanced'
                }`}
              >
                <Icon className="h-4 w-4 icon-bounce" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <div key={recommendation.id} className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-yellow-400 gradient-text">{recommendation.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium pulse-gentle ${getPriorityColor(recommendation.priority)}`}>
                    Priority: {recommendation.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium glow-on-hover ${getDifficultyColor(recommendation.difficulty)}`}>
                    {getDifficultyText(recommendation.difficulty)}
                  </span>
                </div>
                <p className="text-white mb-4 shimmer">{recommendation.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-2 gradient-text">Action Items</h4>
                    <ul className="space-y-1">
                      {recommendation.actionItems.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-white hover-lift">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full pulse-gentle"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm hover-lift">
                      <span className="text-gray-300">Estimated Time:</span>
                      <span className="font-medium text-yellow-400 count-animation">{recommendation.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm hover-lift">
                      <span className="text-gray-300">Category:</span>
                      <span className="font-medium text-yellow-400">{recommendation.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <button
                className={`${addedGoals.has(recommendation.id)
                  ? 'bg-green-600 text-white cursor-default shadow-glow'
                  : 'btn-primary hover-lift'
                } px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => !addedGoals.has(recommendation.id) && addRecommendationToGoals(recommendation)}
                disabled={addingToGoals === recommendation.id || addedGoals.has(recommendation.id)}
              >
                {addingToGoals === recommendation.id ? (
                  <>
                    <div className="spin-enhanced rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : addedGoals.has(recommendation.id) ? (
                  <>
                    <CheckCircle className="h-4 w-4 pulse-gentle" />
                    <span>Added to Goals</span>
                  </>
                ) : (
                  <span>Add to Goals</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-400 mb-2 gradient-text">No Related Recommendations</h3>
          <p className="text-white">Please select other categories or complete more assessments to get personalized recommendations</p>
        </div>
      )}
    </div>
  )
}