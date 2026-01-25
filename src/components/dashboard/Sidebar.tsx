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
  Home,
  ChevronDown,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useWebsite } from './WebsiteSelector'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Startseite', href: '/startseite', icon: Home },
  { label: 'Seiten', href: '/seiten', icon: FileText },
  { label: 'Sektionen', href: '/sektionen', icon: Layers },
  { label: 'Blog', href: '/blog', icon: Newspaper },
  { label: 'Medien', href: '/medien', icon: Image },
  { label: 'Stellenangebote', href: '/stellenangebote', icon: Briefcase },
  { label: 'Bewerbungen', href: '/bewerbungen', icon: Users },
  { label: 'Nachrichten', href: '/nachrichten', icon: MessageSquare },
  { label: 'Einstellungen', href: '/einstellungen', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { website, setWebsite, isLoaded, getDisplayName } = useWebsite()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      {/* Website Selector */}
      <div className="px-2 pb-4" ref={dropdownRef}>
        {isLoaded ? (
          <div className="relative">
            <button
              onClick={() => !isCollapsed && setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                website === 'bs_plus'
                  ? 'bg-primary/20 text-white'
                  : 'bg-ipower-primary/20 text-white',
                !isCollapsed && 'hover:bg-secondary-400'
              )}
              title={isCollapsed ? getDisplayName() : undefined}
            >
              <div
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  website === 'bs_plus' ? 'bg-primary' : 'bg-ipower-primary'
                )}
              >
                {website === 'bs_plus' ? 'BS' : 'iP'}
              </div>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    {getDisplayName()}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isDropdownOpen && 'rotate-180'
                    )}
                  />
                </>
              )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && !isCollapsed && (
              <div className="absolute left-0 right-0 mt-1 bg-secondary-400 rounded-lg overflow-hidden z-50 shadow-lg">
                <button
                  onClick={() => {
                    setWebsite('bs_plus')
                    setIsDropdownOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
                    website === 'bs_plus'
                      ? 'bg-primary text-white'
                      : 'text-secondary-100 hover:bg-secondary-300'
                  )}
                >
                  <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-xs font-bold">
                    BS
                  </div>
                  <span className="text-sm">BS Plus</span>
                </button>
                <button
                  onClick={() => {
                    setWebsite('ipower')
                    setIsDropdownOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
                    website === 'ipower'
                      ? 'bg-ipower-primary text-white'
                      : 'text-secondary-100 hover:bg-secondary-300'
                  )}
                >
                  <div className="h-6 w-6 rounded bg-ipower-primary flex items-center justify-center text-xs font-bold">
                    iP
                  </div>
                  <span className="text-sm">iPower</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-12 rounded-lg bg-secondary-400 animate-pulse" />
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

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
