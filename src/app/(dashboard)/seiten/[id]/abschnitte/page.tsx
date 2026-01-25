'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Skeleton } from '@/components/ui/Skeleton'
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
import { getSectionTypeName, getAvailableSectionTypes } from '@/lib/constants/section-types'
import type { ParsedPage, ParsedPageSection } from '@/types'
import { TripleSectionEditor } from '@/components/dashboard/pages/section-editors/TripleSectionEditor'
import { TextImageSectionEditor } from '@/components/dashboard/pages/section-editors/TextImageSectionEditor'
import { BlackCtaSectionEditor } from '@/components/dashboard/pages/section-editors/BlackCtaSectionEditor'
import { NumbersSectionEditor } from '@/components/dashboard/pages/section-editors/NumbersSectionEditor'

export default function AbschnittePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pageId } = use(params)
  const router = useRouter()
  const [page, setPage] = useState<ParsedPage | null>(null)
  const [sections, setSections] = useState<ParsedPageSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<ParsedPageSection | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`)
      if (!res.ok) throw new Error('Seite nicht gefunden')
      const data = await res.json()
      setPage(data)
      setSections(data.sections || [])
    } catch {
      toast.error('Fehler beim Laden')
      router.push('/seiten')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    const newSections = arrayMove(sections, oldIndex, newIndex)
    setSections(newSections)

    try {
      await fetch(`/api/pages/${pageId}/sections/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds: newSections.map((s) => s.id) }),
      })
    } catch {
      toast.error('Fehler beim Sortieren')
      fetchPage()
    }
  }

  const handleAddSection = async (type: string) => {
    setAddSectionOpen(false)
    try {
      const res = await fetch(`/api/pages/${pageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: 'Neuer Abschnitt',
        }),
      })
      if (!res.ok) throw new Error()
      const section = await res.json()
      setSections((prev) => [...prev, section])
      setEditingSection(section)
      toast.success('Abschnitt erstellt')
    } catch {
      toast.error('Fehler beim Erstellen')
    }
  }

  const handleToggleActive = async (section: ParsedPageSection) => {
    try {
      await fetch(`/api/pages/${pageId}/sections/${section.id}`, {
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

  const handleUpdateSection = async (id: string, updates: Partial<ParsedPageSection>) => {
    try {
      const res = await fetch(`/api/pages/${pageId}/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setSections((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      )
      toast.success('Abschnitt gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDeleteSection = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/pages/${pageId}/sections/${deleteId}`, { method: 'DELETE' })
      setSections((prev) => prev.filter((s) => s.id !== deleteId))
      toast.success('Abschnitt gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/seiten"
            className="p-2 rounded-lg hover:bg-light-grey text-text-color/60 hover:text-text-color"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-color">Abschnitte</h1>
            <p className="text-sm text-text-color/60 mt-1">
              {page.title} · /{page.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/seiten/${pageId}`}
            className="text-sm font-medium text-secondary hover:text-secondary/80"
          >
            Seite bearbeiten
          </Link>
          <Button variant="secondary" onClick={() => setAddSectionOpen(true)}>
            Abschnitt hinzufügen
          </Button>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-text-color/60">
        Ziehen Sie Abschnitte um die Reihenfolge zu ändern. Klicken Sie auf einen Abschnitt zum Bearbeiten.
      </p>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-light-grey">
          <p className="text-text-color/60 mb-4">Keine Abschnitte vorhanden.</p>
          <Button variant="secondary" onClick={() => setAddSectionOpen(true)}>
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
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  onEdit={() => setEditingSection(section)}
                  onToggleActive={() => handleToggleActive(section)}
                  onDelete={() => setDeleteId(section.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Abschnitt hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {getAvailableSectionTypes().map((type) => (
              <button
                key={type.value}
                onClick={() => handleAddSection(type.value)}
                className="w-full text-left p-4 rounded-lg hover:bg-light-grey transition-colors"
              >
                <span className="font-medium text-text-color">{type.label}</span>
                <p className="text-sm text-text-color/60 mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Editor Dialog */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection && getSectionTypeName(editingSection.type)} bearbeiten
            </DialogTitle>
          </DialogHeader>
          {editingSection && (
            <SectionEditor
              section={editingSection}
              onSave={(updates) => {
                handleUpdateSection(editingSection.id, updates)
                setEditingSection(null)
              }}
              onCancel={() => setEditingSection(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abschnitt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Abschnitt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SortableSectionCard({
  section,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  section: ParsedPageSection
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-xl bg-light-grey ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-color/40 hover:text-text-color/60"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Section Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {getSectionTypeName(section.type)}
          </Badge>
          {!section.active && (
            <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
          )}
        </div>
        <h3 className="font-medium text-text-color mt-1 truncate">
          {section.title || 'Ohne Titel'}
        </h3>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-color/50">Aktiv</span>
          <Switch checked={section.active} onCheckedChange={onToggleActive} />
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-text-color/40 hover:text-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-text-color/40 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function SectionEditor({
  section,
  onSave,
  onCancel,
}: {
  section: ParsedPageSection
  onSave: (updates: Partial<ParsedPageSection>) => void
  onCancel: () => void
}) {
  switch (section.type) {
    case 'triple':
      return <TripleSectionEditor section={section} onSave={onSave} onCancel={onCancel} />
    case 'text_image':
      return <TextImageSectionEditor section={section} onSave={onSave} onCancel={onCancel} />
    case 'black_cta':
      return <BlackCtaSectionEditor section={section} onSave={onSave} onCancel={onCancel} />
    case 'numbers':
      return <NumbersSectionEditor section={section} onSave={onSave} onCancel={onCancel} />
    default:
      return (
        <div className="text-center py-8">
          <p className="text-text-color/60">Editor für diesen Typ nicht verfügbar.</p>
          <Button variant="secondary" onClick={onCancel} className="mt-4">
            Schließen
          </Button>
        </div>
      )
  }
}
