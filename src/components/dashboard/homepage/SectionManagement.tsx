'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
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
import type { ParsedHomepageSection, AccordionCard } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function SectionManagement() {
  const { website, isLoaded } = useWebsite()
  const [sections, setSections] = useState<ParsedHomepageSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

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
      toast.success('Reihenfolge aktualisiert')
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
      toast.success(section.active ? 'Abschnitt deaktiviert' : 'Abschnitt aktiviert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleUpdateSection = async (id: string, updates: Partial<ParsedHomepageSection>) => {
    try {
      await fetch(`/api/homepage/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      )
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/homepage/sections/${id}`, { method: 'DELETE' })
      setSections((prev) => prev.filter((s) => s.id !== id))
      toast.success('Abschnitt gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const handleCreateSection = async () => {
    try {
      const res = await fetch('/api/homepage/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          identifier: `section-${Date.now()}`,
          title: 'Neuer Abschnitt',
          description: '',
          backgroundColor: 'light',
          textColor: 'dark',
          cards: [],
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSections((prev) => [...prev, { ...data.section, cards: [] }])
      toast.success('Abschnitt erstellt')
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
          Ziehen Sie Abschnitte um die Reihenfolge zu ändern
        </p>
        <Button variant="secondary" onClick={handleCreateSection}>
          Neuer Abschnitt
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-light-grey">
          <p className="text-text-color/60">Keine Abschnitte vorhanden.</p>
          <Button variant="secondary" onClick={handleCreateSection} className="mt-4">
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
            <div className="space-y-6">
              {sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  allSections={sections}
                  onUpdate={(updates) => handleUpdateSection(section.id, updates)}
                  onDelete={() => handleDelete(section.id)}
                  onToggleActive={() => handleToggleActive(section)}
                  mediaModalOpen={mediaModalOpen && editingSectionId === section.id}
                  onOpenMediaModal={() => {
                    setEditingSectionId(section.id)
                    setMediaModalOpen(true)
                  }}
                  onCloseMediaModal={() => {
                    setMediaModalOpen(false)
                    setEditingSectionId(null)
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

function SortableSectionCard({
  section,
  allSections,
  onUpdate,
  onDelete,
  onToggleActive,
  mediaModalOpen,
  onOpenMediaModal,
  onCloseMediaModal,
}: {
  section: ParsedHomepageSection
  allSections: ParsedHomepageSection[]
  onUpdate: (updates: Partial<ParsedHomepageSection>) => void
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
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [localData, setLocalData] = useState({
    title: section.title,
    subtitle: section.subtitle || '',
    description: section.description || '',
    backgroundColor: section.backgroundColor || 'light',
    textColor: section.textColor || 'dark',
    cards: section.cards,
    // Navbar settings
    showInNavbar: section.showInNavbar,
    navbarName: section.navbarName || '',
    navbarPosition: section.navbarPosition,
  })

  // Calculate used positions (excluding current section)
  const usedPositions = allSections
    .filter((s) => s.id !== section.id && s.showInNavbar && s.navbarPosition)
    .map((s) => s.navbarPosition as number)

  // Count of sections with navbar enabled (excluding current)
  const navbarEnabledCount = allSections.filter(
    (s) => s.id !== section.id && s.showInNavbar
  ).length

  const [editingCard, setEditingCard] = useState<{ index: number; card: AccordionCard } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'section' | 'card'; index?: number } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local data when section changes
  useEffect(() => {
    setLocalData({
      title: section.title,
      subtitle: section.subtitle || '',
      description: section.description || '',
      backgroundColor: section.backgroundColor || 'light',
      textColor: section.textColor || 'dark',
      cards: section.cards,
      showInNavbar: section.showInNavbar,
      navbarName: section.navbarName || '',
      navbarPosition: section.navbarPosition,
    })
  }, [section])

  // Check if there are unsaved changes (excluding cards which save immediately)
  const hasChanges =
    localData.title !== section.title ||
    localData.description !== (section.description || '')

  const handleSave = async () => {
    setIsSaving(true)
    await onUpdate({
      title: localData.title,
      description: localData.description,
    })
    setIsSaving(false)
    toast.success('Änderungen gespeichert')
  }

  const handleAddCard = () => {
    const newCard: AccordionCard = {
      title: 'Neue Karte',
      content: '',
      linkUrl: '',
      linkText: 'Mehr erfahren',
      btnClass: 'primary',
    }
    setEditingCard({ index: localData.cards.length, card: newCard })
  }

  const handleSaveCard = () => {
    if (!editingCard) return

    const isNewCard = editingCard.index >= localData.cards.length
    const newCards = [...localData.cards]
    if (isNewCard) {
      // Adding new card
      newCards.push(editingCard.card)
    } else {
      // Updating existing card
      newCards[editingCard.index] = editingCard.card
    }

    setLocalData((prev) => ({ ...prev, cards: newCards }))
    onUpdate({ cards: newCards })
    setEditingCard(null)
    toast.success(isNewCard ? 'Karte hinzugefügt' : 'Karte aktualisiert')
  }

  const handleDeleteCard = (index: number) => {
    const newCards = localData.cards.filter((_, i) => i !== index)
    setLocalData((prev) => ({ ...prev, cards: newCards }))
    onUpdate({ cards: newCards })
    setDeleteConfirm(null)
    toast.success('Karte gelöscht')
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

          <span className="text-sm text-text-color/50">{section.identifier}</span>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <span className="text-xs text-text-color/50">Aktiv</span>
            <Switch checked={section.active} onCheckedChange={onToggleActive} />
            <button
              onClick={() => setDeleteConfirm({ type: 'section' })}
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
          {/* Left: Background Image (1/3) */}
          <div
            onClick={onOpenMediaModal}
            className="w-full md:w-1/3 min-h-[250px] md:min-h-[350px] relative cursor-pointer group bg-text-color/10"
          >
            {section.backgroundImage ? (
              <>
                <Image
                  src={getImageUrl(section.backgroundImage)}
                  alt={section.title}
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
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs text-text-color/50">Beschreibung</Label>
              <Textarea
                value={localData.description}
                onChange={(e) => setLocalData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Accent Color Selector */}
            <div className="flex items-center gap-3">
              <Label className="text-xs text-text-color/50">Akzentfarbe</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setLocalData((prev) => ({ ...prev, backgroundColor: 'primary' }))
                    onUpdate({ backgroundColor: 'primary' })
                    toast.success('Farbe aktualisiert')
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full bg-white border-2 transition-all',
                    localData.backgroundColor === 'primary' || localData.backgroundColor === 'light'
                      ? 'border-secondary scale-110'
                      : 'border-text-color/20 hover:border-text-color/40'
                  )}
                  title="Weiß"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLocalData((prev) => ({ ...prev, backgroundColor: 'secondary' }))
                    onUpdate({ backgroundColor: 'secondary' })
                    toast.success('Farbe aktualisiert')
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full bg-secondary border-2 transition-all',
                    localData.backgroundColor === 'secondary'
                      ? 'border-secondary scale-110 ring-2 ring-secondary/30'
                      : 'border-transparent hover:scale-105'
                  )}
                  title="Sekundär"
                />
              </div>
            </div>

            {/* Accordion Cards - displayed like frontend */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-text-color/50">Accordion-Karten ({localData.cards.length})</Label>
                <button
                  type="button"
                  onClick={handleAddCard}
                  className="text-xs text-secondary hover:text-secondary/80 font-medium"
                >
                  + Karte hinzufügen
                </button>
              </div>

              {localData.cards.length === 0 ? (
                <p className="text-sm text-text-color/40 text-center py-4 bg-white/50 rounded-lg">
                  Keine Karten vorhanden
                </p>
              ) : (
                <div className="flex flex-wrap justify-evenly gap-2">
                  {localData.cards.map((card, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditingCard({ index, card: { ...card } })}
                      className={cn(
                        'border-none rounded-full px-4 py-3 cursor-pointer text-center',
                        'transition-all duration-300 ease-in-out hover:opacity-80',
                        'w-[23%] min-w-[140px] max-md:w-full',
                        localData.backgroundColor === 'secondary'
                          ? 'bg-secondary text-white'
                          : 'bg-white text-text-color'
                      )}
                    >
                      <span className="font-highlight text-sm font-bold">
                        {card.title || `Karte ${index + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Settings */}
            <div className="pt-4 mt-4 border-t border-text-color/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-text-color/50">In Navigation anzeigen</Label>
                  <Switch
                    checked={localData.showInNavbar}
                    onCheckedChange={(checked) => {
                      if (checked && navbarEnabledCount >= 5) {
                        toast.error('Maximal 5 Abschnitte können in der Navigation angezeigt werden')
                        return
                      }
                      setLocalData((prev) => ({ ...prev, showInNavbar: checked }))
                      if (!checked) {
                        // Clear navbar fields when disabling
                        onUpdate({ showInNavbar: false, navbarName: null, navbarPosition: null })
                      } else {
                        onUpdate({ showInNavbar: true })
                      }
                      toast.success(checked ? 'Navigation aktiviert' : 'Navigation deaktiviert')
                    }}
                  />
                </div>
              </div>

              {localData.showInNavbar && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-text-color/50">Name in Navigation</Label>
                    <Input
                      value={localData.navbarName}
                      onChange={(e) => setLocalData((prev) => ({ ...prev, navbarName: e.target.value }))}
                      onBlur={() => {
                        if (localData.navbarName !== (section.navbarName || '')) {
                          onUpdate({ navbarName: localData.navbarName || null })
                          toast.success('Name aktualisiert')
                        }
                      }}
                      placeholder={section.title}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Position</Label>
                    <Select
                      value={localData.navbarPosition?.toString() || ''}
                      onValueChange={(v) => {
                        const position = parseInt(v)
                        setLocalData((prev) => ({ ...prev, navbarPosition: position }))
                        onUpdate({ navbarPosition: position })
                        toast.success('Position aktualisiert')
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Position wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((pos) => (
                          <SelectItem
                            key={pos}
                            value={pos.toString()}
                            disabled={usedPositions.includes(pos)}
                          >
                            {pos}{usedPositions.includes(pos) ? ' (vergeben)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
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
          onUpdate({ backgroundImage: selectedMedia.url })
          toast.success('Bild aktualisiert')
        }}
        title="Hintergrundbild auswählen"
      />

      {/* Card Edit Modal */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard && editingCard.index >= localData.cards.length
                ? 'Neue Karte erstellen'
                : 'Karte bearbeiten'}
            </DialogTitle>
          </DialogHeader>

          {editingCard && (
            <div className="space-y-4">
              <div>
                <Label>Titel</Label>
                <Input
                  value={editingCard.card.title}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      card: { ...editingCard.card, title: e.target.value },
                    })
                  }
                  className="mt-1"
                  placeholder="Kartentitel"
                />
              </div>

              <div>
                <Label>Inhalt</Label>
                <Textarea
                  value={editingCard.card.content}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      card: { ...editingCard.card, content: e.target.value },
                    })
                  }
                  rows={4}
                  className="mt-1"
                  placeholder="Karteninhalt..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Link URL</Label>
                  <Input
                    value={editingCard.card.linkUrl || ''}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        card: { ...editingCard.card, linkUrl: e.target.value },
                      })
                    }
                    placeholder="/seite"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Link Text</Label>
                  <Input
                    value={editingCard.card.linkText || ''}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        card: { ...editingCard.card, linkText: e.target.value },
                      })
                    }
                    placeholder="Mehr erfahren"
                    className="mt-1"
                  />
                </div>
              </div>

            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editingCard && editingCard.index < localData.cards.length && (
              <button
                type="button"
                onClick={() => {
                  setEditingCard(null)
                  setDeleteConfirm({ type: 'card', index: editingCard.index })
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Löschen
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="secondary"
                onClick={() => setEditingCard(null)}
                className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
              >
                Abbrechen
              </Button>
              <Button variant="secondary" onClick={handleSaveCard}>
                Speichern
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirm?.type === 'section' ? 'Abschnitt löschen?' : 'Karte löschen?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'section'
                ? 'Möchten Sie diesen Abschnitt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
                : 'Möchten Sie diese Karte wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'section') {
                  onDelete()
                } else if (deleteConfirm?.type === 'card' && deleteConfirm.index !== undefined) {
                  handleDeleteCard(deleteConfirm.index)
                }
                setDeleteConfirm(null)
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
