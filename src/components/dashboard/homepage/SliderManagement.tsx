'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
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
import { toast } from 'sonner'
import Image from 'next/image'
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
import type { Slide } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { getImageUrl } from '@/lib/utils'

export function SliderManagement() {
  const { website, isLoaded } = useWebsite()
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchSlides = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/slides?website=${website}`)
      const data = await res.json()
      setSlides(data.slides || [])
    } catch {
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = slides.findIndex((s) => s.id === active.id)
    const newIndex = slides.findIndex((s) => s.id === over.id)

    const newSlides = arrayMove(slides, oldIndex, newIndex)
    setSlides(newSlides)

    try {
      await fetch('/api/slides/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIds: newSlides.map((s) => s.id) }),
      })
    } catch {
      toast.error('Fehler beim Sortieren')
      fetchSlides()
    }
  }

  const handleToggleActive = async (slide: Slide) => {
    try {
      await fetch(`/api/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !slide.active }),
      })
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, active: !s.active } : s))
      )
      toast.success(slide.active ? 'Slide deaktiviert' : 'Slide aktiviert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleUpdateSlide = async (id: string, updates: Partial<Slide>) => {
    try {
      await fetch(`/api/slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      setSlides((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      )
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/slides/${id}`, { method: 'DELETE' })
      setSlides((prev) => prev.filter((s) => s.id !== id))
      toast.success('Slide gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const handleCreateSlide = async () => {
    try {
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          title: 'Neuer Slide',
          subtitle: '',
          imageUrl: '',
          linkUrl: '',
          linkText: '',
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSlides((prev) => [...prev, data.slide])
      toast.success('Slide erstellt')
    } catch {
      toast.error('Fehler beim Erstellen')
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <p className="text-sm text-text-color/60">
          Ziehen Sie Slides um die Reihenfolge zu ändern
        </p>
        <Button variant="secondary" onClick={handleCreateSlide}>
          Neuer Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-light-grey">
          <p className="text-text-color/60">Keine Slides vorhanden.</p>
          <Button variant="secondary" onClick={handleCreateSlide} className="mt-4">
            Ersten Slide erstellen
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {slides.map((slide) => (
                <SortableSlideCard
                  key={slide.id}
                  slide={slide}
                  onUpdate={(updates) => handleUpdateSlide(slide.id, updates)}
                  onDelete={() => handleDelete(slide.id)}
                  onToggleActive={() => handleToggleActive(slide)}
                  mediaModalOpen={mediaModalOpen && editingSlideId === slide.id}
                  onOpenMediaModal={() => {
                    setEditingSlideId(slide.id)
                    setMediaModalOpen(true)
                  }}
                  onCloseMediaModal={() => {
                    setMediaModalOpen(false)
                    setEditingSlideId(null)
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableSlideCard({
  slide,
  onUpdate,
  onDelete,
  onToggleActive,
  mediaModalOpen,
  onOpenMediaModal,
  onCloseMediaModal,
}: {
  slide: Slide
  onUpdate: (updates: Partial<Slide>) => void
  onDelete: () => void
  onToggleActive: () => void
  mediaModalOpen: boolean
  onOpenMediaModal: () => void
  onCloseMediaModal: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [localData, setLocalData] = useState({
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    linkUrl: slide.linkUrl || '',
    linkText: slide.linkText || '',
  })

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local data when slide changes
  useEffect(() => {
    setLocalData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      linkUrl: slide.linkUrl || '',
      linkText: slide.linkText || '',
    })
  }, [slide])

  // Check if there are unsaved changes
  const hasChanges =
    localData.title !== (slide.title || '') ||
    localData.subtitle !== (slide.subtitle || '') ||
    localData.linkUrl !== (slide.linkUrl || '') ||
    localData.linkText !== (slide.linkText || '')

  const handleSave = async () => {
    setIsSaving(true)
    await onUpdate(localData)
    setIsSaving(false)
    toast.success('Änderungen gespeichert')
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`rounded-xl bg-light-grey overflow-hidden shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      >
        {/* Header with drag handle and controls */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/50">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-text-color/40 hover:text-text-color/60"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          <span className="text-sm font-medium text-text-color/70 truncate flex-1">
            {slide.title || 'Ohne Titel'}
          </span>

          <div className="flex items-center gap-3">
            <span className="text-xs text-text-color/50">Aktiv</span>
            <Switch checked={slide.active} onCheckedChange={onToggleActive} />
            <button
              onClick={() => setDeleteConfirm(true)}
              className="p-2 text-text-color/40 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content: Image (1/3) + Content (2/3) */}
        <div className="flex flex-col md:flex-row">
          {/* Left: Image (1/3) */}
          <div
            onClick={onOpenMediaModal}
            className="w-full md:w-1/3 min-h-[200px] md:min-h-[280px] relative cursor-pointer group bg-text-color/10"
          >
            {slide.imageUrl ? (
              <>
                <Image
                  src={getImageUrl(slide.imageUrl)}
                  alt={slide.title || 'Slide'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Bild ändern</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-color/40 group-hover:text-text-color/60 transition-colors">
                <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Bild hinzufügen</span>
              </div>
            )}
          </div>

          {/* Right: Content (2/3) */}
          <div className="w-full md:w-2/3 p-5 space-y-4">
            {/* Title */}
            <div>
              <Label className="text-xs text-text-color/50">Titel</Label>
              <Input
                value={localData.title}
                onChange={(e) => setLocalData((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 text-lg font-medium"
                placeholder="Slide Titel"
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label className="text-xs text-text-color/50">Untertitel</Label>
              <Textarea
                value={localData.subtitle}
                onChange={(e) => setLocalData((prev) => ({ ...prev, subtitle: e.target.value }))}
                rows={3}
                className="mt-1"
                placeholder="Beschreibung oder Untertitel..."
              />
            </div>

            {/* Link fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-text-color/50">Link URL</Label>
                <Input
                  value={localData.linkUrl}
                  onChange={(e) => setLocalData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  className="mt-1"
                  placeholder="/seite oder https://..."
                />
              </div>
              <div>
                <Label className="text-xs text-text-color/50">Link Text</Label>
                <Input
                  value={localData.linkText}
                  onChange={(e) => setLocalData((prev) => ({ ...prev, linkText: e.target.value }))}
                  className="mt-1"
                  placeholder="Mehr erfahren"
                />
              </div>
            </div>

            {/* Save Button - only visible when there are changes */}
            {hasChanges && (
              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? 'Speichern...' : 'Änderungen speichern'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={onCloseMediaModal}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          onUpdate({ imageUrl: selectedMedia.url })
        }}
        title="Slide-Bild auswählen"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slide löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Slide wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete()
                setDeleteConfirm(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
