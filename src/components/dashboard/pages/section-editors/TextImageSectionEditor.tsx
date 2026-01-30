'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'
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

interface TextImageSectionEditorProps {
  section: ParsedPageSection
  onSave: (updates: Partial<ParsedPageSection>) => void
  onCancel: () => void
}

export function TextImageSectionEditor({ section, onSave, onCancel }: TextImageSectionEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [content, setContent] = useState(section.content || '')
  const [imageUrl, setImageUrl] = useState(section.imageUrl || '')
  const [imageAlt, setImageAlt] = useState(section.imageAlt || '')
  const [imageAlign, setImageAlign] = useState<'left' | 'right'>(
    (section.imageAlign as 'left' | 'right') || 'left'
  )
  const [buttons, setButtons] = useState<ButtonItem[]>(section.buttons || [])
  const [backgroundColor, setBackgroundColor] = useState(section.backgroundColor || 'light')
  const [textColor, setTextColor] = useState(section.textColor || 'dark')
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  const handleAddButton = () => {
    setButtons((prev) => [
      ...prev,
      { text: 'Mehr erfahren', link: '/kontakt', type: 'internal', btnClass: 'primary' },
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
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      imageAlign,
      buttons,
      backgroundColor,
      textColor,
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Machbarkeit & Auslegung"
          className="mt-1"
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Inhalt</Label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Beschreibungstext eingeben..."
          className="mt-1"
        />
      </div>

      {/* Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Bild</Label>
          <div
            onClick={() => setMediaModalOpen(true)}
            className="mt-1 relative h-40 rounded-lg bg-light-grey cursor-pointer group overflow-hidden"
          >
            {imageUrl ? (
              <>
                <Image
                  src={getImageUrl(imageUrl)}
                  alt={imageAlt || 'Bild'}
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
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="imageAlt">Bild Alt-Text</Label>
            <Input
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Beschreibung des Bildes"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Bild-Ausrichtung</Label>
            <Select value={imageAlign} onValueChange={(v) => setImageAlign(v as 'left' | 'right')}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Bild links</SelectItem>
                <SelectItem value="right">Bild rechts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Styling */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Hintergrund</Label>
          <Select value={backgroundColor} onValueChange={setBackgroundColor}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Hell (Weiß)</SelectItem>
              <SelectItem value="dark">Dunkel (Schwarz)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Textfarbe</Label>
          <Select value={textColor} onValueChange={setTextColor}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dunkel</SelectItem>
              <SelectItem value="light">Hell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Buttons (optional)</Label>
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
            Keine Buttons
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
                    value={button.btnClass || 'primary'}
                    onValueChange={(v) => handleButtonChange(index, 'btnClass', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primär</SelectItem>
                      <SelectItem value="secondary">Sekundär</SelectItem>
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
          setImageUrl(selectedMedia.url)
        }}
        title="Bild auswählen"
      />
    </div>
  )
}
