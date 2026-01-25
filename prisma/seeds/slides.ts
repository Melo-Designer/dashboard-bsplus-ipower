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

// BS Plus Slides
const bsPlusSlides = [
  {
    title: 'BHKW Service',
    subtitle: 'BSplus MotorenService ist Spezialist für Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen.',
    imageUrl: 'https://bs-plus-back.melodesigner.dev/storage/slides/IObaGaFyxEmJvQ84OWM86ozACNV50rZWs47viLUN.jpg',
    linkUrl: null,
    linkText: null,
  },
  {
    title: 'BHKW Anlagenbau',
    subtitle: 'BSplus MotorenService ist langjähriger Partner für den BHKW Anlagenbau.',
    imageUrl: 'https://bs-plus-back.melodesigner.dev/storage/slides/rmc15Y3JikB8X0co32nbQ3vodDMb99aFDzxiRFKk.jpg',
    linkUrl: null,
    linkText: null,
  },
  {
    title: 'Team und Karriere',
    subtitle: 'Aktuelle Stellenausschreibungen und Möglichkeiten im BSplus MotorenService Team.',
    imageUrl: 'https://bs-plus-back.melodesigner.dev/storage/slides/7BsRbWJOY8Epc0dSh77uHnWgKf5FTTIXVAh7Fzw2.jpg',
    linkUrl: '/karriere',
    linkText: 'Mehr erfahren',
  },
  {
    title: 'News und aktuelle Projekte',
    subtitle: 'Dran bleiben. Aktuelles und Blogbeiträge rund um die BSplus Firmengruppe.',
    imageUrl: 'https://bs-plus-back.melodesigner.dev/storage/slides/Hn2AZuOkZhhJLP9BlE4LvFMoYhuP9jLrGkhDdEp4.jpg',
    linkUrl: '/journal',
    linkText: 'Mehr erfahren',
  },
]

// iPower Slides
const iPowerSlides = [
  {
    title: 'Wärmespeicher für flexible Energie- und Wärmenetze',
    subtitle: 'Wir begleiten das Speicherprojekt von der ersten Auslegung bis zur vollständigen Montage.',
    imageUrl: 'https://admin.ipower.de/storage/slides/HLEX3TnZX1mg9wD4PU3NqkMz1AC0oqM52OHSCJou.jpg',
    linkUrl: null,
    linkText: null,
  },
  {
    title: 'Kommunale Wärmeplanung',
    subtitle: 'Strategische Planung für die Wärmewende in der Kommune',
    imageUrl: 'https://admin.ipower.de/storage/slides/tH7D6YWqVGpZK1ufeo6XCxq9pCsO6nzdDCfy5Zof.jpg',
    linkUrl: null,
    linkText: null,
  },
  {
    title: 'Wärmenetze',
    subtitle: 'Grüner Strom wird zur Wärme',
    imageUrl: 'https://admin.ipower.de/storage/slides/DAfKEVYs8SRc7NbpKoWnNcxOPbpMacDntJfyo5TE.jpg',
    linkUrl: null,
    linkText: null,
  },
  {
    title: 'Intelligente Energiesysteme und Sektorenkopplung',
    subtitle: 'Ein nachhaltiges Energiesystem basiert auf grüner Energie',
    imageUrl: 'https://admin.ipower.de/storage/slides/nJKNfs1lwKmVIUq51GaSSZPY7iwb7JAjff5W9ukt.jpg',
    linkUrl: null,
    linkText: null,
  },
]

async function seedSlides() {
  console.log('Seeding slides...')

  // Clear existing slides (optional, for clean seeding)
  await prisma.slide.deleteMany({})

  // Seed BS Plus slides
  for (let i = 0; i < bsPlusSlides.length; i++) {
    await prisma.slide.create({
      data: {
        website: 'bs_plus' as Website,
        ...bsPlusSlides[i],
        sortOrder: i,
        active: true,
      },
    })
  }
  console.log(`✓ Seeded ${bsPlusSlides.length} slides for BS Plus`)

  // Seed iPower slides
  for (let i = 0; i < iPowerSlides.length; i++) {
    await prisma.slide.create({
      data: {
        website: 'ipower' as Website,
        ...iPowerSlides[i],
        sortOrder: i,
        active: true,
      },
    })
  }
  console.log(`✓ Seeded ${iPowerSlides.length} slides for iPower`)

  console.log('Slides seeding completed!')
}

export { seedSlides, bsPlusSlides, iPowerSlides }
