'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { LogOut, User } from 'lucide-react'
import { WebsiteSelector } from './WebsiteSelector'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <WebsiteSelector />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-text-color">
          <User className="h-4 w-4" />
          <span>{session?.user?.name || session?.user?.email}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/anmelden' })}
          className="flex items-center gap-2 text-sm text-text-color hover:text-primary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </header>
  )
}
