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

    // Get navbar items (sections with showInNavbar enabled)
    const navbarSections = await prisma.homepageSection.findMany({
      where: {
        website,
        active: true,
        showInNavbar: true,
      },
      orderBy: { navbarPosition: 'asc' },
      select: {
        id: true,
        identifier: true,
        title: true,
        navbarName: true,
        navbarPosition: true,
      },
    })

    // Get sidebar items (pages with showInSidebar enabled)
    const sidebarPages = await prisma.page.findMany({
      where: {
        website,
        active: true,
        showInSidebar: true,
      },
      orderBy: { sidebarPosition: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        sidebarName: true,
        sidebarPosition: true,
      },
    })

    // Format navbar items
    const navbar = navbarSections.map((section) => ({
      id: section.id,
      name: section.navbarName || section.title,
      identifier: section.identifier,
      position: section.navbarPosition || 0,
    }))

    // Format sidebar items
    const sidebar = sidebarPages.map((page) => ({
      id: page.id,
      name: page.sidebarName || page.title,
      slug: page.slug,
      position: page.sidebarPosition || 0,
    }))

    return NextResponse.json(
      { navbar, sidebar },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Get navigation error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
