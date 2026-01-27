import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public header for a page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
  try {
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
      select: {
        title: true,
        description: true,
        backgroundImage: true,
        overlayColor: true,
        textColor: true,
      },
    })

    if (!header) {
      return NextResponse.json({ error: 'Header nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(header)
  } catch (error) {
    console.error('Get public header error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
