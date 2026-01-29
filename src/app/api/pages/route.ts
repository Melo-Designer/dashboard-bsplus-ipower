import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'
import { z } from 'zod'

const pageSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
  title: z.string().min(1, 'Titel ist erforderlich'),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  heroButtonText: z.string().optional().nullable(),
  heroButtonLink: z.string().optional().nullable(),
  heroTextColor: z.enum(['light', 'dark']).optional().nullable(),
  heroCardColor: z.enum(['primary', 'secondary']).optional().nullable(),
  active: z.boolean().optional(),
  // Navigation settings (sidebar/burger menu)
  showInSidebar: z.boolean().optional(),
  sidebarName: z.string().max(50).optional().nullable(),
  sidebarPosition: z.number().min(1).optional().nullable(),
})

// GET - List pages
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

    const pages = await prisma.page.findMany({
      where,
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { sections: true },
        },
      },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST - Create page
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

    const validated = pageSchema.parse(data)

    // Check unique slug
    const existing = await prisma.page.findUnique({
      where: { website_slug: { website, slug: validated.slug } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Eine Seite mit diesem Slug existiert bereits' }, { status: 400 })
    }

    const page = await prisma.page.create({
      data: {
        website,
        slug: validated.slug,
        title: validated.title,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
        heroTitle: validated.heroTitle,
        heroSubtitle: validated.heroSubtitle,
        heroDescription: validated.heroDescription,
        heroImage: validated.heroImage,
        heroButtonText: validated.heroButtonText,
        heroButtonLink: validated.heroButtonLink,
        heroTextColor: validated.heroTextColor,
        heroCardColor: validated.heroCardColor,
        active: validated.active ?? true,
        // Navigation settings
        showInSidebar: validated.showInSidebar ?? false,
        sidebarName: validated.sidebarName,
        sidebarPosition: validated.sidebarPosition,
      },
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create page error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
