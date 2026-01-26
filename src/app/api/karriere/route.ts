import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website, JobStatus } from '@/generated/prisma'
import { z } from 'zod'

const jobSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
  title: z.string().min(1, 'Titel ist erforderlich'),
  company: z.string().optional().nullable(),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
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

// GET - List job listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website
    const status = searchParams.get('status') as JobStatus | null
    const search = searchParams.get('search')

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const where: {
      website: Website
      status?: JobStatus
      title?: { contains: string; mode: 'insensitive' }
    } = { website }

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      where.status = status
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }

    const jobs = await prisma.jobListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    })

    // Parse JSON fields
    const parsedJobs = jobs.map((job) => ({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
    }))

    return NextResponse.json({ jobs: parsedJobs })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST - Create job listing
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { website, ...data } = body

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const validated = jobSchema.parse(data)

    // Check unique slug
    const existing = await prisma.jobListing.findUnique({
      where: { website_slug: { website, slug: validated.slug } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Eine Stelle mit diesem Slug existiert bereits' }, { status: 400 })
    }

    const job = await prisma.jobListing.create({
      data: {
        website,
        slug: validated.slug,
        title: validated.title,
        company: validated.company,
        description: validated.description,
        requirements: validated.requirements ? JSON.stringify(validated.requirements) : null,
        benefits: validated.benefits ? JSON.stringify(validated.benefits) : null,
        responsibilities: validated.responsibilities ? JSON.stringify(validated.responsibilities) : null,
        employmentType: validated.employmentType,
        location: validated.location,
        salary: validated.salary,
        featuredImage: validated.featuredImage,
        contactEmail: validated.contactEmail,
        status: validated.status || 'draft',
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : null,
        applicationDeadline: validated.applicationDeadline ? new Date(validated.applicationDeadline) : null,
      },
    })

    return NextResponse.json({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
