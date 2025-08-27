import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowRight, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSetup } from '../contexts/SetupContext'
import { supabase } from '../lib/supabase'

interface SetupData {
  expectedSalary: string
  industry: string
  professionalBackground: string
  positionLevel: string
  careerGoal: string
}

const INDUSTRIES = [
  'AI/Artificial Intelligence',
  'Internet/Technology',
  'Finance/Investment',
  'Consulting/Management',
  'Startup/Entrepreneurship',
  'Education/Training',
  'Healthcare/Biotechnology',
  'Manufacturing/Engineering',
  'Media/Entertainment',
  'Other'
]

const POSITION_LEVELS = [
  'Junior (0-2 years)',
  'Mid-level (3-5 years)',
  'Senior (6-8 years)',
  'Expert (9+ years)',
  'Management',
  'Executive/Founder'
]

const CAREER_GOALS = [
  'Technical Expert Path',
  'Management Development Path',
  'Entrepreneurship Direction',
  'Cross-Industry Development',
  'Freelancing',
  'Still Exploring'
]

const SALARY_RANGES = [
  'Under $100K',
  '$100K-200K',
  '$200K-500K',
  '$500K-1M',
  '$1M-2M',
  '$2M-5M',
  '$5M-10M',
  'Over $10M (Aim for the top!)'
]

export function SetupPage() {
  const { user } = useAuth()
  const { checkSetupStatus } = useSetup()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState<SetupData>({
    expectedSalary: '',
    industry: '',
    professionalBackground: '',
    positionLevel: '',
    careerGoal: ''
  })

  const [analysisStep, setAnalysisStep] = useState(0)
  const analysisSteps = [
    'Analyzing your background information...',
    'Matching optimal career paths...',
    'Generating personalized recommendations...',
    'Preparing your exclusive Dashboard...'
  ]

  const handleInputChange = (field: keyof SetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '')
  }

  const handleSubmit = async () => {
    if (!isFormValid() || !user) {
      console.log('Form validation failed or user not logged in', { isFormValid: isFormValid(), user: !!user })
      return
    }

    console.log('Starting Setup submission process...')
    setIsAnalyzing(true)
    setStep(2)

    try {
      // Simulate AI analysis process
      for (let i = 0; i < analysisSteps.length; i++) {
        console.log(`AI analysis step ${i + 1}: ${analysisSteps[i]}`)
        setAnalysisStep(i)
        await new Promise(resolve => setTimeout(resolve, 1500)) // 增加到1.5秒
      }

      console.log('Starting to save Setup data...')
      // 使用upsert操作，确保只有一条记录
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          expected_salary: formData.expectedSalary,
          industry: formData.industry,
          professional_background: formData.professionalBackground,
          position_level: formData.positionLevel,
          career_goal: formData.careerGoal,
          setup_completed: true,
          setup_completed_at: new Date().toISOString(),
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          email: user.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select('id, setup_completed')
        .single()

      if (error) {
        console.error('Supabase save error:', error)
        throw error
      }

      console.log('Setup data saved successfully:', data)

      console.log('Setup data saved successfully, updating status...')
      // 立即更新Setup状态
      await checkSetupStatus()
      
      console.log('Entering step 3: completion page')
      setStep(3)
      
      // Wait 2.5 seconds then redirect
      setTimeout(() => {
        console.log('Redirecting to Dashboard...')
        navigate('/dashboard')
      }, 2500)
      
    } catch (error) {
      console.error('Failed to save setup data:', error)
      setIsAnalyzing(false)
      setStep(1)
      alert(`Error saving information: ${error.message || 'Unknown error'}, please try again`)
    }
  }

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to AI Billion Career!
        </h1>
        <p className="text-gray-300 text-lg">
          Let's understand your background to provide tailored career development advice
        </p>
      </div>

      <div className="space-y-6">
        {/* 期望年薪 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            What is your expected annual salary? *
          </label>
          <select
            value={formData.expectedSalary}
            onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            <option value="">Please select expected salary range</option>
            {SALARY_RANGES.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>

        {/* 所在行业 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            What industry are you in or want to enter? *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            <option value="">Please select industry</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* 职位级别 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            What is your current position level? *
          </label>
          <select
            value={formData.positionLevel}
            onChange={(e) => handleInputChange('positionLevel', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            <option value="">Please select position level</option>
            {POSITION_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* 职业目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            What are your career development goals? *
          </label>
          <select
            value={formData.careerGoal}
            onChange={(e) => handleInputChange('careerGoal', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            <option value="">Please select career goal</option>
            {CAREER_GOALS.map(goal => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </div>

        {/* 专业背景 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Please briefly describe your professional background and skills *
          </label>
          <textarea
            value={formData.professionalBackground}
            onChange={(e) => handleInputChange('professionalBackground', e.target.value)}
            placeholder="E.g.: Master's in Computer Science, 5 years Python development experience, familiar with machine learning algorithms..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            isFormValid()
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-lg hover:shadow-xl'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Start AI Analysis</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="relative">
          <div className="h-32 w-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-b from-gray-900 to-gray-800 rounded-full flex items-center justify-center">
              <Brain className="h-12 w-12 text-yellow-400 animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            AI is crafting your personalized career plan
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            {analysisSteps[analysisStep]}
          </p>
          
          {/* 增强的进度条 */}
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-1000 ease-out animate-pulse"
              style={{ width: `${(analysisStep + 1) * 25}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Step {analysisStep + 1} / {analysisSteps.length}
          </p>
          
          {/* 分析步骤列表 */}
          <div className="space-y-3">
            {analysisSteps.map((step, index) => (
              <div key={index} className={`flex items-center space-x-3 text-sm ${
                index <= analysisStep ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  index < analysisStep ? 'bg-yellow-500' : 
                  index === analysisStep ? 'bg-yellow-400 animate-pulse' : 'bg-gray-700'
                }`}></div>
                <span className={index === analysisStep ? 'font-medium' : ''}>{step}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Please wait while we generate your personalized career planning recommendations...
          </div>
        </div>
      </div>
  )

  const renderStep3 = () => (
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="h-32 w-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full shadow-lg shadow-yellow-500/50"></div>
          <div className="absolute inset-2 bg-gradient-to-b from-gray-900 to-gray-800 rounded-full flex items-center justify-center">
            <Brain className="h-12 w-12 text-yellow-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Analysis Complete!
        </h2>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
          Your exclusive career planning Dashboard is ready
          <br />
          <span className="text-yellow-400 font-medium">Redirecting you now...</span>
        </p>
        
        <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex justify-center mb-4">
            <Loader className="h-8 w-8 text-yellow-400 animate-spin" />
          </div>
          <p className="text-sm text-gray-400">
            Loading your personalized Dashboard...
          </p>
        </div>
      </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* 步骤指示器 */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= stepNumber
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black'
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    step > stepNumber ? 'bg-yellow-500' : 'bg-gray-800'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  )
}