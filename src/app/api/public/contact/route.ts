import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'
import { sendEmail } from '@/lib/email'
import {
  generateContactNotificationEmail,
  generateContactNotificationSubject,
} from '@/lib/email-templates/contact-notification'

const contactSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Nachricht ist erforderlich'),
  subject: z.string().optional(),
  company: z.string().optional(),
})

/**
 * POST /api/public/contact
 * Public endpoint to receive contact form submissions
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
    const validation = contactSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { first_name, last_name, email, phone, message, subject, company } = validation.data
    const fullName = `${first_name} ${last_name}`.trim()

    // Store message in database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        website,
        name: fullName,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        company: company || null,
      },
    })

    // Get admin notification email from settings
    const emailSetting = await prisma.setting.findUnique({
      where: {
        website_key: {
          website,
          key: 'email_contact_recipient',
        },
      },
    })

    // Fallback to contact_email if no specific recipient is set
    const contactEmailSetting = await prisma.setting.findUnique({
      where: {
        website_key: {
          website,
          key: 'contact_email',
        },
      },
    })

    const recipientEmail = emailSetting?.value || contactEmailSetting?.value

    if (recipientEmail) {
      // Send email notification
      const emailHtml = generateContactNotificationEmail({
        website,
        name: fullName,
        email,
        phone: phone || undefined,
        subject: subject || undefined,
        message,
        company: company || undefined,
        submittedAt: contactMessage.createdAt,
      })

      const emailSubject = generateContactNotificationSubject({
        website,
        name: fullName,
        email,
        message,
        subject: subject || undefined,
        submittedAt: contactMessage.createdAt,
      })

      await sendEmail({
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        replyTo: email,
      })
    }

    return NextResponse.json(
      { success: true, message: 'Nachricht erfolgreich gesendet' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}
