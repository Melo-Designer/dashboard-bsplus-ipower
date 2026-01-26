'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

export default function KategorienPage() {
  const { website, isLoaded, getDisplayName } = useWebsite()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })

  const fetchCategories = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/blog/categories?website=${website}`)
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      toast.error('Fehler beim Laden der Kategorien')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

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

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: !editCategory || prev.slug === '' || prev.slug === generateSlug(prev.name)
        ? generateSlug(value)
        : prev.slug,
    }))
  }

  const openCreateDialog = () => {
    setEditCategory(null)
    setFormData({ name: '', slug: '', description: '' })
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name und Slug sind erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const url = editCategory
        ? `/api/blog/categories/${editCategory.id}`
        : '/api/blog/categories'
      const method = editCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          ...formData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success(editCategory ? 'Kategorie aktualisiert' : 'Kategorie erstellt')
      setIsDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/blog/categories/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }
      setCategories((prev) => prev.filter((c) => c.id !== deleteId))
      toast.success('Kategorie gelöscht')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
            <h1 className="text-2xl font-bold text-text-color">Kategorien</h1>
            <p className="text-sm text-text-color/60 mt-1">
              Verwalten Sie die Blog-Kategorien für {getDisplayName()}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={openCreateDialog}>
          Neue Kategorie
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-text-color/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="text-text-color/60 mt-4 mb-4">Keine Kategorien vorhanden.</p>
          <Button variant="secondary" onClick={openCreateDialog}>
            Erste Kategorie erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-color">{category.name}</h3>
                  <span className="px-2 py-0.5 text-xs bg-light-grey text-text-color/60 rounded-full">
                    {category._count.posts} Beiträge
                  </span>
                </div>
                <p className="text-sm text-text-color/50">/{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-text-color/60 mt-1 truncate">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditDialog(category)}
                  className="px-3 py-1.5 text-sm font-medium text-secondary hover:text-secondary/80"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => setDeleteId(category.id)}
                  className="p-2 text-text-color/30 hover:text-red-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Name der Kategorie"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="url-slug"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung (optional)"
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
                className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
              >
                Abbrechen
              </Button>
              <Button
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Kategorie wirklich löschen? Kategorien mit Beiträgen können nicht gelöscht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
