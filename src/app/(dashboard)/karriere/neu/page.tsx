'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
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
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import { EMPLOYMENT_TYPES, JOB_STATUSES } from '@/lib/constants/employment-types'

// ListEditor component moved outside to prevent re-creation on every render
function ListEditor({
  label,
  field,
  placeholder,
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: {
  label: string
  field: string
  placeholder: string
  items: string[]
  onItemChange: (index: number, value: string) => void
  onAddItem: () => void
  onRemoveItem: (index: number) => void
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {items.map((item, index) => (
        <div key={`${field}-${index}`} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => onItemChange(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveItem(index)}
              className="p-2 text-text-color/30 hover:text-red-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddItem}
        className="text-sm text-secondary hover:text-secondary/80"
      >
        + Punkt hinzufügen
      </button>
    </div>
  )
}

export default function NeueStelle() {
  const router = useRouter()
  const { website, getDisplayName } = useWebsite()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    company: '',
    description: '',
    requirements: [''] as string[],
    benefits: [''] as string[],
    responsibilities: [''] as string[],
    employmentType: '',
    location: '',
    salary: '',
    featuredImage: '',
    contactEmail: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    publishedAt: '',
    applicationDeadline: '',
  })

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

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title)
        ? generateSlug(value)
        : prev.slug,
    }))
  }

  const handleListItemChange = useCallback((field: 'requirements' | 'benefits' | 'responsibilities', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }, [])

  const handleAddListItem = useCallback((field: 'requirements' | 'benefits' | 'responsibilities') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }))
  }, [])

  const handleRemoveListItem = useCallback((field: 'requirements' | 'benefits' | 'responsibilities', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug || !formData.description) {
      toast.error('Titel, Slug und Beschreibung sind erforderlich')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/karriere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          ...formData,
          requirements: formData.requirements.filter((r) => r.trim()),
          benefits: formData.benefits.filter((b) => b.trim()),
          responsibilities: formData.responsibilities.filter((r) => r.trim()),
          publishedAt: formData.status === 'published' ? formData.publishedAt || new Date().toISOString() : null,
          applicationDeadline: formData.applicationDeadline || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      const job = await res.json()
      toast.success('Stelle erstellt')
      router.push(`/karriere/${job.id}`)
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
          href="/karriere"
          className="p-2 rounded-lg hover:bg-light-grey text-text-color/60 hover:text-text-color"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-color">Neue Stelle</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Erstellen Sie ein neues Stellenangebot für {getDisplayName()}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Grundinformationen</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Stellentitel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="z.B. Servicetechniker (m/w/d)"
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
                  placeholder="url-slug"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Abteilung/Bereich</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="z.B. Service"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Stellenbeschreibung *</h2>
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
              placeholder="Beschreiben Sie die Stelle..."
            />
          </div>

          {/* Responsibilities */}
          <div className="p-6 rounded-xl bg-light-grey">
            <ListEditor
              label="Ihre Aufgaben"
              field="responsibilities"
              placeholder="z.B. Wartung und Instandhaltung von BHKW-Anlagen"
              items={formData.responsibilities}
              onItemChange={(index, value) => handleListItemChange('responsibilities', index, value)}
              onAddItem={() => handleAddListItem('responsibilities')}
              onRemoveItem={(index) => handleRemoveListItem('responsibilities', index)}
            />
          </div>

          {/* Requirements */}
          <div className="p-6 rounded-xl bg-light-grey">
            <ListEditor
              label="Was Sie mitbringen"
              field="requirements"
              placeholder="z.B. Abgeschlossene Ausbildung im Bereich Elektrotechnik"
              items={formData.requirements}
              onItemChange={(index, value) => handleListItemChange('requirements', index, value)}
              onAddItem={() => handleAddListItem('requirements')}
              onRemoveItem={(index) => handleRemoveListItem('requirements', index)}
            />
          </div>

          {/* Benefits */}
          <div className="p-6 rounded-xl bg-light-grey">
            <ListEditor
              label="Was wir bieten"
              field="benefits"
              placeholder="z.B. Attraktives Gehalt und Sozialleistungen"
              items={formData.benefits}
              onItemChange={(index, value) => handleListItemChange('benefits', index, value)}
              onAddItem={() => handleAddListItem('benefits')}
              onRemoveItem={(index) => handleRemoveListItem('benefits', index)}
            />
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Bild</h2>
            <div
              onClick={() => setMediaModalOpen(true)}
              className="relative h-32 rounded-lg bg-white cursor-pointer group overflow-hidden"
            >
              {formData.featuredImage ? (
                <>
                  <Image
                    src={getImageUrl(formData.featuredImage)}
                    alt="Featured"
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

          {/* Employment Details */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Details</h2>

            <div>
              <Label>Art der Beschäftigung</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, employmentType: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Standort</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="z.B. Bakum"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="salary">Gehalt (optional)</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
                placeholder="z.B. Nach Vereinbarung"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Kontakt-E-Mail</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="bewerbung@example.de"
                className="mt-1"
              />
            </div>
          </div>

          {/* Publication */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Veröffentlichung</h2>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'published' && (
              <div>
                <Label htmlFor="publishedAt">Veröffentlichungsdatum</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="applicationDeadline">Bewerbungsfrist</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button buttonType="submit" variant="secondary" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Erstellen...' : 'Stelle erstellen'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/karriere')}
              className="w-full bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </form>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media) => {
          const selectedMedia = Array.isArray(media) ? media[0] : media
          setFormData((prev) => ({ ...prev, featuredImage: selectedMedia.url }))
        }}
        title="Bild auswählen"
      />
    </div>
  )
}
