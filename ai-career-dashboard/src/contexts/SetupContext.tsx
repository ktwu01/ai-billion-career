import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface SetupContextType {
  setupCompleted: boolean | null
  checkSetupStatus: () => Promise<void>
  refreshSetupStatus: () => Promise<void>
  loading: boolean
}

const SetupContext = createContext<SetupContextType | undefined>(undefined)

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSetupStatus = async () => {
    if (!user) {
      setSetupCompleted(null)
      setLoading(false)
      return
    }

    try {
      console.log('Starting to check user setup status, user_id:', user.id)
      
      // Use single record query with error handling to prevent multi-record issues
      const { data, error } = await supabase
        .from('user_profiles')
        .select('setup_completed, id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (error) {
        console.error('Check setup status failed:', error)
        // If record not found error, means user doesn't have profile record yet
        if (error.code === 'PGRST116') {
          console.log('User profile record does not exist, setup not completed')
          setSetupCompleted(false)
        } else {
          console.error('Database query error:', error)
          setSetupCompleted(false)
        }
      } else {
        console.log('Setup status query successful:', data)
        setSetupCompleted(data?.setup_completed || false)
      }
    } catch (error) {
      console.error('Check setup status exception:', error)
      setSetupCompleted(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSetupStatus()
  }, [user])

  return (
    <SetupContext.Provider value={{
      setupCompleted,
      checkSetupStatus,
      refreshSetupStatus: checkSetupStatus, // Provide an explicit refresh method
      loading
    }}>
      {children}
    </SetupContext.Provider>
  )
}

export function useSetup() {
  const context = useContext(SetupContext)
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider')
  }
  return context
}