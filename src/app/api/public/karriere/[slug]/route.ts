import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// GET - Get single published job by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const job = await prisma.jobListing.findUnique({
      where: {
        website_slug: { website, slug },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Stelle nicht gefunden' }, { status: 404 })
    }

    // Check if published
    if (job.status !== 'published') {
      return NextResponse.json({ error: 'Stelle nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
      employmentType: job.employmentType,
      location: job.location,
      salary: job.salary,
      featuredImage: job.featuredImage,
      contactEmail: job.contactEmail,
      publishedAt: job.publishedAt,
      applicationDeadline: job.applicationDeadline,
    })
  } catch (error) {
    console.error('Get public job error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
