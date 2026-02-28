'use client'

import { useState } from 'react'
import { usePWAInstall } from '@/lib/usePWAInstall'
import { Download, X, Smartphone } from 'lucide-react'

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  if (isInstalled || dismissed || !isInstallable) return null

  async function handleInstall() {
    setInstalling(true)
    await triggerInstall()
    setInstalling(false)
  }

  return (
    <div className="bg-brand-blue text-white px-4 py-3 flex items-center gap-3">
      <div className="p-2 bg-brand-orange rounded-lg shrink-0">
        <Smartphone className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Install Grub N Snack</p>
        <p className="text-xs text-white/60">
          Add to your home screen for quick access
        </p>
      </div>
      <button
        onClick={handleInstall}
        disabled={installing}
        className="shrink-0 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
      >
        <Download className="w-3.5 h-3.5" />
        {installing ? 'Installing...' : 'Install'}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-white/40 hover:text-white/80 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
