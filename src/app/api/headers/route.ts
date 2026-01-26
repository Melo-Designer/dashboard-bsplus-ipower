import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all headers for a website
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website')

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Ungültige Website' }, { status: 400 })
    }

    const headers = await prisma.pageHeader.findMany({
      where: { website: website as 'bs_plus' | 'ipower' },
      orderBy: { pageSlug: 'asc' },
    })

    return NextResponse.json({ headers })
  } catch (error) {
    console.error('Get headers error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
