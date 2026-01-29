'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'

// Define the karriere page sections that can be configured
const KARRIERE_SECTIONS = [
  {
    key: 'hero',
    label: 'Hero-Bereich',
    description: 'Kopfbereich der Karriereseite mit Hintergrundbild',
    hasImage: true,
    hasColor: true,
  },
  {
    key: 'cta',
    label: 'CTA-Bereich',
    description: 'Schwarzer Bereich am Ende der Stellenseiten',
    hasImage: true,
    hasColor: false,
  },
] as const

type SectionKey = typeof KARRIERE_SECTIONS[number]['key']

interface KarriereSection {
  id?: string
  sectionKey: string
  backgroundImage: string | null
  accentColor: string | null
  updatedAt?: string
}

const ACCENT_COLOR_OPTIONS = [
  { value: 'primary', label: 'Primär (Rot)' },
  { value: 'secondary', label: 'Sekundär (Blau)' },
]

export function KarriereSettingsManagement() {
  const { website, isLoaded } = useWebsite()
  const [sections, setSections] = useState<KarriereSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<SectionKey | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  const [formData, setFormData] = useState<KarriereSection>({
    sectionKey: '',
    backgroundImage: '',
    accentColor: 'primary',
  })

  useEffect(() => {
    const fetchSections = async () => {
      if (!isLoaded) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/karriere-settings?website=${website}`)
        const data = await res.json()
        setSections(data.sections || [])
      } catch {
        toast.error('Fehler beim Laden der Karriere-Einstellungen')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSections()
  }, [website, isLoaded])

  const handleEdit = (key: SectionKey) => {
    const existing = sections.find((s) => s.sectionKey === key)
    const sectionConfig = KARRIERE_SECTIONS.find((s) => s.key === key)

    if (existing) {
      setFormData({
        sectionKey: key,
        backgroundImage: existing.backgroundImage || '',
        accentColor: existing.accentColor || 'primary',
      })
    } else {
      setFormData({
        sectionKey: key,
        backgroundImage: '',
        accentColor: sectionConfig?.hasColor ? 'primary' : null,
      })
    }
    setEditingKey(key)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/karriere-settings/${formData.sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          backgroundImage: formData.backgroundImage || null,
          accentColor: formData.accentColor || null,
        }),
      })

      if (!res.ok) throw new Error()

      const updated = await res.json()
      setSections((prev) => {
        const exists = prev.find((s) => s.sectionKey === formData.sectionKey)
        if (exists) {
          return prev.map((s) => (s.sectionKey === formData.sectionKey ? updated : s))
        }
        return [...prev, updated]
      })

      toast.success('Einstellungen gespeichert')
      setEditingKey(null)
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  const editingSection = KARRIERE_SECTIONS.find((s) => s.key === editingKey)

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-color/60">
        Konfigurieren Sie die Bilder und Farben für die Karriereseiten-Abschnitte.
      </p>

      {KARRIERE_SECTIONS.map((section) => {
        const data = sections.find((s) => s.sectionKey === section.key)
        return (
          <div
            key={section.key}
            className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm"
          >
            <div className="flex items-center gap-4">
              {data?.backgroundImage && (
                <div className="relative h-12 w-20 rounded overflow-hidden">
                  <Image
                    src={getImageUrl(data.backgroundImage)}
                    alt={section.label}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium text-text-color">{section.label}</h3>
                <p className="text-sm text-text-color/60">{section.description}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleEdit(section.key)}
              className="text-sm"
            >
              Bearbeiten
            </Button>
          </div>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingKey} onOpenChange={(open) => !open && setEditingKey(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.label} bearbeiten
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {editingSection?.hasImage && (
              <div>
                <Label>Hintergrundbild</Label>
                <div
                  onClick={() => setMediaModalOpen(true)}
                  className="relative mt-1 h-32 rounded-lg bg-light-grey cursor-pointer group overflow-hidden"
                >
                  {formData.backgroundImage ? (
                    <>
                      <Image
                        src={getImageUrl(formData.backgroundImage)}
                        alt="Hintergrund"
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
                {formData.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, backgroundImage: '' }))}
                    className="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    Bild entfernen
                  </button>
                )}
              </div>
            )}

            {editingSection?.hasColor && (
              <div>
                <Label>Akzentfarbe</Label>
                <Select
                  value={formData.accentColor || 'primary'}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, accentColor: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingKey(null)}
                className="bg-transparent shadow-sm text-text-color hover:bg-light-grey"
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Selector */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, backgroundImage: selectedMedia.url }))
        }}
        title="Hintergrundbild auswählen"
      />
    </div>
  )
}
