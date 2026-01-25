'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { SectionEditor } from './SectionEditor'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ParsedHomepageSection } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'

export function SectionManagement() {
  const { website, isLoaded } = useWebsite()
  const [sections, setSections] = useState<ParsedHomepageSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ParsedHomepageSection | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchSections = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/homepage/sections?website=${website}`)
      const data = await res.json()
      setSections(data.sections || [])
    } catch {
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    const newSections = arrayMove(sections, oldIndex, newIndex)
    setSections(newSections)

    try {
      await fetch('/api/homepage/sections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds: newSections.map((s) => s.id) }),
      })
    } catch {
      toast.error('Fehler beim Sortieren')
      fetchSections()
    }
  }

  const handleToggleActive = async (section: ParsedHomepageSection) => {
    try {
      await fetch(`/api/homepage/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !section.active }),
      })
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, active: !s.active } : s))
      )
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Abschnitt wirklich löschen?')) return

    try {
      await fetch(`/api/homepage/sections/${id}`, { method: 'DELETE' })
      setSections((prev) => prev.filter((s) => s.id !== id))
      toast.success('Abschnitt gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <p className="text-sm text-text-color/60">
          Ziehen Sie Abschnitte um die Reihenfolge zu ändern
        </p>
        <Button variant="secondary" onClick={() => setIsCreating(true)}>
          Neuer Abschnitt
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-light-grey">
          <p className="text-text-color/60">Keine Abschnitte vorhanden.</p>
          <Button variant="secondary" onClick={() => setIsCreating(true)} className="mt-4">
            Ersten Abschnitt erstellen
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  expanded={expandedId === section.id}
                  onToggleExpand={() => setExpandedId(
                    expandedId === section.id ? null : section.id
                  )}
                  onEdit={() => setEditingSection(section)}
                  onDelete={() => handleDelete(section.id)}
                  onToggleActive={() => handleToggleActive(section)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {(isCreating || editingSection) && (
        <SectionEditor
          section={editingSection}
          website={website}
          onClose={() => {
            setIsCreating(false)
            setEditingSection(null)
          }}
          onSave={() => {
            setIsCreating(false)
            setEditingSection(null)
            fetchSections()
          }}
        />
      )}
    </div>
  )
}

function SortableSectionItem({
  section,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  section: ParsedHomepageSection
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getBackgroundPreview = () => {
    if (section.backgroundImage) return 'bg-gray-300'
    switch (section.backgroundColor) {
      case 'primary': return 'bg-primary'
      case 'secondary': return 'bg-secondary'
      case 'dark': return 'bg-gray-800'
      default: return 'bg-light-grey'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl bg-light-grey overflow-hidden ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-text-color/40 hover:text-text-color/60"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className={`h-10 w-10 rounded-lg shrink-0 ${getBackgroundPreview()}`} />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-secondary truncate">{section.title}</p>
          <p className="text-sm text-text-color/60">
            {section.cards.length} Karten • {section.identifier}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Switch checked={section.active} onCheckedChange={onToggleActive} />

          <button onClick={onToggleExpand} className="p-2 text-text-color/40 hover:text-text-color/60">
            <svg className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button onClick={onEdit} className="p-2 text-text-color/40 hover:text-text-color/60">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <button onClick={onDelete} className="p-2 text-text-color/40 hover:text-red-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && section.cards.length > 0 && (
        <div className="border-t border-text-color/10 bg-white/50 p-4">
          <p className="text-xs font-medium text-text-color/50 mb-2">Accordion-Karten:</p>
          <div className="space-y-2">
            {section.cards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg p-3 text-sm">
                <p className="font-medium">{card.title}</p>
                {card.linkUrl && (
                  <p className="text-text-color/50 text-xs mt-1">→ {card.linkUrl}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
