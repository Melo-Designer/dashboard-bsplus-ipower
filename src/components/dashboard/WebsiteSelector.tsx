'use client'

import { useState, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

type Website = 'bs_plus' | 'ipower'

interface WebsiteContextType {
  website: Website
  setWebsite: (website: Website) => void
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
  const [website, setWebsite] = useState<Website>('bs_plus')

  return (
    <WebsiteContext.Provider value={{ website, setWebsite }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export function WebsiteSelector() {
  const { website, setWebsite } = useWebsite()

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
