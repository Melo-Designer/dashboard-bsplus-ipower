import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { sectionIds } = await request.json()

    if (!Array.isArray(sectionIds)) {
      return NextResponse.json({ error: 'Ungültiges Format' }, { status: 400 })
    }

    await Promise.all(
      sectionIds.map((id, index) =>
        prisma.homepageSection.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder sections error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
