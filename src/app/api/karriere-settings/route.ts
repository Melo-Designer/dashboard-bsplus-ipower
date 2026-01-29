import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// Section keys
const SECTION_KEYS = ['hero', 'cta'] as const

// GET - Get all karriere section settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    // Fetch all karriere section settings
    const settings = await prisma.setting.findMany({
      where: {
        website,
        key: {
          startsWith: 'karriere_section_',
        },
      },
    })

    // Parse settings into section objects
    const sections = SECTION_KEYS.map((sectionKey) => {
      const imageKey = `karriere_section_${sectionKey}_image`
      const colorKey = `karriere_section_${sectionKey}_color`

      const imageSetting = settings.find((s) => s.key === imageKey)
      const colorSetting = settings.find((s) => s.key === colorKey)

      return {
        sectionKey,
        backgroundImage: imageSetting?.value || null,
        accentColor: colorSetting?.value || null,
      }
    }).filter((s) => s.backgroundImage || s.accentColor)

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Get karriere settings error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
