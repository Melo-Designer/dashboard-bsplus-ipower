import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus, Website } from '@/generated/prisma'

// GET - List all applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website
    const status = searchParams.get('status') as ApplicationStatus | null
    const jobId = searchParams.get('jobId')

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const where: {
      job: { website: Website }
      status?: ApplicationStatus
      jobId?: string
    } = {
      job: { website },
    }

    if (status && ['new', 'reviewing', 'interviewed', 'accepted', 'rejected'].includes(status)) {
      where.status = status
    }
    if (jobId) {
      where.jobId = jobId
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    // Parse certificates JSON
    const parsedApplications = applications.map((app) => ({
      ...app,
      certificates: app.certificatesJson ? JSON.parse(app.certificatesJson) : [],
    }))

    return NextResponse.json({ applications: parsedApplications })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
