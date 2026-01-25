'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import type { Page } from '@/generated/prisma'

interface PageWithCount extends Page {
  _count: {
    sections: number
  }
}

export default function SeitenPage() {
  const { website, isLoaded, getDisplayName } = useWebsite()
  const [pages, setPages] = useState<PageWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPages = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/pages?website=${website}`)
      const data = await res.json()
      setPages(data.pages || [])
    } catch {
      toast.error('Fehler beim Laden der Seiten')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

  const handleToggleActive = async (page: PageWithCount) => {
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !page.active }),
      })
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, active: !p.active } : p))
      )
      toast.success(page.active ? 'Seite deaktiviert' : 'Seite aktiviert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/pages/${deleteId}`, { method: 'DELETE' })
      setPages((prev) => prev.filter((p) => p.id !== deleteId))
      toast.success('Seite gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Seiten</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Verwalten Sie die Seiten für {getDisplayName()}
          </p>
        </div>
        <Button type="internal" link="/seiten/neu" variant="secondary">
          Neue Seite
        </Button>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-light-grey">
          <p className="text-text-color/60 mb-4">Keine Seiten vorhanden.</p>
          <Button type="internal" link="/seiten/neu" variant="secondary">
            Erste Seite erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-light-grey"
            >
              {/* Page Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-color truncate">
                    {page.title}
                  </h3>
                  {!page.active && (
                    <Badge variant="secondary">Inaktiv</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-text-color/60">
                  <span>/{page.slug}</span>
                  <span>|</span>
                  <span>{page._count.sections} Abschnitte</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-color/50">Aktiv</span>
                  <Switch
                    checked={page.active}
                    onCheckedChange={() => handleToggleActive(page)}
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
                  onClick={() => setDeleteId(page.id)}
                  className="p-2 text-text-color/40 hover:text-red-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seite löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Seite wirklich löschen? Alle Abschnitte werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
