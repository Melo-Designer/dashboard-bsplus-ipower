import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const applicationUpdateSchema = z.object({
  status: z.enum(['new', 'reviewing', 'interviewed', 'accepted', 'rejected']).optional(),
  notes: z.string().optional().nullable(),
})

// GET - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            website: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Bewerbung nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      ...application,
      certificates: application.certificatesJson ? JSON.parse(application.certificatesJson) : [],
    })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update application (status, notes)
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

    const validated = applicationUpdateSchema.parse(body)

    // Check if application exists
    const existing = await prisma.jobApplication.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Bewerbung nicht gefunden' }, { status: 404 })
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: validated,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...application,
      certificates: application.certificatesJson ? JSON.parse(application.certificatesJson) : [],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete application
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

    // Check if application exists
    const existing = await prisma.jobApplication.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Bewerbung nicht gefunden' }, { status: 404 })
    }

    await prisma.jobApplication.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
