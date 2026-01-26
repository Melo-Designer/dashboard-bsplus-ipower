'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { BlogCard } from '@/components/dashboard/blog/BlogCard'
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
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { toast } from 'sonner'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  author: string | null
  published: boolean
  publishedAt: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  tags: {
    id: string
    name: string
    slug: string
  }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BlogPage() {
  const { website, isLoaded, getDisplayName } = useWebsite()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const fetchData = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        fetch(`/api/blog?website=${website}`),
        fetch(`/api/blog/categories?website=${website}`),
      ])
      const postsData = await postsRes.json()
      const categoriesData = await categoriesRes.json()
      setPosts(postsData.posts || [])
      setCategories(categoriesData.categories || [])
    } catch {
      toast.error('Fehler beim Laden der Beiträge')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by status
    if (filterStatus === 'published') {
      filtered = filtered.filter((post) => post.published)
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter((post) => !post.published)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((post) => post.category?.id === filterCategory)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.author?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [posts, searchQuery, filterStatus, filterCategory])

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: !post.published,
          publishedAt: !post.published ? new Date().toISOString() : post.publishedAt,
        }),
      })
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, published: !p.published, publishedAt: !p.published ? new Date().toISOString() : p.publishedAt }
            : p
        )
      )
      toast.success(post.published ? 'Beitrag als Entwurf gespeichert' : 'Beitrag veröffentlicht')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/blog/${deleteId}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== deleteId))
      toast.success('Beitrag gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Blog</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Verwalten Sie die Blog-Beiträge für {getDisplayName()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="internal" link="/blog/kategorien" variant="secondary" className="bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-white">
            Kategorien
          </Button>
          <Button type="internal" link="/blog/neu" variant="secondary">
            Neuer Beitrag
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-color/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Beitrag suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white shadow-sm text-sm text-text-color placeholder:text-text-color/40 focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'published' | 'draft')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="published">Veröffentlicht</SelectItem>
            <SelectItem value="draft">Entwürfe</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
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
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="text-text-color/60 mt-4 mb-4">Keine Beiträge vorhanden.</p>
          <Button type="internal" link="/blog/neu" variant="secondary">
            Ersten Beitrag erstellen
          </Button>
        </div>
      ) : filteredPosts.length === 0 ? (
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-text-color/60 mt-4">
            Keine Beiträge gefunden
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              onTogglePublished={handleTogglePublished}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beitrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Beitrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
