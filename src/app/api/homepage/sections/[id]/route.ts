import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidateFrontend } from '@/lib/revalidate'
import { z } from 'zod'

const cardSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  btnClass: z.enum(['primary', 'secondary']).optional().nullable(),
})

const updateSchema = z.object({
  identifier: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
  backgroundColor: z.enum(['primary', 'secondary', 'light', 'dark']).optional().nullable(),
  textColor: z.enum(['light', 'dark']).optional().nullable(),
  cards: z.array(cardSchema).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
  // Navigation settings
  showInNavbar: z.boolean().optional(),
  navbarName: z.string().max(50).optional().nullable(),
  navbarPosition: z.number().min(1).max(5).optional().nullable(),
})

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const section = await prisma.homepageSection.findUnique({ where: { id } })

    if (!section) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      ...section,
      cards: section.cards ? JSON.parse(section.cards) : [],
    })
  } catch (error) {
    console.error('Get section error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateSchema.parse(body)

    // Get current section to check website and current navbar status
    const currentSection = await prisma.homepageSection.findUnique({
      where: { id },
      select: { website: true, showInNavbar: true, navbarPosition: true },
    })
    if (!currentSection) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
    }

    // Validate navbar settings
    if (validated.showInNavbar === true && !currentSection.showInNavbar) {
      // Enabling navbar - check max 5
      const navbarCount = await prisma.homepageSection.count({
        where: { website: currentSection.website, showInNavbar: true },
      })
      if (navbarCount >= 5) {
        return NextResponse.json(
          { error: 'Maximal 5 Abschnitte können in der Navigation angezeigt werden' },
          { status: 400 }
        )
      }
    }

    // Check position uniqueness (if changing position or enabling navbar)
    if (validated.navbarPosition !== undefined && validated.navbarPosition !== null) {
      const positionTaken = await prisma.homepageSection.findFirst({
        where: {
          website: currentSection.website,
          navbarPosition: validated.navbarPosition,
          id: { not: id },
        },
      })
      if (positionTaken) {
        return NextResponse.json(
          { error: `Position ${validated.navbarPosition} ist bereits vergeben` },
          { status: 400 }
        )
      }
    }

    // Clear navbar fields if disabling navbar
    if (validated.showInNavbar === false) {
      validated.navbarName = null
      validated.navbarPosition = null
    }

    const updateData: Record<string, unknown> = { ...validated }
    if (validated.cards !== undefined) {
      updateData.cards = JSON.stringify(validated.cards)
    }

    const section = await prisma.homepageSection.update({
      where: { id },
      data: updateData,
    })

    // Trigger frontend cache revalidation (non-blocking)
    revalidateFrontend(section.website as 'bs_plus' | 'ipower', { tag: 'sections' })
    // Also revalidate navigation when navbar settings might have changed
    revalidateFrontend(section.website as 'bs_plus' | 'ipower', { tag: 'navigation' })

    return NextResponse.json({
      ...section,
      cards: section.cards ? JSON.parse(section.cards) : [],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update section error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    // Get website before deleting
    const section = await prisma.homepageSection.findUnique({
      where: { id },
      select: { website: true },
    })

    await prisma.homepageSection.delete({ where: { id } })

    // Trigger frontend cache revalidation (non-blocking)
    if (section) {
      revalidateFrontend(section.website as 'bs_plus' | 'ipower', { tag: 'sections' })
      revalidateFrontend(section.website as 'bs_plus' | 'ipower', { tag: 'navigation' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
