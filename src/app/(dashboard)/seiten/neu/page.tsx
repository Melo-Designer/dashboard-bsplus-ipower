'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl, cn } from '@/lib/utils'

export default function NeueSeite() {
  const router = useRouter()
  const { website, getDisplayName } = useWebsite()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    heroTextColor: 'dark' as 'light' | 'dark',
    heroCardColor: 'primary' as 'primary' | 'secondary',
  })

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title)
        ? generateSlug(value)
        : prev.slug,
    }))
  }

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug) {
      toast.error('Titel und Slug sind erforderlich')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          ...formData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      const page = await res.json()
      toast.success('Seite erstellt')
      router.push(`/seiten/${page.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-text-color">Neue Seite</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Erstellen Sie eine neue Seite für {getDisplayName()}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 rounded-xl bg-light-grey space-y-4">
          <h2 className="font-medium text-text-color">Grundinformationen</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
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
              <p className="text-xs text-text-color/50 mt-1">
                URL: /{formData.slug || 'slug'}
              </p>
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
        <div className="rounded-xl bg-light-grey overflow-hidden">
          <div className="px-4 py-3 bg-white/50">
            <h2 className="font-medium text-text-color">Hero-Bereich</h2>
          </div>

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

              <div className="flex items-center gap-6">
                {/* Text Color Selector */}
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-text-color/50">Textfarbe</Label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroTextColor: 'light' }))}
                      className={cn(
                        'w-6 h-6 rounded-full bg-white border-2 transition-all',
                        formData.heroTextColor === 'light'
                          ? 'border-secondary scale-110'
                          : 'border-text-color/20 hover:border-text-color/40'
                      )}
                      title="Hell (weiß)"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroTextColor: 'dark' }))}
                      className={cn(
                        'w-6 h-6 rounded-full bg-text-color border-2 transition-all',
                        formData.heroTextColor === 'dark'
                          ? 'border-secondary scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      title="Dunkel (schwarz)"
                    />
                  </div>
                </div>

                {/* Card Color Selector */}
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-text-color/50">Kartenfarbe</Label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroCardColor: 'primary' }))}
                      className={cn(
                        'w-6 h-6 rounded-full bg-white border-2 transition-all',
                        formData.heroCardColor === 'primary'
                          ? 'border-secondary scale-110'
                          : 'border-text-color/20 hover:border-text-color/40'
                      )}
                      title="Weiß"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroCardColor: 'secondary' }))}
                      className={cn(
                        'w-6 h-6 rounded-full bg-secondary border-2 transition-all',
                        formData.heroCardColor === 'secondary'
                          ? 'border-secondary scale-110 ring-2 ring-secondary/30'
                          : 'border-transparent hover:scale-105'
                      )}
                      title="Sekundär"
                    />
                  </div>
                </div>
              </div>
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
          <Button buttonType="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? 'Erstellen...' : 'Seite erstellen'}
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
