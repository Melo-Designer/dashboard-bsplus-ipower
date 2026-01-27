import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePageBySlug } from '@/lib/revalidate'
import { z } from 'zod'

const headerUpdateSchema = z.object({
  website: z.enum(['bs_plus', 'ipower']),
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
  overlayColor: z.string().optional().nullable(),
  textColor: z.enum(['light', 'dark']).optional().nullable(),
})

// GET - Get single header
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { pageSlug } = await params
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website')

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Ungültige Website' }, { status: 400 })
    }

    const header = await prisma.pageHeader.findUnique({
      where: {
        website_pageSlug: {
          website: website as 'bs_plus' | 'ipower',
          pageSlug,
        },
      },
    })

    if (!header) {
      return NextResponse.json({ error: 'Header nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(header)
  } catch (error) {
    console.error('Get header error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update or create header (upsert)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { pageSlug } = await params
    const body = await request.json()

    const validated = headerUpdateSchema.parse(body)

    const header = await prisma.pageHeader.upsert({
      where: {
        website_pageSlug: {
          website: validated.website,
          pageSlug,
        },
      },
      update: {
        title: validated.title,
        description: validated.description,
        backgroundImage: validated.backgroundImage,
        overlayColor: validated.overlayColor,
        textColor: validated.textColor,
      },
      create: {
        website: validated.website,
        pageSlug,
        title: validated.title,
        description: validated.description,
        backgroundImage: validated.backgroundImage,
        overlayColor: validated.overlayColor,
        textColor: validated.textColor,
      },
    })

    // Trigger revalidation for the page
    revalidatePageBySlug(validated.website, pageSlug)

    return NextResponse.json(header)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update header error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}
