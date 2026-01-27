import { PrismaClient, Website, SectionType } from '../../src/generated/prisma'
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

export async function seedPages() {
  console.log('Seeding pages...')

  // BHKW Anlagenbau page for BS Plus
  const bhkwAnlagenbauPage = await prisma.page.upsert({
    where: {
      website_slug: {
        website: 'bs_plus' as Website,
        slug: 'bhkw-anlagenbau',
      },
    },
    update: {
      title: 'BHKW Anlagenbau',
      metaTitle: 'BHKW Anlagenbau - Kraft trifft Wärme | BSplus MotorenService GmbH',
      metaDescription:
        'BSplus MotorenService ist erfahrener Partner für den Bau von Blockheizkraftwerken und Anlagen zur Kraft-Wärme-Kopplung (KWK). Von Machbarkeit bis Inbetriebnahme.',
      heroTitle: 'BHKW Anlagenbau | Kraft trifft Wärme | Ihr Plus an Effizienz',
      heroSubtitle: 'Ihr Plus an Effizienz',
      heroDescription:
        'BSplus MotorenService ist erfahrener Partner für den Bau von Blockheizkraftwerken und Anlagen zur Kraft-Wärme-Kopplung (KWK).',
      heroImage: '/img/bhkw-anlagenbau/hero.webp',
      heroButtonText: 'Jetzt anfragen',
      heroButtonLink: '/kontakt',
      active: true,
    },
    create: {
      website: 'bs_plus' as Website,
      slug: 'bhkw-anlagenbau',
      title: 'BHKW Anlagenbau',
      metaTitle: 'BHKW Anlagenbau - Kraft trifft Wärme | BSplus MotorenService GmbH',
      metaDescription:
        'BSplus MotorenService ist erfahrener Partner für den Bau von Blockheizkraftwerken und Anlagen zur Kraft-Wärme-Kopplung (KWK). Von Machbarkeit bis Inbetriebnahme.',
      heroTitle: 'BHKW Anlagenbau | Kraft trifft Wärme | Ihr Plus an Effizienz',
      heroSubtitle: 'Ihr Plus an Effizienz',
      heroDescription:
        'BSplus MotorenService ist erfahrener Partner für den Bau von Blockheizkraftwerken und Anlagen zur Kraft-Wärme-Kopplung (KWK).',
      heroImage: '/img/bhkw-anlagenbau/hero.webp',
      heroButtonText: 'Jetzt anfragen',
      heroButtonLink: '/kontakt',
      active: true,
    },
  })

  console.log(`  ✓ Created page: ${bhkwAnlagenbauPage.title} (/${bhkwAnlagenbauPage.slug})`)

  // Delete existing sections for this page to avoid duplicates
  await prisma.pageSection.deleteMany({
    where: { pageId: bhkwAnlagenbauPage.id },
  })

  // Sections for BHKW Anlagenbau page
  const sections = [
    // 1. Triple section
    {
      pageId: bhkwAnlagenbauPage.id,
      type: 'triple' as SectionType,
      title: null,
      content: null,
      imageUrl: null,
      imageAlt: null,
      imageAlign: null,
      items: JSON.stringify([
        {
          title: 'Von der ersten Analyse bis zur erfolgreichen Umsetzung Ihres Projekts',
          content:
            'Wir begleiten Sie als verlässlicher Partner von der fundierten Machbarkeitsanalyse über die sorgfältige Planung und technische Auslegung bis hin zur reibungslosen Integration und Inbetriebnahme in Ihre bestehende Infrastruktur.',
        },
        {
          title: 'Wirtschaftliche und nachhaltige Lösungen für Ihre Energiezukunft',
          content:
            'Unsere durchdachten und innovativen Konzepte sind auf maximale Effizienz und langfristige Wirtschaftlichkeit ausgelegt. Sie profitieren von zukunftssicheren Systemen, die modernste Speichertechnologien für Wärme und Energie nahtlos integrieren.',
        },
        {
          title: 'Langjährige Erfahrung und starke Partner für Ihren Erfolg',
          content:
            'Profitieren Sie von unserer langjährigen Expertise im Anlagenbau und einem Netzwerk bewährter Partner. Gemeinsam ermöglichen wir zuverlässige und zugleich innovative BHKW-Lösungen und sichern durch kompetente Betreuung und umfassenden Service den nachhaltigen Erfolg Ihres Projekts.',
        },
      ]),
      buttons: '[]',
      stats: '[]',
      backgroundImage: null,
      backgroundColor: 'light',
      textColor: 'dark',
      sortOrder: 0,
      active: true,
    },
    // 2. Text + Image: Machbarkeit & Auslegung
    {
      pageId: bhkwAnlagenbauPage.id,
      type: 'text_image' as SectionType,
      title: 'Machbarkeit & Auslegung | Von der ersten Idee bis zur technischen Detailplanung',
      content: `Im ersten Schritt analysieren wir sorgfältig die technischen und wirtschaftlichen Rahmenbedingungen Ihres Projekts. Dabei prüfen wir, ob und wie sich Ihr Vorhaben effizient und nachhaltig realisieren lässt. Auf Basis dieser detaillierten Machbarkeitsanalyse erarbeiten wir eine passgenaue Auslegung, die exakt auf Ihre individuellen Anforderungen abgestimmt ist.<br /><br />Unsere herstellerübergreifende Planung stützt sich auf langjährige Praxiserfahrungen aus Betrieb und Service seit 2013. Dadurch erfolgt die Dimensionierung Ihrer Anlage realistisch und bedarfsgerecht – nicht nach allgemeinen Katalogwerten, sondern auf Grundlage belastbarer Betriebsdaten.<br /><br /><a href="/journal" class="text-secondary underline hover:no-underline">Erfahren Sie mehr in unserem Journal →</a>`,
      imageUrl: '/img/bhkw-anlagenbau/machbarkeit.jpg',
      imageAlt: 'Machbarkeit und Auslegung',
      imageAlign: 'left',
      items: '[]',
      buttons: '[]',
      stats: '[]',
      backgroundImage: null,
      backgroundColor: 'light',
      textColor: 'dark',
      sortOrder: 1,
      active: true,
    },
    // 3. Text + Image: Planung & Umsetzung
    {
      pageId: bhkwAnlagenbauPage.id,
      type: 'text_image' as SectionType,
      title: 'Planung & Umsetzung | Maßgeschneiderte Lösungen für Ihre Energiezentrale',
      content: `Die sorgfältige und detaillierte Planung ist die Grundlage für den erfolgreichen Bau von KWK-Anlagen. Wir begleiten Sie von der ersten technischen Detailplanung bis zur termingerechten Realisierung Ihres Projekts und stellen dabei eine effiziente und zuverlässige Umsetzung sicher.<br /><br />Während des gesamten Prozesses steht Ihnen ein zentraler Ansprechpartner zur Verfügung – von der Detailplanung bis zur Inbetriebnahme. Dank unseres eingespielten Netzwerks aus erfahrenen Partnern und dem Einsatz vorkonfigurierter BHKW-Module ermöglichen wir einen reibungslosen, termintreuen Aufbau Ihrer Anlage. So gewährleisten wir, dass Ihr Projekt ohne Verzögerungen und mit höchster Qualität abgeschlossen wird.`,
      imageUrl: '/img/bhkw-anlagenbau/planung.jpg',
      imageAlt: 'Planung und Umsetzung',
      imageAlign: 'right',
      items: '[]',
      buttons: '[]',
      stats: '[]',
      backgroundImage: null,
      backgroundColor: 'light',
      textColor: 'dark',
      sortOrder: 2,
      active: true,
    },
    // 4. Text + Image: Integration & Wirtschaftlichkeit
    {
      pageId: bhkwAnlagenbauPage.id,
      type: 'text_image' as SectionType,
      title: 'Integration & Wirtschaftlichkeit | Perfekte Einbindung in bestehende Infrastruktur',
      content: `Die nahtlose Einbindung neuer Energiesysteme in bestehende Infrastrukturen ist entscheidend für den langfristigen Erfolg und die Wirtschaftlichkeit Ihres Projekts. Wir kümmern uns um die optimale Integration und passen die Systeme individuell an die vorhandenen Gegebenheiten an. Dabei liegt unser Fokus darauf, die Wirtschaftlichkeit Ihrer KWK-Anlage durch intelligente Planung und laufende Optimierung nachhaltig zu steigern.<br /><br />Unsere Retrofit- und Optimierungskompetenz umfasst vielfältige Maßnahmen wie beispielsweise Gaskühlung, Aktivkohlefilter und emissionsreduzierende Konzepte. Ergänzt wird dieses Leistungsspektrum durch eine 24/7-Fernwartung, die eine maximale Verfügbarkeit Ihrer Anlage sicherstellt und die Betriebskosten auf ein Minimum reduziert.<br /><br />Zusätzlich informieren wir Sie stets über aktuelle Förderprogramme für KWK-Anlagen und unterstützen Sie aktiv bei der Antragstellung. So profitieren Sie von den besten finanziellen Rahmenbedingungen und einer maximalen Wirtschaftlichkeit Ihres Energieprojekts.`,
      imageUrl: '/img/bhkw-anlagenbau/integration.jpg',
      imageAlt: 'Integration und Wirtschaftlichkeit',
      imageAlign: 'left',
      items: '[]',
      buttons: '[]',
      stats: '[]',
      backgroundImage: null,
      backgroundColor: 'light',
      textColor: 'dark',
      sortOrder: 3,
      active: true,
    },
    // 5. Text + Image: Speicherlösungen & Zukunftssicherheit
    {
      pageId: bhkwAnlagenbauPage.id,
      type: 'text_image' as SectionType,
      title: 'Speicherlösungen & Zukunftssicherheit | Wärme- und Energiespeicher für maximale Effizienz',
      content: `Unsere innovativen Speicherlösungen gewährleisten eine sichere und zukunftsfähige Energieversorgung. Durch den gezielten Einsatz und die richtige Dimensionierung von systemintegrierten Speichern – seien es Puffer-, Batterie- oder Gasspeicher – werden BHKW-Anlagen optimal für kommende Herausforderungen aufgestellt. Dabei sorgen wir für eine intelligente Erzeugerpriorisierung sowie eine moderne Leitstand- und Steuerungstechnik, die bereits heute auf zukünftige Energieträger vorbereitet ist.<br /><br />Innerhalb der BSplus-Firmengruppe bieten wir Förderchecks und BEW-kompatible Machbarkeitsstudien an. Diese beinhalten ein umfassendes Dokumentationspaket, das Ihnen eine zügige und unkomplizierte Antragstellung ermöglicht.<br /><br />Die Bundesförderung für effiziente Wärmenetze (BEW) unterstützt sowohl den Neubau von Wärmenetzen mit hohem Anteil erneuerbarer Energien als auch die Dekarbonisierung bestehender Systeme.<br /><br /><a href="https://www.bafa.de/DE/Energie/Energieeffizienz/Waermenetze/waermenetze_node.html" target="_blank" rel="noopener noreferrer" class="text-secondary underline hover:no-underline">Weitere Informationen: BAFA - Bundesförderung für effiziente Wärmenetze (BEW) →</a>`,
      imageUrl: '/img/bhkw-anlagenbau/speicher.jpg',
      imageAlt: 'Speicherlösungen und Zukunftssicherheit',
      imageAlign: 'right',
      items: '[]',
      buttons: '[]',
      stats: '[]',
      backgroundImage: null,
      backgroundColor: 'light',
      textColor: 'dark',
      sortOrder: 4,
      active: true,
    },
    // 6. Black CTA section
    {
      pageId: bhkwAnlagenbauPage.id,
      type: 'black_cta' as SectionType,
      title: 'Ihr BHKW-Projekt – professionell geplant und umgesetzt',
      content:
        'Sie planen eine BHKW-Anlage oder möchten Ihr Projekt professionell umsetzen? Lassen Sie sich jetzt individuell beraten und profitieren Sie von unserer langjährigen Erfahrung in der Anlagenplanung und im Anlagenbau. Nehmen Sie Kontakt zu uns auf, wir entwickeln gemeinsam Ihr maßgeschneidertes Energiekonzept!',
      imageUrl: null,
      imageAlt: null,
      imageAlign: null,
      items: '[]',
      buttons: JSON.stringify([
        {
          text: 'Jetzt anfragen',
          type: 'internal',
          link: '/kontakt',
          btnClass: 'secondary',
        },
      ]),
      stats: '[]',
      backgroundImage: '/img/common/black.webp',
      backgroundColor: 'dark',
      textColor: 'light',
      sortOrder: 5,
      active: true,
    },
  ]

  for (const section of sections) {
    await prisma.pageSection.create({
      data: section,
    })
  }

  console.log(`  ✓ Created ${sections.length} sections for BHKW Anlagenbau page`)

  // Seed PageHeaders for contact pages
  console.log('Seeding page headers...')

  // BS Plus Kontakt PageHeader
  await prisma.pageHeader.upsert({
    where: {
      website_pageSlug: {
        website: 'bs_plus' as Website,
        pageSlug: 'kontakt',
      },
    },
    update: {
      title: 'Kontakt',
      subtitle: null,
      description: null,
      backgroundImage: '/img/kontakt/kontak-bg.webp',
      overlayColor: 'rgba(0, 0, 0, 0.2)',
      textColor: 'white',
    },
    create: {
      website: 'bs_plus' as Website,
      pageSlug: 'kontakt',
      title: 'Kontakt',
      subtitle: null,
      description: null,
      backgroundImage: '/img/kontakt/kontak-bg.webp',
      overlayColor: 'rgba(0, 0, 0, 0.2)',
      textColor: 'white',
    },
  })
  console.log('  ✓ Created PageHeader: BS Plus Kontakt')

  // iPower Kontakt PageHeader
  await prisma.pageHeader.upsert({
    where: {
      website_pageSlug: {
        website: 'ipower' as Website,
        pageSlug: 'kontakt',
      },
    },
    update: {
      title: 'Kontakt',
      subtitle: null,
      description: null,
      backgroundImage: '/img/kontak-bg.jpg',
      overlayColor: 'rgba(0, 0, 0, 0.2)',
      textColor: 'white',
    },
    create: {
      website: 'ipower' as Website,
      pageSlug: 'kontakt',
      title: 'Kontakt',
      subtitle: null,
      description: null,
      backgroundImage: '/img/kontak-bg.jpg',
      overlayColor: 'rgba(0, 0, 0, 0.2)',
      textColor: 'white',
    },
  })
  console.log('  ✓ Created PageHeader: iPower Kontakt')

  console.log('Pages seeded successfully!')
}

// Allow running directly
if (require.main === module) {
  seedPages()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
