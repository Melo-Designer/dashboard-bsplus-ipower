'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

interface PageHeader {
  id?: string
  title: string
  subtitle: string | null
  description: string | null
  backgroundImage: string | null
  overlayColor: string | null
  textColor: string | null
}

interface ContactSettings {
  contact_form_title: string
  contact_form_description: string
  contact_cta_title: string
  contact_cta_description: string
  contact_cta_image: string
  google_maps_embed: string
}

export default function ContactPage() {
  const { website, getDisplayName, isLoaded } = useWebsite()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Hero state
  const [header, setHeader] = useState<PageHeader>({
    title: 'Kontakt',
    subtitle: null,
    description: null,
    backgroundImage: null,
    overlayColor: null,
    textColor: 'light',
  })
  const [heroMediaModalOpen, setHeroMediaModalOpen] = useState(false)

  // Content settings state
  const [settings, setSettings] = useState<ContactSettings>({
    contact_form_title: '',
    contact_form_description: '',
    contact_cta_title: '',
    contact_cta_description: '',
    contact_cta_image: '',
    google_maps_embed: '',
  })
  const [ctaMediaModalOpen, setCtaMediaModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return
      setIsLoading(true)

      try {
        // Fetch header
        const headerRes = await fetch(`/api/headers/kontakt?website=${website}`)
        if (headerRes.ok) {
          const headerData = await headerRes.json()
          if (headerData) {
            setHeader({
              title: headerData.title || 'Kontakt',
              subtitle: headerData.subtitle,
              description: headerData.description,
              backgroundImage: headerData.backgroundImage,
              overlayColor: headerData.overlayColor,
              textColor: headerData.textColor || 'light',
            })
          }
        }

        // Fetch settings
        const settingsRes = await fetch(`/api/settings?website=${website}`)
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          const s = settingsData.settings || {}
          setSettings({
            contact_form_title: s.contact_form_title || '',
            contact_form_description: s.contact_form_description || '',
            contact_cta_title: s.contact_cta_title || '',
            contact_cta_description: s.contact_cta_description || '',
            contact_cta_image: s.contact_cta_image || '',
            google_maps_embed: s.google_maps_embed || '',
          })
        }
      } catch {
        toast.error('Fehler beim Laden der Daten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [website, isLoaded])

  const handleSaveHeader = async () => {
    if (!header.title.trim()) {
      toast.error('Titel ist erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/headers/kontakt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          title: header.title,
          subtitle: header.subtitle || null,
          description: header.description || null,
          backgroundImage: header.backgroundImage || null,
          overlayColor: header.overlayColor || null,
          textColor: header.textColor || null,
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Hero-Bereich gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          settings: {
            contact_form_title: settings.contact_form_title,
            contact_form_description: settings.contact_form_description,
            contact_cta_title: settings.contact_cta_title,
            contact_cta_description: settings.contact_cta_description,
            contact_cta_image: settings.contact_cta_image,
            google_maps_embed: settings.google_maps_embed,
          },
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Inhalte gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-secondary">Kontaktseite</h1>
        <p className="text-text-color/60 mt-1">
          Verwalten Sie die Inhalte der Kontaktseite für {getDisplayName()}
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList>
          <TabsTrigger value="hero">Hero-Bereich</TabsTrigger>
          <TabsTrigger value="content">Inhalte</TabsTrigger>
        </TabsList>

        {/* Hero Tab */}
        <TabsContent value="hero" className="mt-6">
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">Hero-Bereich</h2>
              <Button
                variant="secondary"
                onClick={handleSaveHeader}
                disabled={isSaving}
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>

            {/* Main content: Image (1/3) + Content (2/3) */}
            <div className="flex flex-col md:flex-row">
              {/* Left: Hero Image (1/3) */}
              <div
                onClick={() => setHeroMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[250px] md:min-h-[350px] relative cursor-pointer group bg-text-color/10"
              >
                {header.backgroundImage ? (
                  <>
                    <Image
                      src={getImageUrl(header.backgroundImage)}
                      alt="Hintergrund"
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
                  <Label className="text-xs text-text-color/50">Titel *</Label>
                  <Input
                    value={header.title}
                    onChange={(e) =>
                      setHeader((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Kontakt"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Untertitel</Label>
                  <Input
                    value={header.subtitle || ''}
                    onChange={(e) =>
                      setHeader((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="Untertitel"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Beschreibung</Label>
                  <Textarea
                    value={header.description || ''}
                    onChange={(e) =>
                      setHeader((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Kurze Beschreibung"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Textfarbe</Label>
                  <Select
                    value={header.textColor || 'light'}
                    onValueChange={(value) =>
                      setHeader((prev) => ({ ...prev, textColor: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Hell (weiß)</SelectItem>
                      <SelectItem value="dark">Dunkel (schwarz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {header.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => setHeader((prev) => ({ ...prev, backgroundImage: null }))}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Bild entfernen
                  </button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6 space-y-6">
          {/* Form Section */}
          <div className="rounded-xl bg-light-grey p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-highlight font-bold text-secondary">
                  Formular-Bereich
                </h2>
                <p className="text-sm text-text-color/60">
                  Titel und Beschreibung über dem Kontaktformular
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>

            <div>
              <Label htmlFor="form-title">Titel</Label>
              <Input
                id="form-title"
                value={settings.contact_form_title}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, contact_form_title: e.target.value }))
                }
                placeholder="SIE HABEN FRAGEN?"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="form-description">Beschreibung</Label>
              <Textarea
                id="form-description"
                value={settings.contact_form_description}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact_form_description: e.target.value,
                  }))
                }
                placeholder="Einführungstext über dem Formular..."
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-text-color/50 mt-1">
                Verwenden Sie zwei Zeilenumbrüche für einen neuen Absatz
              </p>
            </div>

            <div>
              <Label htmlFor="maps-embed">Google Maps Embed URL</Label>
              <Input
                id="maps-embed"
                value={settings.google_maps_embed}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, google_maps_embed: e.target.value }))
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="mt-1"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <div>
                <h2 className="font-bold text-text-color">CTA-Bereich (optional)</h2>
                <p className="text-sm text-text-color/60">
                  Schwarzer Abschnitt am Ende der Seite
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>

            {/* Main content: Image (1/3) + Content (2/3) */}
            <div className="flex flex-col md:flex-row">
              {/* Left: CTA Image (1/3) */}
              <div
                onClick={() => setCtaMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[200px] md:min-h-[280px] relative cursor-pointer group bg-text-color/10"
              >
                {settings.contact_cta_image ? (
                  <>
                    <Image
                      src={getImageUrl(settings.contact_cta_image)}
                      alt="CTA Hintergrund"
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
                    <span className="text-sm">Bild hinzufügen (optional)</span>
                  </div>
                )}
              </div>

              {/* Right: Content (2/3) */}
              <div className="w-full md:w-2/3 p-5 space-y-4">
                <div>
                  <Label className="text-xs text-text-color/50">Titel</Label>
                  <Input
                    value={settings.contact_cta_title}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, contact_cta_title: e.target.value }))
                    }
                    placeholder="CTA Überschrift"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Beschreibung</Label>
                  <Textarea
                    value={settings.contact_cta_description}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        contact_cta_description: e.target.value,
                      }))
                    }
                    placeholder="CTA Beschreibungstext..."
                    rows={5}
                    className="mt-1"
                  />
                </div>

                {settings.contact_cta_image && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, contact_cta_image: '' }))
                    }
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Bild entfernen
                  </button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Media Modals */}
      <MediaSelectorModal
        isOpen={heroMediaModalOpen}
        onClose={() => setHeroMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setHeader((prev) => ({ ...prev, backgroundImage: selectedMedia.url }))
        }}
        title="Hero-Hintergrundbild auswählen"
      />

      <MediaSelectorModal
        isOpen={ctaMediaModalOpen}
        onClose={() => setCtaMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, contact_cta_image: selectedMedia.url }))
        }}
        title="CTA-Hintergrundbild auswählen"
      />
    </div>
  )
}
