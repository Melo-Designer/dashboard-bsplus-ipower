'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Image,
  Settings,
  Users,
  Briefcase,
  MessageSquare,
  Newspaper,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Seiten', href: '/dashboard/seiten', icon: FileText },
  { label: 'Sektionen', href: '/dashboard/sektionen', icon: Layers },
  { label: 'Blog', href: '/dashboard/blog', icon: Newspaper },
  { label: 'Medien', href: '/dashboard/medien', icon: Image },
  { label: 'Stellenangebote', href: '/dashboard/stellenangebote', icon: Briefcase },
  { label: 'Bewerbungen', href: '/dashboard/bewerbungen', icon: Users },
  { label: 'Nachrichten', href: '/dashboard/nachrichten', icon: MessageSquare },
  { label: 'Einstellungen', href: '/dashboard/einstellungen', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'h-screen bg-secondary text-white flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="font-highlight text-lg font-bold text-white">Dashboard</h1>
            <p className="text-xs text-secondary-200">BS Plus & iPower</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-secondary-400 transition-colors"
          aria-label={isCollapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-secondary-100 hover:bg-secondary-400 hover:text-white'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
