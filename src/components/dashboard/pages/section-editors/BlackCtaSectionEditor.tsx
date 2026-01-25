'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import type { ParsedPageSection, ButtonItem } from '@/types'

interface BlackCtaSectionEditorProps {
  section: ParsedPageSection
  onSave: (updates: Partial<ParsedPageSection>) => void
  onCancel: () => void
}

export function BlackCtaSectionEditor({ section, onSave, onCancel }: BlackCtaSectionEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [content, setContent] = useState(section.content || '')
  const [backgroundImage, setBackgroundImage] = useState(section.backgroundImage || '')
  const [buttons, setButtons] = useState<ButtonItem[]>(section.buttons || [])
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  const handleAddButton = () => {
    setButtons((prev) => [
      ...prev,
      { text: 'Jetzt anfragen', link: '/kontakt', type: 'internal', btnClass: 'secondary' },
    ])
  }

  const handleRemoveButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index))
  }

  const handleButtonChange = (index: number, field: keyof ButtonItem, value: string) => {
    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, [field]: value } : btn))
    )
  }

  const handleSave = () => {
    onSave({
      title: title || null,
      content: content || null,
      backgroundImage: backgroundImage || null,
      buttons,
    })
  }

  return (
    <div className="space-y-6">
      {/* Preview hint */}
      <div className="p-3 rounded-lg bg-gray-900 text-white text-sm">
        Dieser Abschnitt wird mit dunklem Hintergrund angezeigt.
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Ihr BHKW-Projekt – professionell geplant"
          className="mt-1"
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Inhalt</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Beschreibungstext für den CTA-Bereich..."
          rows={4}
          className="mt-1"
        />
      </div>

      {/* Background Image */}
      <div>
        <Label>Hintergrundbild (optional)</Label>
        <div
          onClick={() => setMediaModalOpen(true)}
          className="mt-1 relative h-32 rounded-lg bg-gray-900 cursor-pointer group overflow-hidden"
        >
          {backgroundImage ? (
            <>
              <Image
                src={getImageUrl(backgroundImage)}
                alt="Hintergrund"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Ändern</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 group-hover:text-white/60">
              <span className="text-sm">Bild auswählen (optional)</span>
            </div>
          )}
        </div>
        {backgroundImage && (
          <button
            type="button"
            onClick={() => setBackgroundImage('')}
            className="text-xs text-red-600 hover:text-red-700 mt-1"
          >
            Bild entfernen
          </button>
        )}
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>CTA-Buttons</Label>
          <button
            type="button"
            onClick={handleAddButton}
            className="text-xs text-secondary hover:text-secondary/80 font-medium"
          >
            + Button hinzufügen
          </button>
        </div>
        {buttons.length === 0 ? (
          <p className="text-sm text-text-color/40 py-4 text-center bg-light-grey rounded-lg">
            Keine Buttons – fügen Sie mindestens einen CTA-Button hinzu
          </p>
        ) : (
          <div className="space-y-3">
            {buttons.map((button, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-light-grey rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={button.text}
                    onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                    placeholder="Button-Text"
                  />
                  <Input
                    value={button.link}
                    onChange={(e) => handleButtonChange(index, 'link', e.target.value)}
                    placeholder="/link"
                  />
                  <Select
                    value={button.type || 'internal'}
                    onValueChange={(v) => handleButtonChange(index, 'type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Intern</SelectItem>
                      <SelectItem value="external">Extern</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={button.btnClass || 'secondary'}
                    onValueChange={(v) => handleButtonChange(index, 'btnClass', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primär</SelectItem>
                      <SelectItem value="secondary">Sekundär (empfohlen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveButton(index)}
                  className="p-2 text-text-color/40 hover:text-red-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
        >
          Abbrechen
        </Button>
        <Button type="button" variant="secondary" onClick={handleSave}>
          Speichern
        </Button>
      </div>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setBackgroundImage(selectedMedia.url)
        }}
        title="Hintergrundbild auswählen"
      />
    </div>
  )
}
