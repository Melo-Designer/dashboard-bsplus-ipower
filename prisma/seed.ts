import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { seedSettings } from './seeds/settings'
import { seedSlides } from './seeds/slides'
import { seedPages } from './seeds/pages'
import { seedJournal } from './seeds/journal'

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

async function main() {
  console.log('Starting database seed...\n')

  // Seed settings for both websites
  await seedSettings()

  // Seed slides for both websites
  await seedSlides()

  // Seed pages for both websites
  await seedPages()

  // Seed journal posts for both websites
  await seedJournal()

  console.log('\nDatabase seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
