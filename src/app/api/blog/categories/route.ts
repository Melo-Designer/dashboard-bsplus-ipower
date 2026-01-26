import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
  description: z.string().optional().nullable(),
})

// GET - List categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const categories = await prisma.blogCategory.findMany({
      where: { website },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST - Create category
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

    const validated = categorySchema.parse(data)

    // Check unique slug
    const existing = await prisma.blogCategory.findUnique({
      where: { website_slug: { website, slug: validated.slug } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Eine Kategorie mit diesem Slug existiert bereits' }, { status: 400 })
    }

    const category = await prisma.blogCategory.create({
      data: {
        website,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
