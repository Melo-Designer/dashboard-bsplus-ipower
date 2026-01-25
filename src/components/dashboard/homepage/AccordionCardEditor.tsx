'use client'

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
import type { AccordionCard } from '@/types'

interface AccordionCardEditorProps {
  card: AccordionCard
  index: number
  expanded: boolean
  onToggle: () => void
  onChange: (card: AccordionCard) => void
  onRemove: () => void
}

export function AccordionCardEditor({
  card,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: AccordionCardEditorProps) {
  return (
    <div className="bg-light-grey rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-text-color/5"
        onClick={onToggle}
      >
        <span className="text-sm font-medium text-text-color/50 w-6">#{index + 1}</span>
        <span className="flex-1 font-medium truncate">
          {card.title || 'Ohne Titel'}
        </span>
        <svg
          className={`h-4 w-4 text-text-color/40 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="p-1 text-text-color/40 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="p-3 pt-0 space-y-3">
          <div>
            <Label>Titel *</Label>
            <Input
              value={card.title}
              onChange={(e) => onChange({ ...card, title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Inhalt</Label>
            <Textarea
              value={card.content}
              onChange={(e) => onChange({ ...card, content: e.target.value })}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Link URL</Label>
              <Input
                value={card.linkUrl || ''}
                onChange={(e) => onChange({ ...card, linkUrl: e.target.value })}
                placeholder="/seite"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Link Text</Label>
              <Input
                value={card.linkText || ''}
                onChange={(e) => onChange({ ...card, linkText: e.target.value })}
                placeholder="Mehr erfahren"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Button-Farbe</Label>
            <Select
              value={card.btnClass || 'primary'}
              onValueChange={(value) => onChange({ ...card, btnClass: value as 'primary' | 'secondary' })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primär</SelectItem>
                <SelectItem value="secondary">Sekundär</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
