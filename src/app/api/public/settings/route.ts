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
  // Contact page content
  'contact_form_title',
  'contact_form_description',
  'contact_cta_title',
  'contact_cta_description',
  'contact_cta_image',
  // Karriere ARCHIVE page content
  'karriere_hero_title',
  'karriere_hero_description',
  'karriere_hero_button_text',
  'karriere_hero_button_link',
  'karriere_benefits_active',
  'karriere_benefit_1_title',
  'karriere_benefit_1_content',
  'karriere_benefit_2_title',
  'karriere_benefit_2_content',
  'karriere_benefit_3_title',
  'karriere_benefit_3_content',
  'karriere_jobs_title',
  'karriere_empty_title',
  'karriere_empty_description',
  'karriere_empty_button_text',
  'karriere_empty_button_link',
  'karriere_about_active',
  'karriere_about_title',
  'karriere_about_content',
  'karriere_about_button_text',
  'karriere_about_button_link',
  'karriere_about_image',
  'karriere_about_image_alt',
  'karriere_archive_cta_active',
  'karriere_archive_cta_title',
  'karriere_archive_cta_description',
  'karriere_archive_cta_button1_text',
  'karriere_archive_cta_button1_link',
  'karriere_archive_cta_button2_text',
  'karriere_archive_cta_button2_link',
  'karriere_archive_cta_image',
  // Karriere SINGLE JOB page content
  'karriere_detail_tasks_title',
  'karriere_detail_profile_title',
  'karriere_detail_benefits_title',
  'karriere_detail_overview_title',
  'karriere_detail_apply_button',
  'karriere_form_title',
  'karriere_form_submit_button',
  'karriere_form_success_message',
  'karriere_form_error_message',
  'karriere_single_cta_active',
  'karriere_single_cta_title',
  'karriere_single_cta_description',
  'karriere_single_cta_button1_text',
  'karriere_single_cta_button1_link',
  'karriere_single_cta_button2_text',
  'karriere_single_cta_button2_link',
  'karriere_single_cta_image',
  // Karriere section images (hero)
  'karriere_section_hero_image',
  'karriere_section_hero_color',
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
