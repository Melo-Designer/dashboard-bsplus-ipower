import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * GET /api/media
 * List all media files with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const mimeType = searchParams.get('mimeType') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (mimeType) {
      where.mimeType = mimeType
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch media with pagination
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.media.count({ where }),
    ])

    return NextResponse.json({
      media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Medien' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/media
 * Upload new media file
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const originalName = formData.get('originalName') as string
    const description = formData.get('description') as string
    const altText = formData.get('altText') as string
    const caption = formData.get('caption') as string
    const category = formData.get('category') as string
    const widthStr = formData.get('width') as string
    const heightStr = formData.get('height') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp. Nur Bilder sind erlaubt.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei ist zu groß. Maximal 10MB erlaubt.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Math.floor(Date.now() / 1000)
    const randomStr = Math.random().toString(36).substring(2, 10)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${timestamp}-${randomStr}.${ext}`

    // Create year/month directory structure
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const uploadDir = join(process.cwd(), 'public', 'uploads', year, month)

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filepath = join(uploadDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create URL path
    const url = `/uploads/${year}/${month}/${filename}`

    // Create database record
    const media = await prisma.media.create({
      data: {
        url,
        filename,
        originalName: originalName || file.name,
        mimeType: file.type,
        size: file.size,
        width: widthStr ? parseInt(widthStr) : null,
        height: heightStr ? parseInt(heightStr) : null,
        altText: altText || null,
        caption: caption || null,
        description: description || null,
        category: category || null,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      media,
      url,
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    )
  }
}
