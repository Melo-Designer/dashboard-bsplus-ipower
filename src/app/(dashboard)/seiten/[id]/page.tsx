'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import type { ParsedPage } from '@/types'

export default function SeiteBearbeiten({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [page, setPage] = useState<ParsedPage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

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

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages/${id}`)
        if (!res.ok) throw new Error('Seite nicht gefunden')
        const data = await res.json()
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
      } catch (error) {
        toast.error('Fehler beim Laden der Seite')
        router.push('/seiten')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPage()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug) {
      toast.error('Titel und Slug sind erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success('Seite gespeichert')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-text-color">Seite bearbeiten</h1>
            <p className="text-sm text-text-color/60 mt-1">/{page.slug}</p>
          </div>
        </div>
        <Link
          href={`/seiten/${id}/abschnitte`}
          className="text-sm font-medium text-secondary hover:text-secondary/80"
        >
          Abschnitte verwalten →
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-light-grey">
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

        {/* Basic Info */}
        <div className="p-6 rounded-xl bg-light-grey space-y-4">
          <h2 className="font-medium text-text-color">Grundinformationen</h2>

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
        </div>

        {/* SEO */}
        <div className="p-6 rounded-xl bg-light-grey space-y-4">
          <h2 className="font-medium text-text-color">SEO</h2>

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

        {/* Hero Section */}
        <div className="p-6 rounded-xl bg-light-grey space-y-4">
          <h2 className="font-medium text-text-color">Hero-Bereich</h2>

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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/seiten')}
            className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
          >
            Abbrechen
          </Button>
          <Button buttonType="submit" variant="secondary" disabled={isSaving}>
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </form>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, heroImage: selectedMedia.url }))
        }}
        title="Hero-Bild auswählen"
      />
    </div>
  )
}
