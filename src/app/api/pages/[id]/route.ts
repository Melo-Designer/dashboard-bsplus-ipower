import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pageUpdateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten').optional(),
  title: z.string().min(1, 'Titel ist erforderlich').optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  heroButtonText: z.string().optional().nullable(),
  heroButtonLink: z.string().optional().nullable(),
  active: z.boolean().optional(),
})

// GET - Get single page with sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    // Parse JSON fields in sections
    const parsedSections = page.sections.map((section) => ({
      ...section,
      items: section.items ? JSON.parse(section.items) : [],
      buttons: section.buttons ? JSON.parse(section.buttons) : [],
      cards: section.cards ? JSON.parse(section.cards) : [],
      stats: section.stats ? JSON.parse(section.stats) : [],
    }))

    return NextResponse.json({
      ...page,
      sections: parsedSections,
    })
  } catch (error) {
    console.error('Get page error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update page
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

    const validated = pageUpdateSchema.parse(body)

    // Check if page exists
    const existing = await prisma.page.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    // Check unique slug if changed
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.page.findUnique({
        where: {
          website_slug: {
            website: existing.website,
            slug: validated.slug,
          },
        },
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Eine Seite mit diesem Slug existiert bereits' }, { status: 400 })
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(page)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update page error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete page
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

    // Check if page exists
    const existing = await prisma.page.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    // Delete page (sections will cascade delete)
    await prisma.page.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete page error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
