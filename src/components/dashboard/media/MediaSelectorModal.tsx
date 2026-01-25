'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Upload,
  Search,
  Filter,
  X,
  CheckCircle,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react'
import { MediaUploadModal } from './MediaUploadModal'
import { formatFileSize } from '@/lib/image-optimizer'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'
import useSWR from 'swr'

interface Media {
  id: string
  url: string
  filename: string
  originalName?: string
  mimeType: string
  size: number
  width?: number
  height?: number
  altText?: string
  caption?: string
  description?: string
  category?: string
  uploadedBy?: string
  createdAt: string
  updatedAt: string
}

interface MediaSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: Media | Media[]) => void
  multiSelect?: boolean
  filterByCategory?: string
  title?: string
  selectButtonLabel?: string
  acceptedTypes?: string[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function MediaSelectorModal({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  filterByCategory,
  title = 'Bild auswählen',
  selectButtonLabel = 'Bild auswählen',
  acceptedTypes,
}: MediaSelectorModalProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(filterByCategory || 'all')
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Fetch media
  const categoryParam = category === 'all' ? '' : category
  const { data, error, isLoading, mutate } = useSWR(
    isOpen
      ? `/api/media?limit=100&search=${search}&category=${categoryParam}`
      : null,
    fetcher
  )

  const media: Media[] = data?.media || []

  // Reset selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMedia([])
      setSearch('')
      setCategory(filterByCategory || 'all')
    }
  }, [isOpen, filterByCategory])

  // Handle media selection
  const handleSelectMedia = useCallback(
    (item: Media) => {
      if (multiSelect) {
        setSelectedMedia((prev) => {
          const exists = prev.find((m) => m.id === item.id)
          if (exists) {
            return prev.filter((m) => m.id !== item.id)
          } else {
            return [...prev, item]
          }
        })
      } else {
        setSelectedMedia([item])
      }
    },
    [multiSelect]
  )

  // Handle select and close
  const handleConfirmSelection = useCallback(() => {
    if (selectedMedia.length === 0) return

    if (multiSelect) {
      onSelect(selectedMedia)
    } else {
      onSelect(selectedMedia[0])
    }
    onClose()
  }, [selectedMedia, multiSelect, onSelect, onClose])

  // Handle upload success
  const handleUploadSuccess = useCallback(
    (newMedia: { id: string; url: string; originalName?: string; size?: number; width?: number; height?: number } | { id: string; url: string; originalName?: string; size?: number; width?: number; height?: number }[]) => {
      setShowUploadModal(false)
      mutate() // Refresh media list
      // Handle both single and multiple uploads
      if (Array.isArray(newMedia)) {
        const mediaItems = newMedia.map(m => ({
          ...m,
          filename: m.originalName || '',
          mimeType: 'image/jpeg',
          size: m.size || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Media))
        setSelectedMedia(mediaItems)
        toast.success(`${newMedia.length} Dateien hochgeladen und ausgewählt`)
      } else {
        const mediaItem = {
          ...newMedia,
          filename: newMedia.originalName || '',
          mimeType: 'image/jpeg',
          size: newMedia.size || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Media
        setSelectedMedia([mediaItem])
        toast.success('Datei hochgeladen und ausgewählt')
      }
    },
    [mutate]
  )

  // Filter media by accepted types
  const filteredMedia = acceptedTypes
    ? media.filter((m) => acceptedTypes.includes(m.mimeType))
    : media

  return (
    <>
      <Dialog open={isOpen && !showUploadModal} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <p className="text-sm text-text-color/70">
              Wählen Sie ein vorhandenes Bild oder laden Sie ein neues hoch
            </p>
          </DialogHeader>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-text-color/10">
            <Button
              variant="secondary"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Neue Datei hochladen
            </Button>

            <div className="flex-1 flex gap-2">
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
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="Blog">Blog</SelectItem>
                  <SelectItem value="Karriere">Karriere</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Unternehmen">Unternehmen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 min-h-0 overflow-auto" style={{ maxHeight: '50vh' }}>
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-64 text-text-color/50">
                <XCircle className="h-12 w-12 mb-4" />
                <p className="font-medium">Fehler beim Laden der Medien</p>
                <Button
                  variant="secondary"
                  onClick={() => mutate()}
                  className="mt-4 bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
                >
                  Erneut versuchen
                </Button>
              </div>
            )}

            {!isLoading && !error && filteredMedia.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-text-color/50">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p className="font-medium text-lg mb-2">
                  {search || (category && category !== 'all') ? 'Keine Ergebnisse' : 'Keine Medien vorhanden'}
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
                  {search || (category && category !== 'all') ? 'Filter zurücksetzen' : 'Datei hochladen'}
                </Button>
              </div>
            )}

            {!isLoading && !error && filteredMedia.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {filteredMedia.map((item) => {
                  const isSelected = selectedMedia.some((m) => m.id === item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectMedia(item)}
                      className={`group relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-secondary bg-secondary/5'
                          : 'border-transparent hover:border-text-color/30'
                      }`}
                    >
                      <Image
                        src={getImageUrl(item.url)}
                        alt={item.altText || item.originalName || 'Media'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-secondary rounded-full p-1">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <p className="text-sm font-medium truncate">
                            {item.originalName || item.filename}
                          </p>
                          <p className="text-xs opacity-90">
                            {formatFileSize(item.size)}
                            {item.width && item.height && ` • ${item.width}x${item.height}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-text-color/10 pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-text-color/60">
                {multiSelect && selectedMedia.length > 0 && (
                  <span>{selectedMedia.length} Bilder ausgewählt</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
                >
                  Abbrechen
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleConfirmSelection}
                  disabled={selectedMedia.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {selectButtonLabel}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        defaultCategory={filterByCategory}
      />
    </>
  )
}
