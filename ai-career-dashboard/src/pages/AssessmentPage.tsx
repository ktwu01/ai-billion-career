import React, { useState } from 'react'
import { Brain, CheckCircle, Clock, Award } from 'lucide-react'

export function AssessmentPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const assessmentTypes = [
    {
      id: 'technical',
      title: 'Technical Skills Assessment',
      description: 'Evaluate your technical proficiency in programming, algorithms, system design, etc.',
      duration: '30 minutes',
      questions: 25,
      status: 'completed',
      score: 85
    },
    {
      id: 'leadership',
      title: 'Leadership Assessment',
      description: 'Assess your team management, communication and decision-making abilities',
      duration: '25 minutes',
      questions: 20,
      status: 'in_progress',
      score: null
    },
    {
      id: 'business',
      title: 'Business Acumen Assessment',
      description: 'Evaluate your understanding of markets, products and business models',
      duration: '20 minutes',
      questions: 15,
      status: 'not_started',
      score: null
    },
    {
      id: 'project',
      title: 'Project Management Assessment',
      description: 'Assess your project planning, execution and control capabilities',
      duration: '25 minutes',
      questions: 18,
      status: 'not_started',
      score: null
    }
  ]

  const mbtiTypes = [
    'INTJ - Architect', 'INTP - Thinker', 'ENTJ - Commander', 'ENTP - Debater',
    'INFJ - Advocate', 'INFP - Mediator', 'ENFJ - Protagonist', 'ENFP - Campaigner',
    'ISTJ - Logistician', 'ISFJ - Defender', 'ESTJ - Executive', 'ESFJ - Consul',
    'ISTP - Virtuoso', 'ISFP - Adventurer', 'ESTP - Entrepreneur', 'ESFP - Entertainer'
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Intelligent Assessment System</h1>
        <p className="text-xl opacity-90">
          Comprehensive understanding of your capabilities and potential through scientific assessment system
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'skills', name: 'Skills Assessment' },
              { id: 'personality', name: 'Personality Test' },
              { id: 'results', name: 'Assessment Results' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Skills Assessment</h3>
                  <p className="text-sm text-gray-600">Multi-dimensional skill level assessment</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">MBTI Personality</h3>
                  <p className="text-sm text-gray-600">16 personality type analysis</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Competitiveness Analysis</h3>
                  <p className="text-sm text-gray-600">Industry competitiveness comparison</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Development Recommendations</h3>
                  <p className="text-sm text-gray-600">Personalized improvement plans</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Skills Assessment Checklist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assessmentTypes.map((assessment) => (
                  <div key={assessment.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                        {getStatusIcon(assessment.status)}
                        <span className="ml-1">
                          {assessment.status === 'completed' ? 'Completed' : 
                           assessment.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Questions: {assessment.questions}</span>
                      <span>Duration: {assessment.duration}</span>
                    </div>
                    
                    {assessment.score && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Score</span>
                          <span className="font-semibold">{assessment.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${assessment.score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        assessment.status === 'completed' 
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={assessment.status === 'completed'}
                    >
                      {assessment.status === 'completed' ? 'View Results' : 
                       assessment.status === 'in_progress' ? 'Continue Assessment' : 'Start Assessment'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">MBTI Personality Test</h2>
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">16 Personality Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mbtiTypes.map((type, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg text-center">
                      <span className="text-sm font-medium text-gray-700">{type}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium">
                  Start MBTI Test
                </button>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Assessment Results Report</h2>
              <div className="text-center py-12">
                <img 
                  src="/charts/skills_radar_chart.png" 
                  alt="Skills Radar Chart" 
                  className="max-w-full max-h-96 mx-auto object-contain rounded-lg"
                />
                <p className="mt-4 text-gray-600">
                  Your skill radar chart shows ability levels across different dimensions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}