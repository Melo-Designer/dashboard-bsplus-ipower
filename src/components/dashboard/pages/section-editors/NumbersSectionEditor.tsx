'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import type { ParsedPageSection, StatItem } from '@/types'

interface NumbersSectionEditorProps {
  section: ParsedPageSection
  onSave: (updates: Partial<ParsedPageSection>) => void
  onCancel: () => void
}

export function NumbersSectionEditor({ section, onSave, onCancel }: NumbersSectionEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [stats, setStats] = useState<StatItem[]>(
    section.stats.length > 0
      ? section.stats
      : [
          { number: '', title: '' },
          { number: '', title: '' },
          { number: '', title: '' },
          { number: '', title: '' },
        ]
  )
  const [backgroundColor, setBackgroundColor] = useState(section.backgroundColor || 'light')
  const [textColor, setTextColor] = useState(section.textColor || 'dark')

  const handleStatChange = (index: number, field: keyof StatItem, value: string) => {
    setStats((prev) =>
      prev.map((stat, i) => (i === index ? { ...stat, [field]: value } : stat))
    )
  }

  const handleAddStat = () => {
    if (stats.length < 6) {
      setStats((prev) => [...prev, { number: '', title: '' }])
    }
  }

  const handleRemoveStat = (index: number) => {
    if (stats.length > 1) {
      setStats((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    onSave({
      title: title || null,
      stats: stats.filter((s) => s.number || s.title),
      backgroundColor,
      textColor,
    })
  }

  return (
    <div className="space-y-6">
      {/* Preview hint */}
      <div className="p-3 rounded-lg bg-secondary/10 text-secondary text-sm">
        Zeigt Kennzahlen/Statistiken in einer Reihe an (z.B. "30+ Jahre Erfahrung").
      </div>

      {/* Section Title (optional) */}
      <div>
        <Label htmlFor="title">Abschnitt-Titel (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optionaler Titel über den Zahlen"
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

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Kennzahlen</Label>
          {stats.length < 6 && (
            <button
              type="button"
              onClick={handleAddStat}
              className="text-xs text-secondary hover:text-secondary/80 font-medium"
            >
              + Kennzahl hinzufügen
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 rounded-lg bg-light-grey space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-color/50">
                  Kennzahl {index + 1}
                </span>
                {stats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(index)}
                    className="p-1 text-text-color/40 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div>
                <Label htmlFor={`stat-${index}-number`} className="text-xs">
                  Zahl/Wert
                </Label>
                <Input
                  id={`stat-${index}-number`}
                  value={stat.number}
                  onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                  placeholder="z.B. 30+"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`stat-${index}-title`} className="text-xs">
                  Beschreibung
                </Label>
                <Input
                  id={`stat-${index}-title`}
                  value={stat.title}
                  onChange={(e) => handleStatChange(index, 'title', e.target.value)}
                  placeholder="z.B. Jahre Erfahrung"
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
