import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidateFrontend } from '@/lib/revalidate'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { sectionIds } = await request.json()

    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
      return NextResponse.json({ error: 'Ungültiges Format' }, { status: 400 })
    }

    // Get website from first section
    const firstSection = await prisma.homepageSection.findUnique({
      where: { id: sectionIds[0] },
      select: { website: true },
    })

    await Promise.all(
      sectionIds.map((id, index) =>
        prisma.homepageSection.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    // Trigger frontend cache revalidation (non-blocking)
    if (firstSection) {
      revalidateFrontend(firstSection.website as 'bs_plus' | 'ipower', { tag: 'sections' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder sections error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
