'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { toast } from 'sonner'
import Image from 'next/image'
import type { Slide } from '@/types'

interface SlideEditorProps {
  slide: Slide | null
  website: string
  onClose: () => void
  onSave: () => void
}

export function SlideEditor({ slide, website, onClose, onSave }: SlideEditorProps) {
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    imageUrl: slide?.imageUrl || '',
    linkUrl: slide?.linkUrl || '',
    linkText: slide?.linkText || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.imageUrl) {
      toast.error('Bitte wählen Sie ein Bild aus')
      return
    }

    setIsSaving(true)
    try {
      const url = slide ? `/api/slides/${slide.id}` : '/api/slides'
      const method = slide ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          website,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler')
      }

      toast.success(slide ? 'Slide aktualisiert' : 'Slide erstellt')
      onSave()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {slide ? 'Slide bearbeiten' : 'Neuer Slide'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image */}
            <div>
              <Label>Bild *</Label>
              <div
                onClick={() => setMediaOpen(true)}
                className="mt-1.5 cursor-pointer rounded-xl bg-gray-100 p-4 hover:bg-gray-200 transition-colors"
              >
                {formData.imageUrl ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-text-color/40">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">Klicken um Bild auszuwählen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label htmlFor="subtitle">Untertitel</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Optional"
                rows={2}
                className="mt-1.5"
              />
            </div>

            {/* Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))
                  }
                  placeholder="/kontakt"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={formData.linkText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, linkText: e.target.value }))
                  }
                  placeholder="Mehr erfahren"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={onClose}
                className="bg-transparent text-text-color hover:bg-light-grey hover:opacity-100"
              >
                Abbrechen
              </Button>
              <Button buttonType="submit" variant="secondary" disabled={isSaving}>
                {isSaving ? 'Wird gespeichert...' : slide ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <MediaSelectorModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media) => {
          const item = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, imageUrl: item.url }))
        }}
        title="Slide-Bild auswählen"
        selectButtonLabel="Bild auswählen"
      />
    </>
  )
}
