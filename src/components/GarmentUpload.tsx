
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface GarmentUploadProps {
  onFilesSelected: (files: { garmentImage?: File; styleSwatchImage?: File }) => void
  garmentImage?: File | null
  styleSwatchImage?: File | null
}

export default function GarmentUpload({
  onFilesSelected,
  garmentImage,
  styleSwatchImage
}: GarmentUploadProps) {
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null)
  const [styleSwatchPreview, setStyleSwatchPreview] = useState<string | null>(null)

  const onGarmentDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setGarmentPreview(preview)
      onFilesSelected({ garmentImage: file, styleSwatchImage })
    }
  }, [onFilesSelected, styleSwatchImage])

  const onStyleSwatchDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setStyleSwatchPreview(preview)
      onFilesSelected({ garmentImage, styleSwatchImage: file })
    }
  }, [onFilesSelected, garmentImage])

  const {
    getRootProps: getGarmentRootProps,
    getInputProps: getGarmentInputProps,
    isDragActive: isGarmentDragActive
  } = useDropzone({
    onDrop: onGarmentDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  })

  const {
    getRootProps: getStyleSwatchRootProps,
    getInputProps: getStyleSwatchInputProps,
    isDragActive: isStyleSwatchDragActive
  } = useDropzone({
    onDrop: onStyleSwatchDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  })

  const removeGarmentImage = () => {
    setGarmentPreview(null)
    onFilesSelected({ styleSwatchImage })
  }

  const removeStyleSwatchImage = () => {
    setStyleSwatchPreview(null)
    onFilesSelected({ garmentImage })
  }

  return (
    <div className="space-y-6">
      {/* Garment Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Garment Image *
        </label>
        <div
          {...getGarmentRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isGarmentDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : garmentPreview
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getGarmentInputProps()} />
          {garmentPreview ? (
            <div className="relative">
              <Image
                src={garmentPreview}
                alt="Garment preview"
                className="max-h-48 mx-auto rounded-lg"
                width={200} // Add appropriate width
                height={200} // Add appropriate height
                objectFit="contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeGarmentImage()
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isGarmentDragActive
                  ? 'Drop the garment image here...'
                  : 'Drag & drop a garment image, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Style Swatch Upload (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style Swatch (Optional)
        </label>
        <div
          {...getStyleSwatchRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isStyleSwatchDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : styleSwatchPreview
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getStyleSwatchInputProps()} />
          {styleSwatchPreview ? (
            <div className="relative">
              <Image
                src={styleSwatchPreview}
                alt="Style swatch preview"
                className="max-h-32 mx-auto rounded-lg"
                width={150} // Add appropriate width
                height={150} // Add appropriate height
                objectFit="contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeStyleSwatchImage()
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isStyleSwatchDragActive
                  ? 'Drop the style swatch here...'
                  : 'Drag & drop a style swatch, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Fabric texture, pattern, or color reference
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

