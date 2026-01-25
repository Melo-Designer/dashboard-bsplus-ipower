'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { MediaUploadModal } from '@/components/dashboard/media/MediaUploadModal'
import {
  Search,
  X,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Grid,
  List,
} from 'lucide-react'
import { formatFileSize } from '@/lib/image-optimizer'
import { getImageUrl, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'
import useSWR from 'swr'

interface Media {
  id: string
  url: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  altText?: string
  caption?: string
  description?: string
  category?: string
  createdAt: string
  updatedAt: string
  uploadedBy?: {
    id: string
    name?: string
    email: string
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MediaPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch media
  const categoryParam = category === 'all' ? '' : category
  const { data, error, isLoading, mutate } = useSWR(
    `/api/media?limit=100&search=${search}&category=${categoryParam}`,
    fetcher
  )

  const media: Media[] = data?.media || []

  // Handle upload success
  const handleUploadSuccess = useCallback(() => {
    setShowUploadModal(false)
    mutate()
    toast.success('Medien erfolgreich hochgeladen')
  }, [mutate])

  // Handle copy URL
  const handleCopyUrl = useCallback((url: string) => {
    const fullUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('URL in die Zwischenablage kopiert')
  }, [])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!selectedMedia) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      const result = await res.json()

      if (result.warnings && result.warnings.length > 0) {
        toast.warning(result.warnings.join('\n'))
      }

      toast.success('Medien-Datei erfolgreich gelöscht')
      setSelectedMedia(null)
      setShowDeleteDialog(false)
      mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }, [selectedMedia, mutate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-secondary">Medienbibliothek</h1>
          <p className="text-text-color/60 mt-1">
            Verwalten Sie Ihre Bilder und Dateien
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowUploadModal(true)}>
          Datei hochladen
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-color/40" />
          <Input
            type="text"
            placeholder="Medien durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-text-color/40 hover:text-text-color/60" />
            </button>
          )}
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="Blog">Blog</SelectItem>
            <SelectItem value="Karriere">Karriere</SelectItem>
            <SelectItem value="Services">Services</SelectItem>
            <SelectItem value="Unternehmen">Unternehmen</SelectItem>
            <SelectItem value="Sonstiges">Sonstiges</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 bg-light-grey rounded-full p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
            aria-label="Gitteransicht"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
            aria-label="Listenansicht"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
          {Array.from({ length: 10 }).map((_, i) =>
            viewMode === 'grid' ? (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ) : (
              <Skeleton key={i} className="h-16 rounded-xl" />
            )
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-text-color/50">
          <p className="font-medium mb-2">Fehler beim Laden der Medien</p>
          <Button
            variant="secondary"
            onClick={() => mutate()}
            className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
          >
            Erneut versuchen
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && media.length === 0 && (
        <div className="text-center py-12 text-text-color/50">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-text-color/30" />
          <p className="font-medium text-lg mb-2">
            {search || (category && category !== 'all')
              ? 'Keine Ergebnisse'
              : 'Keine Medien vorhanden'}
          </p>
          <p className="text-sm mb-4">
            {search || (category && category !== 'all')
              ? `Keine Dateien gefunden für "${search || category}"`
              : 'Laden Sie Ihre erste Datei hoch'}
          </p>
          <Button
            variant="secondary"
            onClick={
              search || (category && category !== 'all')
                ? () => {
                    setSearch('')
                    setCategory('all')
                  }
                : () => setShowUploadModal(true)
            }
          >
            {search || (category && category !== 'all')
              ? 'Filter zurücksetzen'
              : 'Datei hochladen'}
          </Button>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && media.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-light-grey hover:ring-2 hover:ring-secondary transition-all"
            >
              <Image
                src={getImageUrl(item.url)}
                alt={item.altText || item.originalName || 'Media'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-sm font-medium truncate">
                    {item.originalName || item.filename}
                  </p>
                  <p className="text-xs opacity-90">
                    {formatFileSize(item.size)}
                  </p>
                </div>
              </div>

              {/* Category Badge */}
              {item.category && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && !error && media.length > 0 && viewMode === 'list' && (
        <div className="space-y-2">
          {media.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="flex items-center gap-4 p-3 rounded-xl bg-light-grey hover:bg-secondary/5 cursor-pointer transition-colors"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={getImageUrl(item.url)}
                  alt={item.altText || item.originalName || 'Media'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.originalName || item.filename}</p>
                <p className="text-sm text-text-color/60">
                  {formatFileSize(item.size)}
                  {item.width && item.height && ` • ${item.width}x${item.height}`}
                  {' • '}
                  {formatDate(item.createdAt)}
                </p>
              </div>
              {item.category && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {item.category}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Detail Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medien-Details</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-light-grey">
                <Image
                  src={getImageUrl(selectedMedia.url)}
                  alt={selectedMedia.altText || selectedMedia.originalName || 'Media'}
                  fill
                  className="object-contain"
                />
              </div>

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-color/60">Dateiname</p>
                  <p className="font-medium">{selectedMedia.originalName || selectedMedia.filename}</p>
                </div>
                <div>
                  <p className="text-text-color/60">Dateigröße</p>
                  <p className="font-medium">{formatFileSize(selectedMedia.size)}</p>
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <p className="text-text-color/60">Abmessungen</p>
                    <p className="font-medium">{selectedMedia.width}x{selectedMedia.height} px</p>
                  </div>
                )}
                <div>
                  <p className="text-text-color/60">Typ</p>
                  <p className="font-medium">{selectedMedia.mimeType}</p>
                </div>
                <div>
                  <p className="text-text-color/60">Hochgeladen am</p>
                  <p className="font-medium">{formatDate(selectedMedia.createdAt)}</p>
                </div>
                {selectedMedia.category && (
                  <div>
                    <p className="text-text-color/60">Kategorie</p>
                    <Badge variant="secondary">{selectedMedia.category}</Badge>
                  </div>
                )}
              </div>

              {/* Alt Text */}
              {selectedMedia.altText && (
                <div className="text-sm">
                  <p className="text-text-color/60">Alt-Text</p>
                  <p>{selectedMedia.altText}</p>
                </div>
              )}

              {/* Description */}
              {selectedMedia.description && (
                <div className="text-sm">
                  <p className="text-text-color/60">Beschreibung</p>
                  <p>{selectedMedia.description}</p>
                </div>
              )}

              {/* URL */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-light-grey text-sm">
                <code className="flex-1 truncate text-text-color/70">{`${window.location.origin}${selectedMedia.url}`}</code>
                <button
                  onClick={() => handleCopyUrl(selectedMedia.url)}
                  className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  title="URL kopieren"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  href={getImageUrl(selectedMedia.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  title="In neuem Tab öffnen"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setShowDeleteDialog(true)}
              className="bg-primary"
            >
              Löschen
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedMedia(null)}
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Medien-Datei löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Datei wird
              dauerhaft gelöscht und kann nicht wiederhergestellt werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
