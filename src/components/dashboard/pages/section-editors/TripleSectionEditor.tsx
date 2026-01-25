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
import type { ParsedPageSection, TripleItem } from '@/types'

interface TripleSectionEditorProps {
  section: ParsedPageSection
  onSave: (updates: Partial<ParsedPageSection>) => void
  onCancel: () => void
}

export function TripleSectionEditor({ section, onSave, onCancel }: TripleSectionEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [items, setItems] = useState<TripleItem[]>(
    section.items.length === 3
      ? section.items
      : [
          { title: '', content: '' },
          { title: '', content: '' },
          { title: '', content: '' },
        ]
  )
  const [backgroundColor, setBackgroundColor] = useState(section.backgroundColor || 'light')
  const [textColor, setTextColor] = useState(section.textColor || 'dark')

  const handleItemChange = (index: number, field: 'title' | 'content', value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSave = () => {
    onSave({
      title: title || null,
      items,
      backgroundColor,
      textColor,
    })
  }

  return (
    <div className="space-y-6">
      {/* Section Title (optional) */}
      <div>
        <Label htmlFor="title">Abschnitt-Titel (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optionaler Titel über den drei Spalten"
          className="mt-1"
        />
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

      {/* Three Columns */}
      <div className="space-y-4">
        <Label>Drei Spalten</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-light-grey space-y-3">
              <span className="text-xs font-medium text-text-color/50">Spalte {index + 1}</span>
              <div>
                <Label htmlFor={`item-${index}-title`} className="text-xs">Titel</Label>
                <Input
                  id={`item-${index}-title`}
                  value={item.title}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  placeholder="Spaltentitel"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`item-${index}-content`} className="text-xs">Inhalt</Label>
                <Textarea
                  id={`item-${index}-content`}
                  value={item.content}
                  onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                  placeholder="Spalteninhalt..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
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
    </div>
  )
}
