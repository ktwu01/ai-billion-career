import React, { useState, useEffect } from 'react'
import { Target, Plus, Calendar, Check, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { CareerGoal } from '../lib/supabase'

// Status mapping between frontend display and database values
const STATUS_MAPPING = {
  // Frontend status -> Database status
  toDatabase: {
    'not_started': 'active',
    'in_progress': 'active', 
    'completed': 'completed',
    'on_hold': 'paused'
  } as const,
  // Database status -> Frontend status
  fromDatabase: {
    'active': 'not_started', // Default mapping for new goals
    'completed': 'completed',
    'paused': 'on_hold',
    'cancelled': 'on_hold'
  } as const
}

// Helper function to map frontend status to database status
const mapStatusToDatabase = (frontendStatus: string): string => {
  return STATUS_MAPPING.toDatabase[frontendStatus as keyof typeof STATUS_MAPPING.toDatabase] || 'active'
}

// Helper function to map database status to frontend status
const mapStatusFromDatabase = (databaseStatus: string): string => {
  return STATUS_MAPPING.fromDatabase[databaseStatus as keyof typeof STATUS_MAPPING.fromDatabase] || 'not_started'
}

export function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<CareerGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editGoal, setEditGoal] = useState({
    title: '',
    description: '',
    category: 'skills' as 'salary' | 'skills' | 'position' | 'business',
    priority: 'medium' as 'high' | 'medium' | 'low',
    target_date: '',
    status: 'not_started' as 'not_started' | 'in_progress' | 'completed' | 'on_hold',
    progress_percentage: 0
  })
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'skills' as 'salary' | 'skills' | 'position' | 'business',
    priority: 'medium' as 'high' | 'medium' | 'low',
    target_date: '',
    status: 'not_started' as 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  })

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching goals:', error)
      } else {
        // Map database status values to frontend status values
        const mappedGoals = (data || []).map(goal => ({
          ...goal,
          status: mapStatusFromDatabase(goal.status)
        }))
        setGoals(mappedGoals)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!newGoal.title.trim()) {
      alert('Please enter a goal title')
      return
    }
    
    if (!newGoal.target_date) {
      alert('Please select a target date')
      return
    }
    
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('User authentication failed')
      }

      const goalData = {
        ...newGoal,
        goal_type: newGoal.category, // Map category to goal_type for database
        status: mapStatusToDatabase(newGoal.status), // Map frontend status to database status
        user_id: currentUser.id,
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('career_goals')
        .insert(goalData)
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        // Map the returned data status back to frontend format
        const mappedData = {
          ...data,
          status: mapStatusFromDatabase(data.status)
        }
        setGoals([mappedData, ...goals])
        setShowAddForm(false)
        setNewGoal({
          title: '',
          description: '',
          category: 'skills',
          priority: 'medium',
          target_date: '',
          status: 'not_started'
        })
        alert('Goal added successfully!')
      }
    } catch (error: any) {
      console.error('Error adding goal:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to add goal. Please try again.'
      
      if (error.code === '23502') {
        errorMessage = 'Please fill in all required fields.'
      } else if (error.code === '23514') {
        errorMessage = 'Invalid status value. Please try again.'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const updateGoalStatus = async (goalId: string, newStatus: string, progress: number) => {
    try {
      // Map frontend status to database status before updating
      const databaseStatus = mapStatusToDatabase(newStatus)
      
      const { error } = await supabase
        .from('career_goals')
        .update({ 
          status: databaseStatus, 
          progress_percentage: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) {
        throw error
      }

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, status: newStatus as any, progress_percentage: progress }
          : goal
      ))
    } catch (error: any) {
      console.error('Error updating goal:', error)
      
      let errorMessage = 'Failed to update goal status. Please try again.'
      if (error.code === '23514') {
        errorMessage = 'Invalid status value. Please try again.'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('career_goals')
        .delete()
        .eq('id', goalId)

      if (error) {
        throw error
      }

      setGoals(goals.filter(goal => goal.id !== goalId))
    } catch (error: any) {
      console.error('Error deleting goal:', error)
      
      let errorMessage = 'Failed to delete goal. Please try again.'
      if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const startEditGoal = (goal: CareerGoal) => {
    setEditingGoalId(goal.id)
    setEditGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category as 'salary' | 'skills' | 'position' | 'business',
      priority: goal.priority,
      target_date: goal.target_date,
      status: goal.status as 'not_started' | 'in_progress' | 'completed' | 'on_hold',
      progress_percentage: goal.progress_percentage || 0
    })
  }

  const cancelEdit = () => {
    setEditingGoalId(null)
    setEditGoal({
      title: '',
      description: '',
      category: 'skills',
      priority: 'medium',
      target_date: '',
      status: 'not_started',
      progress_percentage: 0
    })
  }

  const saveEditGoal = async (goalId: string) => {
    // Validate required fields
    if (!editGoal.title.trim()) {
      alert('Please enter a goal title')
      return
    }
    
    if (!editGoal.target_date) {
      alert('Please select a target date')
      return
    }

    try {
      const { error } = await supabase
        .from('career_goals')
        .update({
          title: editGoal.title,
          description: editGoal.description,
          goal_type: editGoal.category,
          priority: editGoal.priority,
          target_date: editGoal.target_date,
          status: mapStatusToDatabase(editGoal.status),
          progress_percentage: editGoal.progress_percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) {
        throw error
      }

      // Update the goals list
      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              title: editGoal.title,
              description: editGoal.description,
              goal_type: editGoal.category,
              priority: editGoal.priority,
              target_date: editGoal.target_date,
              status: editGoal.status as any,
              progress_percentage: editGoal.progress_percentage,
              updated_at: new Date().toISOString()
            }
          : goal
      ))

      setEditingGoalId(null)
      alert('Goal updated successfully!')
    } catch (error: any) {
      console.error('Error updating goal:', error)
      
      let errorMessage = 'Failed to update goal. Please try again.'
      if (error.code === '23502') {
        errorMessage = 'Please fill in all required fields.'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('career_goals')
        .update({ 
          progress_percentage: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) {
        throw error
      }

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, progress_percentage: newProgress }
          : goal
      ))
    } catch (error: any) {
      console.error('Error updating progress:', error)
      alert('Failed to update progress. Please try again.')
    }
  }

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === 'all') return true
    return goal.status === activeFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'on_hold': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'on_hold': return <AlertCircle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glassmorphism bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-2xl p-8 text-white relative overflow-hidden enhanced-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text float-animation">SMART Goal Management</h1>
            <p className="text-xl opacity-90 shimmer">
              Set clear, measurable goals on your path to success
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary px-6 py-3 rounded-lg hover-lift font-medium flex items-center space-x-2 shadow-glow"
          >
            <Plus className="h-5 w-5 icon-bounce" />
            <span>Add Goal</span>
          </button>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center hover-lift glow-on-hover">
            <div className="text-2xl font-bold count-animation">{goals.length}</div>
            <div className="text-sm opacity-80">Total Goals</div>
          </div>
          <div className="text-center hover-lift glow-on-hover">
            <div className="text-2xl font-bold count-animation">{goals.filter(g => g.status === 'completed').length}</div>
            <div className="text-sm opacity-80">Completed</div>
          </div>
          <div className="text-center hover-lift glow-on-hover">
            <div className="text-2xl font-bold count-animation">{goals.filter(g => g.status === 'in_progress').length}</div>
            <div className="text-sm opacity-80">In Progress</div>
          </div>
          <div className="text-center hover-lift glow-on-hover">
            <div className="text-2xl font-bold count-animation">
              {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%
            </div>
            <div className="text-sm opacity-80">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'all', name: 'All Goals', count: goals.length },
            { id: 'not_started', name: 'Not Started', count: goals.filter(g => g.status === 'not_started').length },
            { id: 'in_progress', name: 'In Progress', count: goals.filter(g => g.status === 'in_progress').length },
            { id: 'completed', name: 'Completed', count: goals.filter(g => g.status === 'completed').length },
            { id: 'on_hold', name: 'On Hold', count: goals.filter(g => g.status === 'on_hold').length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover-lift ${
                activeFilter === filter.id
                  ? 'btn-primary shadow-glow'
                  : 'glassmorphism text-gray-700 hover:shadow-enhanced glow-on-hover'
              }`}
            >
              <span className="shimmer">{filter.name}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs count-animation">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Add New Goal</h2>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Please enter goal title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
                <input
                  type="date"
                  required
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="skills">Skill Development</option>
                  <option value="salary">Salary Increase</option>
                  <option value="position">Position Promotion</option>
                  <option value="business">Business Development</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Goal Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your goal in detail..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Save Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="glassmorphism enhanced-card shadow-enhanced hover-lift glow-on-hover rounded-xl p-6 transition-all duration-300">
            {editingGoalId === goal.id ? (
              // Edit Form
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-400 gradient-text mb-4">Edit Goal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Goal Title</label>
                    <input
                      type="text"
                      required
                      value={editGoal.title}
                      onChange={(e) => setEditGoal({...editGoal, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Please enter goal title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
                    <input
                      type="date"
                      required
                      value={editGoal.target_date}
                      onChange={(e) => setEditGoal({...editGoal, target_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Goal Category</label>
                    <select
                      value={editGoal.category}
                      onChange={(e) => setEditGoal({...editGoal, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="skills">Skill Development</option>
                      <option value="salary">Salary Increase</option>
                      <option value="position">Position Promotion</option>
                      <option value="business">Business Development</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={editGoal.priority}
                      onChange={(e) => setEditGoal({...editGoal, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Goal Description</label>
                  <textarea
                    value={editGoal.description}
                    onChange={(e) => setEditGoal({...editGoal, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe your goal in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Progress: {editGoal.progress_percentage}%
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editGoal.progress_percentage}
                      onChange={(e) => setEditGoal({...editGoal, progress_percentage: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editGoal.progress_percentage}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          setEditGoal({...editGoal, progress_percentage: value})
                        }}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-center"
                      />
                      <div className="text-sm text-gray-300">
                        Use slider or enter number (0-100)
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => saveEditGoal(goal.id)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-yellow-400 gradient-text">{goal.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium pulse-gentle ${getStatusColor(goal.status)}`}>
                        {getStatusIcon(goal.status)}
                        <span className="ml-1">
                          {goal.status === 'completed' ? 'Completed' :
                           goal.status === 'in_progress' ? 'In Progress' :
                           goal.status === 'on_hold' ? 'On Hold' : 'Not Started'}
                        </span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium glow-on-hover ${getPriorityColor(goal.priority)}`}>
                        {goal.priority === 'high' ? 'High Priority' :
                         goal.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                      </span>
                    </div>
                    
                    <p className="text-white mb-3 shimmer">{goal.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-300">
                      <div className="flex items-center space-x-1 hover-lift">
                        <Calendar className="h-4 w-4 icon-bounce" />
                        <span className="count-animation">Target Date: {goal.target_date}</span>
                      </div>
                      <div className="shimmer">
                        Category: {goal.category === 'skills' ? 'Skill Development' :
                              goal.category === 'salary' ? 'Salary Increase' :
                              goal.category === 'position' ? 'Position Promotion' : 'Business Development'}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="gradient-text">Progress</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={goal.progress_percentage}
                            onChange={(e) => {
                              const newProgress = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              updateGoalProgress(goal.id, newProgress)
                            }}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-center"
                          />
                          <span className="font-medium count-animation">%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200/50 glassmorphism rounded-full h-3 relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress_percentage}
                          onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title={`Current progress: ${goal.progress_percentage}%`}
                        />
                        <div 
                          className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-3 rounded-full transition-all duration-300 shimmer pointer-events-none"
                          style={{ width: `${goal.progress_percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Click and drag to adjust progress</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => startEditGoal(goal)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover-lift icon-bounce transition-all duration-300"
                      title="Edit goal"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover-lift icon-bounce transition-all duration-300"
                      title="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-yellow-400 gradient-text">Update Status:</span>
                    <select
                      value={goal.status}
                      onChange={(e) => {
                        const newStatus = e.target.value
                        const progress = newStatus === 'completed' ? 100 : 
                                       newStatus === 'in_progress' ? Math.max(goal.progress_percentage, 10) : 
                                       goal.progress_percentage
                        updateGoalStatus(goal.id, newStatus, progress)
                      }}
                      className="text-sm glassmorphism border border-gray-300/50 rounded px-2 py-1 hover-lift glow-on-hover transition-all duration-300"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-300 count-animation">
                    Created on {new Date(goal.created_at).toLocaleDateString('en-US')}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12 glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4 float-animation" />
          <h3 className="text-lg font-medium text-yellow-400 mb-2 gradient-text">No Goals Yet</h3>
          <p className="text-white mb-4 shimmer">Start setting your first career goal!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary px-6 py-2 rounded-lg hover-lift font-medium"
          >
            Add Goal
          </button>
        </div>
      )}
    </div>
  )
}