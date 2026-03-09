import React from 'react'
import { Menu, Bell, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="backdrop-blur-xl bg-black/20 border-b border-white/10 shadow-2xl shadow-black/20 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black/20 border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-xl font-semibold text-white truncate">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
            Keep working towards your career goals
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <Link to="/recommendations">
          <button className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105 relative transition-all duration-300 border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black/20 hover:shadow-lg hover:shadow-black/20">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-gray-300 rounded-full shadow-lg shadow-black/50"></span>
          </button>
        </Link>
        
        <Link to="/profile">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:border-gray-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-black/20">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300 hover:text-white transition-colors duration-300" />
            </div>
          </div>
        </Link>
      </div>
    </header>
  )
}