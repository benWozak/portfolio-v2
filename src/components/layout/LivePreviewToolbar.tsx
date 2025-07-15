'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface LivePreviewToolbarProps {
  isDraftMode?: boolean
  collection?: string
  id?: string
  slug?: string
}

export function LivePreviewToolbar({ 
  isDraftMode = false, 
  collection,
  id
}: LivePreviewToolbarProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(isDraftMode)

  useEffect(() => {
    setIsVisible(isDraftMode)
  }, [isDraftMode])

  const handleExitPreview = async () => {
    try {
      const currentPath = window.location.pathname
      await fetch(`/api/exit-preview?redirect=${encodeURIComponent(currentPath)}`)
      router.refresh()
    } catch (error) {
      console.error('Error exiting preview mode:', error)
    }
  }

  const handleRefresh = () => {
    router.refresh()
  }

  const openInPayload = () => {
    if (collection && id) {
      window.open(`/admin/collections/${collection}/${id}`, '_blank')
    } else if (collection) {
      window.open(`/admin/collections/${collection}`, '_blank')
    } else {
      window.open('/admin', '_blank')
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-sm font-medium shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
            <span className="font-semibold">Live Preview Mode</span>
          </div>
          {collection && (
            <span className="text-xs bg-black/10 px-2 py-1 rounded">
              {collection} {id && `(${id})`}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="bg-black/10 hover:bg-black/20 px-3 py-1 rounded text-xs font-medium transition-colors"
            title="Refresh to see latest changes"
          >
            Refresh
          </button>
          
          {collection && (
            <button
              onClick={openInPayload}
              className="bg-black/10 hover:bg-black/20 px-3 py-1 rounded text-xs font-medium transition-colors"
              title="Edit in Payload CMS"
            >
              Edit
            </button>
          )}
          
          <button
            onClick={handleExitPreview}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            title="Exit preview mode"
          >
            Exit Preview
          </button>
        </div>
      </div>
    </div>
  )
}