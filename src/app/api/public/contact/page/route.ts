import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// Settings keys for contact page content
const CONTACT_PAGE_SETTINGS = [
  'contact_form_title',
  'contact_form_description',
  'contact_cta_title',
  'contact_cta_description',
  'contact_cta_image',
  'google_maps_embed',
  'contact_email',
  'contact_phone',
  'contact_fax',
  'address_street',
  'address_zip',
  'address_city',
  'address_country',
  'opening_hours',
]

/**
 * GET /api/public/contact/page
 * Public endpoint to fetch contact page content (header + settings)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json(
        { error: 'Website parameter erforderlich' },
        { status: 400 }
      )
    }

    // Fetch page header for "kontakt"
    const header = await prisma.pageHeader.findUnique({
      where: {
        website_pageSlug: {
          website,
          pageSlug: 'kontakt',
        },
      },
      select: {
        title: true,
        subtitle: true,
        description: true,
        backgroundImage: true,
        overlayColor: true,
        textColor: true,
      },
    })

    // Fetch contact page settings
    const settings = await prisma.setting.findMany({
      where: {
        website,
        key: { in: CONTACT_PAGE_SETTINGS },
      },
    })

    const settingsObject = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )

    return NextResponse.json(
      {
        header: header || null,
        settings: settingsObject,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Get contact page error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kontaktseite' },
      { status: 500 }
    )
  }
}
