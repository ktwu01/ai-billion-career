import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SetupProvider } from './contexts/SetupContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SetupProtectedRoute } from './components/SetupProtectedRoute'
import { Layout } from './components/Layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SetupPage } from './pages/SetupPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { AssessmentPage } from './pages/AssessmentPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { ProgressPage } from './pages/ProgressPage'
import { GoalsPage } from './pages/GoalsPage'
import { MentorsPage } from './pages/MentorsPage'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <SetupProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Setup route - Only requires login */}
            <Route path="/setup" element={
              <ProtectedRoute>
                <SetupPage />
              </ProtectedRoute>
            } />
            
            {/* Protected routes - Requires login and setup completion */}
            <Route path="/" element={
              <SetupProtectedRoute>
                <Layout />
              </SetupProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="assessment" element={<AssessmentPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="mentors" element={<MentorsPage />} />
            </Route>
            
            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SetupProvider>
    </AuthProvider>
  )
}

export default App