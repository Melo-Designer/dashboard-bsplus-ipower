import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public legal page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
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
      select: {
        title: true,
        content: true,
        lastUpdated: true,
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Get public legal page error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
