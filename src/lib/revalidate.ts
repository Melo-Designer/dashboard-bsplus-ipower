/**
 * Trigger cache revalidation on frontend websites
 *
 * Called after content updates (slides, sections, pages) to ensure
 * the frontend reflects changes immediately without waiting for cache expiry.
 */

type Website = 'bs_plus' | 'ipower'
type RevalidateTag = 'slides' | 'sections' | 'homepage' | 'pages' | 'contact-page' | 'karriere-page' | 'journal-page'

interface RevalidateOptions {
  tag?: RevalidateTag
  path?: string
}

const config: Record<Website, { url: string; secret: string }> = {
  bs_plus: {
    url: process.env.BSPLUS_REVALIDATE_URL || '',
    secret: process.env.BSPLUS_REVALIDATE_SECRET || '',
  },
  ipower: {
    url: process.env.IPOWER_REVALIDATE_URL || '',
    secret: process.env.IPOWER_REVALIDATE_SECRET || '',
  },
}

/**
 * Mapping of page slugs to their cache tags
 */
const PAGE_SLUG_TO_TAG: Record<string, RevalidateTag> = {
  kontakt: 'contact-page',
  karriere: 'karriere-page',
  journal: 'journal-page',
  home: 'homepage',
}

/**
 * Mapping of setting key prefixes to their cache tags
 */
const SETTING_PREFIX_TO_TAG: Record<string, RevalidateTag> = {
  contact_: 'contact-page',
  karriere_: 'karriere-page',
  journal_: 'journal-page',
  homepage_: 'homepage',
}

/**
 * Get the cache tag for a page slug
 */
export function getTagForPageSlug(pageSlug: string): RevalidateTag | null {
  return PAGE_SLUG_TO_TAG[pageSlug] || null
}

/**
 * Get the cache tag for a setting key based on its prefix
 */
export function getTagForSettingKey(key: string): RevalidateTag | null {
  for (const [prefix, tag] of Object.entries(SETTING_PREFIX_TO_TAG)) {
    if (key.startsWith(prefix)) {
      return tag
    }
  }
  return null
}

/**
 * Get unique cache tags for a list of setting keys
 */
export function getTagsForSettingKeys(keys: string[]): RevalidateTag[] {
  const tags = new Set<RevalidateTag>()
  for (const key of keys) {
    const tag = getTagForSettingKey(key)
    if (tag) tags.add(tag)
  }
  return Array.from(tags)
}

/**
 * Trigger revalidation for a specific website
 *
 * @param website - Which frontend to revalidate ('bs_plus' or 'ipower')
 * @param options - Optional tag or path to revalidate
 *
 * @example
 * // Revalidate slides cache
 * await revalidateFrontend('bs_plus', { tag: 'slides' })
 *
 * // Revalidate specific page
 * await revalidateFrontend('bs_plus', { path: '/bhkw-anlagenbau' })
 *
 * // Revalidate homepage (default)
 * await revalidateFrontend('bs_plus')
 */
export async function revalidateFrontend(
  website: Website,
  options: RevalidateOptions = {}
): Promise<boolean> {
  const { url, secret } = config[website]

  // Skip if not configured (e.g., in development without frontend running)
  if (!url || !secret) {
    console.log(`[Revalidate] Skipped - no config for ${website}`)
    return false
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        tag: options.tag,
        path: options.path,
      }),
    })

    if (!response.ok) {
      console.error(`[Revalidate] Failed for ${website}:`, await response.text())
      return false
    }

    const result = await response.json()
    console.log(`[Revalidate] Success for ${website}:`, result)
    return true
  } catch (error) {
    // Don't fail the main operation if revalidation fails
    // (e.g., frontend might be offline in development)
    console.error(`[Revalidate] Error for ${website}:`, error)
    return false
  }
}

/**
 * Revalidate frontend cache for a page by its slug
 *
 * @example
 * await revalidatePageBySlug('bs_plus', 'kontakt')
 */
export async function revalidatePageBySlug(
  website: Website,
  pageSlug: string
): Promise<boolean> {
  const tag = getTagForPageSlug(pageSlug)
  if (!tag) {
    console.log(`[Revalidate] No tag mapping for page slug: ${pageSlug}`)
    return false
  }
  return revalidateFrontend(website, { tag })
}

/**
 * Revalidate frontend cache for settings based on the keys being updated
 *
 * @example
 * await revalidateForSettings('bs_plus', ['contact_form_title', 'contact_cta_active'])
 */
export async function revalidateForSettings(
  website: Website,
  settingKeys: string[]
): Promise<boolean[]> {
  const tags = getTagsForSettingKeys(settingKeys)
  return Promise.all(tags.map((tag) => revalidateFrontend(website, { tag })))
}
