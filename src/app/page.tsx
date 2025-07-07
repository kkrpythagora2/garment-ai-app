'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import DemoMode from '@/components/DemoMode'

export default function Home() {
  const { user, loading } = useAuth()
  const [showDemo, setShowDemo] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (showDemo) {
    return <DemoMode />
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Garment AI Studio
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Transform your garment designs with AI-powered tools
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowDemo(true)}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Demo Mode
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

