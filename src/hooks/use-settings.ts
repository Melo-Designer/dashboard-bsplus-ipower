'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseSettingsOptions {
  website: string
}

export function useSettings({ website }: UseSettingsOptions) {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      if (!website) return

      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/settings?website=${website}`)
        if (!res.ok) throw new Error('Failed to fetch settings')

        const data = await res.json()
        setSettings(data.settings || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [website])

  const getSetting = useCallback(
    (key: string, defaultValue = ''): string => {
      return settings[key] || defaultValue
    },
    [settings]
  )

  const refetch = useCallback(async () => {
    if (!website) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/settings?website=${website}`)
      if (!res.ok) throw new Error('Failed to fetch settings')

      const data = await res.json()
      setSettings(data.settings || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [website])

  return {
    settings,
    getSetting,
    isLoading,
    error,
    refetch,
  }
}
