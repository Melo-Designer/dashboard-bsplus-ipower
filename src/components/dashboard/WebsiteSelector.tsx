'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { cn } from '@/lib/utils'

export type Website = 'bs_plus' | 'ipower'

const STORAGE_KEY = 'dashboard-selected-website'

interface WebsiteContextType {
  website: Website
  setWebsite: (website: Website) => void
  isLoaded: boolean
  getDisplayName: (site?: Website) => string
  isBsPlus: boolean
  isIpower: boolean
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined)

export function useWebsite() {
  const context = useContext(WebsiteContext)
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider')
  }
  return context
}

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const [website, setWebsiteState] = useState<Website>('bs_plus')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'bs_plus' || stored === 'ipower') {
      setWebsiteState(stored)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when changed
  const setWebsite = useCallback((newWebsite: Website) => {
    setWebsiteState(newWebsite)
    localStorage.setItem(STORAGE_KEY, newWebsite)
  }, [])

  // Get display name
  const getDisplayName = useCallback((site?: Website): string => {
    const target = site || website
    return target === 'bs_plus' ? 'BS Plus' : 'iPower'
  }, [website])

  return (
    <WebsiteContext.Provider value={{
      website,
      setWebsite,
      isLoaded,
      getDisplayName,
      isBsPlus: website === 'bs_plus',
      isIpower: website === 'ipower',
    }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export function WebsiteSelector() {
  const { website, setWebsite, isLoaded } = useWebsite()

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-1 p-1 bg-light-grey rounded-lg">
        <div className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground">
          Laden...
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-light-grey rounded-lg">
      <button
        onClick={() => setWebsite('bs_plus')}
        className={cn(
          'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
          website === 'bs_plus'
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-text-color'
        )}
      >
        BS Plus
      </button>
      <button
        onClick={() => setWebsite('ipower')}
        className={cn(
          'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
          website === 'ipower'
            ? 'bg-ipower-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-text-color'
        )}
      >
        iPower
      </button>
    </div>
  )
}
