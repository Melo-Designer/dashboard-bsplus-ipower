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
import { TripleSectionEditor } from '@/components/dashboard/pages/section-editors/TripleSectionEditor'
import { BlackCtaSectionEditor } from '@/components/dashboard/pages/section-editors/BlackCtaSectionEditor'
import { NumbersSectionEditor } from '@/components/dashboard/pages/section-editors/NumbersSectionEditor'

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

// Sortable Text+Image Card - Same layout as homepage sections (1/3 image + 2/3 content)
function SortableTextImageCard({
  section,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenMediaModal,
}: {
  section: ParsedPageSection
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onOpenMediaModal: () => void
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
      className={`rounded-xl bg-light-grey overflow-hidden shadow-sm ${isDragging ? 'shadow-xl' : ''}`}
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

        <Badge variant="outline" className="text-xs">
          Bild {section.imageAlign === 'left' ? 'links' : 'rechts'}
        </Badge>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-color/50">Aktiv</span>
          <Switch checked={section.active} onCheckedChange={onToggleActive} />
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-text-color/40 hover:text-secondary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
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
          {section.imageUrl ? (
            <>
              <Image
                src={getImageUrl(section.imageUrl)}
                alt={section.imageAlt || section.title || ''}
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
        <div className="w-full md:w-2/3 p-5 space-y-3">
          <div>
            <Label className="text-xs text-text-color/50">Titel</Label>
            <p className="font-medium text-text-color mt-1">
              {section.title || 'Ohne Titel'}
            </p>
          </div>

          {section.content && (
            <div>
              <Label className="text-xs text-text-color/50">Inhalt</Label>
              <p className="text-sm text-text-color/70 mt-1 line-clamp-4">
                {section.content.replace(/<[^>]*>/g, '')}
              </p>
            </div>
          )}

          {section.buttons && section.buttons.length > 0 && (
            <div>
              <Label className="text-xs text-text-color/50">Buttons</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {section.buttons.map((btn, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {btn.text}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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

  // Text+Image media modal state (for inline image editing)
  const [editingTextImageId, setEditingTextImageId] = useState<string | null>(null)

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

  // Section editing states
  const [editingTriple, setEditingTriple] = useState(false)
  const [editingBlackCta, setEditingBlackCta] = useState(false)
  const [editingNumbers, setEditingNumbers] = useState(false)

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

  // Save triple section
  const saveTripleSection = async (updates: Partial<ParsedPageSection>) => {
    if (!tripleSection) return
    try {
      const res = await fetch(`/api/pages/${id}/sections/${tripleSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTripleSection(updated)
      setEditingTriple(false)
      toast.success('3-Spalten Abschnitt gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  // Save black CTA section
  const saveBlackCtaSection = async (updates: Partial<ParsedPageSection>) => {
    if (!blackCtaSection) return
    try {
      const res = await fetch(`/api/pages/${id}/sections/${blackCtaSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setBlackCtaSection(updated)
      setEditingBlackCta(false)
      toast.success('CTA-Bereich gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  // Save numbers section
  const saveNumbersSection = async (updates: Partial<ParsedPageSection>) => {
    if (!numbersSection) return
    try {
      const res = await fetch(`/api/pages/${id}/sections/${numbersSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setNumbersSection(updated)
      setEditingNumbers(false)
      toast.success('Zahlen-Abschnitt gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
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

  // Toggle text+image section active state
  const toggleTextImageActive = async (section: ParsedPageSection) => {
    try {
      await fetch(`/api/pages/${id}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !section.active }),
      })
      setTextImageSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, active: !s.active } : s))
      )
      toast.success(section.active ? 'Abschnitt deaktiviert' : 'Abschnitt aktiviert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  // Update text+image section image
  const updateTextImageImage = async (sectionId: string, imageUrl: string) => {
    try {
      await fetch(`/api/pages/${id}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      setTextImageSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, imageUrl } : s))
      )
      toast.success('Bild aktualisiert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
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
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">Hero-Bereich</h2>
              <TabSaveButton onClick={saveHero} loading={saving === 'hero'} />
            </div>

            {/* Main content: Image (1/3) + Content (2/3) */}
            <div className="flex flex-col md:flex-row">
              {/* Left: Hero Image (1/3) */}
              <div
                onClick={() => setMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[250px] md:min-h-[350px] relative cursor-pointer group bg-text-color/10"
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
                <div>
                  <Label className="text-xs text-text-color/50">Hero-Titel</Label>
                  <Input
                    value={formData.heroTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                    placeholder="z.B. BHKW Anlagenbau | Kraft trifft Wärme"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Hero-Untertitel</Label>
                  <Input
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="z.B. Ihr Plus an Effizienz"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Hero-Beschreibung</Label>
                  <Textarea
                    value={formData.heroDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heroDescription: e.target.value }))}
                    placeholder="Beschreibungstext für den Hero-Bereich"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-text-color/50">Button-Text</Label>
                    <Input
                      value={formData.heroButtonText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroButtonText: e.target.value }))}
                      placeholder="z.B. Jetzt anfragen"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Button-Link</Label>
                    <Input
                      value={formData.heroButtonLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroButtonLink: e.target.value }))}
                      placeholder="z.B. /kontakt"
                      className="mt-1"
                    />
                  </div>
                </div>
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
                {editingTriple ? (
                  <TripleSectionEditor
                    section={tripleSection}
                    onSave={saveTripleSection}
                    onCancel={() => setEditingTriple(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Preview of items */}
                    {tripleSection.items.length > 0 && tripleSection.items.some(item => item.title || item.content) ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tripleSection.items.map((item, index) => (
                          <div key={index} className="p-3 rounded-lg bg-light-grey">
                            <p className="font-medium text-text-color">{item.title || `Spalte ${index + 1}`}</p>
                            {item.content && (
                              <p className="text-sm text-text-color/60 mt-1 line-clamp-3">{item.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-color/60 text-center py-4">
                        Keine Inhalte vorhanden. Klicken Sie auf Bearbeiten, um Inhalte hinzuzufügen.
                      </p>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingTriple(true)}
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                )}
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
                  <div className="space-y-6">
                    {textImageSections.map((section) => (
                      <SortableTextImageCard
                        key={section.id}
                        section={section}
                        onEdit={() => setTextImageModal({ open: true, section })}
                        onDelete={() => deleteTextImageSection(section.id)}
                        onToggleActive={() => toggleTextImageActive(section)}
                        onOpenMediaModal={() => setEditingTextImageId(section.id)}
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
                {editingBlackCta ? (
                  <BlackCtaSectionEditor
                    section={blackCtaSection}
                    onSave={saveBlackCtaSection}
                    onCancel={() => setEditingBlackCta(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="p-4 rounded-lg bg-gray-900 text-white">
                      <p className="font-medium">{blackCtaSection.title || 'Kein Titel'}</p>
                      {blackCtaSection.content && (
                        <p className="text-sm text-white/70 mt-1 line-clamp-2">
                          {blackCtaSection.content.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      {blackCtaSection.buttons && blackCtaSection.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {blackCtaSection.buttons.map((btn, i) => (
                            <Badge key={i} variant="secondary" className="bg-white/20 text-white text-xs">
                              {btn.text}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingBlackCta(true)}
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                )}
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
                {editingNumbers ? (
                  <NumbersSectionEditor
                    section={numbersSection}
                    onSave={saveNumbersSection}
                    onCancel={() => setEditingNumbers(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Preview of stats */}
                    {numbersSection.stats.length > 0 && numbersSection.stats.some(stat => stat.number || stat.title) ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {numbersSection.stats.map((stat, index) => (
                          <div key={index} className="p-3 rounded-lg bg-light-grey text-center">
                            <p className="text-2xl font-bold text-secondary">{stat.number || '-'}</p>
                            <p className="text-sm text-text-color/60">{stat.title || `Kennzahl ${index + 1}`}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-color/60 text-center py-4">
                        Keine Kennzahlen vorhanden. Klicken Sie auf Bearbeiten, um Kennzahlen hinzuzufügen.
                      </p>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingNumbers(true)}
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                )}
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

      {/* Media Selector Modal for Text+Image Sections */}
      <MediaSelectorModal
        isOpen={!!editingTextImageId}
        onClose={() => setEditingTextImageId(null)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          if (editingTextImageId) {
            updateTextImageImage(editingTextImageId, selectedMedia.url)
          }
          setEditingTextImageId(null)
        }}
        title="Bild auswählen"
      />
    </div>
  )
}
