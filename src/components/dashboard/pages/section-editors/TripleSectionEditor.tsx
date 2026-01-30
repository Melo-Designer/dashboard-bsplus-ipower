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
import type { ParsedPageSection, TripleItem } from '@/types'

interface TripleSectionEditorProps {
  section: ParsedPageSection
  onSave: (updates: Partial<ParsedPageSection>) => void
  onCancel: () => void
}

export function TripleSectionEditor({ section, onSave, onCancel }: TripleSectionEditorProps) {
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
      items,
      backgroundColor,
      textColor,
    })
  }

  return (
    <div className="space-y-6">
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
                <RichTextEditor
                  content={item.content}
                  onChange={(value) => handleItemChange(index, 'content', value)}
                  placeholder="Spalteninhalt eingeben..."
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
