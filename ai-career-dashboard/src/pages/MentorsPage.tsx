import React, { useState, useEffect } from 'react'
import {
  Quote,
  User,
  ExternalLink,
  Search,
  TrendingUp,
  Lightbulb,
  Brain,
  Rocket,
  UserPlus,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Mentor {
  id: string
  name: string
  title: string
  bio: string
  twitter_handle: string
  avatar_url: string
  category: 'quotes' | 'journey'
  created_at: string
  is_followed?: boolean
}

export function MentorsPage() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [activeCategory, setActiveCategory] = useState<'all' | 'quotes' | 'journey'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchMentorsData()
    }
  }, [user])

  const fetchMentorsData = async () => {
    try {
      setLoading(true)
      
      // Fetch all mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (mentorsError) {
        console.error('Error fetching mentors:', mentorsError)
        return
      }
      
      // Fetch user's followed mentors
      const { data: followsData, error: followsError } = await supabase
        .from('user_mentor_follows')
        .select('mentor_id')
        .eq('user_id', user?.id)
      
      if (followsError) {
        console.error('Error fetching follows:', followsError)
      }
      
      const followedMentorIds = new Set(followsData?.map(f => f.mentor_id) || [])
      
      // Add follow status to mentors
      const mentorsWithFollowStatus = mentorsData?.map(mentor => ({
        ...mentor,
        is_followed: followedMentorIds.has(mentor.id)
      })) || []
      
      setMentors(mentorsWithFollowStatus)
      
    } catch (error) {
      console.error('Error fetching mentors data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async (mentorId: string, isCurrentlyFollowed: boolean) => {
    if (!user) return
    
    setFollowingInProgress(prev => new Set([...prev, mentorId]))
    
    try {
      const action = isCurrentlyFollowed ? 'unfollow' : 'follow'
      
      const { data, error } = await supabase.functions.invoke('mentor-follow', {
        body: {
          mentorId,
          action
        }
      })
      
      if (error) {
        console.error('Follow/unfollow error:', error)
        return
      }
      
      // Update local state
      setMentors(prev => prev.map(mentor => 
        mentor.id === mentorId 
          ? { ...mentor, is_followed: !isCurrentlyFollowed }
          : mentor
      ))
      
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowingInProgress(prev => {
        const newSet = new Set(prev)
        newSet.delete(mentorId)
        return newSet
      })
    }
  }

  const categories = [
    { id: 'all' as const, name: 'All Mentors', icon: Brain, count: mentors.length },
    { id: 'quotes' as const, name: 'Leader Quotes', icon: Quote, count: mentors.filter(m => m.category === 'quotes').length },
    { id: 'journey' as const, name: 'Growth Journey', icon: TrendingUp, count: mentors.filter(m => m.category === 'journey').length }
  ]

  const filteredMentors = mentors.filter(mentor => {
    const matchesCategory = activeCategory === 'all' || mentor.category === activeCategory
    const matchesSearch = searchTerm === '' || 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spin-enhanced rounded-full h-32 w-32 border-b-2 border-accent glow-on-hover"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6 text-secondary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium mb-2 flex items-center space-x-3">
              <Lightbulb className="h-7 w-7 text-accent pulse-gentle" />
              <span className="gradient-text float-animation">Mentors</span>
            </h1>
            <p className="text-lg text-gray-400 shimmer">
              Learn from industry leaders and connect with successful professionals
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2 hover-lift glow-on-hover">
                <Quote className="h-4 w-4 text-accent pulse-gentle" />
                <span className="text-accent text-sm count-animation">
                  {mentors.filter(m => m.category === 'quotes').length} leader quotes
                </span>
              </div>
              <div className="flex items-center space-x-2 hover-lift glow-on-hover">
                <Rocket className="h-4 w-4 text-accent pulse-gentle" />
                <span className="text-accent text-sm count-animation">
                  {mentors.filter(m => m.category === 'journey').length} growth stories
                </span>
              </div>
              <div className="flex items-center space-x-2 hover-lift glow-on-hover">
                <UserCheck className="h-4 w-4 text-accent pulse-gentle" />
                <span className="text-accent text-sm count-animation">
                  {mentors.filter(m => m.is_followed).length} followed
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block hover-lift">
            <div className="w-24 h-24 glassmorphism rounded-full flex items-center justify-center shadow-glow">
              <Brain className="h-10 w-10 text-accent float-animation" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative hover-lift">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 icon-bounce" />
              <input
                type="text"
                placeholder="Search mentors by name, title or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glassmorphism border border-gray-600/50 rounded-md text-secondary-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent glow-on-hover transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-300 hover-lift ${
                    activeCategory === category.id
                      ? 'btn-primary shadow-glow'
                      : 'glassmorphism text-gray-300 hover:shadow-enhanced glow-on-hover'
                  }`}
                >
                  <Icon className="h-4 w-4 icon-bounce" />
                  <span className="shimmer">{category.name}</span>
                  <span className="bg-gray-600/50 text-gray-300 px-2 py-0.5 rounded text-xs count-animation">
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMentors.map(mentor => (
          <div key={mentor.id} className="glassmorphism enhanced-card shadow-enhanced hover-lift glow-on-hover rounded-xl p-6 transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 glassmorphism rounded-full flex items-center justify-center shadow-enhanced hover-lift">
                  <User className="h-6 w-6 text-accent float-animation" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-foreground gradient-text">{mentor.name}</h3>
                  <p className="text-sm text-gray-400 shimmer">{mentor.title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-md text-xs font-medium pulse-gentle ${
                  mentor.category === 'quotes' 
                    ? 'bg-blue-900/50 text-blue-300 glassmorphism'
                    : 'bg-green-900/50 text-green-300 glassmorphism'
                }`}>
                  {mentor.category === 'quotes' ? 'Quote' : 'Growth'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-gray-300 leading-relaxed shimmer">{mentor.bio}</p>
            </div>

            {/* Follow Button and Twitter Link */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleFollowToggle(mentor.id, mentor.is_followed || false)}
                disabled={followingInProgress.has(mentor.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-300 hover-lift ${
                  mentor.is_followed
                    ? 'glassmorphism text-gray-300 hover:shadow-enhanced'
                    : 'btn-primary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {followingInProgress.has(mentor.id) ? (
                  <div className="spin-enhanced rounded-full h-4 w-4 border-b-2 border-current" />
                ) : mentor.is_followed ? (
                  <UserCheck className="h-4 w-4 pulse-gentle" />
                ) : (
                  <UserPlus className="h-4 w-4 icon-bounce" />
                )}
                <span>
                  {followingInProgress.has(mentor.id)
                    ? 'Processing...'
                    : mentor.is_followed
                    ? 'Following'
                    : 'Follow'
                  }
                </span>
              </button>
              
              {mentor.twitter_handle && (
                <a
                  href={`https://twitter.com/${mentor.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1 glassmorphism hover:shadow-enhanced text-gray-300 hover:text-accent text-sm rounded-md transition-all duration-300 hover-lift glow-on-hover"
                >
                  <ExternalLink className="h-3 w-3 icon-bounce" />
                  <span className="shimmer">@{mentor.twitter_handle}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredMentors.length === 0 && (
        <div className="text-center py-12 glassmorphism enhanced-card shadow-enhanced hover-lift rounded-xl">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4 float-animation" />
          <h3 className="text-lg font-medium text-secondary-foreground mb-2 gradient-text">No Mentors Found</h3>
          <p className="text-gray-400 shimmer">Please try adjusting search criteria or selecting other categories</p>
        </div>
      )}
    </div>
  )
}