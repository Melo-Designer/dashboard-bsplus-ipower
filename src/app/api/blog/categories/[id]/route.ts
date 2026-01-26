import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten').optional(),
  description: z.string().optional().nullable(),
})

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update category
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

    const validated = categoryUpdateSchema.parse(body)

    // Check if category exists
    const existing = await prisma.blogCategory.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    // Check unique slug if changed
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.blogCategory.findUnique({
        where: {
          website_slug: {
            website: existing.website,
            slug: validated.slug,
          },
        },
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Eine Kategorie mit diesem Slug existiert bereits' }, { status: 400 })
      }
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete category
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

    // Check if category exists
    const existing = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    // Don't allow deletion if category has posts
    if (existing._count.posts > 0) {
      return NextResponse.json(
        { error: `Diese Kategorie enthält noch ${existing._count.posts} Beitrag(e). Bitte zuerst die Beiträge einer anderen Kategorie zuweisen.` },
        { status: 400 }
      )
    }

    await prisma.blogCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
