import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// Public keys that can be accessed without authentication
const PUBLIC_SETTING_KEYS = [
  'company_name',
  'company_tagline',
  'company_description',
  'contact_email',
  'contact_phone',
  'contact_fax',
  'address_street',
  'address_zip',
  'address_city',
  'address_country',
  'social_facebook',
  'social_instagram',
  'social_linkedin',
  'social_youtube',
  'social_xing',
  'google_maps_embed',
  'opening_hours',
]

/**
 * GET /api/public/settings
 * Public endpoint to retrieve settings for frontend websites
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

    const settings = await prisma.setting.findMany({
      where: {
        website,
        key: { in: PUBLIC_SETTING_KEYS },
      },
    })

    const settingsObject = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )

    // Set cache headers for performance
    return NextResponse.json(
      { settings: settingsObject },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Get public settings error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    )
  }
}
