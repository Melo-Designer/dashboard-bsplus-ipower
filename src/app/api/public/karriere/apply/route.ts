import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'
import { sendEmail } from '@/lib/email'

const applicationSchema = z.object({
  jobSlug: z.string().min(1, 'Stelle ist erforderlich'),
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  coverMessage: z.string().optional(),
})

/**
 * POST /api/public/karriere/apply
 * Public endpoint to receive job applications
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json(
        { error: 'Website parameter erforderlich' },
        { status: 400 }
      )
    }

    // Parse form data or JSON
    let data: Record<string, string>
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      data = await request.json()
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      data = Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [key, value.toString()])
      )
    } else {
      return NextResponse.json(
        { error: 'Ungültiger Content-Type' },
        { status: 400 }
      )
    }

    // Validate input
    const validation = applicationSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { jobSlug, firstName, lastName, email, phone, coverMessage } = validation.data

    // Find the job by slug
    const job = await prisma.jobListing.findUnique({
      where: {
        website_slug: { website, slug: jobSlug },
      },
    })

    if (!job || job.status !== 'published') {
      return NextResponse.json(
        { error: 'Stelle nicht gefunden' },
        { status: 404 }
      )
    }

    // Create the application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        firstName,
        lastName,
        email,
        phone: phone || null,
        coverMessage: coverMessage || null,
      },
    })

    // Get notification email from job contactEmail or settings
    const recipientEmail = job.contactEmail || await getNotificationEmail(website)

    if (recipientEmail) {
      const companyName = website === 'bs_plus' ? 'BSplus MotorenService GmbH' : 'iPower GmbH'
      const fullName = `${firstName} ${lastName}`

      await sendEmail({
        to: recipientEmail,
        subject: `Neue Bewerbung: ${job.title}`,
        html: `
          <h2>Neue Bewerbung eingegangen</h2>
          <p>Eine neue Bewerbung für die Stelle <strong>${job.title}</strong> wurde eingereicht.</p>

          <h3>Bewerber</h3>
          <ul>
            <li><strong>Name:</strong> ${fullName}</li>
            <li><strong>E-Mail:</strong> ${email}</li>
            ${phone ? `<li><strong>Telefon:</strong> ${phone}</li>` : ''}
          </ul>

          ${coverMessage ? `
          <h3>Anschreiben</h3>
          <p>${coverMessage.replace(/\n/g, '<br>')}</p>
          ` : ''}

          <hr>
          <p style="color: #666; font-size: 12px;">
            Diese E-Mail wurde automatisch von ${companyName} generiert.
          </p>
        `,
        replyTo: email,
      })
    }

    return NextResponse.json(
      { success: true, message: 'Bewerbung erfolgreich gesendet', id: application.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Job application error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Bewerbung' },
      { status: 500 }
    )
  }
}

async function getNotificationEmail(website: Website): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: {
      website_key: {
        website,
        key: 'contact_email',
      },
    },
  })
  return setting?.value || null
}
