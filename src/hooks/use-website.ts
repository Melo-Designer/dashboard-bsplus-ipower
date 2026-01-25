'use client'

import { useState, useEffect, useCallback } from 'react'

export type Website = 'bs_plus' | 'ipower'

const STORAGE_KEY = 'dashboard-selected-website'

export function useWebsite() {
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

  return {
    website,
    setWebsite,
    isLoaded,
    getDisplayName,
    isBsPlus: website === 'bs_plus',
    isIpower: website === 'ipower',
  }
}
