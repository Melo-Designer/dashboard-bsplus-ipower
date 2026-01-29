'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { TripleSectionEditor } from '@/components/dashboard/pages/section-editors/TripleSectionEditor'
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
import type { ParsedPageSection, TripleItem } from '@/types'

interface PageHeader {
  id?: string
  title: string
  description: string | null
  backgroundImage: string | null
  overlayColor: string | null
  textColor: string | null
}

interface KarriereSettings {
  // Archive page - Hero button
  karriere_hero_button_text: string
  karriere_hero_button_link: string
  karriere_section_hero_color: string
  // Archive page - Benefits (SectionTriple) - OPTIONAL
  karriere_benefits_active: string
  karriere_benefit_1_title: string
  karriere_benefit_1_content: string
  karriere_benefit_2_title: string
  karriere_benefit_2_content: string
  karriere_benefit_3_title: string
  karriere_benefit_3_content: string
  // Archive page - Jobs section (REQUIRED)
  karriere_jobs_title: string
  // Archive page - Empty state (REQUIRED)
  karriere_empty_title: string
  karriere_empty_description: string
  karriere_empty_button_text: string
  karriere_empty_button_link: string
  // Archive page - About section (SectionTextImage) - OPTIONAL
  karriere_about_active: string
  karriere_about_title: string
  karriere_about_content: string
  karriere_about_button_text: string
  karriere_about_button_link: string
  karriere_about_image: string
  karriere_about_image_alt: string
  // Archive page - CTA (SectionBlack) - OPTIONAL
  karriere_archive_cta_active: string
  karriere_archive_cta_title: string
  karriere_archive_cta_description: string
  karriere_archive_cta_button1_text: string
  karriere_archive_cta_button1_link: string
  karriere_archive_cta_button2_text: string
  karriere_archive_cta_button2_link: string
  karriere_archive_cta_image: string
  // Single job page - Detail headings (REQUIRED)
  karriere_detail_apply_button: string
  karriere_detail_tasks_title: string
  karriere_detail_profile_title: string
  karriere_detail_benefits_title: string
  karriere_detail_overview_title: string
  // Single job page - Form (REQUIRED)
  karriere_form_title: string
  karriere_form_submit_button: string
  karriere_form_success_message: string
  karriere_form_error_message: string
  // Single job page - CTA (SectionBlack) - OPTIONAL
  karriere_single_cta_active: string
  karriere_single_cta_title: string
  karriere_single_cta_description: string
  karriere_single_cta_button1_text: string
  karriere_single_cta_button1_link: string
  karriere_single_cta_button2_text: string
  karriere_single_cta_button2_link: string
  karriere_single_cta_image: string
}

const defaultSettings: KarriereSettings = {
  karriere_hero_button_text: '',
  karriere_hero_button_link: '',
  karriere_section_hero_color: 'primary',
  karriere_benefits_active: 'true',
  karriere_benefit_1_title: '',
  karriere_benefit_1_content: '',
  karriere_benefit_2_title: '',
  karriere_benefit_2_content: '',
  karriere_benefit_3_title: '',
  karriere_benefit_3_content: '',
  karriere_jobs_title: '',
  karriere_empty_title: '',
  karriere_empty_description: '',
  karriere_empty_button_text: '',
  karriere_empty_button_link: '',
  karriere_about_active: 'true',
  karriere_about_title: '',
  karriere_about_content: '',
  karriere_about_button_text: '',
  karriere_about_button_link: '',
  karriere_about_image: '',
  karriere_about_image_alt: '',
  karriere_archive_cta_active: 'true',
  karriere_archive_cta_title: '',
  karriere_archive_cta_description: '',
  karriere_archive_cta_button1_text: '',
  karriere_archive_cta_button1_link: '',
  karriere_archive_cta_button2_text: '',
  karriere_archive_cta_button2_link: '',
  karriere_archive_cta_image: '',
  karriere_detail_apply_button: '',
  karriere_detail_tasks_title: '',
  karriere_detail_profile_title: '',
  karriere_detail_benefits_title: '',
  karriere_detail_overview_title: '',
  karriere_form_title: '',
  karriere_form_submit_button: '',
  karriere_form_success_message: '',
  karriere_form_error_message: '',
  karriere_single_cta_active: 'true',
  karriere_single_cta_title: '',
  karriere_single_cta_description: '',
  karriere_single_cta_button1_text: '',
  karriere_single_cta_button1_link: '',
  karriere_single_cta_button2_text: '',
  karriere_single_cta_button2_link: '',
  karriere_single_cta_image: '',
}

// Helper: Convert settings to ParsedPageSection for TripleSectionEditor
function settingsToTripleSection(settings: KarriereSettings): ParsedPageSection {
  return {
    id: 'benefits',
    pageId: '',
    type: 'triple',
    title: null,
    subtitle: null,
    content: null,
    imageUrl: null,
    imageAlt: null,
    imageAlign: null,
    items: [
      { title: settings.karriere_benefit_1_title, content: settings.karriere_benefit_1_content },
      { title: settings.karriere_benefit_2_title, content: settings.karriere_benefit_2_content },
      { title: settings.karriere_benefit_3_title, content: settings.karriere_benefit_3_content },
    ],
    buttons: [],
    cards: [],
    stats: [],
    backgroundImage: null,
    backgroundColor: null,
    textColor: null,
    sortOrder: 0,
    active: settings.karriere_benefits_active === 'true',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Helper: Convert TripleSectionEditor output back to settings
function tripleToSettings(items: TripleItem[]): Partial<KarriereSettings> {
  return {
    karriere_benefit_1_title: items[0]?.title || '',
    karriere_benefit_1_content: items[0]?.content || '',
    karriere_benefit_2_title: items[1]?.title || '',
    karriere_benefit_2_content: items[1]?.content || '',
    karriere_benefit_3_title: items[2]?.title || '',
    karriere_benefit_3_content: items[2]?.content || '',
  }
}

export default function KarriereSettingsPage() {
  const { website, getDisplayName, isLoaded } = useWebsite()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Hero state (PageHeader)
  const [header, setHeader] = useState<PageHeader>({
    title: 'Karriere',
    description: null,
    backgroundImage: null,
    overlayColor: null,
    textColor: 'light',
  })
  const [heroMediaModalOpen, setHeroMediaModalOpen] = useState(false)

  // Settings state
  const [settings, setSettings] = useState<KarriereSettings>(defaultSettings)

  // Editing states (for inline editors)
  const [editingBenefits, setEditingBenefits] = useState(false)

  // Media modals
  const [aboutMediaModalOpen, setAboutMediaModalOpen] = useState(false)
  const [archiveCtaMediaModalOpen, setArchiveCtaMediaModalOpen] = useState(false)
  const [singleCtaMediaModalOpen, setSingleCtaMediaModalOpen] = useState(false)

  // Track changes for save buttons
  const [heroHasChanges, setHeroHasChanges] = useState(false)
  const [jobsHasChanges, setJobsHasChanges] = useState(false)
  const [aboutHasChanges, setAboutHasChanges] = useState(false)
  const [headingsHasChanges, setHeadingsHasChanges] = useState(false)
  const [formHasChanges, setFormHasChanges] = useState(false)
  const [archiveCtaHasChanges, setArchiveCtaHasChanges] = useState(false)
  const [singleCtaHasChanges, setSingleCtaHasChanges] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return
      setIsLoading(true)

      try {
        // Fetch header
        const headerRes = await fetch(`/api/headers/karriere?website=${website}`)
        if (headerRes.ok) {
          const headerData = await headerRes.json()
          if (headerData) {
            setHeader({
              title: headerData.title || 'Karriere',
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
            karriere_hero_button_text: s.karriere_hero_button_text || '',
            karriere_hero_button_link: s.karriere_hero_button_link || '',
            karriere_section_hero_color: s.karriere_section_hero_color || 'primary',
            karriere_benefits_active: s.karriere_benefits_active ?? 'true',
            karriere_benefit_1_title: s.karriere_benefit_1_title || '',
            karriere_benefit_1_content: s.karriere_benefit_1_content || '',
            karriere_benefit_2_title: s.karriere_benefit_2_title || '',
            karriere_benefit_2_content: s.karriere_benefit_2_content || '',
            karriere_benefit_3_title: s.karriere_benefit_3_title || '',
            karriere_benefit_3_content: s.karriere_benefit_3_content || '',
            karriere_jobs_title: s.karriere_jobs_title || '',
            karriere_empty_title: s.karriere_empty_title || '',
            karriere_empty_description: s.karriere_empty_description || '',
            karriere_empty_button_text: s.karriere_empty_button_text || '',
            karriere_empty_button_link: s.karriere_empty_button_link || '',
            karriere_about_active: s.karriere_about_active ?? 'true',
            karriere_about_title: s.karriere_about_title || '',
            karriere_about_content: s.karriere_about_content || '',
            karriere_about_button_text: s.karriere_about_button_text || '',
            karriere_about_button_link: s.karriere_about_button_link || '',
            karriere_about_image: s.karriere_about_image || '',
            karriere_about_image_alt: s.karriere_about_image_alt || '',
            karriere_archive_cta_active: s.karriere_archive_cta_active ?? 'true',
            karriere_archive_cta_title: s.karriere_archive_cta_title || '',
            karriere_archive_cta_description: s.karriere_archive_cta_description || '',
            karriere_archive_cta_button1_text: s.karriere_archive_cta_button1_text || '',
            karriere_archive_cta_button1_link: s.karriere_archive_cta_button1_link || '',
            karriere_archive_cta_button2_text: s.karriere_archive_cta_button2_text || '',
            karriere_archive_cta_button2_link: s.karriere_archive_cta_button2_link || '',
            karriere_archive_cta_image: s.karriere_archive_cta_image || '',
            karriere_detail_apply_button: s.karriere_detail_apply_button || '',
            karriere_detail_tasks_title: s.karriere_detail_tasks_title || '',
            karriere_detail_profile_title: s.karriere_detail_profile_title || '',
            karriere_detail_benefits_title: s.karriere_detail_benefits_title || '',
            karriere_detail_overview_title: s.karriere_detail_overview_title || '',
            karriere_form_title: s.karriere_form_title || '',
            karriere_form_submit_button: s.karriere_form_submit_button || '',
            karriere_form_success_message: s.karriere_form_success_message || '',
            karriere_form_error_message: s.karriere_form_error_message || '',
            karriere_single_cta_active: s.karriere_single_cta_active ?? 'true',
            karriere_single_cta_title: s.karriere_single_cta_title || '',
            karriere_single_cta_description: s.karriere_single_cta_description || '',
            karriere_single_cta_button1_text: s.karriere_single_cta_button1_text || '',
            karriere_single_cta_button1_link: s.karriere_single_cta_button1_link || '',
            karriere_single_cta_button2_text: s.karriere_single_cta_button2_text || '',
            karriere_single_cta_button2_link: s.karriere_single_cta_button2_link || '',
            karriere_single_cta_image: s.karriere_single_cta_image || '',
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

  const saveSettings = async (updates: Partial<KarriereSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website, settings: updates }),
      })
      if (!res.ok) throw new Error()
      setSettings((prev) => ({ ...prev, ...updates }))
      return true
    } catch {
      toast.error('Fehler beim Speichern')
      return false
    }
  }

  const handleSaveHero = async () => {
    if (!header.title.trim()) {
      toast.error('Titel ist erforderlich')
      return
    }

    setIsSaving(true)
    try {
      // Save header
      const headerRes = await fetch('/api/headers/karriere', {
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

      if (!headerRes.ok) throw new Error()

      // Save hero button settings
      await saveSettings({
        karriere_hero_button_text: settings.karriere_hero_button_text,
        karriere_hero_button_link: settings.karriere_hero_button_link,
        karriere_section_hero_color: settings.karriere_section_hero_color,
      })

      toast.success('Hero-Bereich gespeichert')
      setHeroHasChanges(false)
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (key: keyof KarriereSettings) => {
    const newValue = settings[key] === 'true' ? 'false' : 'true'
    const success = await saveSettings({ [key]: newValue })
    if (success) {
      toast.success(newValue === 'true' ? 'Abschnitt aktiviert' : 'Abschnitt deaktiviert')
    }
  }

  // Benefits section handlers
  const handleSaveBenefits = async (updates: Partial<ParsedPageSection>) => {
    setIsSaving(true)
    const settingsUpdates = tripleToSettings(updates.items || [])
    const success = await saveSettings(settingsUpdates)
    if (success) {
      toast.success('Vorteile-Bereich gespeichert')
      setEditingBenefits(false)
    }
    setIsSaving(false)
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

  const benefitsActive = settings.karriere_benefits_active === 'true'
  const aboutActive = settings.karriere_about_active === 'true'
  const archiveCtaActive = settings.karriere_archive_cta_active === 'true'
  const singleCtaActive = settings.karriere_single_cta_active === 'true'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-secondary">Karriereseite</h1>
        <p className="text-text-color/60 mt-1">
          Verwalten Sie die Inhalte der Karriereseiten für {getDisplayName()}
        </p>
      </div>

      <Tabs defaultValue="archive" className="w-full">
        <TabsList>
          <TabsTrigger value="archive">Stellenübersicht</TabsTrigger>
          <TabsTrigger value="single">Einzelstelle</TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* ARCHIVE PAGE TAB                            */}
        {/* ============================================ */}
        <TabsContent value="archive" className="mt-6 space-y-6">
          {/* Hero Section - INLINE EDITING (Image 1/3 + Content 2/3) */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-color">Hero-Bereich</h2>
                <Badge variant="secondary" className="text-xs">Pflicht</Badge>
              </div>
              {heroHasChanges && (
                <Button variant="secondary" onClick={handleSaveHero} disabled={isSaving}>
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              )}
            </div>

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
                    <span className="text-sm">Hintergrundbild hinzufügen</span>
                  </div>
                )}
              </div>

              {/* Right: Content (2/3) */}
              <div className="w-full md:w-2/3 p-5 space-y-4">
                <div>
                  <Label className="text-xs text-text-color/50">Titel *</Label>
                  <Input
                    value={header.title}
                    onChange={(e) => {
                      setHeader((prev) => ({ ...prev, title: e.target.value }))
                      setHeroHasChanges(true)
                    }}
                    placeholder="Karriere bei uns: Ihre Zukunft beginnt hier"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Beschreibung</Label>
                  <Textarea
                    value={header.description || ''}
                    onChange={(e) => {
                      setHeader((prev) => ({ ...prev, description: e.target.value }))
                      setHeroHasChanges(true)
                    }}
                    placeholder="Bei uns setzen wir auf Innovation..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-text-color/50">Button-Text</Label>
                    <Input
                      value={settings.karriere_hero_button_text}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_hero_button_text: e.target.value }))
                        setHeroHasChanges(true)
                      }}
                      placeholder="Stelle finden"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Button-Link</Label>
                    <Input
                      value={settings.karriere_hero_button_link}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_hero_button_link: e.target.value }))
                        setHeroHasChanges(true)
                      }}
                      placeholder="#stellen"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-text-color/50">Textfarbe</Label>
                    <Select
                      value={header.textColor || 'light'}
                      onValueChange={(value) => {
                        setHeader((prev) => ({ ...prev, textColor: value }))
                        setHeroHasChanges(true)
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Hell (weiß)</SelectItem>
                        <SelectItem value="dark">Dunkel (schwarz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Akzentfarbe</Label>
                    <Select
                      value={settings.karriere_section_hero_color || 'primary'}
                      onValueChange={(value) => {
                        setSettings((prev) => ({ ...prev, karriere_section_hero_color: value }))
                        setHeroHasChanges(true)
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primär (Rot)</SelectItem>
                        <SelectItem value="secondary">Sekundär (Blau)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section - Using TripleSectionEditor */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">Vorteile (3 Spalten)</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={benefitsActive}
                  onCheckedChange={() => handleToggleActive('karriere_benefits_active')}
                />
              </div>
            </div>

            {benefitsActive && (
              <div className="p-5">
                {editingBenefits ? (
                  <TripleSectionEditor
                    section={settingsToTripleSection(settings)}
                    onSave={handleSaveBenefits}
                    onCancel={() => setEditingBenefits(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((num) => {
                        const title = settings[`karriere_benefit_${num}_title` as keyof KarriereSettings]
                        const content = settings[`karriere_benefit_${num}_content` as keyof KarriereSettings]
                        return (
                          <div key={num} className="p-4 rounded-lg bg-white">
                            <p className="font-medium text-text-color">{title || `Spalte ${num}`}</p>
                            {content && (
                              <p className="text-sm text-text-color/60 mt-1 line-clamp-3">{content}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="secondary" onClick={() => setEditingBenefits(true)}>
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Jobs Section - INLINE EDITING */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-color">Stellenangebote</h2>
                <Badge variant="secondary" className="text-xs">Pflicht</Badge>
              </div>
              {jobsHasChanges && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    setIsSaving(true)
                    const success = await saveSettings({
                      karriere_jobs_title: settings.karriere_jobs_title,
                      karriere_empty_title: settings.karriere_empty_title,
                      karriere_empty_description: settings.karriere_empty_description,
                      karriere_empty_button_text: settings.karriere_empty_button_text,
                      karriere_empty_button_link: settings.karriere_empty_button_link,
                    })
                    if (success) {
                      toast.success('Stellenangebote gespeichert')
                      setJobsHasChanges(false)
                    }
                    setIsSaving(false)
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <Label className="text-xs text-text-color/50">Bereichstitel</Label>
                <Input
                  value={settings.karriere_jobs_title}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, karriere_jobs_title: e.target.value }))
                    setJobsHasChanges(true)
                  }}
                  placeholder="Offene Stellen"
                  className="mt-1"
                />
              </div>

              <div className="p-4 rounded-lg bg-white space-y-4">
                <h3 className="font-medium text-text-color text-sm">Wenn keine Stellen vorhanden</h3>

                <div>
                  <Label className="text-xs text-text-color/50">Titel</Label>
                  <Input
                    value={settings.karriere_empty_title}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_empty_title: e.target.value }))
                      setJobsHasChanges(true)
                    }}
                    placeholder="Aktuell keine offenen Stellen"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-text-color/50">Beschreibung</Label>
                  <Textarea
                    value={settings.karriere_empty_description}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_empty_description: e.target.value }))
                      setJobsHasChanges(true)
                    }}
                    placeholder="Derzeit haben wir keine offenen Positionen..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-text-color/50">Button-Text</Label>
                    <Input
                      value={settings.karriere_empty_button_text}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_empty_button_text: e.target.value }))
                        setJobsHasChanges(true)
                      }}
                      placeholder="Initiativbewerbung senden"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-text-color/50">Button-Link</Label>
                    <Input
                      value={settings.karriere_empty_button_link}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_empty_button_link: e.target.value }))
                        setJobsHasChanges(true)
                      }}
                      placeholder="/kontakt"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section - INLINE EDITING (Image 1/3 + Content 2/3) */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">Über uns</h2>
              <div className="flex items-center gap-3">
                {aboutHasChanges && aboutActive && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setIsSaving(true)
                      const success = await saveSettings({
                        karriere_about_title: settings.karriere_about_title,
                        karriere_about_content: settings.karriere_about_content,
                        karriere_about_button_text: settings.karriere_about_button_text,
                        karriere_about_button_link: settings.karriere_about_button_link,
                        karriere_about_image: settings.karriere_about_image,
                        karriere_about_image_alt: settings.karriere_about_image_alt,
                      })
                      if (success) {
                        toast.success('Über uns-Bereich gespeichert')
                        setAboutHasChanges(false)
                      }
                      setIsSaving(false)
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Speichern...' : 'Speichern'}
                  </Button>
                )}
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={aboutActive}
                  onCheckedChange={() => handleToggleActive('karriere_about_active')}
                />
              </div>
            </div>

            {aboutActive && (
              <div className="flex flex-col md:flex-row">
                {/* Left: Image (1/3) */}
                <div
                  onClick={() => setAboutMediaModalOpen(true)}
                  className="w-full md:w-1/3 min-h-[250px] md:min-h-[350px] relative cursor-pointer group bg-text-color/10"
                >
                  {settings.karriere_about_image ? (
                    <>
                      <Image
                        src={getImageUrl(settings.karriere_about_image)}
                        alt={settings.karriere_about_image_alt || 'Über uns'}
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
                    <Label className="text-xs text-text-color/50">Titel</Label>
                    <Input
                      value={settings.karriere_about_title}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_about_title: e.target.value }))
                        setAboutHasChanges(true)
                      }}
                      placeholder="Über uns"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-text-color/50">Inhalt</Label>
                    <Textarea
                      value={settings.karriere_about_content}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_about_content: e.target.value }))
                        setAboutHasChanges(true)
                      }}
                      placeholder="Die Zukunft der Energie ist vernetzt..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Button-Text</Label>
                      <Input
                        value={settings.karriere_about_button_text}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_about_button_text: e.target.value }))
                          setAboutHasChanges(true)
                        }}
                        placeholder="Mehr über uns"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Button-Link</Label>
                      <Input
                        value={settings.karriere_about_button_link}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_about_button_link: e.target.value }))
                          setAboutHasChanges(true)
                        }}
                        placeholder="/ueber-uns"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-text-color/50">Bild Alt-Text</Label>
                    <Input
                      value={settings.karriere_about_image_alt}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_about_image_alt: e.target.value }))
                        setAboutHasChanges(true)
                      }}
                      placeholder="Unser Team"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Archive CTA - INLINE EDITING (Image 1/3 + Content 2/3) */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">CTA-Bereich (Dunkel)</h2>
              <div className="flex items-center gap-3">
                {archiveCtaHasChanges && archiveCtaActive && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setIsSaving(true)
                      const success = await saveSettings({
                        karriere_archive_cta_title: settings.karriere_archive_cta_title,
                        karriere_archive_cta_description: settings.karriere_archive_cta_description,
                        karriere_archive_cta_image: settings.karriere_archive_cta_image,
                        karriere_archive_cta_button1_text: settings.karriere_archive_cta_button1_text,
                        karriere_archive_cta_button1_link: settings.karriere_archive_cta_button1_link,
                        karriere_archive_cta_button2_text: settings.karriere_archive_cta_button2_text,
                        karriere_archive_cta_button2_link: settings.karriere_archive_cta_button2_link,
                      })
                      if (success) {
                        toast.success('CTA-Bereich gespeichert')
                        setArchiveCtaHasChanges(false)
                      }
                      setIsSaving(false)
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Speichern...' : 'Speichern'}
                  </Button>
                )}
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={archiveCtaActive}
                  onCheckedChange={() => handleToggleActive('karriere_archive_cta_active')}
                />
              </div>
            </div>

            {archiveCtaActive && (
              <div className="flex flex-col md:flex-row">
                {/* Left: CTA Image (1/3) */}
                <div
                  onClick={() => setArchiveCtaMediaModalOpen(true)}
                  className="w-full md:w-1/3 min-h-[200px] md:min-h-[280px] relative cursor-pointer group bg-text-color/10"
                >
                  {settings.karriere_archive_cta_image ? (
                    <>
                      <Image
                        src={getImageUrl(settings.karriere_archive_cta_image)}
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
                      value={settings.karriere_archive_cta_title}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_archive_cta_title: e.target.value }))
                        setArchiveCtaHasChanges(true)
                      }}
                      placeholder="CTA Überschrift"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-text-color/50">Beschreibung</Label>
                    <Textarea
                      value={settings.karriere_archive_cta_description}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_archive_cta_description: e.target.value }))
                        setArchiveCtaHasChanges(true)
                      }}
                      placeholder="CTA Beschreibungstext..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Button 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Button 1 Text</Label>
                      <Input
                        value={settings.karriere_archive_cta_button1_text}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_archive_cta_button1_text: e.target.value }))
                          setArchiveCtaHasChanges(true)
                        }}
                        placeholder="z.B. Termin vereinbaren"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Button 1 Link</Label>
                      <Input
                        value={settings.karriere_archive_cta_button1_link}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_archive_cta_button1_link: e.target.value }))
                          setArchiveCtaHasChanges(true)
                        }}
                        placeholder="/kontakt"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Button 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Button 2 Text</Label>
                      <Input
                        value={settings.karriere_archive_cta_button2_text}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_archive_cta_button2_text: e.target.value }))
                          setArchiveCtaHasChanges(true)
                        }}
                        placeholder="z.B. Angebot holen"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Button 2 Link</Label>
                      <Input
                        value={settings.karriere_archive_cta_button2_link}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_archive_cta_button2_link: e.target.value }))
                          setArchiveCtaHasChanges(true)
                        }}
                        placeholder="/kontakt"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {settings.karriere_archive_cta_image && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, karriere_archive_cta_image: '' }))
                        setArchiveCtaHasChanges(true)
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Bild entfernen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* SINGLE JOB PAGE TAB                         */}
        {/* ============================================ */}
        <TabsContent value="single" className="mt-6 space-y-6">
          {/* Headings Section - INLINE EDITING */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-color">Abschnitts-Überschriften</h2>
                <Badge variant="secondary" className="text-xs">Pflicht</Badge>
              </div>
              {headingsHasChanges && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    setIsSaving(true)
                    const success = await saveSettings({
                      karriere_detail_apply_button: settings.karriere_detail_apply_button,
                      karriere_detail_tasks_title: settings.karriere_detail_tasks_title,
                      karriere_detail_profile_title: settings.karriere_detail_profile_title,
                      karriere_detail_benefits_title: settings.karriere_detail_benefits_title,
                      karriere_detail_overview_title: settings.karriere_detail_overview_title,
                    })
                    if (success) {
                      toast.success('Überschriften gespeichert')
                      setHeadingsHasChanges(false)
                    }
                    setIsSaving(false)
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <Label className="text-xs text-text-color/50">Bewerben-Button (im Hero)</Label>
                <Input
                  value={settings.karriere_detail_apply_button}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, karriere_detail_apply_button: e.target.value }))
                    setHeadingsHasChanges(true)
                  }}
                  placeholder="Jetzt bewerben"
                  className="mt-1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-text-color/50">Aufgaben-Titel</Label>
                  <Input
                    value={settings.karriere_detail_tasks_title}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_detail_tasks_title: e.target.value }))
                      setHeadingsHasChanges(true)
                    }}
                    placeholder="Ihre Aufgaben"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-text-color/50">Profil-Titel</Label>
                  <Input
                    value={settings.karriere_detail_profile_title}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_detail_profile_title: e.target.value }))
                      setHeadingsHasChanges(true)
                    }}
                    placeholder="Ihr Profil"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-text-color/50">Benefits-Titel</Label>
                  <Input
                    value={settings.karriere_detail_benefits_title}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_detail_benefits_title: e.target.value }))
                      setHeadingsHasChanges(true)
                    }}
                    placeholder="Was wir bieten"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-text-color/50">Übersicht-Titel</Label>
                  <Input
                    value={settings.karriere_detail_overview_title}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_detail_overview_title: e.target.value }))
                      setHeadingsHasChanges(true)
                    }}
                    placeholder="Auf einen Blick"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Section - INLINE EDITING */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-color">Bewerbungsformular</h2>
                <Badge variant="secondary" className="text-xs">Pflicht</Badge>
              </div>
              {formHasChanges && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    setIsSaving(true)
                    const success = await saveSettings({
                      karriere_form_title: settings.karriere_form_title,
                      karriere_form_submit_button: settings.karriere_form_submit_button,
                      karriere_form_success_message: settings.karriere_form_success_message,
                      karriere_form_error_message: settings.karriere_form_error_message,
                    })
                    if (success) {
                      toast.success('Formular-Einstellungen gespeichert')
                      setFormHasChanges(false)
                    }
                    setIsSaving(false)
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-text-color/50">Formular-Titel</Label>
                  <Input
                    value={settings.karriere_form_title}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_form_title: e.target.value }))
                      setFormHasChanges(true)
                    }}
                    placeholder="Jetzt bewerben"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-text-color/50">Absenden-Button</Label>
                  <Input
                    value={settings.karriere_form_submit_button}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, karriere_form_submit_button: e.target.value }))
                      setFormHasChanges(true)
                    }}
                    placeholder="Bewerbung abschicken"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-text-color/50">Erfolgsmeldung</Label>
                <Textarea
                  value={settings.karriere_form_success_message}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, karriere_form_success_message: e.target.value }))
                    setFormHasChanges(true)
                  }}
                  placeholder="Vielen Dank für Ihre Bewerbung! Wir werden uns in Kürze bei Ihnen melden."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-text-color/50">Fehlermeldung</Label>
                <Textarea
                  value={settings.karriere_form_error_message}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, karriere_form_error_message: e.target.value }))
                    setFormHasChanges(true)
                  }}
                  placeholder="Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Single CTA - INLINE EDITING (Image 1/3 + Content 2/3) */}
          <div className="rounded-xl bg-light-grey overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/50">
              <h2 className="font-bold text-text-color">CTA-Bereich (Dunkel)</h2>
              <div className="flex items-center gap-3">
                {singleCtaHasChanges && singleCtaActive && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setIsSaving(true)
                      const success = await saveSettings({
                        karriere_single_cta_title: settings.karriere_single_cta_title,
                        karriere_single_cta_description: settings.karriere_single_cta_description,
                        karriere_single_cta_image: settings.karriere_single_cta_image,
                        karriere_single_cta_button1_text: settings.karriere_single_cta_button1_text,
                        karriere_single_cta_button1_link: settings.karriere_single_cta_button1_link,
                        karriere_single_cta_button2_text: settings.karriere_single_cta_button2_text,
                        karriere_single_cta_button2_link: settings.karriere_single_cta_button2_link,
                      })
                      if (success) {
                        toast.success('CTA-Bereich gespeichert')
                        setSingleCtaHasChanges(false)
                      }
                      setIsSaving(false)
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Speichern...' : 'Speichern'}
                  </Button>
                )}
                <span className="text-xs text-text-color/50">Aktiv</span>
                <Switch
                  checked={singleCtaActive}
                  onCheckedChange={() => handleToggleActive('karriere_single_cta_active')}
                />
              </div>
            </div>

            {singleCtaActive && (
              <div className="flex flex-col md:flex-row">
                {/* Left: CTA Image (1/3) */}
                <div
                  onClick={() => setSingleCtaMediaModalOpen(true)}
                  className="w-full md:w-1/3 min-h-[200px] md:min-h-[280px] relative cursor-pointer group bg-text-color/10"
                >
                  {settings.karriere_single_cta_image ? (
                    <>
                      <Image
                        src={getImageUrl(settings.karriere_single_cta_image)}
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
                      value={settings.karriere_single_cta_title}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_single_cta_title: e.target.value }))
                        setSingleCtaHasChanges(true)
                      }}
                      placeholder="CTA Überschrift"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-text-color/50">Beschreibung</Label>
                    <Textarea
                      value={settings.karriere_single_cta_description}
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, karriere_single_cta_description: e.target.value }))
                        setSingleCtaHasChanges(true)
                      }}
                      placeholder="CTA Beschreibungstext..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Button 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Button 1 Text</Label>
                      <Input
                        value={settings.karriere_single_cta_button1_text}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_single_cta_button1_text: e.target.value }))
                          setSingleCtaHasChanges(true)
                        }}
                        placeholder="z.B. Termin vereinbaren"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Button 1 Link</Label>
                      <Input
                        value={settings.karriere_single_cta_button1_link}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_single_cta_button1_link: e.target.value }))
                          setSingleCtaHasChanges(true)
                        }}
                        placeholder="/kontakt"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Button 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-text-color/50">Button 2 Text</Label>
                      <Input
                        value={settings.karriere_single_cta_button2_text}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_single_cta_button2_text: e.target.value }))
                          setSingleCtaHasChanges(true)
                        }}
                        placeholder="z.B. Mehr erfahren"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-text-color/50">Button 2 Link</Label>
                      <Input
                        value={settings.karriere_single_cta_button2_link}
                        onChange={(e) => {
                          setSettings((prev) => ({ ...prev, karriere_single_cta_button2_link: e.target.value }))
                          setSingleCtaHasChanges(true)
                        }}
                        placeholder="/ueber-uns"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {settings.karriere_single_cta_image && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, karriere_single_cta_image: '' }))
                        setSingleCtaHasChanges(true)
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Bild entfernen
                    </button>
                  )}
                </div>
              </div>
            )}
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
          setHeroHasChanges(true)
        }}
        title="Hero-Hintergrundbild auswählen"
      />

      <MediaSelectorModal
        isOpen={aboutMediaModalOpen}
        onClose={() => setAboutMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, karriere_about_image: selectedMedia.url }))
          setAboutHasChanges(true)
        }}
        title="Über uns-Bild auswählen"
      />

      <MediaSelectorModal
        isOpen={archiveCtaMediaModalOpen}
        onClose={() => setArchiveCtaMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, karriere_archive_cta_image: selectedMedia.url }))
          setArchiveCtaHasChanges(true)
        }}
        title="CTA-Hintergrundbild auswählen"
      />

      <MediaSelectorModal
        isOpen={singleCtaMediaModalOpen}
        onClose={() => setSingleCtaMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setSettings((prev) => ({ ...prev, karriere_single_cta_image: selectedMedia.url }))
          setSingleCtaHasChanges(true)
        }}
        title="CTA-Hintergrundbild auswählen"
      />
    </div>
  )
}
