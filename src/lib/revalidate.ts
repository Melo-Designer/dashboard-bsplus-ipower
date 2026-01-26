/**
 * Trigger cache revalidation on frontend websites
 *
 * Called after content updates (slides, sections, pages) to ensure
 * the frontend reflects changes immediately without waiting for cache expiry.
 */

type Website = 'bs_plus' | 'ipower'
type RevalidateTag = 'slides' | 'sections' | 'homepage' | 'pages'

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
