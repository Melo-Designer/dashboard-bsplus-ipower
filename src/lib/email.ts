import nodemailer from 'nodemailer'

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const defaultFrom = `${process.env.SMTP_FROM_NAME || 'Dashboard'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`

    await transporter.sendMail({
      from: options.from || defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Verify SMTP connection
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error('SMTP connection error:', error)
    return false
  }
}
