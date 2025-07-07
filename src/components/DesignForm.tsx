'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import GarmentUpload from './GarmentUpload'
import { Sparkles, ArrowRight } from 'lucide-react'

interface DesignFormData {
  garmentImage?: File
  styleSwatchImage?: File
  designPrompt: string
}

export default function DesignForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<DesignFormData>({
    designPrompt: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFilesSelected = (files: { garmentImage?: File; styleSwatchImage?: File }) => {
    setFormData(prev => ({
      ...prev,
      ...files
    }))
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      designPrompt: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.garmentImage || !formData.designPrompt.trim()) {
      alert('Please provide both a garment image and design prompt')
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Implement design creation logic
      console.log('Creating design with:', formData)
      alert('Design creation will be implemented in the next phase!')
    } catch (error) {
      console.error('Error creating design:', error)
      alert('Failed to create design. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.garmentImage && formData.designPrompt.trim()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Sparkles className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Create New Design</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <GarmentUpload
            onFilesSelected={handleFilesSelected}
            garmentImage={formData.garmentImage}
            styleSwatchImage={formData.styleSwatchImage}
          />

          {/* Design Prompt Section */}
          <div>
            <label htmlFor="designPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Design Prompt *
            </label>
            <textarea
              id="designPrompt"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe how you want to modify the garment... (e.g., 'make it denim with floral embroidery', 'change to silk, add ruffles on sleeves')"
              value={formData.designPrompt}
              onChange={handlePromptChange}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Be specific about materials, colors, patterns, or style changes you want to apply
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`flex items-center px-6 py-3 rounded-md text-white font-medium transition-colors ${
                isFormValid && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Design...
                </>
              ) : (
                <>
                  Generate Preview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Upload an image of the garment you want to modify</li>
            <li>2. Optionally add a style swatch for texture/pattern reference</li>
            <li>3. Describe your desired changes in the design prompt</li>
            <li>4. Our AI will generate a preview of your modified design</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

