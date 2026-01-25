'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Progress } from '@/components/ui/Progress'
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
import {
  Upload,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  ImageIcon,
} from 'lucide-react'
import {
  optimizeImage,
  validateImageFile,
  formatFileSize,
  getImageDimensions,
  needsOptimization,
} from '@/lib/image-optimizer'
import { toast } from 'sonner'
import Image from 'next/image'

interface MediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (media: UploadedMedia | UploadedMedia[]) => void
  defaultCategory?: string
}

interface FileItem {
  id: string
  file: File
  preview: string
  dimensions: { width: number; height: number } | null
  status: 'pending' | 'optimizing' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  optimizedFile?: File
  uploadedMedia?: UploadedMedia
}

interface UploadedMedia {
  id: string
  url: string
  originalName: string
  size: number
  width?: number
  height?: number
}

export function MediaUploadModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory,
}: MediaUploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [category, setCategory] = useState(defaultCategory || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9)

  // Handle file selection (multiple files)
  const handleFilesSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles)
    const newFiles: FileItem[] = []

    for (const file of fileArray) {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`)
        continue
      }

      // Create preview
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      // Get dimensions
      let dimensions: { width: number; height: number } | null = null
      try {
        dimensions = await getImageDimensions(file)
      } catch (error) {
        console.error('Error getting dimensions:', error)
      }

      newFiles.push({
        id: generateId(),
        file,
        preview,
        dimensions,
        status: 'pending',
        progress: 0,
      })
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFilesSelect(droppedFiles)
      }
    },
    [handleFilesSelect]
  )

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        handleFilesSelect(selectedFiles)
      }
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleFilesSelect]
  )

  // Remove a file from the queue
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // Update a specific file's state
  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }, [])

  // Process a single file (optimize + upload)
  const processFile = async (fileItem: FileItem): Promise<UploadedMedia | null> => {
    const { id, file, dimensions } = fileItem

    try {
      // Check if optimization is needed
      const shouldOptimize = dimensions
        ? needsOptimization(file, dimensions.width, dimensions.height)
        : false

      let fileToUpload = file

      // Optimize if needed
      if (shouldOptimize) {
        updateFile(id, { status: 'optimizing', progress: 20 })

        const result = await optimizeImage(file, undefined, (progress) => {
          updateFile(id, { progress: 20 + progress.percentage * 0.3 })
        })

        fileToUpload = result.file
        updateFile(id, { optimizedFile: result.file, progress: 50 })
      } else {
        updateFile(id, { progress: 50 })
      }

      // Upload
      updateFile(id, { status: 'uploading' })

      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('originalName', file.name)
      if (category && category !== 'none') {
        formData.append('category', category)
      }
      if (dimensions) {
        formData.append('width', dimensions.width.toString())
        formData.append('height', dimensions.height.toString())
      }

      // Upload with progress
      const uploadedMedia = await new Promise<UploadedMedia>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const uploadProgress = Math.round((e.loaded / e.total) * 50)
            updateFile(id, { progress: 50 + uploadProgress })
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            resolve(response.media)
          } else {
            reject(new Error(xhr.statusText || 'Upload fehlgeschlagen'))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload fehlgeschlagen'))
        })

        xhr.open('POST', '/api/media')
        xhr.send(formData)
      })

      updateFile(id, {
        status: 'success',
        progress: 100,
        uploadedMedia,
      })

      return uploadedMedia
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
      updateFile(id, {
        status: 'error',
        error: errorMessage,
      })
      return null
    }
  }

  // Process all pending files
  const handleUploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsProcessing(true)

    const uploadedMediaList: UploadedMedia[] = []

    // Process files sequentially to avoid overwhelming the server
    for (const fileItem of pendingFiles) {
      const result = await processFile(fileItem)
      if (result) {
        uploadedMediaList.push(result)
      }
    }

    setIsProcessing(false)

    // Notify success
    if (uploadedMediaList.length > 0) {
      const failedCount = pendingFiles.length - uploadedMediaList.length
      if (failedCount > 0) {
        toast.success(
          `${uploadedMediaList.length} Datei(en) hochgeladen, ${failedCount} fehlgeschlagen`
        )
      } else {
        toast.success(
          uploadedMediaList.length === 1
            ? 'Datei erfolgreich hochgeladen'
            : `${uploadedMediaList.length} Dateien erfolgreich hochgeladen`
        )
      }

      // Call onSuccess with single or multiple results
      if (uploadedMediaList.length === 1) {
        onSuccess?.(uploadedMediaList[0])
      } else {
        onSuccess?.(uploadedMediaList)
      }
    }
  }

  // Reset modal
  const handleReset = useCallback(() => {
    setFiles([])
    setCategory(defaultCategory || '')
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [defaultCategory])

  // Handle close with confirmation
  const handleClose = useCallback(() => {
    const hasActiveUploads = files.some(
      (f) => f.status === 'optimizing' || f.status === 'uploading'
    )
    const hasPendingFiles = files.some((f) => f.status === 'pending')

    if (hasActiveUploads || hasPendingFiles) {
      setShowLeaveDialog(true)
    } else {
      handleReset()
      onClose()
    }
  }, [files, handleReset, onClose])

  // Confirm leave
  const handleConfirmLeave = useCallback(() => {
    setShowLeaveDialog(false)
    handleReset()
    onClose()
  }, [handleReset, onClose])

  // Calculate stats
  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length
  const processingCount = files.filter(
    (f) => f.status === 'optimizing' || f.status === 'uploading'
  ).length

  const allDone = files.length > 0 && pendingCount === 0 && processingCount === 0

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dateien hochladen</DialogTitle>
            <p className="text-sm text-text-color/70">
              Bilder werden automatisch optimiert. Mehrere Dateien können gleichzeitig hochgeladen werden.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                isDragging
                  ? 'border-secondary bg-secondary/5'
                  : 'border-text-color/30 hover:border-text-color/50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-10 w-10 text-text-color/40 mb-3" />
              <p className="text-base font-medium mb-1">Dateien hierher ziehen</p>
              <p className="text-sm text-text-color/60 mb-3">oder</p>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                Dateien auswählen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
                multiple
              />
              <p className="text-xs text-text-color/50 mt-3">
                Erlaubte Formate: JPEG, PNG, WebP, GIF (max. 10MB pro Datei)
              </p>
            </div>

            {/* Category Selection */}
            {files.length > 0 && (
              <div>
                <Label htmlFor="category">Kategorie für alle Dateien (optional)</Label>
                <Select value={category} onValueChange={setCategory} disabled={isProcessing}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Keine Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Kategorie</SelectItem>
                    <SelectItem value="Blog">Blog</SelectItem>
                    <SelectItem value="Karriere">Karriere</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Unternehmen">Unternehmen</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">
                    {files.length} Datei{files.length !== 1 ? 'en' : ''} ausgewählt
                  </h3>
                  {!isProcessing && pendingCount > 0 && (
                    <button
                      onClick={handleReset}
                      className="text-sm text-text-color/60 hover:text-text-color transition-colors"
                    >
                      Alle entfernen
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        fileItem.status === 'error'
                          ? 'bg-primary/5'
                          : fileItem.status === 'success'
                          ? 'bg-success/10'
                          : 'bg-light-grey'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-light-grey">
                        <Image
                          src={fileItem.preview}
                          alt={fileItem.file.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-text-color/60">
                          {formatFileSize(fileItem.file.size)}
                          {fileItem.dimensions &&
                            ` • ${fileItem.dimensions.width}x${fileItem.dimensions.height}`}
                        </p>

                        {/* Progress Bar */}
                        {(fileItem.status === 'optimizing' ||
                          fileItem.status === 'uploading') && (
                          <div className="mt-1.5">
                            <Progress value={fileItem.progress} className="h-1.5" />
                            <p className="text-xs text-text-color/50 mt-0.5">
                              {fileItem.status === 'optimizing'
                                ? 'Optimiert...'
                                : 'Hochladen...'}
                            </p>
                          </div>
                        )}

                        {/* Error Message */}
                        {fileItem.status === 'error' && fileItem.error && (
                          <p className="text-xs text-primary mt-1">{fileItem.error}</p>
                        )}
                      </div>

                      {/* Status Icon / Actions */}
                      <div className="shrink-0">
                        {fileItem.status === 'pending' && !isProcessing && (
                          <button
                            className="h-8 w-8 flex items-center justify-center text-text-color/40 hover:text-primary transition-colors"
                            onClick={() => removeFile(fileItem.id)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        {fileItem.status === 'pending' && isProcessing && (
                          <div className="h-8 w-8 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-text-color/30 border-t-text-color/60 rounded-full animate-spin" />
                          </div>
                        )}
                        {(fileItem.status === 'optimizing' ||
                          fileItem.status === 'uploading') && (
                          <Loader2 className="h-5 w-5 text-secondary animate-spin" />
                        )}
                        {fileItem.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-success" />
                        )}
                        {fileItem.status === 'error' && (
                          <XCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                {(successCount > 0 || errorCount > 0) && (
                  <div className="flex gap-4 text-sm pt-2">
                    {successCount > 0 && (
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {successCount} erfolgreich
                      </span>
                    )}
                    {errorCount > 0 && (
                      <span className="text-primary flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {errorCount} fehlgeschlagen
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {files.length === 0 && (
              <div className="text-center py-4 text-text-color/50">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-text-color/30" />
                <p>Noch keine Dateien ausgewählt</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-text-color/10">
            {allDone ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
                >
                  Weitere Dateien hochladen
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleReset()
                    onClose()
                  }}
                >
                  Schließen
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
                >
                  Abbrechen
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleUploadAll}
                  disabled={pendingCount === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {pendingCount === 1
                        ? 'Hochladen'
                        : `${pendingCount} Dateien hochladen`}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload abbrechen?</AlertDialogTitle>
            <AlertDialogDescription>
              {processingCount > 0
                ? 'Es werden gerade Dateien hochgeladen. Möchten Sie wirklich abbrechen?'
                : 'Möchten Sie wirklich abbrechen? Die ausgewählten Dateien wurden noch nicht hochgeladen.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fortfahren</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLeave}>
              Abbrechen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
