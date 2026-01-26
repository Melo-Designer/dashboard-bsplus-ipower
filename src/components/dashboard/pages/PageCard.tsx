'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import type { Page } from '@/generated/prisma'

interface PageWithCount extends Page {
  _count: {
    sections: number
  }
}

interface PageCardProps {
  page: PageWithCount
  onToggleActive: (page: PageWithCount) => void
  onDelete: (id: string) => void
}

export function PageCard({ page, onToggleActive, onDelete }: PageCardProps) {
  return (
    <div className="group relative rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-40 bg-light-grey">
        {page.heroImage ? (
          <Image
            src={page.heroImage}
            alt={page.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-text-color/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        {!page.active && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary">Inaktiv</Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link
            href={`/seiten/${page.id}`}
            className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-text-color hover:bg-light-grey transition-colors"
          >
            Bearbeiten
          </Link>
          <Link
            href={`/seiten/${page.id}/abschnitte`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium text-white hover:bg-secondary/90 transition-colors"
          >
            Abschnitte
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-color truncate">
              {page.title}
            </h3>
            <p className="text-sm text-text-color/50 truncate">/{page.slug}</p>
          </div>
          <button
            onClick={() => onDelete(page.id)}
            className="p-1.5 text-text-color/30 hover:text-red-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-light-grey">
          <span className="text-xs text-text-color/50">
            {page._count.sections} Abschnitte
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-color/50">Aktiv</span>
            <Switch
              checked={page.active}
              onCheckedChange={() => onToggleActive(page)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
