'use client'

import Link from 'next/link'
import NextImage from 'next/image'
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
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronDown,
  Globe,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useWebsite } from './WebsiteSelector'

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Journal', href: '/blog', icon: Newspaper },
  { label: 'Stellenangebote', href: '/karriere', icon: Briefcase },
  {
    label: 'Website',
    icon: Globe,
    children: [
      { label: 'Startseite', href: '/startseite', icon: Home },
      { label: 'Unterseiten', href: '/seiten', icon: FileText },
      { label: 'Karriere', href: '/karriere-seite', icon: Briefcase },
      { label: 'Kontakt', href: '/kontakt', icon: MessageSquare },
      { label: 'Journal-Seite', href: '/journal-seite', icon: Newspaper },
    ],
  },
  { label: 'Bewerbungen', href: '/karriere/bewerbungen', icon: Users },
  { label: 'Nachrichten', href: '/nachrichten', icon: MessageSquare },
  { label: 'Medien', href: '/medien', icon: Image },
  { label: 'Einstellungen', href: '/einstellungen', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { website, setWebsite, isLoaded, getDisplayName } = useWebsite()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Website'])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

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
        'h-screen bg-white flex flex-col transition-all duration-300 shadow-sm',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="font-highlight text-lg font-bold text-text-color">Dashboard</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-text-color"
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors bg-gray-100',
                !isCollapsed && 'hover:bg-gray-200'
              )}
              title={isCollapsed ? getDisplayName() : undefined}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <NextImage
                  src={website === 'bs_plus' ? '/img/bsplus-icon.png' : '/img/ipower-icon.png'}
                  alt={getDisplayName()}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left text-text-color">
                    {getDisplayName()}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform text-text-color',
                      isDropdownOpen && 'rotate-180'
                    )}
                  />
                </>
              )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && !isCollapsed && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg overflow-hidden z-50 shadow-lg">
                <button
                  onClick={() => {
                    setWebsite('bs_plus')
                    setIsDropdownOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
                    website === 'bs_plus'
                      ? 'bg-gray-100 text-text-color'
                      : 'text-muted-foreground hover:bg-gray-50'
                  )}
                >
                  <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center">
                    <NextImage
                      src="/img/bsplus-icon.png"
                      alt="BS Plus"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
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
                      ? 'bg-gray-100 text-text-color'
                      : 'text-muted-foreground hover:bg-gray-50'
                  )}
                >
                  <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center">
                    <NextImage
                      src="/img/ipower-icon.png"
                      alt="iPower"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm">iPower</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Helper to check if path is active (exact match or starts with href/)
          const isPathActive = (href: string | undefined) => {
            if (!href || href === '/') return pathname === href
            return pathname === href || pathname.startsWith(href + '/')
          }

          // Item with children (expandable group)
          if (item.children) {
            const isExpanded = expandedGroups.includes(item.label)
            const hasActiveChild = item.children.some((child) => isPathActive(child.href))

            return (
              <div key={item.label}>
                <button
                  onClick={() => !isCollapsed && toggleGroup(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    hasActiveChild
                      ? 'text-primary'
                      : 'text-muted-foreground hover:bg-gray-50 hover:text-text-color'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
                {isExpanded && !isCollapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = isPathActive(child.href)

                      return (
                        <Link
                          key={child.href}
                          href={child.href || '#'}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                            isChildActive
                              ? 'bg-primary text-white'
                              : 'text-muted-foreground hover:bg-gray-50 hover:text-text-color'
                          )}
                        >
                          <child.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Regular nav item
          const isActive = isPathActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href || '#'}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-gray-50 hover:text-text-color'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
