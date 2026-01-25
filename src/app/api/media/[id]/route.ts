import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * GET /api/media/[id]
 * Get single media file details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const media = await prisma.media.findUnique({
      where: { id },
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

    if (!media) {
      return NextResponse.json(
        { error: 'Medien-Datei nicht gefunden' },
        { status: 404 }
      )
    }

    // Check usage in blog posts and job listings
    const [blogPostCount, jobListingCount] = await Promise.all([
      prisma.blogPost.count({
        where: {
          OR: [
            { featuredImage: { contains: media.url } },
            { content: { contains: media.url } },
          ],
        },
      }),
      prisma.jobListing.count({
        where: {
          description: { contains: media.url },
        },
      }),
    ])

    return NextResponse.json({
      media,
      usageCount: {
        blogPosts: blogPostCount,
        jobListings: jobListingCount,
      },
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Medien-Datei' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/media/[id]
 * Update media metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { description, altText, caption, category } = body

    // Check if media exists
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Medien-Datei nicht gefunden' },
        { status: 404 }
      )
    }

    // Update media
    const media = await prisma.media.update({
      where: { id },
      data: {
        description: description !== undefined ? description : undefined,
        altText: altText !== undefined ? altText : undefined,
        caption: caption !== undefined ? caption : undefined,
        category: category !== undefined ? category : undefined,
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
      message: 'Metadaten erfolgreich aktualisiert',
    })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Metadaten' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/media/[id]
 * Delete media file and database record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Medien-Datei nicht gefunden' },
        { status: 404 }
      )
    }

    // Check usage in blog posts and job listings
    const [blogPostCount, jobListingCount] = await Promise.all([
      prisma.blogPost.count({
        where: {
          OR: [
            { featuredImage: { contains: media.url } },
            { content: { contains: media.url } },
          ],
        },
      }),
      prisma.jobListing.count({
        where: {
          description: { contains: media.url },
        },
      }),
    ])

    const warnings: string[] = []
    if (blogPostCount > 0) {
      warnings.push(`Diese Datei wird in ${blogPostCount} Blog-Beiträgen verwendet`)
    }
    if (jobListingCount > 0) {
      warnings.push(`Diese Datei wird in ${jobListingCount} Stellenanzeigen verwendet`)
    }

    // Delete database record
    await prisma.media.delete({
      where: { id },
    })

    // Delete physical file
    const filepath = join(process.cwd(), 'public', media.url)
    if (existsSync(filepath)) {
      try {
        await unlink(filepath)
      } catch (error) {
        console.error('Error deleting file:', error)
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Medien-Datei erfolgreich gelöscht',
      warnings: warnings.length > 0 ? warnings : undefined,
    })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Medien-Datei' },
      { status: 500 }
    )
  }
}
