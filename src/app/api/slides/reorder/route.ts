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

    const { slideIds } = await request.json()

    if (!Array.isArray(slideIds) || slideIds.length === 0) {
      return NextResponse.json({ error: 'Ungültiges Format' }, { status: 400 })
    }

    // Get website from first slide
    const firstSlide = await prisma.slide.findUnique({
      where: { id: slideIds[0] },
      select: { website: true },
    })

    // Update sort order for each slide
    await Promise.all(
      slideIds.map((id, index) =>
        prisma.slide.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    // Trigger frontend cache revalidation (non-blocking)
    if (firstSlide) {
      revalidateFrontend(firstSlide.website as 'bs_plus' | 'ipower', { tag: 'slides' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder slides error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
