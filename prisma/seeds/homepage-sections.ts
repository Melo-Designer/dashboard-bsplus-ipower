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

async function seedHomepageSections() {
  console.log('Seeding homepage sections...')

  // BS Plus sections
  const bsPlusSections = [
    {
      website: 'bs_plus' as Website,
      identifier: 'bhkw-service',
      title: 'BHKW Service',
      subtitle: null,
      description: 'Spezialist für Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Wartung & Reparatur',
          content: 'Mit einem starken Team bleiben wir fester Ansprechpartner für zuverlässigen Service und langfristige Anlageneffizienz bei Gasmotoren und Anlagen. Herstellerübergreifend, zuverlässig, auf Ihr BHKW abgestimmt.',
          linkUrl: '/bhkw-service',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Revision & Tauschmotoren',
          content: 'Und Ihr Motor fällt doch mal aus? Wir liefern Ersatz – schnell, zuverlässig und sofort betriebsbereit. Unsere generalüberholten BHKW Motoren bieten die gleiche Funktionalität und Performance wie Neumotoren, effizient und sofort einsatzbereit.',
          linkUrl: '/bhkw-service',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Optimierung',
          content: 'Mit unseren Optimierungslösungen steigern Sie den Wirkungsgrad, verlängern die Lebensdauer Ihres Motors und reduzieren den Wartungsaufwand. Unsere Lösungen helfen, Emissionswerte einzuhalten und Kosten nachhaltig zu senken.',
          linkUrl: '/bhkw-service',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 0,
      active: true,
    },
    {
      website: 'bs_plus' as Website,
      identifier: 'bhkw-anlagenbau',
      title: 'BHKW Anlagenbau',
      subtitle: null,
      description: 'Langjähriger Partner für den BHKW Anlagenbau: von der Machbarkeit, über die Planung und Umsetzung bis hin zum Betrieb.',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Beratung',
          content: 'Individuelle Abstimmung der Möglichkeiten, von der Machbarkeit über die Auslegung, Projektierung, Planung bis hin zur Umsetzung.',
          linkUrl: '/bhkw-anlagenbau',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Planung & Errichtung',
          content: 'Wir arbeiten mit unseren langjährigen Partnern intensiv zusammen, um das BHKW perfekt umzusetzen. Im gesamten Prozess stehen wir zur Seite und klären den Bedarf rund um Ihr BHKW.',
          linkUrl: '/bhkw-anlagenbau',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Projekte & Referenzen',
          content: 'Seit 2013 hat sich BSplus MotorenService GmbH in Sachen BHKW Service und BHKW Anlagen einen Namen gemacht und zahlreiche Projekte mit seinen Kunden umgesetzt.',
          linkUrl: '/projekte',
          linkText: 'Referenzen',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 1,
      active: true,
    },
    {
      website: 'bs_plus' as Website,
      identifier: 'team-karriere',
      title: 'Team & Karriere',
      subtitle: null,
      description: 'Entdecke unsere Strategie für Innovation und nachhaltigen Erfolg und lerne das Team kennen.',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Strategie',
          content: 'BSplus MotorenService GmbH ist ein entscheidender Bestandteil unserer Idee von intelligenten Energiesystemen.',
          linkUrl: '/ueber-uns',
          linkText: 'Strategie',
          btnClass: 'primary',
        },
        {
          title: 'Unser Team',
          content: 'Das BSplus Team ist seit 2013 organisch gewachsen und besteht aus absoluten Fachleuten.',
          linkUrl: '/ueber-uns',
          linkText: 'Team',
          btnClass: 'primary',
        },
        {
          title: 'Karriere',
          content: 'BSplus ist: Attraktive Benefits, sichere Perspektiven und ein modernes Arbeitsumfeld.',
          linkUrl: '/karriere',
          linkText: 'Karriere',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 2,
      active: true,
    },
  ]

  // iPower sections
  const ipowerSections = [
    {
      website: 'ipower' as Website,
      identifier: 'planung',
      title: 'Gewünschte Ergebnisse erreichen',
      subtitle: null,
      description: 'Als Planer und Technikpartner entwickeln wir gemeinsam mit unseren Kunden maßgeschneiderte Lösungen',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Kommunale Wärmeplanung',
          content: 'Strategischer Prozess für effiziente Erzeugung, Verteilung und Nutzung von Wärmeenergie mit Bürger*innenbeteiligung',
          linkUrl: '/kommunale-waermeplanung',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Auslegung & Simulation',
          content: 'Moderne Planungswerkzeuge zur Energieanalyse und digitalen Zwillingserstellung für fundierte technische Bewertungen',
          linkUrl: '/auslegung-simulation',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Projektierung',
          content: 'Begleitung von Energieprojekten von Standortanalyse über Fördermanagement bis zur Umsetzung',
          linkUrl: '/projektierung',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Anlagenbau',
          content: 'Realisierung individueller Anlagenplanung mit Qualitätssicherung und termingerechter Fertigstellung',
          linkUrl: '/anlagenbau',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 0,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'erzeugung',
      title: 'Energieerzeugung und Nutzung vorhandener Energiequellen',
      subtitle: null,
      description: 'Erweiterung dezentraler Energieerzeugungsanlagen und Vernetzung mit innovativen Versorgungskonzepten',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Solar',
          content: 'Photovoltaik-Projekte kombiniert mit Batteriespeichern und Wärmepumpen für moderne Energiesysteme',
          linkUrl: '/solar',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Wind',
          content: 'Individuelle Windenergie-Konzepte mit innovativen Power-to-X-Lösungen und lokaler Energienutzung',
          linkUrl: '/wind',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Biogas & Speicherkraftwerke',
          content: 'Biomasseprojekte mit flexibler strommarktorientierter Stromerzeugung und Wärmespeicherung',
          linkUrl: '/biogas',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 1,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'umwandlung',
      title: 'Effiziente Energiewandlung für nachhaltige Versorgung',
      subtitle: null,
      description: 'Innovative Technologien zur effizienten Speicherung, Wandlung und Nutzung von Energie',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Wärmepumpe',
          content: 'Großwärmepumpen nutzen erneuerbare Energiequellen zur effizienten Wärmeversorgung von Wärmenetzen',
          linkUrl: '/waermepumpe',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Blockheizkraftwerk',
          content: 'Effiziente gleichzeitige Erzeugung von Strom und Wärme mit flexibler Kombination erneuerbarer Energien',
          linkUrl: '/bhkw',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Batteriespeicher',
          content: 'Speicherung von Überschüssen zur Steigerung des Eigenverbrauchs und Senkung von Netzentgelten',
          linkUrl: '/batteriespeicher',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 2,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'nutzung',
      title: 'Wärmewende 100% erneuerbar',
      subtitle: null,
      description: 'Individuelle innovative Energiekonzepte für Investoren und Kommunen mit Planung, Finanzierung und Betriebsführung',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: null,
      cards: JSON.stringify([
        {
          title: 'Wärmenetze',
          content: 'Vollständig fossilfreie Nah- und Fernwärmenetze mit erneuerbaren Ressourcen für dezentrale Versorgung',
          linkUrl: '/waermenetze',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Contracting',
          content: 'Mietvarianten mit Planung, Finanzierung, Installation und Betrieb ohne hohe Anfangsinvestitionen',
          linkUrl: '/contracting',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Betriebsführung Anlagen & Netze',
          content: 'Individuell abgestimmte Dienstleistungspakete mit technischen Services und 24/7-Bereitschaftsdienst',
          linkUrl: '/betriebsfuehrung',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 3,
      active: true,
    },
  ]

  // Insert all sections
  for (const section of [...bsPlusSections, ...ipowerSections]) {
    await prisma.homepageSection.upsert({
      where: {
        website_identifier: {
          website: section.website,
          identifier: section.identifier,
        },
      },
      update: section,
      create: section,
    })
    console.log(`  ✓ ${section.website}: ${section.title}`)
  }

  console.log('Homepage sections seeded successfully!')
}

seedHomepageSections()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
