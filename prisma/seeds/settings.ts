import { PrismaClient, Website } from '../../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

// BS Plus Settings
const bsPlusSettings: Record<string, string> = {
  // Company
  company_name: 'BSplus MotorenService GmbH',
  company_tagline: 'Spezialist für Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen',
  company_description: 'BSplus MotorenService GmbH ist Ihr kompetenter Partner für die Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen. Mit jahrelanger Erfahrung bieten wir professionelle Lösungen für BHKW-Betreiber.',

  // Contact
  contact_email: 'info@bsplus-service.de',
  contact_phone: '+49 4475 91848 0',
  contact_fax: '',

  // Address
  address_street: 'Roggenkamp 3',
  address_zip: '49696',
  address_city: 'Molbergen',
  address_country: 'Deutschland',

  // Social Media
  social_facebook: 'https://www.facebook.com/BSPlusMotorenServiceGmbH',
  social_instagram: '',
  social_linkedin: 'https://www.linkedin.com/company/bsplus-motorenservice-gmbh',
  social_youtube: '',
  social_xing: '',

  // Email Configuration
  email_from_name: 'BSplus MotorenService GmbH',
  email_from_address: 'info@bsplus-service.de',
  email_contact_recipient: 'info@bsplus-service.de',
  email_application_recipient: 'info@bsplus-service.de',

  // Misc
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9639.50792506913!2d7.9086251!3d52.8426017!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b713bc43a4fa7b%3A0x9c65c47a9b45c972!2sBSplus%20MotorenService!5e0!3m2!1sen!2sbr!4v1729111101968!5m2!1sen!2sbr',
  opening_hours: 'Mo-Fr: 08:00 - 17:00 Uhr',

  // Contact Page Content
  contact_form_title: 'SIE HABEN FRAGEN?',
  contact_form_description: 'Kommen Sie mit uns ins Gespräch, wenn es um Ihr Energieprojekt geht. Schicken Sie uns Ihr Feedback. Oder wenn Sie einfach nur mehr über BSplus erfahren möchten, wir freuen uns über Ihre Kontaktaufnahme.',
  contact_cta_title: '',
  contact_cta_description: '',
  contact_cta_image: '',
}

// iPower Settings
const iPowerSettings: Record<string, string> = {
  // Company
  company_name: 'iPower GmbH',
  company_tagline: 'Ingenieurbüro für Planung, Erzeugung, Umwandlung und Nutzung',
  company_description: 'iPower bietet Planungs- und Ingenieurlösungen in den Bereichen Energie, Wärme, Infrastruktur und Bau an.',

  // Contact
  contact_email: 'info@ipower.de',
  contact_phone: '+49 4475 91848 0',
  contact_fax: '+49 4475 91848 10',

  // Address
  address_street: 'Roggenkamp 3',
  address_zip: '49696',
  address_city: 'Molbergen',
  address_country: 'Deutschland',

  // Social Media
  social_facebook: 'https://www.facebook.com/profile.php?id=61583672984078',
  social_instagram: 'https://instagram.com/ipower.gmbh',
  social_linkedin: 'https://www.linkedin.com/company/ipower-gmbh/',
  social_youtube: '',
  social_xing: '',

  // Email Configuration
  email_from_name: 'iPower GmbH',
  email_from_address: 'info@ipower.de',
  email_contact_recipient: 'info@ipower.de',
  email_application_recipient: 'info@ipower.de',

  // Misc
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9639.50792506913!2d7.9086251!3d52.8426017!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b713bc43a4fa7b%3A0x9c65c47a9b45c972!2sBSplus%20MotorenService!5e0!3m2!1sen!2sbr!4v1729111101968!5m2!1sen!2sbr',
  opening_hours: 'Mo-Fr: 08:00 - 17:00 Uhr',

  // Contact Page Content
  contact_form_title: 'SIE HABEN FRAGEN?',
  contact_form_description: 'Wir zeigen Ihnen gerne, welchen wertvollen Beitrag unsere intelligent vernetzten Lösungen zu Ihrem Erfolg leisten können.\n\nWenn Sie mehr über unser Unternehmen, unsere Arbeit und unsere Projekte erfahren wollen oder und Anregungen geben und Feedback erteilen wollen – wir sind für Sie da!',
  contact_cta_title: 'Langfristige Partnerschaft über die Wärmeplanung hinaus',
  contact_cta_description: 'Wir begleiten Sie nicht nur bei der Wärmeplanung, sondern bieten eine umfassende, langfristige Zusammenarbeit. Mit unserer langjährigen Expertise in Projekten im Bereich erneuerbarer Energien entwickeln wir nachhaltige und dezentrale Energielösungen und kümmern uns um den Aufbau der gesamten Netz- und Erzeugungsinfrastruktur. Unsere Erkenntnisse aus der Planung nutzen wir, um Unternehmen und Initiativen bei der Umsetzung der Wärmeplanung in Ihrer Region effektiv zu unterstützen.',
  contact_cta_image: '/img/black.jpg',
}

async function seedSettings() {
  console.log('Seeding settings...')

  // Seed BS Plus settings
  for (const [key, value] of Object.entries(bsPlusSettings)) {
    await prisma.setting.upsert({
      where: {
        website_key: {
          website: 'bs_plus' as Website,
          key,
        },
      },
      update: { value },
      create: {
        website: 'bs_plus' as Website,
        key,
        value,
      },
    })
  }
  console.log(`✓ Seeded ${Object.keys(bsPlusSettings).length} settings for BS Plus`)

  // Seed iPower settings
  for (const [key, value] of Object.entries(iPowerSettings)) {
    await prisma.setting.upsert({
      where: {
        website_key: {
          website: 'ipower' as Website,
          key,
        },
      },
      update: { value },
      create: {
        website: 'ipower' as Website,
        key,
        value,
      },
    })
  }
  console.log(`✓ Seeded ${Object.keys(iPowerSettings).length} settings for iPower`)

  console.log('Settings seeding completed!')
}

export { seedSettings, bsPlusSettings, iPowerSettings }
