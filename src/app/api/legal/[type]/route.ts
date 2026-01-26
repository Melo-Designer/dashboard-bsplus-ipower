import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const legalPageSchema = z.object({
  website: z.enum(['bs_plus', 'ipower']),
  title: z.string().min(1, 'Titel ist erforderlich'),
  content: z.string().min(1, 'Inhalt ist erforderlich'),
})

// GET - Get specific legal page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { type } = await params
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website')

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Ungültige Website' }, { status: 400 })
    }

    const validTypes = ['impressum', 'datenschutz', 'barrierefreiheit']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Ungültiger Seitentyp' }, { status: 400 })
    }

    const page = await prisma.legalPage.findUnique({
      where: {
        website_type: {
          website: website as 'bs_plus' | 'ipower',
          type,
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Get legal page error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update or create legal page (upsert)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { type } = await params
    const body = await request.json()

    const validTypes = ['impressum', 'datenschutz', 'barrierefreiheit']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Ungültiger Seitentyp' }, { status: 400 })
    }

    const validated = legalPageSchema.parse(body)

    const page = await prisma.legalPage.upsert({
      where: {
        website_type: {
          website: validated.website,
          type,
        },
      },
      update: {
        title: validated.title,
        content: validated.content,
        lastUpdated: new Date(),
      },
      create: {
        website: validated.website,
        type,
        title: validated.title,
        content: validated.content,
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update legal page error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}
