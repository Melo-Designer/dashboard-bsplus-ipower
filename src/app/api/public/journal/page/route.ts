import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// Settings keys for journal page content
const JOURNAL_PAGE_SETTINGS = [
  // ===== ARCHIVE PAGE (Alle Beiträge) =====
  // SectionTextImage settings
  'journal_text_image_active',
  'journal_text_image_title',
  'journal_text_image_content',
  'journal_text_image_image',
  'journal_text_image_image_alt',
  'journal_text_image_align',
  'journal_text_image_mode',
  'journal_text_image_button_text',
  'journal_text_image_button_link',
  'journal_text_image_button_style',
  // SectionBlack (CTA) settings - Archive
  'journal_cta_active',
  'journal_cta_title',
  'journal_cta_content',
  'journal_cta_image',
  'journal_cta_button1_text',
  'journal_cta_button1_link',
  'journal_cta_button1_style',
  'journal_cta_button2_text',
  'journal_cta_button2_link',
  'journal_cta_button2_style',
  // ===== SINGLE POST PAGE (Einzelner Beitrag) =====
  // SectionBlack (CTA) settings - Single Post
  'journal_single_cta_active',
  'journal_single_cta_title',
  'journal_single_cta_content',
  'journal_single_cta_image',
  'journal_single_cta_button1_text',
  'journal_single_cta_button1_link',
  'journal_single_cta_button1_style',
  'journal_single_cta_button2_text',
  'journal_single_cta_button2_link',
  'journal_single_cta_button2_style',
]

/**
 * GET /api/public/journal/page
 * Public endpoint to fetch journal page content (header + settings)
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

    // Fetch page header for "journal"
    const header = await prisma.pageHeader.findUnique({
      where: {
        website_pageSlug: {
          website,
          pageSlug: 'journal',
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

    // Fetch journal page settings
    const settings = await prisma.setting.findMany({
      where: {
        website,
        key: { in: JOURNAL_PAGE_SETTINGS },
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
    console.error('Get journal page error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Journal-Seite' },
      { status: 500 }
    )
  }
}
