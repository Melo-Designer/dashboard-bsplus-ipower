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

  // BS Plus sections - based on actual homepage at bs-plus/src/app/page.tsx
  const bsPlusSections = [
    {
      website: 'bs_plus' as Website,
      identifier: 'bhkw-service',
      title: 'BHKW Service',
      subtitle: null,
      description:
        'BSplus MotorenService GmbH ist Spezialist für Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen. Wir sorgen dafür, dass Ihre Anlagen zuverlässig und effizient mit maßgeschneiderten Servicekonzepten und Ersatzteilen laufen.',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: '/img/home/artikel1-bhkw-service.webp',
      cards: JSON.stringify([
        {
          title: 'Wartung & Reparatur',
          content:
            'Mit einem starken Team bleiben wir fester Ansprechpartner für zuverlässigen Service und langfristige Anlageneffizienz bei Gasmotoren und Anlagen. Herstellerübergreifend, zuverlässig, auf Ihr BHKW abgestimmt.',
          linkUrl: '/kontakt',
          linkText: 'Mehr erfahren',
          btnClass: 'secondary',
        },
        {
          title: 'Revision & Tauschmotoren',
          content:
            'Und Ihr Motor fällt doch mal aus? Wir liefern Ersatz – schnell, zuverlässig und sofort betriebsbereit. Unsere generalüberholten BHKW Motoren bieten die gleiche Funktionalität und Performance wie Neumotoren, effizient und sofort einsatzbereit.',
          linkUrl: '/kontakt',
          linkText: 'Mehr erfahren',
          btnClass: 'secondary',
        },
        {
          title: 'Optimierung',
          content:
            'Mit unseren Optimierungslösungen steigern Sie den Wirkungsgrad, verlängern die Lebensdauer Ihres Motors und reduzieren den Wartungsaufwand. Unsere Lösungen helfen, Emissionswerte einzuhalten und Kosten nachhaltig zu senken.',
          linkUrl: '/kontakt',
          linkText: 'Mehr erfahren',
          btnClass: 'secondary',
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
      description:
        'BSplus MotorenService GmbH ist langjähriger Partner für den BHKW Anlagenbau: von der Machbarkeit, über die Planung und Umsetzung bis hin zum Betrieb.',
      backgroundColor: 'dark',
      textColor: 'light',
      backgroundImage: '/img/home/artikel2-bhkw-anlagenbau.webp',
      cards: JSON.stringify([
        {
          title: 'Beratung',
          content:
            'Individuelle Abstimmung der Möglichkeiten, von der Machbarkeit über die Auslegung, Projektierung, Planung bis hin zur Umsetzung ist unser Anspruch, wenn es um die BHKW-Anlage geht.',
          linkUrl: '/kontakt',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Planung & Errichtung',
          content:
            'Wir arbeiten mit unseren langjährigen Partnern intensiv zusammen, um das BHKW perfekt umzusetzen. Im gesamten Prozess stehen wir zur Seite und klären den Bedarf rund um Ihr BHKW.',
          linkUrl: '/kontakt',
          linkText: 'Mehr erfahren',
          btnClass: 'primary',
        },
        {
          title: 'Projekte & Referenzen',
          content:
            'Seit 2013 hat sich BSplus MotorenService GmbH in Sachen BHKW Service und BHKW Anlagen einen Namen gemacht und zahlreiche Projekte mit seinen Kunden umgesetzt. Hinter dem Firmennamen steckt jahrzehntelange Erfahrung.',
          linkUrl: '/kontakt',
          linkText: 'Referenzen',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 1,
      active: true,
    },
    {
      website: 'bs_plus' as Website,
      identifier: 'news',
      title: 'News & mehr',
      subtitle: null,
      description:
        'Aktuelle Trends, spannende Einblicke und wichtige Infos rund um BSplus – alles an einem Ort. Lesen Sie unser Journal, treten Sie direkt mit uns in Kontakt oder folgen Sie uns auf Social Media. Jetzt entdecken und vernetzen!',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: '/img/home/artikel3-news.webp',
      cards: JSON.stringify([
        {
          title: 'Journal/Aktuelles',
          content:
            'Entdecken Sie spannende News und aktuelle Entwicklungen rund um BSplus. Bleiben Sie informiert und verpassen Sie keine wichtigen Updates.',
          linkUrl: '/journal',
          linkText: 'Mehr erfahren',
          btnClass: 'secondary',
        },
        {
          title: 'Direktkontakt',
          content:
            'Sie haben Fragen oder benötigen Beratung? Nehmen Sie jetzt unkompliziert Kontakt zu unserem Team auf.',
          linkUrl: '/kontakt',
          linkText: 'Kontakt',
          btnClass: 'secondary',
        },
        {
          title: 'Social Media',
          content:
            'Erleben Sie BSplus auf Social Media und bleiben Sie immer am Puls der Zeit. Jetzt vernetzen und keine Neuigkeiten mehr verpassen. Folgen Sie uns auf Facebook, Instagram und LinkedIn.',
          linkUrl: '/kontakt',
          linkText: 'Folgen',
          btnClass: 'secondary',
        },
      ]),
      sortOrder: 2,
      active: true,
    },
    {
      website: 'bs_plus' as Website,
      identifier: 'team-karriere',
      title: 'Team & Karriere',
      subtitle: null,
      description:
        'Entdecke unsere Strategie für Innovation und nachhaltigen Erfolg und lerne das Team kennen, das BSplus voranbringt. Starte jetzt deine Karriere bei BSplus und sichere dir attraktive Vorteile sowie spannende Entwicklungsmöglichkeiten.',
      backgroundColor: 'dark',
      textColor: 'light',
      backgroundImage: '/img/home/artikel4-team-karriere.webp',
      cards: JSON.stringify([
        {
          title: 'Strategie',
          content:
            'BSplus MotorenService GmbH ist ein entscheidender Bestandteil unserer Idee von intelligenten Energiesystemen. Mit unseren Partnern für Planung und Betriebsführung ergänzen wir die Dienstleistungen für unsere Kunden sinnvoll.',
          linkUrl: '/kontakt',
          linkText: 'Strategie',
          btnClass: 'primary',
        },
        {
          title: 'Unser Team',
          content:
            'Das BSplus Team ist seit 2013 organisch gewachsen und besteht aus absoluten Fachleuten. Jede:r Mitarbeiter:in ist wichtiger Bestandteil, erfährt vollste Wertschätzung und trägt zum Unternehmenserfolg bei.',
          linkUrl: '/kontakt',
          linkText: 'Team',
          btnClass: 'primary',
        },
        {
          title: 'Karriere',
          content:
            'BSplus ist: Attraktive Benefits, sichere Perspektiven und ein modernes Arbeitsumfeld. Starte jetzt Deine Karriere bei BSplus und gestalte mit uns die Zukunft der Energiebranche aktiv mit.',
          linkUrl: '/karriere',
          linkText: 'Karriere',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 3,
      active: true,
    },
  ]

  // iPower sections - based on actual homepage at ipower-next/src/app/page.tsx
  const ipowerSections = [
    {
      website: 'ipower' as Website,
      identifier: 'ueber-uns',
      title: 'Ingenieurbüro für Planung, Erzeugung, Umwandlung und Nutzung',
      subtitle: null,
      description:
        'iPower bietet Planungs- und Ingenieurlösungen in den Bereichen Energie, Wärme, Infrastruktur und Bau an. Wir nutzen das Potenzial bestehender Strukturen und kombinieren es mit erneuerbaren Energien, um intelligente Energiesysteme zu schaffen. Täglich stellen wir uns den Herausforderungen der Energiewende - lassen Sie uns gemeinsam eine nachhaltige Zukunft gestalten.',
      backgroundColor: 'light',
      textColor: 'light',
      backgroundImage: '/img/slide01.webp',
      cards: JSON.stringify([
        {
          title: 'Anlagenbetreiber & Landwirtschaft',
          content:
            'Pioniere der Energiewende sind für uns von hoher Bedeutung. Seit vielen Jahren begleiten wir unsere Kunden bei der Bewältigung der großen Herausforderungen der Energie- und Wärmewende. Die aktuellen Klimaschutzziele bieten zahlreiche Chancen zur Optimierung bestehender Energieanlagen und Wärmenetze. Gemeinsam entwickeln wir passgenaue Lösungen, die Ihre Projekte zukunftssicher machen.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Wohnungswirtschaft',
          content:
            'In den nächsten Jahren müssen herkömmliche Energieerzeugungssysteme durch nachhaltige Lösungen ersetzt werden, die einen möglichst geringen Einfluss auf die Rentabilität der Immobilie ausüben. Wir berücksichtigen den gesamten Energiebedarf – Strom, Wärme und Mobilität – und integrieren flexible Erzeugungs- und Speichersysteme, um die Energiemärkte optimal einzubeziehen. iPower plant und realisiert kompakte Lösungen, die sich nahtlos in Gewerbe- und Wohnimmobilien integrieren lassen.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Kommunen',
          content:
            'Wir sind überzeugt, dass die Energiewende lokal umsetzbar ist. Kommunen und kommunale Versorger spielen eine zentrale Rolle, indem sie den Übergang zu grüner Energie vorantreiben. Jede Kommune benötigt individuelle Lösungen, die auf den lokalen Gegebenheiten, wie den verfügbaren Energieträgern, basieren. Eine umfassende Analyse ist erforderlich, um herauszufinden, wie die gesamte Kommune oder einzelne Liegenschaften nachhaltig umgestaltet werden können.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Industrie & Gewerbe',
          content:
            'Die Energiewende stellt eine der größten Herausforderungen für Unternehmen dar. Um klimaneutral zu produzieren, müssen der Energiebedarf optimiert und regenerative Energieträger eingesetzt werden. Zukunftsfähige Lösungen, wie die Eigenerzeugung, spielen dabei eine entscheidende Rolle. iPower bietet umfassende Expertise in der Entwicklung, Planung und dem Betrieb von Energieerzeugungsanlagen, um die CO₂-Emissionen zu senken und gleichzeitig kostengünstige grüne Energie bereitzustellen. So können Sie sich ganz auf Ihr Kerngeschäft konzentrieren.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
      ]),
      sortOrder: 0,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'waermespeicher',
      title: 'Wärmespeicher für flexible Energie und Wärmenetze.',
      subtitle: null,
      description:
        'Unsere Wärmespeicher verschaffen Energieanlagenbetreibern, Stadtwerken und Industriekunden die Flexibilität, die zukunftsfähige KWK-, Fernwärme- und Energiesysteme benötigen.',
      backgroundColor: 'dark',
      textColor: 'light',
      backgroundImage: '/img/waermespeicher.webp',
      cards: JSON.stringify([
        {
          title: 'Flexible Wärmespeicher',
          content:
            'Für intelligente Energiesysteme. Unsere Wärmespeicher sind nicht nur Pufferspeicher, sie sind das Herz moderner Speicherkraftwerke: Sie verbinden Wärme, Strom und erneuerbare Energiequellen in einem flexiblen System.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
        {
          title: 'Individuelle Wärmespeicher',
          content:
            'Von 150 bis 50.000 m³ individuell geplant und präzise ausgeführt. Unsere Wärmespeicher werden aus hochwertigem Stahl vor Ort gefertigt und verfügen über eine hydraulische Einbindung, die exakt auf den späteren Betrieb ausgelegt ist.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
        {
          title: 'Leistungsumfang',
          content:
            'Für Großpufferspeicher – Planung, Genehmigung und Montage. Wir begleiten Ihr Speicherprojekt von der ersten Auslegung bis zur vollständigen Montage. Dazu gehören die Ermittlung der technischen Anforderungen, die Simulation der passenden Größe und des Speicheraufbaus sowie die anschließende Konstruktion und Erstellung aller erforderlichen Genehmigungsunterlagen inklusive Statik und Fundamentplanung.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
        {
          title: 'Branchen & Anwender',
          content:
            'Unsere Großpufferspeicher sind ein zentraler Baustein für die flexible und wirtschaftliche Fahrweise von Biogas- und regenerativen Energieanlagen. Sie ermöglichen eine leistungsorientierte Stromproduktion, die gezielt auf Marktpreise und Netzanforderungen reagieren kann.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 1,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'planung',
      title: 'Gewünschte Ergebnisse erreichen',
      subtitle: null,
      description:
        'Als Planer und Technikpartner entwickeln wir gemeinsam mit unseren Kunden maßgeschneiderte Lösungen, die exakt auf deren Ziele abgestimmt sind. Dabei betrachten wir die gesamte Wertschöpfungskette: von der regenerativen Energieerzeugung und Speicherung über die Umwandlung von Strom und Gas bis hin zu ihrer effizienten Nutzung.',
      backgroundColor: 'light',
      textColor: 'light',
      backgroundImage: '/img/second-bg.webp',
      cards: JSON.stringify([
        {
          title: 'Kommunale Wärmeplanung',
          content:
            'Bei der kommunalen Wärmeplanung handelt es sich um einen strategischen Prozess, in dessen Rahmen die Städte und Gemeinden geeignete Maßnahmen zur effizienten Erzeugung, Verteilung und Nutzung von Wärmeenergie entwickeln. Zu diesen Maßnahmen gehören die Analyse der vorhandenen Infrastruktur, das Identifizieren von Wärmequellen und -bedarf sowie die Entwicklung von Versorgungsstrategien und die Infrastrukturplanung. Zudem werden die Bürgerinnen und Bürger in den Prozess und seinen Ablauf aktiv miteinbezogen. Das Ziel ist darauf ausgerichtet, die Energieeffizienz zu steigern, die erneuerbaren Energien zu integrieren und die Emissionen zu reduzieren.',
          linkUrl: '/kommunale-warmeplanung',
          linkText: 'Mehr erfahren',
          btnClass: 'secondary',
        },
        {
          title: 'Auslegung & Simulation',
          content:
            'Wir nutzen modernste Planungswerkzeuge und Simulationstools zur Energieanalyse und -modellierung. Damit erstellen wir einen digitalen Zwilling Ihres existierenden oder neuen Projekts. Durch die realitätsnahe Abbildung können wir Energieeffizienzpotenziale in Gebäuden und Anlagen identifizieren, Verbrauchsmuster analysieren und Lösungen zur Reduzierung des Energieverbrauches entwickeln. Dies ermöglicht eine detaillierte und fundierte technische und wirtschaftliche Bewertung Ihres Projekts.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Projektierung',
          content:
            'Wir entwickeln und begleiten Ihr Energieprojekt von Anfang bis Ende. Nach der Standortanalyse erarbeiten wir ein individuelles Konzept, das zu Ihren Anforderungen passt. Anschließend übernehmen wir das Fördermanagement und sorgen dafür, dass alle Förderanträge erfolgreich gestellt werden. Sobald die Finanzierung gesichert ist, organisieren wir die Ausschreibung der Gewerke und begleiten die Umsetzung Ihres Energieprojekts. Gemeinsam mit Ihnen realisieren wir die Energiewende.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Anlagenbau',
          content:
            'Wir realisieren den Anlagenbau. iPower steht Ihnen bei jedem Schritt zur Seite. Als erfahrene Planer und Betreiber von Energieanlagen kennen wir die Anforderungen unserer Kunden genau. Bei der individuellen Anlagenplanung und dem Anlagenbau verschaffen wir Ihnen die nötige Sicherheit und sorgen für reibungslose Abläufe, höchste Qualität und termingerechte Fertigstellung – selbst bei straffen Zeitplänen.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
      ]),
      sortOrder: 2,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'erzeugung',
      title: 'Energieerzeugung und Nutzung vorhandener Energiequellen',
      subtitle: null,
      description:
        'Wir erweitern dezentrale Energieerzeugungsanlagen und vernetzen sie mit innovativen Versorgungskonzepten. Wir optimieren bestehende oder bauen neue Anlagen, um zukunftssichere Energieversorgung zu gewährleisten. So stellen wir sicher, dass Ihre Anlagen die heutigen Anforderungen erfüllen und zukunftsfähig bleiben.',
      backgroundColor: 'dark',
      textColor: 'light',
      backgroundImage: '/img/third-bg.webp',
      cards: JSON.stringify([
        {
          title: 'Solar',
          content:
            'Die Sonne ist eine zentrale Energiequelle in modernen Energiesystemen. Wir entwickeln Photovoltaik-Projekte und kombinieren diese mit Batteriespeichern und Wärmepumpen. Oft wird dieses Konzept dann durch ein Blockheizkraftwerk (BHKW) ergänzt, wenn kein weiterer lokaler Energieerzeuger verfügbar ist.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
        {
          title: 'Wind',
          content:
            'Für Fachplaner im Bereich Windenergie bieten wir innovative Power-to-X-Lösungen an, welche die Bürgernähe fördern und die Wirtschaftlichkeit ihrer Projekte steigern. Basierend auf den regionalen Gegebenheiten, entwickeln wir individuelle Konzepte für Windenergie-Projekte. Die lokal erzeugte Energie nutzen wir z. B. in Wärmenetzen. Durch die enge Zusammenarbeit mit den Betreibern, Kommunen und Bürgerinnen und Bürgern fördern wir damit das Vertrauen und die Akzeptanz.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
        {
          title: 'Biogas & Speicherkraftwerke',
          content:
            'Wir entwickeln Biomasseprojekte von der Planung bis zur Umsetzung und kombinieren sie mit Speichern. Die Stromerzeugung erfolgt strommarktorientiert und maximal flexibel, während die erzeugte Wärme zwischengespeichert und bei Bedarf an Wärmesenken abgegeben wird. Ein Speicherkraftwerk kann sowohl in einer bestehenden Biogasanlage als auch als Neuanlage realisiert werden. Gerne bewerten wir die wirtschaftliche Machbarkeit.',
          linkUrl: '',
          linkText: '',
          btnClass: 'primary',
        },
      ]),
      sortOrder: 3,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'umwandlung',
      title: 'Effiziente Energiewandlung für nachhaltige Versorgung',
      subtitle: null,
      description:
        'Entdecken Sie innovative Technologien, die Energie effizient speichern, wandeln und nutzen - für eine zukunftssichere, nachhaltige Versorgung.',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: '/img/fourth-bg.webp',
      cards: JSON.stringify([
        {
          title: 'Wärmepumpe',
          content:
            'Großwärmepumpen sind von entscheidender Bedeutung für die nachhaltige Wärmeversorgung von Wärmenetzen und Industrieprozessen. Sie nutzen erneuerbare Energiequellen, wie Luft, Wasser oder Erdwärme, um effizient große Mengen Wärme bereitzustellen. Auf diese Weise werden die CO₂-Emissionen deutlich reduziert und zugleich die Betriebskosten gesenkt. Sie bieten eine flexible, kosteneffiziente Lösung für industrielle und kommunale Anwendungen.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Blockheizkraftwerk',
          content:
            'Mit unserer jahrzehntelangen Erfahrung im Bereich Blockheizkraftwerke (BHKW) bieten wir effiziente Lösungen zur gleichzeitigen Erzeugung von Strom und Wärme. BHKW nutzen Brennstoffe, wie Gas oder Biomasse, und lassen sich ideal mit erneuerbaren Energien kombinieren, und zwar z.B. dann, wenn Wind und Sonne nicht verfügbar sind. Diese flexible Energiequelle maximiert die Brennstoffnutzung, senkt die Energiekosten und reduziert die CO₂-Emissionen.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Batteriespeicher',
          content:
            'Der Erfolg der Energiewende hängt davon ab, dass jede Megawattstunde intelligent genutzt wird. Batteriespeicher erhöhen den Eigenverbrauch, indem sie Überschüsse speichern und in teuren Zeiten bereitstellen. Sie senken Netzentgelte, indem sie Lastspitzen abfangen, und generieren durch den Verkauf überschüssiger Energie zusätzliche Einnahmen.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
      ]),
      sortOrder: 4,
      active: true,
    },
    {
      website: 'ipower' as Website,
      identifier: 'nutzung',
      title: 'Wärmewende 100% erneuerbar',
      subtitle: null,
      description:
        'Für Investoren und Kommunen entwickeln wir individuelle, innovative Energiekonzepte. Wir übernehmen die Planung, Finanzierung und Umsetzung von Nah- oder Fernwärmenetzen. Darüber hinaus kümmern wir uns auch um die spätere technische und kaufmännische Betriebsführung.',
      backgroundColor: 'light',
      textColor: 'dark',
      backgroundImage: '/img/fifth-bg.webp',
      cards: JSON.stringify([
        {
          title: 'Wärmenetze',
          content:
            'Erneuerbare Wärmenetze unterscheiden sich deshalb von herkömmlichen Nah- und Fernwärmenetzen, da sie vollständig auf fossile Brennstoffe verzichten. Stattdessen verwenden wir ungenutzte Abwärmepotenziale, vernetzen verschiedene Energiesektoren miteinander und setzen auf grüne Energie. An vielen Standorten stehen erneuerbare Ressourcen teilweise unbegrenzt zur Verfügung, wodurch ganze Gemeinden, Siedlungen oder Stadtteile dezentral, zuverlässig, wirtschaftlich und nachhaltig mit regenerativer Wärme versorgt werden können.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Contracting',
          content:
            'Mietvarianten und Energiecontracting sind Modelle, bei denen wir die Planung, Finanzierung, Installation und den Betrieb von Energieerzeugungsanlagen übernehmen. Die erzeugte Energie stellen wir Ihnen gegen eine vertraglich festgelegte Gebühr zur Verfügung. Sie profitieren von moderner Energietechnik ohne hohe Anfangsinvestitionen und können Ihre liquiden Mittel in andere Kernprozesse investieren.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
        {
          title: 'Betriebsführung Anlagen & Netze',
          content:
            'Wir unterstützen Sie beim Betrieb Ihrer Energieanlagen und Verteilnetze mit individuell abgestimmten Dienstleistungspaketen. Neben den technischen und betriebswirtschaftlichen Services, wie der Energieabrechnung bis hin zur Buchhaltung, bieten wir mit einem 24/7-Bereitschaftsdienst für Ihre Versorgungssicherheit.',
          linkUrl: '',
          linkText: '',
          btnClass: 'secondary',
        },
      ]),
      sortOrder: 5,
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
