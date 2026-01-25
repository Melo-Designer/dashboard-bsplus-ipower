/**
 * Client-side image optimization utility
 * Optimizes images in the browser before upload using Canvas API
 */

export interface OptimizationConfig {
  maxDimensions: number
  targetSize: number
  maxUploadSize: number
  minQuality: number
  maxQuality: number
  maxIterations: number
}

export interface OptimizationResult {
  file: File
  originalSize: number
  optimizedSize: number
  originalDimensions: { width: number; height: number }
  newDimensions: { width: number; height: number }
  quality: number
  reduction: number
  format: string
}

export interface OptimizationProgress {
  stage: 'loading' | 'resizing' | 'compressing' | 'finalizing'
  percentage: number
  message: string
}

const DEFAULT_CONFIG: OptimizationConfig = {
  maxDimensions: 1920,
  targetSize: 500 * 1024, // 500KB
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  minQuality: 0.6,
  maxQuality: 0.9,
  maxIterations: 5,
}

/**
 * Check if image needs optimization
 */
export function needsOptimization(
  file: File,
  width: number,
  height: number,
  config: OptimizationConfig = DEFAULT_CONFIG
): boolean {
  return (
    file.size > config.targetSize ||
    width > config.maxDimensions ||
    height > config.maxDimensions
  )
}

/**
 * Read file as data URL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Create image from data URL
 */
function createImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      mimeType,
      quality
    )
  })
}

/**
 * Check if image has transparency (alpha channel)
 */
function hasTransparency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Check every 10th pixel for performance
  for (let i = 3; i < data.length; i += 40) {
    if (data[i] < 255) return true
  }

  return false
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight }
  }

  const ratio = Math.min(maxDimension / originalWidth, maxDimension / originalHeight)
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  }
}

/**
 * Optimize image
 */
export async function optimizeImage(
  file: File,
  config: OptimizationConfig = DEFAULT_CONFIG,
  onProgress?: (progress: OptimizationProgress) => void
): Promise<OptimizationResult> {
  // Stage 1: Loading
  onProgress?.({
    stage: 'loading',
    percentage: 25,
    message: 'Bild wird geladen...',
  })

  const dataUrl = await readFileAsDataURL(file)
  const img = await createImage(dataUrl)

  const originalWidth = img.width
  const originalHeight = img.height
  const originalSize = file.size

  // Check if optimization is needed
  if (!needsOptimization(file, originalWidth, originalHeight, config)) {
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      originalDimensions: { width: originalWidth, height: originalHeight },
      newDimensions: { width: originalWidth, height: originalHeight },
      quality: 1.0,
      reduction: 0,
      format: file.type,
    }
  }

  // Stage 2: Resizing
  onProgress?.({
    stage: 'resizing',
    percentage: 50,
    message: 'Größe wird angepasst...',
  })

  const { width, height } = calculateDimensions(
    originalWidth,
    originalHeight,
    config.maxDimensions
  )

  // Create canvas and resize
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)

  // Determine output format
  let outputMimeType = 'image/jpeg'
  let outputExtension = 'jpg'

  // Check if PNG with transparency
  if (file.type === 'image/png') {
    const isPngWithAlpha = hasTransparency(ctx, width, height)
    if (isPngWithAlpha) {
      outputMimeType = 'image/png'
      outputExtension = 'png'
    }
  }

  // Keep WebP as WebP
  if (file.type === 'image/webp') {
    outputMimeType = 'image/webp'
    outputExtension = 'webp'
  }

  // Keep GIF as is (no optimization for GIF to preserve animation)
  if (file.type === 'image/gif') {
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      originalDimensions: { width: originalWidth, height: originalHeight },
      newDimensions: { width, height },
      quality: 1.0,
      reduction: 0,
      format: file.type,
    }
  }

  // Stage 3: Compressing
  onProgress?.({
    stage: 'compressing',
    percentage: 75,
    message: 'Komprimierung...',
  })

  // Compress to target size
  let quality = config.maxQuality
  let blob: Blob | null = null
  let iterations = 0

  do {
    blob = await canvasToBlob(canvas, outputMimeType, quality)

    if (blob.size <= config.targetSize || quality <= config.minQuality) {
      break
    }

    quality -= 0.1
    iterations++
  } while (iterations < config.maxIterations)

  if (!blob) {
    throw new Error('Failed to compress image')
  }

  // Stage 4: Finalizing
  onProgress?.({
    stage: 'finalizing',
    percentage: 100,
    message: 'Abschluss...',
  })

  // Create optimized file
  const originalName = file.name.replace(/\.[^.]+$/, '')
  const optimizedFile = new File([blob], `${originalName}.${outputExtension}`, {
    type: outputMimeType,
  })

  const reduction = Math.round((1 - blob.size / originalSize) * 100)

  return {
    file: optimizedFile,
    originalSize,
    optimizedSize: blob.size,
    originalDimensions: { width: originalWidth, height: originalHeight },
    newDimensions: { width, height },
    quality,
    reduction,
    format: outputMimeType,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Nur Bilddateien sind erlaubt (JPEG, PNG, WebP, GIF)',
    }
  }

  if (file.size > DEFAULT_CONFIG.maxUploadSize) {
    return {
      valid: false,
      error: `Die Datei darf maximal ${formatFileSize(DEFAULT_CONFIG.maxUploadSize)} groß sein`,
    }
  }

  return { valid: true }
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await createImage(dataUrl)
  return { width: img.width, height: img.height }
}
