import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'
import { z } from 'zod'

const slideSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  imageUrl: z.string().min(1, 'Bild erforderlich'),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  active: z.boolean().optional(),
})

// GET - List slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website
    const activeOnly = searchParams.get('active') === 'true'

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json(
        { error: 'Website parameter erforderlich' },
        { status: 400 }
      )
    }

    const where: { website: Website; active?: boolean } = { website }
    if (activeOnly) {
      where.active = true
    }

    const slides = await prisma.slide.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Get slides error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden' },
      { status: 500 }
    )
  }
}

// POST - Create slide
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { website, ...data } = body

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json(
        { error: 'Website parameter erforderlich' },
        { status: 400 }
      )
    }

    const validated = slideSchema.parse(data)

    // Get max sortOrder
    const maxOrder = await prisma.slide.aggregate({
      where: { website },
      _max: { sortOrder: true },
    })

    const slide = await prisma.slide.create({
      data: {
        website,
        ...validated,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    })

    return NextResponse.json(slide, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Create slide error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen' },
      { status: 500 }
    )
  }
}
