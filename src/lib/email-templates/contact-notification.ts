import type { Website } from '@/generated/prisma'

interface ContactNotificationData {
  website: Website
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  company?: string
  submittedAt: Date
}

const websiteConfig = {
  bs_plus: {
    name: 'BS Plus',
    fullName: 'BSplus MotorenService GmbH',
    primaryColor: '#c8102e', // BS Plus red
    logoUrl: 'https://bsplus-service.de/img/logo.svg',
    websiteUrl: 'https://bsplus-service.de',
  },
  ipower: {
    name: 'iPower',
    fullName: 'iPower GmbH',
    primaryColor: '#035e83', // iPower blue
    logoUrl: 'https://ipower.de/img/logo.svg',
    websiteUrl: 'https://ipower.de',
  },
}

export function generateContactNotificationEmail(data: ContactNotificationData): string {
  const config = websiteConfig[data.website]
  const formattedDate = data.submittedAt.toLocaleString('de-DE', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Kontaktanfrage - ${config.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${config.primaryColor}; padding: 30px 40px; text-align: center;">
              <img src="${config.logoUrl}" alt="${config.name}" height="40" style="height: 40px; max-width: 200px;">
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                Neue Kontaktanfrage
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: #666666;">
                Eingegangen am ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">

                    <!-- Name -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 120px; vertical-align: top;">
                          <span style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Name</span>
                        </td>
                        <td style="vertical-align: top;">
                          <span style="font-size: 15px; color: #1a1a1a; font-weight: 500;">${escapeHtml(data.name)}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Email -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 120px; vertical-align: top;">
                          <span style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">E-Mail</span>
                        </td>
                        <td style="vertical-align: top;">
                          <a href="mailto:${escapeHtml(data.email)}" style="font-size: 15px; color: ${config.primaryColor}; text-decoration: none;">${escapeHtml(data.email)}</a>
                        </td>
                      </tr>
                    </table>

                    ${data.phone ? `
                    <!-- Phone -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 120px; vertical-align: top;">
                          <span style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Telefon</span>
                        </td>
                        <td style="vertical-align: top;">
                          <a href="tel:${escapeHtml(data.phone)}" style="font-size: 15px; color: ${config.primaryColor}; text-decoration: none;">${escapeHtml(data.phone)}</a>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    ${data.company ? `
                    <!-- Company -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 120px; vertical-align: top;">
                          <span style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Firma</span>
                        </td>
                        <td style="vertical-align: top;">
                          <span style="font-size: 15px; color: #1a1a1a;">${escapeHtml(data.company)}</span>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    ${data.subject ? `
                    <!-- Subject -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="width: 120px; vertical-align: top;">
                          <span style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Betreff</span>
                        </td>
                        <td style="vertical-align: top;">
                          <span style="font-size: 15px; color: #1a1a1a;">${escapeHtml(data.subject)}</span>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">
                Nachricht
              </h2>
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1a1a1a; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 6px; background-color: ${config.primaryColor};">
                    <a href="mailto:${escapeHtml(data.email)}?subject=Re: ${escapeHtml(data.subject || 'Ihre Anfrage')}" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Antworten
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #666666; text-align: center;">
                Diese E-Mail wurde automatisch vom Kontaktformular auf<br>
                <a href="${config.websiteUrl}" style="color: ${config.primaryColor}; text-decoration: none;">${config.websiteUrl}</a> generiert.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

export function generateContactNotificationSubject(data: ContactNotificationData): string {
  const config = websiteConfig[data.website]
  const subject = data.subject ? `: ${data.subject}` : ''
  return `Neue Kontaktanfrage von ${data.name}${subject} - ${config.name}`
}
