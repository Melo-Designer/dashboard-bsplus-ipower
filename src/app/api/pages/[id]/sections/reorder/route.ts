import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidateFrontend } from '@/lib/revalidate'

const reorderSchema = z.object({
  sectionIds: z.array(z.string()).min(1),
})

// PUT - Reorder sections
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: pageId } = await params
    const body = await request.json()

    const validated = reorderSchema.parse(body)

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })
    if (!page) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    // Update sortOrder for each section
    await Promise.all(
      validated.sectionIds.map((id, index) =>
        prisma.pageSection.updateMany({
          where: { id, pageId },
          data: { sortOrder: index },
        })
      )
    )

    // Trigger frontend revalidation
    await revalidateFrontend(page.website as 'bs_plus' | 'ipower', { path: `/${page.slug}` })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Reorder sections error:', error)
    return NextResponse.json({ error: 'Fehler beim Sortieren' }, { status: 500 })
  }
}
