'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/utils'
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
import type { ParsedPage, ParsedPageSection, ButtonItem } from '@/types'

// Save button component for each tab
function TabSaveButton({
  onClick,
  loading,
  label = 'Speichern',
}: {
  onClick: () => void
  loading: boolean
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? 'Speichern...' : label}
    </Button>
  )
}

// Item Card Component for displaying editable items
function ItemCard({
  children,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-xl p-4 border-l-4 border-secondary shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-full text-text-color/50 hover:text-secondary hover:bg-light-grey"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-full text-text-color/50 hover:text-red-600 hover:bg-red-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Sortable Text+Image Card
function SortableTextImageCard({
  section,
  onEdit,
  onDelete,
}: {
  section: ParsedPageSection
  onEdit: () => void
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
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-4 border-l-4 border-secondary shadow-sm ${isDragging ? 'shadow-xl' : 'hover:shadow-md'} transition-shadow`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-text-color/40 hover:text-text-color/60 cursor-grab active:cursor-grabbing"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Thumbnail */}
        {section.imageUrl && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-light-grey shrink-0">
            <Image
              src={getImageUrl(section.imageUrl)}
              alt={section.imageAlt || ''}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              Bild {section.imageAlign === 'left' ? 'links' : 'rechts'}
            </Badge>
          </div>
          <h3 className="font-medium text-text-color truncate">
            {section.title || 'Ohne Titel'}
          </h3>
          {section.content && (
            <p className="text-sm text-text-color/60 line-clamp-1 mt-0.5">
              {section.content.replace(/<[^>]*>/g, '').substring(0, 100)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-full text-text-color/50 hover:text-secondary hover:bg-light-grey"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-full text-text-color/50 hover:text-red-600 hover:bg-red-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Text+Image Section Modal
function TextImageModal({
  isOpen,
  onClose,
  section,
  onSave,
  pageId,
}: {
  isOpen: boolean
  onClose: () => void
  section: ParsedPageSection | null
  onSave: (section: ParsedPageSection) => void
  pageId: string
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageAlign, setImageAlign] = useState<'left' | 'right'>('left')
  const [buttons, setButtons] = useState<ButtonItem[]>([])
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (section) {
      setTitle(section.title || '')
      setContent(section.content || '')
      setImageUrl(section.imageUrl || '')
      setImageAlt(section.imageAlt || '')
      setImageAlign((section.imageAlign as 'left' | 'right') || 'left')
      setButtons(section.buttons || [])
    } else {
      setTitle('')
      setContent('')
      setImageUrl('')
      setImageAlt('')
      setImageAlign('left')
      setButtons([])
    }
  }, [section, isOpen])

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein')
      return
    }

    setSaving(true)
    try {
      const sectionData = {
        type: 'text_image',
        title: title || null,
        content: content || null,
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null,
        imageAlign,
        buttons,
        backgroundColor: 'light',
        textColor: 'dark',
      }

      if (section) {
        // Update existing
        const res = await fetch(`/api/pages/${pageId}/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionData),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        onSave(updated)
        toast.success('Abschnitt gespeichert')
      } else {
        // Create new
        const res = await fetch(`/api/pages/${pageId}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionData),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        onSave(created)
        toast.success('Abschnitt erstellt')
      }
      onClose()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {section ? 'Text + Bild bearbeiten' : 'Neuer Text + Bild Abschnitt'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div>
              <Label htmlFor="ti-title">Titel</Label>
              <Input
                id="ti-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Machbarkeit & Auslegung"
                className="mt-1"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="ti-content">Inhalt (HTML erlaubt)</Label>
              <Textarea
                id="ti-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Beschreibungstext... (HTML wie <br />, <a href> erlaubt)"
                rows={6}
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
                  <Label htmlFor="ti-imageAlt">Bild Alt-Text</Label>
                  <Input
                    id="ti-imageAlt"
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
            >
              Abbrechen
            </Button>
            <Button type="button" variant="secondary" onClick={handleSave} disabled={saving}>
              {saving ? 'Speichern...' : section ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setImageUrl(selectedMedia.url)
        }}
        title="Bild auswählen"
      />
    </>
  )
}

export default function SeiteBearbeiten({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [page, setPage] = useState<ParsedPage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('allgemein')
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  // Text+Image modal state
  const [textImageModal, setTextImageModal] = useState<{
    open: boolean
    section: ParsedPageSection | null
  }>({ open: false, section: null })

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Form data for general + hero
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroImage: '',
    heroButtonText: '',
    heroButtonLink: '',
    active: true,
  })

  // Section states
  const [tripleSection, setTripleSection] = useState<ParsedPageSection | null>(null)
  const [blackCtaSection, setBlackCtaSection] = useState<ParsedPageSection | null>(null)
  const [numbersSection, setNumbersSection] = useState<ParsedPageSection | null>(null)
  const [textImageSections, setTextImageSections] = useState<ParsedPageSection[]>([])

  const fetchPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${id}`)
      if (!res.ok) throw new Error('Seite nicht gefunden')
      const data: ParsedPage = await res.json()
      setPage(data)
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
        heroDescription: data.heroDescription || '',
        heroImage: data.heroImage || '',
        heroButtonText: data.heroButtonText || '',
        heroButtonLink: data.heroButtonLink || '',
        active: data.active,
      })

      // Organize sections by type
      const sections = data.sections || []
      setTripleSection(sections.find((s) => s.type === 'triple') || null)
      setBlackCtaSection(sections.find((s) => s.type === 'black_cta') || null)
      setNumbersSection(sections.find((s) => s.type === 'numbers') || null)
      setTextImageSections(
        sections.filter((s) => s.type === 'text_image').sort((a, b) => a.sortOrder - b.sortOrder)
      )
    } catch {
      toast.error('Fehler beim Laden der Seite')
      router.push('/seiten')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  // Save general info
  const saveGeneral = async () => {
    if (!formData.title || !formData.slug) {
      toast.error('Titel und Slug sind erforderlich')
      return
    }

    setSaving('allgemein')
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          active: formData.active,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success('Allgemeine Einstellungen gespeichert')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setSaving(null)
    }
  }

  // Save hero
  const saveHero = async () => {
    setSaving('hero')
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroTitle: formData.heroTitle || null,
          heroSubtitle: formData.heroSubtitle || null,
          heroDescription: formData.heroDescription || null,
          heroImage: formData.heroImage || null,
          heroButtonText: formData.heroButtonText || null,
          heroButtonLink: formData.heroButtonLink || null,
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Hero-Bereich gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(null)
    }
  }

  // Toggle section active state
  const toggleSectionActive = async (section: ParsedPageSection | null, type: string) => {
    if (!section) {
      // Create the section
      try {
        const res = await fetch(`/api/pages/${id}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            title: type === 'triple' ? null : type === 'black_cta' ? 'CTA Titel' : 'Zahlen',
            active: true,
          }),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        if (type === 'triple') setTripleSection(created)
        else if (type === 'black_cta') setBlackCtaSection(created)
        else if (type === 'numbers') setNumbersSection(created)
        toast.success('Abschnitt aktiviert')
      } catch {
        toast.error('Fehler beim Erstellen')
      }
    } else {
      // Toggle active
      try {
        await fetch(`/api/pages/${id}/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: !section.active }),
        })
        const updatedSection = { ...section, active: !section.active }
        if (type === 'triple') setTripleSection(updatedSection)
        else if (type === 'black_cta') setBlackCtaSection(updatedSection)
        else if (type === 'numbers') setNumbersSection(updatedSection)
        toast.success(updatedSection.active ? 'Abschnitt aktiviert' : 'Abschnitt deaktiviert')
      } catch {
        toast.error('Fehler beim Aktualisieren')
      }
    }
  }

  // Handle text+image drag end
  const handleTextImageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = textImageSections.findIndex((s) => s.id === active.id)
    const newIndex = textImageSections.findIndex((s) => s.id === over.id)

    const newSections = arrayMove(textImageSections, oldIndex, newIndex)
    setTextImageSections(newSections)

    // Update sortOrder via API
    try {
      await fetch(`/api/pages/${id}/sections/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds: newSections.map((s) => s.id) }),
      })
    } catch {
      toast.error('Fehler beim Sortieren')
      fetchPage()
    }
  }

  // Delete text+image section
  const deleteTextImageSection = async (sectionId: string) => {
    try {
      await fetch(`/api/pages/${id}/sections/${sectionId}`, { method: 'DELETE' })
      setTextImageSections((prev) => prev.filter((s) => s.id !== sectionId))
      toast.success('Abschnitt gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  // Handle text+image save (update or create)
  const handleTextImageSave = (savedSection: ParsedPageSection) => {
    setTextImageSections((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === savedSection.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = savedSection
        return updated
      }
      return [...prev, savedSection]
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-color">{page.title}</h1>
              <Badge
                variant={formData.active ? 'default' : 'secondary'}
                className={formData.active ? 'bg-green-100 text-green-700' : ''}
              >
                {formData.active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
            <p className="text-sm text-text-color/60 mt-1">/{page.slug}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-light-grey p-1 rounded-xl">
          <TabsTrigger value="allgemein" className="rounded-lg data-[state=active]:bg-white">
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="hero" className="rounded-lg data-[state=active]:bg-white">
            Hero
          </TabsTrigger>
          <TabsTrigger value="triple" className="rounded-lg data-[state=active]:bg-white">
            3-Spalten
          </TabsTrigger>
          <TabsTrigger value="text-image" className="rounded-lg data-[state=active]:bg-white">
            Text + Bild
          </TabsTrigger>
          <TabsTrigger value="black-cta" className="rounded-lg data-[state=active]:bg-white">
            CTA (Dunkel)
          </TabsTrigger>
          <TabsTrigger value="numbers" className="rounded-lg data-[state=active]:bg-white">
            Zahlen
          </TabsTrigger>
        </TabsList>

        {/* Tab: Allgemein */}
        <TabsContent value="allgemein" className="mt-6">
          <div className="p-6 rounded-xl bg-light-grey space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-color">Allgemeine Einstellungen</h2>
              <TabSaveButton onClick={saveGeneral} loading={saving === 'allgemein'} />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white">
              <div>
                <span className="font-medium text-text-color">Status</span>
                <p className="text-sm text-text-color/60">
                  {formData.active ? 'Seite ist sichtbar' : 'Seite ist versteckt'}
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
              />
            </div>

            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="z.B. BHKW Anlagenbau"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="z.B. bhkw-anlagenbau"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* SEO */}
            <div className="pt-4 border-t border-text-color/10">
              <h3 className="font-medium text-text-color mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta-Titel</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO Titel (optional)"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="SEO Beschreibung (optional)"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Hero */}
        <TabsContent value="hero" className="mt-6">
          <div className="p-6 rounded-xl bg-light-grey space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-color">Hero-Bereich</h2>
              <TabSaveButton onClick={saveHero} loading={saving === 'hero'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="heroTitle">Hero-Titel</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="z.B. BHKW Anlagenbau | Kraft trifft Wärme"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Hero-Untertitel</Label>
                <Input
                  id="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                  placeholder="z.B. Ihr Plus an Effizienz"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hero-Bild</Label>
                <div
                  onClick={() => setMediaModalOpen(true)}
                  className="mt-1 relative h-32 rounded-lg bg-white cursor-pointer group overflow-hidden"
                >
                  {formData.heroImage ? (
                    <>
                      <Image
                        src={getImageUrl(formData.heroImage)}
                        alt="Hero"
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
              <div className="sm:col-span-2">
                <Label htmlFor="heroDescription">Hero-Beschreibung</Label>
                <Textarea
                  id="heroDescription"
                  value={formData.heroDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroDescription: e.target.value }))}
                  placeholder="Beschreibungstext für den Hero-Bereich"
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heroButtonText">Button-Text</Label>
                <Input
                  id="heroButtonText"
                  value={formData.heroButtonText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroButtonText: e.target.value }))}
                  placeholder="z.B. Jetzt anfragen"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heroButtonLink">Button-Link</Label>
                <Input
                  id="heroButtonLink"
                  value={formData.heroButtonLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroButtonLink: e.target.value }))}
                  placeholder="z.B. /kontakt"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Triple (3-Spalten) */}
        <TabsContent value="triple" className="mt-6">
          <div className="p-6 rounded-xl bg-light-grey space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-color">3-Spalten Abschnitt</h2>
                <p className="text-sm text-text-color/60 mt-1">
                  Drei Spalten mit Titel und Text
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-color/50">Aktiv</span>
                <Switch
                  checked={tripleSection?.active ?? false}
                  onCheckedChange={() => toggleSectionActive(tripleSection, 'triple')}
                />
              </div>
            </div>

            {tripleSection?.active && (
              <div className="p-4 rounded-xl bg-white">
                <p className="text-sm text-text-color/60 text-center">
                  Bearbeitung des 3-Spalten Abschnitts wird in einer zukünftigen Version verfügbar sein.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Text + Bild (CRUD) */}
        <TabsContent value="text-image" className="mt-6">
          <div className="p-6 rounded-xl bg-light-grey space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-color">Text + Bild Abschnitte</h2>
                <p className="text-sm text-text-color/60 mt-1">
                  Abschnitte mit Text und Bild (links oder rechts). Ziehen Sie zum Sortieren.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setTextImageModal({ open: true, section: null })}
              >
                + Hinzufügen
              </Button>
            </div>

            {textImageSections.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-white">
                <p className="text-text-color/60 mb-4">Keine Text + Bild Abschnitte vorhanden.</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTextImageModal({ open: true, section: null })}
                >
                  Ersten Abschnitt erstellen
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTextImageDragEnd}
              >
                <SortableContext
                  items={textImageSections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {textImageSections.map((section) => (
                      <SortableTextImageCard
                        key={section.id}
                        section={section}
                        onEdit={() => setTextImageModal({ open: true, section })}
                        onDelete={() => deleteTextImageSection(section.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </TabsContent>

        {/* Tab: Black CTA */}
        <TabsContent value="black-cta" className="mt-6">
          <div className="p-6 rounded-xl bg-light-grey space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-color">CTA-Bereich (Dunkel)</h2>
                <p className="text-sm text-text-color/60 mt-1">
                  Call-to-Action Bereich mit dunklem Hintergrund
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-color/50">Aktiv</span>
                <Switch
                  checked={blackCtaSection?.active ?? false}
                  onCheckedChange={() => toggleSectionActive(blackCtaSection, 'black_cta')}
                />
              </div>
            </div>

            {blackCtaSection?.active && (
              <div className="p-4 rounded-xl bg-white">
                <p className="text-sm text-text-color/60 text-center">
                  Bearbeitung des CTA-Bereichs wird in einer zukünftigen Version verfügbar sein.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Numbers */}
        <TabsContent value="numbers" className="mt-6">
          <div className="p-6 rounded-xl bg-light-grey space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-color">Zahlen & Statistiken</h2>
                <p className="text-sm text-text-color/60 mt-1">
                  Kennzahlen und Statistiken anzeigen
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-color/50">Aktiv</span>
                <Switch
                  checked={numbersSection?.active ?? false}
                  onCheckedChange={() => toggleSectionActive(numbersSection, 'numbers')}
                />
              </div>
            </div>

            {numbersSection?.active && (
              <div className="p-4 rounded-xl bg-white">
                <p className="text-sm text-text-color/60 text-center">
                  Bearbeitung der Zahlen wird in einer zukünftigen Version verfügbar sein.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Media Selector Modal for Hero */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, heroImage: selectedMedia.url }))
        }}
        title="Hero-Bild auswählen"
      />

      {/* Text+Image Modal */}
      <TextImageModal
        isOpen={textImageModal.open}
        onClose={() => setTextImageModal({ open: false, section: null })}
        section={textImageModal.section}
        onSave={handleTextImageSave}
        pageId={id}
      />
    </div>
  )
}
