
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { DesignData, ProgressStep } from "../types"

interface ProgressTrackerProps {
  designId: string
  onComplete?: (result: unknown) => void
  onError?: (error: string) => void
}

export default function ProgressTracker({ designId, onComplete, onError }: ProgressTrackerProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'upload',
      title: 'Image Upload',
      description: 'Processing uploaded images',
      status: 'completed'
    },
    {
      id: 'segmentation',
      title: 'Garment Segmentation',
      description: 'Identifying garment boundaries using Grounding DINO + SAM',
      status: 'pending'
    },
    {
      id: 'concept_generation',
      title: 'Concept Generation',
      description: 'Creating design variations with SDXL',
      status: 'pending'
    },
    {
      id: 'pattern_drafting',
      title: 'Pattern Drafting',
      description: 'Generating sewing patterns with SewFormer',
      status: 'pending'
    },
    {
      id: 'fit_simulation',
      title: '3D Fit Simulation',
      description: 'Running CLO 3D simulation',
      status: 'pending'
    },
    {
      id: 'tech_pack',
      title: 'Tech Pack Generation',
      description: 'Creating technical specifications',
      status: 'pending'
    }
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const handleProgressUpdate = useCallback((designData: DesignData) => {
    if (!designData) return

    const { status, current_step, progress_data, error_message } = designData

    // Update steps based on progress data
    if (progress_data) {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps]
        
        // Update step statuses based on progress data
        progress_data.forEach((stepData: ProgressStep) => {
          const stepIndex = newSteps.findIndex(step => step.id === stepData.id);
          if (stepIndex !== -1) {
            newSteps[stepIndex] = {
              ...newSteps[stepIndex],
              status: stepData.status,
              progress: stepData.progress,
              error_message: stepData.error_message,
              started_at: stepData.started_at,
              completed_at: stepData.completed_at
            }
          }
        })
        return newSteps
      })
    }

    // Update current step
    if (current_step !== undefined) {
      setCurrentStep(current_step)
    }

    // Handle completion
    if (status === 'completed') {
      setIsComplete(true)
      onComplete?.(designData)
    }

    // Handle errors
    if (status === 'error') {
      onError?.(error_message || 'An error occurred during processing')
    }
  }, [onComplete, onError])

  useEffect(() => {
    // Subscribe to real-time updates for this design
    const channel = supabase
      .channel(`design_progress_${designId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'designs',
          filter: `id=eq.${designId}`
        },
        (payload) => {
          console.log('Design progress update:', payload)
          handleProgressUpdate(payload.new as DesignData)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [designId, handleProgressUpdate])

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'processing':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      default:
        return (
          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
            index <= currentStep ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}>
            {index <= currentStep && step.status === 'pending' && (
              <Clock className="h-3 w-3 text-blue-500" />
            )}
          </div>
        )
    }
  }

  const getStepProgress = (step: ProgressStep) => {
    if (step.status === 'completed') return 100
    if (step.status === 'processing' && step.progress) return step.progress
    return 0
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Loader2 className={`h-6 w-6 mr-2 ${isComplete ? 'text-green-500' : 'text-blue-500 animate-spin'}`} />
          <h2 className="text-2xl font-bold text-gray-900">
            {isComplete ? 'Design Complete!' : 'Processing Your Design'}
          </h2>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step, index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${
                    step.status === 'error' ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>
                  {step.status === 'processing' && step.progress && (
                    <span className="text-sm text-blue-600 font-medium">
                      {step.progress}%
                    </span>
                  )}
                </div>
                
                <p className={`text-sm ${
                  step.status === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {step.status === 'error' && step.error_message 
                    ? step.error_message 
                    : step.description
                  }
                </p>

                {/* Progress bar for processing steps */}
                {step.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getStepProgress(step)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                {(step.started_at || step.completed_at) && (
                  <div className="mt-1 text-xs text-gray-500">
                    {step.started_at && (
                      <span>Started: {new Date(step.started_at).toLocaleTimeString()}</span>
                    )}
                    {step.completed_at && (
                      <span className="ml-4">
                        Completed: {new Date(step.completed_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800 font-medium">
                Your design has been successfully processed! You can now view the results.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


