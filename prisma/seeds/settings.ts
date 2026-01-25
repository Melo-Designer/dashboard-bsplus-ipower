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
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2404.8!2d7.9167!3d52.8833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDUzJzAwLjAiTiA3wrA1NSczMC4xIkU!5e0!3m2!1sde!2sde!4v1',
  opening_hours: 'Mo-Fr: 08:00 - 17:00 Uhr',
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
  google_maps_embed: 'https://maps.google.com/maps?ll=52.842602,7.908625&z=14&t=m&hl=de&gl=DE&mapclient=embed&cid=11269629673434630514',
  opening_hours: 'Mo-Fr: 08:00 - 17:00 Uhr',
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
