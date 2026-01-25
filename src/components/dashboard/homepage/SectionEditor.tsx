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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { AccordionCardEditor } from './AccordionCardEditor'
import { toast } from 'sonner'
import Image from 'next/image'
import type { ParsedHomepageSection, AccordionCard } from '@/types'

interface SectionEditorProps {
  section: ParsedHomepageSection | null
  website: string
  onClose: () => void
  onSave: () => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SectionEditor({ section, website, onClose, onSave }: SectionEditorProps) {
  const [formData, setFormData] = useState({
    identifier: section?.identifier || '',
    title: section?.title || '',
    subtitle: section?.subtitle || '',
    description: section?.description || '',
    backgroundImage: section?.backgroundImage || '',
    backgroundColor: section?.backgroundColor || 'light',
    textColor: section?.textColor || 'dark',
    cards: section?.cards || [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null)

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      identifier: section ? prev.identifier : slugify(title),
    }))
  }

  const handleAddCard = () => {
    setFormData((prev) => ({
      ...prev,
      cards: [...prev.cards, { title: '', content: '', linkUrl: '', linkText: '', btnClass: 'primary' as const }],
    }))
    setEditingCardIndex(formData.cards.length)
  }

  const handleUpdateCard = (index: number, card: AccordionCard) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((c, i) => (i === index ? card : c)),
    }))
  }

  const handleRemoveCard = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }))
    if (editingCardIndex === index) {
      setEditingCardIndex(null)
    } else if (editingCardIndex !== null && editingCardIndex > index) {
      setEditingCardIndex(editingCardIndex - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.identifier) {
      toast.error('Titel und Identifier erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const url = section ? `/api/homepage/sections/${section.id}` : '/api/homepage/sections'
      const method = section ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler')
      }

      toast.success(section ? 'Abschnitt aktualisiert' : 'Abschnitt erstellt')
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {section ? 'Abschnitt bearbeiten' : 'Neuer Abschnitt'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="identifier">Identifier *</Label>
                <Input
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) => setFormData((prev) => ({ ...prev, identifier: e.target.value }))}
                  disabled={!!section}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subtitle">Untertitel</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1.5"
              />
            </div>

            {/* Styling */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Hintergrundfarbe</Label>
                <Select
                  value={formData.backgroundColor || 'light'}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, backgroundColor: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hell (Grau)</SelectItem>
                    <SelectItem value="primary">Primär (Markenfarbe)</SelectItem>
                    <SelectItem value="secondary">Sekundär</SelectItem>
                    <SelectItem value="dark">Dunkel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Textfarbe</Label>
                <Select
                  value={formData.textColor || 'dark'}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, textColor: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dunkel</SelectItem>
                    <SelectItem value="light">Hell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Background Image */}
            <div>
              <Label>Hintergrundbild (optional)</Label>
              <div
                onClick={() => setMediaOpen(true)}
                className="mt-1.5 cursor-pointer rounded-xl border-2 border-dashed border-text-color/30 p-4 hover:border-primary transition-colors"
              >
                {formData.backgroundImage ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image src={formData.backgroundImage} alt="Background" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData((prev) => ({ ...prev, backgroundImage: '' }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 text-text-color/40">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">Klicken um Bild auszuwählen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Accordion Cards */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Accordion-Karten</Label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddCard}
                  className="text-sm px-3 py-1.5 h-auto"
                >
                  + Karte hinzufügen
                </Button>
              </div>

              {formData.cards.length === 0 ? (
                <p className="text-sm text-text-color/50 py-4 text-center bg-light-grey rounded-lg">
                  Keine Karten. Klicken Sie auf &quot;Karte hinzufügen&quot; um zu beginnen.
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.cards.map((card, index) => (
                    <AccordionCardEditor
                      key={index}
                      card={card}
                      index={index}
                      expanded={editingCardIndex === index}
                      onToggle={() => setEditingCardIndex(editingCardIndex === index ? null : index)}
                      onChange={(updated) => handleUpdateCard(index, updated)}
                      onRemove={() => handleRemoveCard(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                className="bg-transparent text-text-color hover:bg-light-grey"
              >
                Abbrechen
              </Button>
              <Button buttonType="submit" variant="secondary" disabled={isSaving}>
                {isSaving ? 'Speichern...' : section ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <MediaSelectorModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, backgroundImage: selectedMedia.url }))
        }}
        title="Hintergrundbild auswählen"
      />
    </>
  )
}
