'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/Switch'
import { MediaSelectorModal } from '@/components/dashboard/media/MediaSelectorModal'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

export default function NeuerBlogBeitrag() {
  const router = useRouter()
  const { website, getDisplayName } = useWebsite()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    categoryId: '',
    tagIds: [] as string[],
    published: false,
    publishedAt: '',
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch(`/api/blog/categories?website=${website}`),
          fetch('/api/blog/tags'),
        ])
        const categoriesData = await categoriesRes.json()
        const tagsData = await tagsRes.json()
        setCategories(categoriesData.categories || [])
        setTags(tagsData.tags || [])
      } catch {
        console.error('Error fetching data')
      }
    }
    if (website) fetchData()
  }, [website])

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

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    try {
      const res = await fetch('/api/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      })
      const tag = await res.json()
      if (!tags.find((t) => t.id === tag.id)) {
        setTags((prev) => [...prev, tag])
      }
      if (!formData.tagIds.includes(tag.id)) {
        setFormData((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }))
      }
      setNewTagName('')
    } catch {
      toast.error('Fehler beim Erstellen des Tags')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Titel, Slug und Inhalt sind erforderlich')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          ...formData,
          categoryId: formData.categoryId || null,
          publishedAt: formData.published ? formData.publishedAt || new Date().toISOString() : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      const post = await res.json()
      toast.success('Beitrag erstellt')
      router.push(`/blog/${post.id}`)
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
          href="/blog"
          className="p-2 rounded-lg hover:bg-light-grey text-text-color/60 hover:text-text-color"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-color">Neuer Beitrag</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Erstellen Sie einen neuen Journal-Beitrag für {getDisplayName()}
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
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Titel des Beitrags"
                  className="mt-1"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-text-color/50 mt-1">
                  URL: /journal/{formData.slug || 'slug'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Inhalt *</h2>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
              placeholder="Schreiben Sie Ihren Beitrag..."
            />
          </div>

          {/* Excerpt */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Kurzfassung</h2>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Kurze Beschreibung für Vorschau und SEO..."
              rows={3}
            />
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
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Beitragsbild</h2>
            <div
              onClick={() => setMediaModalOpen(true)}
              className="relative h-40 rounded-lg bg-white cursor-pointer group overflow-hidden"
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
                  <div className="text-center">
                    <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Bild auswählen</span>
                  </div>
                </div>
              )}
            </div>
            {formData.featuredImage && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, featuredImage: '' }))}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Bild entfernen
              </button>
            )}
          </div>

          {/* Category */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Kategorie</h2>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      tagIds: prev.tagIds.includes(tag.id)
                        ? prev.tagIds.filter((id) => id !== tag.id)
                        : [...prev.tagIds, tag.id],
                    }))
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.tagIds.includes(tag.id)
                      ? 'bg-secondary text-white'
                      : 'bg-white text-text-color/60 hover:bg-white/80'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Neues Tag..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag} className="px-3">
                +
              </Button>
            </div>
          </div>

          {/* Author */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Autor</h2>
            <Input
              value={formData.author}
              onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              placeholder="Name des Autors"
            />
          </div>

          {/* Publication */}
          <div className="p-6 rounded-xl bg-light-grey space-y-4">
            <h2 className="font-medium text-text-color">Veröffentlichung</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-color/60">Veröffentlicht</span>
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, published: checked }))}
              />
            </div>
            {formData.published && (
              <div>
                <Label htmlFor="publishedAt">Veröffentlichungsdatum</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button buttonType="submit" variant="secondary" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Erstellen...' : 'Beitrag erstellen'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/blog')}
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
        title="Beitragsbild auswählen"
      />
    </div>
  )
}
