'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { SlideEditor } from './SlideEditor'
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

export function SliderManagement() {
  const { website, isLoaded } = useWebsite()
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Slide wirklich löschen?')) return

    try {
      await fetch(`/api/slides/${id}`, { method: 'DELETE' })
      setSlides((prev) => prev.filter((s) => s.id !== id))
      toast.success('Slide gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
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
          Ziehen Sie Slides um die Reihenfolge zu ändern
        </p>
        <Button variant="secondary" onClick={() => setIsCreating(true)}>
          Neuer Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-light-grey">
          <p className="text-text-color/60">Keine Slides vorhanden.</p>
          <Button variant="secondary" onClick={() => setIsCreating(true)} className="mt-4">
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
            <div className="space-y-2">
              {slides.map((slide) => (
                <SortableSlideItem
                  key={slide.id}
                  slide={slide}
                  onEdit={() => setEditingSlide(slide)}
                  onDelete={() => handleDelete(slide.id)}
                  onToggleActive={() => handleToggleActive(slide)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {(isCreating || editingSlide) && (
        <SlideEditor
          slide={editingSlide}
          website={website}
          onClose={() => {
            setIsCreating(false)
            setEditingSlide(null)
          }}
          onSave={() => {
            setIsCreating(false)
            setEditingSlide(null)
            fetchSlides()
          }}
        />
      )}
    </div>
  )
}

function SortableSlideItem({
  slide,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  slide: Slide
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
  } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-xl bg-light-grey p-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-color/40 hover:text-text-color/60"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={slide.imageUrl}
          alt={slide.title || 'Slide'}
          fill
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-secondary truncate">
          {slide.title || 'Ohne Titel'}
        </p>
        {slide.subtitle && (
          <p className="text-sm text-text-color/60 truncate">{slide.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Switch
          checked={slide.active}
          onCheckedChange={onToggleActive}
        />

        <button
          onClick={onEdit}
          className="p-2 text-text-color/40 hover:text-text-color/60"
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
