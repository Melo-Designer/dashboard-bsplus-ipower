import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

/**
 * GET /api/settings
 * Retrieve all settings for a website
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json(
        { error: 'Website parameter erforderlich' },
        { status: 400 }
      )
    }

    const settings = await prisma.setting.findMany({
      where: { website },
    })

    // Convert to key-value object
    const settingsObject = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )

    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings
 * Update settings for a website
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { website, settings } = body

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json(
        { error: 'Website parameter erforderlich' },
        { status: 400 }
      )
    }

    // Validate settings is an object
    if (typeof settings !== 'object' || settings === null) {
      return NextResponse.json(
        { error: 'Ungültiges Einstellungsformat' },
        { status: 400 }
      )
    }

    // Upsert each setting
    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { website_key: { website: website as Website, key } },
        update: { value: String(value) },
        create: {
          website: website as Website,
          key,
          value: String(value),
        },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({
      success: true,
      message: 'Einstellungen erfolgreich gespeichert'
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    )
  }
}
