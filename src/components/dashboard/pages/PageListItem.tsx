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

interface PageListItemProps {
  page: PageWithCount
  onToggleActive: (page: PageWithCount) => void
  onDelete: (id: string) => void
}

export function PageListItem({ page, onToggleActive, onDelete }: PageListItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-16 w-24 rounded-lg bg-light-grey overflow-hidden flex-shrink-0">
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
              className="h-6 w-6 text-text-color/20"
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
      </div>

      {/* Page Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-text-color truncate">{page.title}</h3>
          {!page.active && <Badge variant="secondary">Inaktiv</Badge>}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-text-color/50">
          <span>/{page.slug}</span>
          <span className="text-text-color/30">|</span>
          <span>{page._count.sections} Abschnitte</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-color/50">Aktiv</span>
          <Switch
            checked={page.active}
            onCheckedChange={() => onToggleActive(page)}
          />
        </div>
        <Link
          href={`/seiten/${page.id}/abschnitte`}
          className="px-3 py-1.5 text-sm font-medium text-secondary hover:text-secondary/80"
        >
          Abschnitte
        </Link>
        <Link
          href={`/seiten/${page.id}`}
          className="px-3 py-1.5 text-sm font-medium text-secondary hover:text-secondary/80"
        >
          Bearbeiten
        </Link>
        <button
          onClick={() => onDelete(page.id)}
          className="p-2 text-text-color/30 hover:text-red-600 transition-colors"
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
    </div>
  )
}
