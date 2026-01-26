'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { LEGAL_PAGE_TYPES } from '@/lib/constants/page-headers'

interface LegalPage {
  id?: string
  type: string
  title: string
  content: string
  lastUpdated: string | null
}

export function LegalPagesManagement() {
  const { website, isLoaded } = useWebsite()
  const [pages, setPages] = useState<LegalPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
  })

  useEffect(() => {
    const fetchPages = async () => {
      if (!isLoaded) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/legal?website=${website}`)
        const data = await res.json()
        setPages(data.pages || [])
      } catch {
        toast.error('Fehler beim Laden der Seiten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages()
  }, [website, isLoaded])

  const handleEdit = (type: string) => {
    const existing = pages.find((p) => p.type === type)
    const pageConfig = LEGAL_PAGE_TYPES.find((p) => p.type === type)

    if (existing) {
      setFormData({
        type,
        title: existing.title,
        content: existing.content,
      })
    } else {
      setFormData({
        type,
        title: pageConfig?.defaultTitle || '',
        content: '',
      })
    }
    setEditingType(type)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Titel ist erforderlich')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Inhalt ist erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/legal/${formData.type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          title: formData.title,
          content: formData.content,
        }),
      })

      if (!res.ok) throw new Error()

      const updated = await res.json()
      setPages((prev) => {
        const exists = prev.find((p) => p.type === formData.type)
        if (exists) {
          return prev.map((p) => (p.type === formData.type ? updated : p))
        }
        return [...prev, updated]
      })

      toast.success('Seite gespeichert')
      setEditingType(null)
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-color/60">
        Bearbeiten Sie die rechtlichen Seiten Ihrer Website.
      </p>

      {LEGAL_PAGE_TYPES.map((pageType) => {
        const page = pages.find((p) => p.type === pageType.type)
        return (
          <div
            key={pageType.type}
            className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm"
          >
            <div>
              <h3 className="font-medium text-text-color">{pageType.label}</h3>
              {page?.lastUpdated && (
                <p className="text-sm text-text-color/60">
                  Zuletzt aktualisiert: {format(new Date(page.lastUpdated), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              )}
              {!page && (
                <p className="text-sm text-text-color/40">Noch nicht erstellt</p>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleEdit(pageType.type)}
              className="text-sm"
            >
              {page ? 'Bearbeiten' : 'Erstellen'}
            </Button>
          </div>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {LEGAL_PAGE_TYPES.find((p) => p.type === editingType)?.label} bearbeiten
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="legal-title">Seitentitel *</Label>
              <Input
                id="legal-title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Seitentitel"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Inhalt *</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  placeholder="Geben Sie den Inhalt der Seite ein..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingType(null)}
                className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
