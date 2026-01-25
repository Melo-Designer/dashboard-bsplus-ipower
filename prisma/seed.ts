import 'dotenv/config'
import { PrismaClient, Website } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create admin user
  const hashedPassword = await hash('change-this-password', 12)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrator',
    },
  })

  // Create default settings for both websites
  const defaultSettings = [
    { key: 'company_name', value: '' },
    { key: 'company_email', value: '' },
    { key: 'company_phone', value: '' },
    { key: 'company_address', value: '' },
    { key: 'company_city', value: '' },
    { key: 'company_zip', value: '' },
    { key: 'social_facebook', value: '' },
    { key: 'social_instagram', value: '' },
    { key: 'social_linkedin', value: '' },
    { key: 'social_youtube', value: '' },
  ]

  for (const website of ['bs_plus', 'ipower'] as Website[]) {
    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { website_key: { website, key: setting.key } },
        update: {},
        create: {
          website,
          key: setting.key,
          value: setting.value,
        },
      })
    }

    // Create default legal pages
    const legalPages = [
      { type: 'impressum', title: 'Impressum', content: '' },
      { type: 'datenschutz', title: 'Datenschutzerklärung', content: '' },
      { type: 'barrierefreiheit', title: 'Barrierefreiheit', content: '' },
    ]

    for (const page of legalPages) {
      await prisma.legalPage.upsert({
        where: { website_type: { website, type: page.type } },
        update: {},
        create: {
          website,
          type: page.type,
          title: page.title,
          content: page.content,
        },
      })
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
