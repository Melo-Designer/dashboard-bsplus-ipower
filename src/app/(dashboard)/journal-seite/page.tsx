'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/Switch'

interface PageHeader {
  id?: string
  title: string
  description: string | null
  backgroundImage: string | null
  overlayColor: string | null
  textColor: string | null
}

interface JournalSettings {
  // ===== ARCHIVE PAGE (Alle Beiträge) =====
  // SectionTextImage settings
  journal_text_image_active: boolean
  journal_text_image_title: string
  journal_text_image_content: string
  journal_text_image_image: string
  journal_text_image_image_alt: string
  journal_text_image_align: string
  journal_text_image_mode: string
  journal_text_image_button_text: string
  journal_text_image_button_link: string
  journal_text_image_button_style: string
  // Archive SectionBlack (CTA) settings
  journal_cta_active: boolean
  journal_cta_title: string
  journal_cta_content: string
  journal_cta_image: string
  journal_cta_button1_text: string
  journal_cta_button1_link: string
  journal_cta_button1_style: string
  journal_cta_button2_text: string
  journal_cta_button2_link: string
  journal_cta_button2_style: string

  // ===== SINGLE POST PAGE (Einzelner Beitrag) =====
  journal_single_cta_active: boolean
  journal_single_cta_title: string
  journal_single_cta_content: string
  journal_single_cta_image: string
  journal_single_cta_button1_text: string
  journal_single_cta_button1_link: string
  journal_single_cta_button1_style: string
  journal_single_cta_button2_text: string
  journal_single_cta_button2_link: string
  journal_single_cta_button2_style: string
}

export default function JournalSeitePage() {
  const { website, getDisplayName, isLoaded } = useWebsite()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Hero state
  const [header, setHeader] = useState<PageHeader>({
    title: 'Journal',
    description: null,
    backgroundImage: null,
    overlayColor: null,
    textColor: 'light',
  })
  const [heroMediaModalOpen, setHeroMediaModalOpen] = useState(false)

  // Section settings state
  const [settings, setSettings] = useState<JournalSettings>({
    // Archive - SectionTextImage
    journal_text_image_active: false,
    journal_text_image_title: '',
    journal_text_image_content: '',
    journal_text_image_image: '',
    journal_text_image_image_alt: '',
    journal_text_image_align: 'left',
    journal_text_image_mode: 'light',
    journal_text_image_button_text: '',
    journal_text_image_button_link: '',
    journal_text_image_button_style: 'secondary',
    // Archive - SectionBlack (CTA)
    journal_cta_active: false,
    journal_cta_title: '',
    journal_cta_content: '',
    journal_cta_image: '',
    journal_cta_button1_text: '',
    journal_cta_button1_link: '',
    journal_cta_button1_style: 'primary',
    journal_cta_button2_text: '',
    journal_cta_button2_link: '',
    journal_cta_button2_style: 'secondary',
    // Single Post - CTA
    journal_single_cta_active: true,
    journal_single_cta_title: '',
    journal_single_cta_content: '',
    journal_single_cta_image: '',
    journal_single_cta_button1_text: '',
    journal_single_cta_button1_link: '',
    journal_single_cta_button1_style: 'primary',
    journal_single_cta_button2_text: '',
    journal_single_cta_button2_link: '',
    journal_single_cta_button2_style: 'secondary',
  })
  const [textImageMediaModalOpen, setTextImageMediaModalOpen] = useState(false)
  const [archiveCtaMediaModalOpen, setArchiveCtaMediaModalOpen] = useState(false)
  const [singleCtaMediaModalOpen, setSingleCtaMediaModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return
      setIsLoading(true)

      try {
        // Fetch header
        const headerRes = await fetch(`/api/headers/journal?website=${website}`)
        if (headerRes.ok) {
          const headerData = await headerRes.json()
          if (headerData) {
            setHeader({
              title: headerData.title || 'Journal',
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
            // Archive - SectionTextImage
            journal_text_image_active: s.journal_text_image_active === 'true',
            journal_text_image_title: s.journal_text_image_title || '',
            journal_text_image_content: s.journal_text_image_content || '',
            journal_text_image_image: s.journal_text_image_image || '',
            journal_text_image_image_alt: s.journal_text_image_image_alt || '',
            journal_text_image_align: s.journal_text_image_align || 'left',
            journal_text_image_mode: s.journal_text_image_mode || 'light',
            journal_text_image_button_text: s.journal_text_image_button_text || '',
            journal_text_image_button_link: s.journal_text_image_button_link || '',
            journal_text_image_button_style: s.journal_text_image_button_style || 'secondary',
            // Archive - SectionBlack (CTA)
            journal_cta_active: s.journal_cta_active === 'true',
            journal_cta_title: s.journal_cta_title || '',
            journal_cta_content: s.journal_cta_content || '',
            journal_cta_image: s.journal_cta_image || '',
            journal_cta_button1_text: s.journal_cta_button1_text || '',
            journal_cta_button1_link: s.journal_cta_button1_link || '',
            journal_cta_button1_style: s.journal_cta_button1_style || 'primary',
            journal_cta_button2_text: s.journal_cta_button2_text || '',
            journal_cta_button2_link: s.journal_cta_button2_link || '',
            journal_cta_button2_style: s.journal_cta_button2_style || 'secondary',
            // Single Post - CTA
            journal_single_cta_active: s.journal_single_cta_active !== 'false',
            journal_single_cta_title: s.journal_single_cta_title || '',
            journal_single_cta_content: s.journal_single_cta_content || '',
            journal_single_cta_image: s.journal_single_cta_image || '',
            journal_single_cta_button1_text: s.journal_single_cta_button1_text || '',
            journal_single_cta_button1_link: s.journal_single_cta_button1_link || '',
            journal_single_cta_button1_style: s.journal_single_cta_button1_style || 'primary',
            journal_single_cta_button2_text: s.journal_single_cta_button2_text || '',
            journal_single_cta_button2_link: s.journal_single_cta_button2_link || '',
            journal_single_cta_button2_style: s.journal_single_cta_button2_style || 'secondary',
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
      const res = await fetch('/api/headers/journal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          title: header.title,
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
            // Archive - SectionTextImage
            journal_text_image_active: settings.journal_text_image_active ? 'true' : 'false',
            journal_text_image_title: settings.journal_text_image_title,
            journal_text_image_content: settings.journal_text_image_content,
            journal_text_image_image: settings.journal_text_image_image,
            journal_text_image_image_alt: settings.journal_text_image_image_alt,
            journal_text_image_align: settings.journal_text_image_align,
            journal_text_image_mode: settings.journal_text_image_mode,
            journal_text_image_button_text: settings.journal_text_image_button_text,
            journal_text_image_button_link: settings.journal_text_image_button_link,
            journal_text_image_button_style: settings.journal_text_image_button_style,
            // Archive - SectionBlack (CTA)
            journal_cta_active: settings.journal_cta_active ? 'true' : 'false',
            journal_cta_title: settings.journal_cta_title,
            journal_cta_content: settings.journal_cta_content,
            journal_cta_image: settings.journal_cta_image,
            journal_cta_button1_text: settings.journal_cta_button1_text,
            journal_cta_button1_link: settings.journal_cta_button1_link,
            journal_cta_button1_style: settings.journal_cta_button1_style,
            journal_cta_button2_text: settings.journal_cta_button2_text,
            journal_cta_button2_link: settings.journal_cta_button2_link,
            journal_cta_button2_style: settings.journal_cta_button2_style,
            // Single Post - CTA
            journal_single_cta_active: settings.journal_single_cta_active ? 'true' : 'false',
            journal_single_cta_title: settings.journal_single_cta_title,
            journal_single_cta_content: settings.journal_single_cta_content,
            journal_single_cta_image: settings.journal_single_cta_image,
            journal_single_cta_button1_text: settings.journal_single_cta_button1_text,
            journal_single_cta_button1_link: settings.journal_single_cta_button1_link,
            journal_single_cta_button1_style: settings.journal_single_cta_button1_style,
            journal_single_cta_button2_text: settings.journal_single_cta_button2_text,
            journal_single_cta_button2_link: settings.journal_single_cta_button2_link,
            journal_single_cta_button2_style: settings.journal_single_cta_button2_style,
          },
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Einstellungen gespeichert')
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
        <h1 className="text-2xl text-secondary">Journal-Seite</h1>
        <p className="text-text-color/60 mt-1">
          Verwalten Sie die Inhalte der Journal-Seiten für {getDisplayName()}
        </p>
      </div>

      <Tabs defaultValue="archive" className="w-full">
        <TabsList>
          <TabsTrigger value="archive">Alle Beiträge</TabsTrigger>
          <TabsTrigger value="single">Einzelner Beitrag</TabsTrigger>
        </TabsList>

        {/* ===== ARCHIVE TAB (Alle Beiträge) ===== */}
        <TabsContent value="archive" className="mt-6 space-y-6">
          {/* Hero Section */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
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

            <div className="flex flex-col md:flex-row">
              <div
                onClick={() => setHeroMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[250px] md:min-h-[300px] relative cursor-pointer group bg-text-color/10"
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

              <div className="w-full md:w-2/3 p-5 space-y-4">
                <div>
                  <Label className="text-xs text-text-color/50">Titel *</Label>
                  <Input
                    value={header.title}
                    onChange={(e) => setHeader((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Journal"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Beschreibung</Label>
                  <Textarea
                    value={header.description || ''}
                    onChange={(e) => setHeader((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Kurze Beschreibung"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Textfarbe</Label>
                  <Select
                    value={header.textColor || 'light'}
                    onValueChange={(value) => setHeader((prev) => ({ ...prev, textColor: value }))}
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

          {/* SectionTextImage */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">Text + Bild Abschnitt</h2>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={settings.journal_text_image_active}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, journal_text_image_active: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              <div
                onClick={() => setTextImageMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[200px] md:min-h-[350px] relative cursor-pointer group bg-text-color/10"
              >
                {settings.journal_text_image_image ? (
                  <>
                    <Image src={getImageUrl(settings.journal_text_image_image)} alt="Abschnitt Bild" fill className="object-cover" />
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

              <div className="w-full md:w-2/3 p-5 space-y-4">
                <div>
                  <Label className="text-xs text-text-color/50">Titel</Label>
                  <Input
                    value={settings.journal_text_image_title}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_text_image_title: e.target.value }))}
                    placeholder="Abschnitt Titel"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Inhalt</Label>
                  <Textarea
                    value={settings.journal_text_image_content}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_text_image_content: e.target.value }))}
                    placeholder="Text für diesen Abschnitt..."
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-text-color/50 mt-1">HTML-Tags wie &lt;strong&gt; und &lt;br&gt; werden unterstützt</p>
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Bild Alt-Text</Label>
                  <Input
                    value={settings.journal_text_image_image_alt}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_text_image_image_alt: e.target.value }))}
                    placeholder="Beschreibung des Bildes für Barrierefreiheit"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-text-color/50">Ausrichtung</Label>
                    <Select
                      value={settings.journal_text_image_align}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_text_image_align: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Bild links</SelectItem>
                        <SelectItem value="right">Bild rechts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Modus</Label>
                    <Select
                      value={settings.journal_text_image_mode}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_text_image_mode: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Hell</SelectItem>
                        <SelectItem value="dark">Dunkel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-text-color/50">Button Text</Label>
                    <Input
                      value={settings.journal_text_image_button_text}
                      onChange={(e) => setSettings((prev) => ({ ...prev, journal_text_image_button_text: e.target.value }))}
                      placeholder="z.B. Mehr erfahren"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Button Link</Label>
                    <Input
                      value={settings.journal_text_image_button_link}
                      onChange={(e) => setSettings((prev) => ({ ...prev, journal_text_image_button_link: e.target.value }))}
                      placeholder="z.B. /ueber-uns"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Button Stil</Label>
                    <Select
                      value={settings.journal_text_image_button_style}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_text_image_button_style: value }))}
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

                {settings.journal_text_image_image && (
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, journal_text_image_image: '' }))}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Bild entfernen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Archive SectionBlack (CTA) */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">CTA-Bereich (Dunkel)</h2>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={settings.journal_cta_active}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, journal_cta_active: checked }))}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              <div
                onClick={() => setArchiveCtaMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[200px] md:min-h-[300px] relative cursor-pointer group bg-text-color/10"
              >
                {settings.journal_cta_image ? (
                  <>
                    <Image src={getImageUrl(settings.journal_cta_image)} alt="CTA Bild" fill className="object-cover" />
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

              <div className="w-full md:w-2/3 p-5 space-y-4">
                <div>
                  <Label className="text-xs text-text-color/50">Titel</Label>
                  <Input
                    value={settings.journal_cta_title}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_cta_title: e.target.value }))}
                    placeholder="CTA Überschrift"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Inhalt</Label>
                  <Textarea
                    value={settings.journal_cta_content}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_cta_content: e.target.value }))}
                    placeholder="CTA Beschreibungstext..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-text-color/70 mb-2">Button 1</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Text</Label>
                      <Input
                        value={settings.journal_cta_button1_text}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_cta_button1_text: e.target.value }))}
                        placeholder="z.B. Termin vereinbaren"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Link</Label>
                      <Input
                        value={settings.journal_cta_button1_link}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_cta_button1_link: e.target.value }))}
                        placeholder="z.B. /kontakt"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Stil</Label>
                      <Select
                        value={settings.journal_cta_button1_style}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_cta_button1_style: value }))}
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
                </div>

                <div>
                  <p className="text-xs font-medium text-text-color/70 mb-2">Button 2</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Text</Label>
                      <Input
                        value={settings.journal_cta_button2_text}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_cta_button2_text: e.target.value }))}
                        placeholder="z.B. Angebot holen"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Link</Label>
                      <Input
                        value={settings.journal_cta_button2_link}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_cta_button2_link: e.target.value }))}
                        placeholder="z.B. /angebot"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Stil</Label>
                      <Select
                        value={settings.journal_cta_button2_style}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_cta_button2_style: value }))}
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
                </div>

                {settings.journal_cta_image && (
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, journal_cta_image: '' }))}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Bild entfernen
                  </button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ===== SINGLE POST TAB (Einzelner Beitrag) ===== */}
        <TabsContent value="single" className="mt-6 space-y-6">
          {/* Single Post CTA Section */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">CTA-Bereich (Dunkel)</h2>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={settings.journal_single_cta_active}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, journal_single_cta_active: checked }))}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              <div
                onClick={() => setSingleCtaMediaModalOpen(true)}
                className="w-full md:w-1/3 min-h-[200px] md:min-h-[300px] relative cursor-pointer group bg-text-color/10"
              >
                {settings.journal_single_cta_image ? (
                  <>
                    <Image src={getImageUrl(settings.journal_single_cta_image)} alt="CTA Bild" fill className="object-cover" />
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

              <div className="w-full md:w-2/3 p-5 space-y-4">
                <div>
                  <Label className="text-xs text-text-color/50">Titel</Label>
                  <Input
                    value={settings.journal_single_cta_title}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_single_cta_title: e.target.value }))}
                    placeholder="CTA Überschrift"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Inhalt</Label>
                  <Textarea
                    value={settings.journal_single_cta_content}
                    onChange={(e) => setSettings((prev) => ({ ...prev, journal_single_cta_content: e.target.value }))}
                    placeholder="CTA Beschreibungstext..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-text-color/70 mb-2">Button 1</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Text</Label>
                      <Input
                        value={settings.journal_single_cta_button1_text}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_single_cta_button1_text: e.target.value }))}
                        placeholder="z.B. Termin vereinbaren"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Link</Label>
                      <Input
                        value={settings.journal_single_cta_button1_link}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_single_cta_button1_link: e.target.value }))}
                        placeholder="z.B. /kontakt"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Stil</Label>
                      <Select
                        value={settings.journal_single_cta_button1_style}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_single_cta_button1_style: value }))}
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
                </div>

                <div>
                  <p className="text-xs font-medium text-text-color/70 mb-2">Button 2</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Text</Label>
                      <Input
                        value={settings.journal_single_cta_button2_text}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_single_cta_button2_text: e.target.value }))}
                        placeholder="z.B. Angebot holen"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Link</Label>
                      <Input
                        value={settings.journal_single_cta_button2_link}
                        onChange={(e) => setSettings((prev) => ({ ...prev, journal_single_cta_button2_link: e.target.value }))}
                        placeholder="z.B. /angebot"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Stil</Label>
                      <Select
                        value={settings.journal_single_cta_button2_style}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, journal_single_cta_button2_style: value }))}
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
                </div>

                {settings.journal_single_cta_image && (
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, journal_single_cta_image: '' }))}
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
        isOpen={textImageMediaModalOpen}
        onClose={() => setTextImageMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, journal_text_image_image: selectedMedia.url }))
        }}
        title="Abschnitt-Bild auswählen"
      />

      <MediaSelectorModal
        isOpen={archiveCtaMediaModalOpen}
        onClose={() => setArchiveCtaMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, journal_cta_image: selectedMedia.url }))
        }}
        title="CTA-Bild auswählen (Alle Beiträge)"
      />

      <MediaSelectorModal
        isOpen={singleCtaMediaModalOpen}
        onClose={() => setSingleCtaMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, journal_single_cta_image: selectedMedia.url }))
        }}
        title="CTA-Bild auswählen (Einzelner Beitrag)"
      />
    </div>
  )
}
