import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// GET - Get page by slug with sections for public consumption
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const page = await prisma.page.findUnique({
      where: {
        website_slug: {
          website,
          slug,
        },
      },
      include: {
        sections: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    if (!page.active) {
      return NextResponse.json({ error: 'Seite nicht aktiv' }, { status: 404 })
    }

    // Parse JSON fields in sections
    const parsedSections = page.sections.map((section) => ({
      id: section.id,
      type: section.type,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      imageUrl: section.imageUrl,
      imageAlt: section.imageAlt,
      imageAlign: section.imageAlign,
      items: section.items ? JSON.parse(section.items) : [],
      buttons: section.buttons ? JSON.parse(section.buttons) : [],
      cards: section.cards ? JSON.parse(section.cards) : [],
      stats: section.stats ? JSON.parse(section.stats) : [],
      backgroundImage: section.backgroundImage,
      backgroundColor: section.backgroundColor,
      textColor: section.textColor,
      sortOrder: section.sortOrder,
    }))

    const response = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      heroTitle: page.heroTitle,
      heroSubtitle: page.heroSubtitle,
      heroDescription: page.heroDescription,
      heroImage: page.heroImage,
      heroButtonText: page.heroButtonText,
      heroButtonLink: page.heroButtonLink,
      heroTextColor: page.heroTextColor,
      heroCardColor: page.heroCardColor,
      sections: parsedSections,
    }

    // Set cache headers for 5 minutes
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Get public page error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
