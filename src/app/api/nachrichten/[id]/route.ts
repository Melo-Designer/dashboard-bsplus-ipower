import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const messageUpdateSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
})

// GET - Get single message
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

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json({ error: 'Nachricht nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Get message error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update message (read, archived)
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

    const validated = messageUpdateSchema.parse(body)

    // Check if message exists
    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Nachricht nicht gefunden' }, { status: 404 })
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(message)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update message error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete message
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

    // Check if message exists
    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Nachricht nicht gefunden' }, { status: 404 })
    }

    await prisma.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
