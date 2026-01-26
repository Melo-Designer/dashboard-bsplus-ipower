'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import { PAGE_HEADERS, TEXT_COLOR_OPTIONS } from '@/lib/constants/page-headers'

interface PageHeader {
  id?: string
  pageSlug: string
  title: string
  subtitle: string | null
  description: string | null
  backgroundImage: string | null
  overlayColor: string | null
  textColor: string | null
}

export function HeadersManagement() {
  const { website, isLoaded } = useWebsite()
  const [headers, setHeaders] = useState<PageHeader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  const [formData, setFormData] = useState<PageHeader>({
    pageSlug: '',
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    overlayColor: '',
    textColor: 'light',
  })

  useEffect(() => {
    const fetchHeaders = async () => {
      if (!isLoaded) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/headers?website=${website}`)
        const data = await res.json()
        setHeaders(data.headers || [])
      } catch {
        toast.error('Fehler beim Laden der Seitenköpfe')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeaders()
  }, [website, isLoaded])

  const handleEdit = (slug: string) => {
    const existing = headers.find((h) => h.pageSlug === slug)
    const pageConfig = PAGE_HEADERS.find((p) => p.slug === slug)

    if (existing) {
      setFormData({
        pageSlug: slug,
        title: existing.title,
        subtitle: existing.subtitle || '',
        description: existing.description || '',
        backgroundImage: existing.backgroundImage || '',
        overlayColor: existing.overlayColor || '',
        textColor: existing.textColor || 'light',
      })
    } else {
      setFormData({
        pageSlug: slug,
        title: pageConfig?.defaultTitle || '',
        subtitle: pageConfig?.defaultSubtitle || '',
        description: '',
        backgroundImage: '',
        overlayColor: '',
        textColor: 'light',
      })
    }
    setEditingSlug(slug)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Titel ist erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/headers/${formData.pageSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          title: formData.title,
          subtitle: formData.subtitle || null,
          description: formData.description || null,
          backgroundImage: formData.backgroundImage || null,
          overlayColor: formData.overlayColor || null,
          textColor: formData.textColor || null,
        }),
      })

      if (!res.ok) throw new Error()

      const updated = await res.json()
      setHeaders((prev) => {
        const exists = prev.find((h) => h.pageSlug === formData.pageSlug)
        if (exists) {
          return prev.map((h) => (h.pageSlug === formData.pageSlug ? updated : h))
        }
        return [...prev, updated]
      })

      toast.success('Seitenkopf gespeichert')
      setEditingSlug(null)
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-color/60">
        Passen Sie die Kopfbereiche der verschiedenen Unterseiten an.
      </p>

      {PAGE_HEADERS.map((page) => {
        const header = headers.find((h) => h.pageSlug === page.slug)
        return (
          <div
            key={page.slug}
            className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm"
          >
            <div>
              <h3 className="font-medium text-text-color">{page.label}</h3>
              <p className="text-sm text-text-color/60">
                {header?.title || page.defaultTitle}
                {header?.subtitle && ` - ${header.subtitle}`}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleEdit(page.slug)}
              className="text-sm"
            >
              Bearbeiten
            </Button>
          </div>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingSlug} onOpenChange={(open) => !open && setEditingSlug(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Seitenkopf bearbeiten: {PAGE_HEADERS.find((p) => p.slug === editingSlug)?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="header-title">Titel *</Label>
              <Input
                id="header-title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Seitentitel"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="header-subtitle">Untertitel</Label>
              <Input
                id="header-subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Untertitel"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="header-description">Beschreibung</Label>
              <Textarea
                id="header-description"
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Hintergrundbild</Label>
              <div
                onClick={() => setMediaModalOpen(true)}
                className="relative mt-1 h-32 rounded-lg bg-light-grey cursor-pointer group overflow-hidden"
              >
                {formData.backgroundImage ? (
                  <>
                    <Image
                      src={getImageUrl(formData.backgroundImage)}
                      alt="Hintergrund"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Ändern</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-color/40 group-hover:text-text-color/60">
                    <span className="text-sm">Bild auswählen</span>
                  </div>
                )}
              </div>
              {formData.backgroundImage && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, backgroundImage: '' }))}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Bild entfernen
                </button>
              )}
            </div>

            <div>
              <Label>Textfarbe</Label>
              <Select
                value={formData.textColor || 'light'}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, textColor: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_COLOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingSlug(null)}
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

      {/* Media Selector */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, backgroundImage: selectedMedia.url }))
        }}
        title="Hintergrundbild auswählen"
      />
    </div>
  )
}
