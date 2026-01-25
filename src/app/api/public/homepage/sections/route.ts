import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const sections = await prisma.homepageSection.findMany({
      where: { website, active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        identifier: true,
        title: true,
        subtitle: true,
        description: true,
        backgroundImage: true,
        backgroundColor: true,
        textColor: true,
        cards: true,
      },
    })

    const parsed = sections.map((section) => ({
      ...section,
      cards: section.cards ? JSON.parse(section.cards) : [],
    }))

    return NextResponse.json(
      { sections: parsed },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Get public sections error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
