import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const blogPostUpdateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten').optional(),
  title: z.string().min(1, 'Titel ist erforderlich').optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional(),
  featuredImage: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const validated = blogPostUpdateSchema.parse(body)

    // Check if post exists
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 })
    }

    // Check unique slug if changed
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: {
          website_slug: {
            website: existing.website,
            slug: validated.slug,
          },
        },
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Ein Beitrag mit diesem Slug existiert bereits' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      ...validated,
      publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : validated.publishedAt === null ? null : undefined,
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update blog post error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    // Check if post exists
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 })
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
