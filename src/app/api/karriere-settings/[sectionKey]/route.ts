import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidateFrontend } from '@/lib/revalidate'
import { Website } from '@/generated/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  website: z.enum(['bs_plus', 'ipower']),
  backgroundImage: z.string().nullable(),
  accentColor: z.string().nullable(),
})

// PUT - Update karriere section settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { sectionKey } = await params

    // Validate section key
    if (!['hero', 'cta'].includes(sectionKey)) {
      return NextResponse.json({ error: 'Ungültiger Abschnitt' }, { status: 400 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body)
    const { website, backgroundImage, accentColor } = validated

    // Update or create image setting
    const imageKey = `karriere_section_${sectionKey}_image`
    if (backgroundImage) {
      await prisma.setting.upsert({
        where: { website_key: { website, key: imageKey } },
        create: { website, key: imageKey, value: backgroundImage },
        update: { value: backgroundImage },
      })
    } else {
      // Delete the setting if image is null
      await prisma.setting.deleteMany({
        where: { website, key: imageKey },
      })
    }

    // Update or create color setting
    const colorKey = `karriere_section_${sectionKey}_color`
    if (accentColor) {
      await prisma.setting.upsert({
        where: { website_key: { website, key: colorKey } },
        create: { website, key: colorKey, value: accentColor },
        update: { value: accentColor },
      })
    } else {
      await prisma.setting.deleteMany({
        where: { website, key: colorKey },
      })
    }

    // Revalidate frontend karriere pages
    revalidateFrontend(website as 'bs_plus' | 'ipower', { tag: 'karriere' })

    return NextResponse.json({
      sectionKey,
      backgroundImage,
      accentColor,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update karriere settings error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}
