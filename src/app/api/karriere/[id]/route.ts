import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const jobUpdateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten').optional(),
  title: z.string().min(1, 'Titel ist erforderlich').optional(),
  company: z.string().optional().nullable(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  employmentType: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
})

// GET - Get single job listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const job = await prisma.jobListing.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Stelle nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
    })
  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT - Update job listing
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

    const validated = jobUpdateSchema.parse(body)

    // Check if job exists
    const existing = await prisma.jobListing.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Stelle nicht gefunden' }, { status: 404 })
    }

    // Check unique slug if changed
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.jobListing.findUnique({
        where: {
          website_slug: {
            website: existing.website,
            slug: validated.slug,
          },
        },
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Eine Stelle mit diesem Slug existiert bereits' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (validated.slug !== undefined) updateData.slug = validated.slug
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.company !== undefined) updateData.company = validated.company
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.requirements !== undefined) updateData.requirements = JSON.stringify(validated.requirements)
    if (validated.benefits !== undefined) updateData.benefits = JSON.stringify(validated.benefits)
    if (validated.responsibilities !== undefined) updateData.responsibilities = JSON.stringify(validated.responsibilities)
    if (validated.employmentType !== undefined) updateData.employmentType = validated.employmentType
    if (validated.location !== undefined) updateData.location = validated.location
    if (validated.salary !== undefined) updateData.salary = validated.salary
    if (validated.featuredImage !== undefined) updateData.featuredImage = validated.featuredImage
    if (validated.contactEmail !== undefined) updateData.contactEmail = validated.contactEmail
    if (validated.status !== undefined) updateData.status = validated.status
    if (validated.publishedAt !== undefined) {
      updateData.publishedAt = validated.publishedAt ? new Date(validated.publishedAt) : null
    }
    if (validated.applicationDeadline !== undefined) {
      updateData.applicationDeadline = validated.applicationDeadline ? new Date(validated.applicationDeadline) : null
    }

    const job = await prisma.jobListing.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update job error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete job listing
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

    // Check if job exists
    const existing = await prisma.jobListing.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Stelle nicht gefunden' }, { status: 404 })
    }

    // Delete job (applications will cascade delete)
    await prisma.jobListing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
