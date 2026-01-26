import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'

// GET - List published job listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const jobs = await prisma.jobListing.findMany({
      where: {
        website,
        status: 'published',
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        benefits: true,
        responsibilities: true,
        employmentType: true,
        location: true,
        salary: true,
        featuredImage: true,
        contactEmail: true,
        publishedAt: true,
        applicationDeadline: true,
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
    console.error('Get public jobs error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
