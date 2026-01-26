import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidateFrontend } from '@/lib/revalidate'
import { Website } from '@/generated/prisma'
import { z } from 'zod'

const cardSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  btnClass: z.enum(['primary', 'secondary']).optional().nullable(),
})

const sectionSchema = z.object({
  identifier: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
  backgroundColor: z.enum(['primary', 'secondary', 'light', 'dark']).optional().nullable(),
  textColor: z.enum(['light', 'dark']).optional().nullable(),
  cards: z.array(cardSchema).optional(),
  active: z.boolean().optional(),
})

// GET - List sections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website
    const activeOnly = searchParams.get('active') === 'true'

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const where: { website: Website; active?: boolean } = { website }
    if (activeOnly) where.active = true

    const sections = await prisma.homepageSection.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    // Parse JSON cards
    const parsed = sections.map((section) => ({
      ...section,
      cards: section.cards ? JSON.parse(section.cards) : [],
    }))

    return NextResponse.json({ sections: parsed })
  } catch (error) {
    console.error('Get sections error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST - Create section
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { website, ...data } = body

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const validated = sectionSchema.parse(data)

    // Check unique identifier
    const existing = await prisma.homepageSection.findUnique({
      where: { website_identifier: { website, identifier: validated.identifier } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Identifier bereits vorhanden' }, { status: 400 })
    }

    // Get max sortOrder
    const maxOrder = await prisma.homepageSection.aggregate({
      where: { website },
      _max: { sortOrder: true },
    })

    const section = await prisma.homepageSection.create({
      data: {
        website,
        identifier: validated.identifier,
        title: validated.title,
        subtitle: validated.subtitle,
        description: validated.description,
        backgroundImage: validated.backgroundImage,
        backgroundColor: validated.backgroundColor,
        textColor: validated.textColor,
        cards: validated.cards ? JSON.stringify(validated.cards) : null,
        active: validated.active ?? true,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    })

    // Trigger frontend cache revalidation (non-blocking)
    revalidateFrontend(website as 'bs_plus' | 'ipower', { tag: 'sections' })

    return NextResponse.json({
      section: {
        ...section,
        cards: section.cards ? JSON.parse(section.cards) : [],
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create section error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
