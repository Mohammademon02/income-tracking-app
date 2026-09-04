'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Download className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground dark:text-gray-100">
            Install SurvTrack
          </p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            Add to your home screen for quick access
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-primary hover:bg-blue-700 text-white"
        >
          Install
        </Button>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}