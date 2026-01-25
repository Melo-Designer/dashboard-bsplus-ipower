import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SectionType } from '@/generated/prisma'
import { z } from 'zod'

const tripleItemSchema = z.object({
  title: z.string(),
  content: z.string(),
})

const buttonSchema = z.object({
  text: z.string(),
  type: z.enum(['internal', 'external', 'button']).optional(),
  link: z.string(),
  btnClass: z.enum(['primary', 'secondary']).optional(),
})

const statSchema = z.object({
  number: z.string(),
  title: z.string(),
})

const cardSchema = z.object({
  title: z.string(),
  content: z.string(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  btnClass: z.enum(['primary', 'secondary']).optional().nullable(),
})

const sectionSchema = z.object({
  type: z.enum(['triple', 'text_image', 'black_cta', 'numbers', 'hero', 'accordion']),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  imageAlign: z.enum(['left', 'right']).optional().nullable(),
  items: z.array(tripleItemSchema).optional(),
  buttons: z.array(buttonSchema).optional(),
  cards: z.array(cardSchema).optional(),
  stats: z.array(statSchema).optional(),
  backgroundImage: z.string().optional().nullable(),
  backgroundColor: z.string().optional().nullable(),
  textColor: z.string().optional().nullable(),
  active: z.boolean().optional(),
})

// GET - List sections for a page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })
    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    const sections = await prisma.pageSection.findMany({
      where: { pageId },
      orderBy: { sortOrder: 'asc' },
    })

    // Parse JSON fields
    const parsed = sections.map((section) => ({
      ...section,
      items: section.items ? JSON.parse(section.items) : [],
      buttons: section.buttons ? JSON.parse(section.buttons) : [],
      cards: section.cards ? JSON.parse(section.cards) : [],
      stats: section.stats ? JSON.parse(section.stats) : [],
    }))

    return NextResponse.json({ sections: parsed })
  } catch (error) {
    console.error('Get sections error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST - Create section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: pageId } = await params
    const body = await request.json()

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })
    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    const validated = sectionSchema.parse(body)

    // Get max sortOrder
    const maxOrder = await prisma.pageSection.aggregate({
      where: { pageId },
      _max: { sortOrder: true },
    })

    const section = await prisma.pageSection.create({
      data: {
        pageId,
        type: validated.type as SectionType,
        title: validated.title,
        subtitle: validated.subtitle,
        content: validated.content,
        imageUrl: validated.imageUrl,
        imageAlt: validated.imageAlt,
        imageAlign: validated.imageAlign,
        items: validated.items ? JSON.stringify(validated.items) : null,
        buttons: validated.buttons ? JSON.stringify(validated.buttons) : null,
        cards: validated.cards ? JSON.stringify(validated.cards) : null,
        stats: validated.stats ? JSON.stringify(validated.stats) : null,
        backgroundImage: validated.backgroundImage,
        backgroundColor: validated.backgroundColor,
        textColor: validated.textColor,
        active: validated.active ?? true,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    })

    return NextResponse.json({
      ...section,
      items: section.items ? JSON.parse(section.items) : [],
      buttons: section.buttons ? JSON.parse(section.buttons) : [],
      cards: section.cards ? JSON.parse(section.cards) : [],
      stats: section.stats ? JSON.parse(section.stats) : [],
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create section error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
