import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  ClipboardList,
  Lightbulb,
  TrendingUp,
  Target,
  BarChart3,
  LogOut,
  Brain,
  Users
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

// Simple navigation array (flattened from sections, maintaining pill styles)
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Your main workspace'
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
    description: 'Track your objectives'
  },
  {
    name: 'Recommendations',
    href: '/recommendations',
    icon: Lightbulb,
    description: 'AI-powered insights'
  },
  {
    name: 'Mentors',
    href: '/mentors',
    icon: Users,
    description: 'Connect with experts'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Manage your account'
  }
]

// Hidden pages (keep source code for future use):
// {
//   name: 'Assessment',
//   href: '/assessment',
//   icon: ClipboardList,
//   description: 'Skill evaluation'
// },
// {
//   name: 'Progress',
//   href: '/progress',
//   icon: TrendingUp,
//   description: 'Track improvements'
// }

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col transform transition-all duration-300 ease-in-out",
        // Enhanced glassmorphism with better backdrop blur and shadow
        "backdrop-blur-xl bg-black/20 border-r border-white/10 shadow-2xl shadow-black/20",
        // Increased width with responsive design
        "w-80 sm:w-72 lg:w-80",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:scale-105">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm border border-white/10 shadow-lg group-hover:shadow-yellow-500/20 transition-all duration-300">
              <Brain className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
            </div>
            <div>
              <span className="text-lg font-semibold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                AI Billion Career
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-black/20"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  // Base pill styling with generous padding
                  "group flex items-center px-4 py-4 text-sm rounded-2xl transition-all duration-300",
                  "border backdrop-blur-sm transform-gpu",
                  // Focus states
                  "focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-black/20",
                  // Hover states - scale up and deeper shadow
                  "hover:scale-105 hover:shadow-lg hover:shadow-black/20",
                  // Active states - filled background with thin ring
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-yellow-400/50 text-white font-semibold shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-400/30"
                    : "text-gray-300 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all duration-300",
                    isActive 
                      ? "text-yellow-300 drop-shadow-sm" 
                      : "text-gray-400 group-hover:text-gray-200"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium transition-all duration-300",
                      isActive ? "font-semibold text-white" : "font-normal"
                    )}>
                      {item.name}
                    </div>
                    <div className={cn(
                      "text-xs mt-0.5 transition-all duration-300 truncate",
                      isActive 
                        ? "text-yellow-200/80" 
                        : "text-gray-500 group-hover:text-gray-400"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Sticky Footer */}
        <div className="mt-auto border-t border-white/10 bg-black/10 backdrop-blur-sm">
          {/* Sign out */}
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className={cn(
                "group flex items-center px-4 py-4 text-sm rounded-2xl transition-all duration-300 w-full",
                "border backdrop-blur-sm transform-gpu",
                "text-gray-300 border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-300",
                "hover:scale-105 hover:shadow-lg hover:shadow-black/20",
                "focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-black/20"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 mr-4 text-gray-400 group-hover:text-red-400 transition-all duration-300" />
              <div className="flex-1 text-left">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-gray-500 group-hover:text-red-400/80 transition-all duration-300 mt-0.5">
                  End your session
                </div>
              </div>
            </button>
          </div>
          
          {/* Footer Caption */}
          <div className="px-6 py-3 border-t border-white/5">
            <p className="text-xs text-gray-500/80 text-center">
              <span className="font-mono text-gray-400/90 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                Powered by AI
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}