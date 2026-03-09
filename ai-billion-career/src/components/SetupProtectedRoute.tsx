import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSetup } from '../contexts/SetupContext'
import { Loader } from 'lucide-react'

interface SetupProtectedRouteProps {
  children: React.ReactNode
}

export function SetupProtectedRoute({ children }: SetupProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { setupCompleted, loading: setupLoading } = useSetup()

  // 等待认证和setup状态加载
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // 未登录用户跳转到登录页
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 已登录但未完成setup的用户跳转到setup页面
  if (setupCompleted === false) {
    return <Navigate to="/setup" replace />
  }

  // 只有明确完成setup的用户才能访问主应用
  if (setupCompleted === true) {
    return <>{children}</>
  }

  // setupCompleted为null时，显示加载状态
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-300">Checking account status...</p>
      </div>
    </div>
  )
}