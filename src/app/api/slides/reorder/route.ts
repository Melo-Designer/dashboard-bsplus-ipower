import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { slideIds } = await request.json()

    if (!Array.isArray(slideIds)) {
      return NextResponse.json({ error: 'Ungültiges Format' }, { status: 400 })
    }

    // Update sort order for each slide
    await Promise.all(
      slideIds.map((id, index) =>
        prisma.slide.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder slides error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
