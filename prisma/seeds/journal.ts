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

// Helper to parse German date format (dd.mm.yyyy or dd.mm.yyyy hh:mm)
function parseGermanDate(dateStr: string): Date {
  // Handle format "dd.mm.yyyy hh:mm" or "dd.mm.yyyy"
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('.').map(Number)

  if (timePart) {
    const [hours, minutes] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes)
  }

  return new Date(year, month - 1, day, 12, 0) // Default to noon
}

// iPower Posts (from https://admin.ipower.de/api/posts)
// Images saved in _temp folder - need to be uploaded to dashboard media library
const iPowerPosts = [
  {
    title: 'Case Study: Kommunale Wärmeplanung in Gescher',
    slug: 'case-study-kommunale-waermeplanung-in-gescher',
    content: `<p><strong>Einleitung: Gescher auf dem Weg zur klimaneutralen Wärmeversorgung</strong></p><p>Die Stadt Gescher verfolgt ein klares Ziel: Bis 2040 soll die Wärmeversorgung CO₂-neutral sein. Im Rahmen der kommunalen Wärmeplanung wird ein detailliertes Konzept für eine nachhaltige und zukunftssichere Energieversorgung entwickelt.</p><p>Die iPower GmbH ist als führendes Ingenieurbüro für Wärmeplanung und erneuerbare Energien mit der Analyse und Entwicklung dieser Strategie beauftragt. Das Projekt wird durch die Nationale Klimaschutzinitiative mit 90 % gefördert und soll bis Mai 2025 fertiggestellt sein (Quelle: gescher.de).</p><p><br></p><p><strong>Die Herausforderung: Warum braucht Gescher eine neue Wärmeplanung?</strong></p><p>Die Bestandsanalyse zeigt deutlichen Handlungsbedarf:</p><p>- Einwohnerzahl: 17.467</p><p>- Wärmebedarf: 167.837.000 kWh/a</p><p>- CO₂-Emissionen: 42.706,1 t/a</p><p>- Hauptenergiequellen: 63 % Gasheizungen, 26 % Ölheizungen</p><p>Da fossile Heizungen noch immer den Großteil der Gebäudeversorgung übernehmen, muss Gescher seine Wärmeversorgung auf erneuerbare Energien umstellen, um die Klimaschutzziele NRW und die Vorgaben des Gebäudeenergiegesetzes (GEG) zu erfüllen.</p><p><br></p><p><strong>Die Lösung: Nachhaltige Wärmeversorgung mit iPower</strong></p><p>Die kommunale Wärmeplanung von iPower folgt einem klar strukturierten Prozess:</p><p>1. Bestandsanalyse: Erhebung des aktuellen Energieverbrauchs und der bestehenden Infrastruktur.</p><p>2. Potenzialanalyse: Untersuchung erneuerbarer Wärmequellen wie Solarthermie, Biogas, Wärmepumpen und Nahwärmenetze.</p><p>3. Szenarien-Analyse: Simulation verschiedener Wärmewende-Modelle.</p><p>4. Maßnahmenkatalog: Definition konkreter Handlungsschritte zur CO₂-Reduzierung.</p><p><br></p><p><strong>Ergebnisse: Maßnahmen für die Wärmewende in Gescher</strong></p><p>Die von iPower entwickelten Szenarien zeigen, dass durch folgende Maßnahmen eine CO₂-Reduktion von 65 % bis 2030 und 100 % bis 2045 erreicht werden kann:</p><p><br></p><p>- Ausbau eines Nahwärmenetzes für verdichtete Wohngebiete</p><p>- Einbindung von Wärmepumpen und Hybridheizsystemen in Neubaugebieten</p><p>- Förderung energieeffizienter Sanierungen für Altbauten</p><p>- Nutzung erneuerbarer Energiequellen wie Biogas, PV und Solarthermie.</p><p><br></p><p><strong>Fazit: Ein Modellprojekt für nachhaltige Wärmeversorgung</strong></p><p>Die kommunale Wärmeplanung in Gescher ist ein wegweisendes Modell für Städte, die ihre Energieversorgung klimaneutral gestalten wollen. iPower unterstützt Kommunen dabei, maßgeschneiderte Konzepte für erneuerbare Wärmeversorgung zu entwickeln.</p><p><br></p><p>Möchten Sie mehr über kommunale Wärmeplanung erfahren? Kontaktieren Sie uns:</p><p>Mehr erfahren: www.iPower.de</p>`,
    excerpt: null,
    // Original: https://admin.ipower.de/storage/posts/9VXyTYqPIEYKW6lsrhlp7oUo26rbsmDtcU029RrJ.jpg
    // Local: _temp/ipower-waermeplanung-gescher.jpg
    featuredImage: 'https://admin.ipower.de/storage/posts/9VXyTYqPIEYKW6lsrhlp7oUo26rbsmDtcU029RrJ.jpg',
    publishedAt: '02.10.2025 12:30',
    author: 'Administrator',
  },
  {
    title: 'Case Study: Effiziente Energieversorgung im Impfstoffwerk mit BHKW und Dampferzeuger',
    slug: 'case-study-effiziente-energieversorgung-im-impfstoffwerk-mit-bhkw-und-dampferzeuger',
    content: `<p><strong>Herausforderung: Energieversorgung für Industrie & Gewerbe optimieren</strong></p><p>Das Serumwerk Bernburg AG, ein führendes Unternehmen in der pharmazeutischen Produktion, benötigte eine zuverlässige, effiziente und nachhaltige Energieversorgung. Besonders wichtig war eine stabile Strom- und Wärmeversorgung sowie eine effektive Dampferzeugung für die Produktion, ohne dass das Werk diesen Prozess aktiv betreuen muss. iPower bietet maßgeschneiderte Lösungen für die Betriebsführung von BHKW, Dampferzeugern und KWK-Anlagen, um maximale Energieeffizienz zu gewährleisten.</p><p><strong>Lösung: Blockheizkraftwerk (BHKW) mit Dampferzeugung für Industrie & Gewerbe</strong></p><p>Zur Optimierung der Energieumwandlung wurde ein hocheffizientes Blockheizkraftwerk (BHKW) mit Abhitzekessel installiert. Die moderne Kraft-Wärme-Kopplung (KWK) stellt nicht nur eine kontinuierliche Energieversorgung sicher, sondern nutzt auch die Abgaswärme optimal.</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Elektrische Leistung: 600 kW</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Thermische Leistung: 675 kW</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Dampferzeugung: 310 kW Sattdampf, 6,1 barü, 165 °C</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Wärmerückgewinnung: 365 kW Warmwasser</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Betriebsführung & Überwachung: 24/7 maximale Verfügbarkeit</li></ol><p>Neben der Technik, organisiert iPower die Betriebsführung und Energieumwandlung für industrielle Energieanlagen. Die 24/7-Überwachung des BHKW im Leitstand garantiert eine kontinuierliche Energieversorgung und hohe Anlagenverfügbarkeit. Unsere Laufzeitprognosen und Energieoptimierung ermöglichen eine Reduzierung von Energiekosten und CO₂-Emissionen.</p><p><strong>Ergebnisse: Mehr Effizienz, geringere Kosten & nachhaltige Energieversorgung</strong></p><p>Dank der durchdachten Betriebsführung kann das Serumwerk Bernburg seine Produktionsprozesse mit maximaler Energieeffizienz betreiben. Die optimierte Kombination aus Strom-, Warmwasser- und Dampferzeugung sorgt für nachhaltige Energieeinsparungen und senkt Betriebskosten erheblich.</p><p><strong>Fazit: Effiziente Energie für Industrie & Gewerbe</strong></p><p>Dieses Projekt zeigt, wie durch den Einsatz innovativer BHKW-Technologie und KWK-Anlagen eine nachhaltige und wirtschaftliche Energieversorgung in der Industrie realisiert werden kann. iPower bietet die optimale Betriebsführung für Blockheizkraftwerke und Dampferzeuger, um Unternehmen auf dem Weg zur maximalen Energieeffizienz zu begleiten.</p><p><strong>Jetzt Kontakt aufnehmen!</strong></p><p>Erfahren Sie mehr über maßgeschneiderte Energielösungen für Produktionsbetriebe, Industrie und Gewerbe. Lassen Sie sich von unseren Experten beraten!</p>`,
    excerpt: null,
    // Original: https://admin.ipower.de/storage/posts/nx6HZsCEJZ6iPxbImu4ev0nbG0pJ6iuX4vYMwYr0.webp
    // Local: _temp/ipower-impfstoffwerk.webp
    featuredImage: 'https://admin.ipower.de/storage/posts/nx6HZsCEJZ6iPxbImu4ev0nbG0pJ6iuX4vYMwYr0.webp',
    publishedAt: '21.08.2025 14:14',
    author: 'Administrator',
  },
  {
    title: 'Case Study: Nahwärmenetz Mondscheinweg - Nachhaltige Energieversorgung für die Zukunft Einleitung',
    slug: 'case-study-nahwaermenetz-mondscheinweg-nachhaltige-energieversorgung-fuer-die-zukunft-einleitung',
    content: `<p>Das Nahwärmenetz Mondscheinweg ist ein innovatives, nachhaltiges und kosteneffizientes Heizsystem, das den Energiebedarf von Haushalten umweltfreundlich deckt. Mit modernster Technik wie einer Luft-Wasser-Wärmepumpe, einem Pelletkessel, einem Blockheizkraftwerk (BHKW) und einer Photovoltaikanlage stellt dieses Nahwärmesystem eine zukunftsweisende Alternative zu herkömmlichen Heizmethoden dar. Die Energiezentrale wurde von iPower, im Auftrag der Stadtwerke Ostmünsterland realisiert.</p><p><br></p><p><strong>Projektbeschreibung: Effizientes und nachhaltiges Heizen</strong>&nbsp;</p><p>Die Energiezentrale am Mondscheinweg wurde speziell konzipiert, um eine effiziente und nachhaltige Wärmeversorgung für Neubauten zu gewährleisten. Das System setzt auf erneuerbare Energien und sorgt für niedrige CO2-Emissionen.</p><p><strong>Technologie und Funktionalität:</strong></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Luft-Wasser-Wärmepumpe: Nutzt Umweltwärme zur Heizungsunterstützung und Warmwasserbereitung.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Pelletkessel: Sorgt für eine konstante Energieversorgung mit nachwachsenden Rohstoffen.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Blockheizkraftwerk (BHKW): Erzeugt Wärme und Strom gleichzeitig und steigert die Energieeffizienz.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Photovoltaikanlage: Versorgt die Energiezentrale mit umweltfreundlichem Solarstrom.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Niedertemperatur-Wärmenetz: Optimiert die Energieverteilung und minimiert Verluste.</li></ol><p><strong>Umweltfreundlichkeit und Energieeffizienz</strong>&nbsp;</p><p>Durch den Verzicht auf fossile Brennstoffe und die Nutzung erneuerbarer Energien werden jährlich bis zu 60 Tonnen CO2 eingespart. Die von iPower entwickelte Energiezentrale reduziert die individuellen Heizkosten und ist eine klimafreundliche Lösung für nachhaltiges Bauen.</p><p><strong>Wirtschaftliche Vorteile</strong></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Niedrige Heizkosten: Durchschnittliche Energiekosten von nur ca. 87€ pro Monat pro Haushalt.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Hohe Fördermittel: Zuschüsse von bis zu 10.750€ für den Anschluss an das Nahwärmenetz.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Wertsteigerung von Immobilien: Nachhaltige Energieversorgung steigert die Attraktivität des Wohngebiets.</li></ol><p><strong>Herausforderungen und erfolgreiche Umsetzung</strong>&nbsp;</p><p>Die Errichtung der Energiezentrale erfolgte mitten in der Ukraine-Krise, was mit erheblichen Lieferengpässen verbunden war. Dank der engen Zusammenarbeit zwischen iPower und den Stadtwerken Ostmünsterland konnten diese Herausforderungen gemeistert und die Anlage termingerecht fertiggestellt werden. Wir bedanken uns herzlich beim Team der Stadtwerke Ostmünsterland für die großartige Zusammenarbeit und das gemeinsame Lösen dieser anspruchsvollen Aufgabe.</p><p><strong>Fazit: Zukunftsweisende Wärmeversorgung von iPower</strong>&nbsp;</p><p>Das Nahwärmenetz Mondscheinweg ist ein Vorzeigemodell für nachhaltige Energieversorgung. Es zeigt, wie moderne Technologien und erneuerbare Energien kombiniert werden können, um eine wirtschaftliche und umweltfreundliche Alternative zu herkömmlichen Heizsystemen zu schaffen. iPower hat mit dem Bau der Energiezentrale im Auftrag der Stadtwerke Ostmünsterland einen wichtigen Beitrag zur klimafreundlichen Wärmeversorgung geleistet. Vertrauen Sie auf iPower für nachhaltige Energielösungen!</p>`,
    excerpt: null,
    // Original: https://admin.ipower.de/storage/posts/LM2xZvlymhoxOSHtBVxwrYyJLgqxR4QRlyJsZRvU.jpg
    // Local: _temp/ipower-nahwaermenetz-mondscheinweg.jpg
    featuredImage: 'https://admin.ipower.de/storage/posts/LM2xZvlymhoxOSHtBVxwrYyJLgqxR4QRlyJsZRvU.jpg',
    publishedAt: '01.06.2025 17:09',
    author: 'Administrator',
  },
  {
    title: 'Case Study: Sichere Energieversorgung im Rathaus – iPower sorgt für zuverlässigen Notstrom',
    slug: 'case-study-sichere-energieversorgung-im-rathaus-ipower-sorgt-fuer-zuverlaessigen-notstrom',
    content: `<p><strong>Herausforderung:&nbsp;</strong></p><p>In einer modernen Kreisstadt wie Cloppenburg ist eine unterbrechungsfreie Stromversorgung essenziell, insbesondere für öffentliche Einrichtungen wie das Rathaus. Stromausfälle können zu erheblichen Einschränkungen in der Verwaltung, der Krisenkommunikation und dem Katastrophenschutz führen. Um die Betriebssicherheit und Handlungsfähigkeit auch bei einem Blackout zu gewährleisten, entschied sich das Rathaus der Stadt Cloppenburg für die Installation einer leistungsstarken Netzersatzanlage.</p><p><strong>Lösung:&nbsp;</strong></p><p>Das Ingenieurbüro iPower übernahm die Planung, Lieferung und Installation eines maßgeschneiderten Notstromaggregats. Die wichtigsten Schritte der Umsetzung umfassten:</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Bedarfsermittlung: Analyse des Strombedarfs im Rathaus, um eine optimale Dimensionierung des Aggregats sicherzustellen.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Technische Planung: Auswahl einer hocheffizienten Netzersatzanlage mit automatischem Start bei Stromausfällen.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Installation & Inbetriebnahme: Fachgerechte Implementierung und Integration in die bestehende Stromversorgung.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Tests & Sicherheitsschulungen: Durchführung von Lasttests und Schulungen für das Rathauspersonal zur sicheren Bedienung der Anlage.</li></ol><p><strong>Ergebnis:&nbsp;</strong></p><p>Mit der Installation des neuen Notstromaggregats durch iPower ist das Rathaus der Stadt Cloppenburg nun bestens auf Stromausfälle vorbereitet.&nbsp;</p><p>Die wichtigsten Vorteile auf einen Blick:</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Unterbrechungsfreie Verwaltung: Kritische Verwaltungsprozesse bleiben auch bei einem Stromausfall aktiv.&nbsp;</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Sicherheit für Bürgeri:nnen: Notfallkommunikation und Katastrophenschutz sind jederzeit gewährleistet.&nbsp;</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Effizienz & Umweltfreundlichkeit: Das Aggregat arbeitet mit modernster Technologie für minimale Emissionen und hohe Energieeffizienz.&nbsp;</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Automatische Umschaltung: Bei Netzausfall startet das Aggregat sofort und versorgt das Rathaus zuverlässig mit Strom.</li></ol><p><br></p><p><strong>Fazit:&nbsp;</strong></p><p>Dank der professionellen Umsetzung durch iPower ist das Rathaus der Stadt Cloppenburg optimal auf mögliche Stromausfälle vorbereitet. Die Kombination aus modernster Technologie, effizienter Installation und umfangreicher Schulung macht diese Lösung zu einem Best-Practice-Beispiel für öffentliche Einrichtungen.</p><p><br></p><p><strong>Sie suchen eine zuverlässige Notstrromlösung?&nbsp;</strong></p><p>Kontaktieren Sie iPower für eine maßgeschneiderte Beratung und sichern Sie sich eine zukunftssichere Energieversorgung!</p>`,
    excerpt: null,
    // Original: https://admin.ipower.de/storage/posts/ucAwISzkYFMYsr74bDBakxkP8VkHaaTcvEbr1F64.jpg
    // Local: _temp/ipower-notstrom-rathaus.jpg
    featuredImage: 'https://admin.ipower.de/storage/posts/ucAwISzkYFMYsr74bDBakxkP8VkHaaTcvEbr1F64.jpg',
    publishedAt: '07.03.2025 10:06',
    author: 'Administrator',
  },
]

export async function seedJournal() {
  console.log('Seeding iPower journal categories and posts...')

  // Create "Allgemein" category for iPower
  const iPowerCategory = await prisma.blogCategory.upsert({
    where: {
      website_slug: {
        website: Website.ipower,
        slug: 'allgemein',
      },
    },
    update: {},
    create: {
      website: Website.ipower,
      name: 'Allgemein',
      slug: 'allgemein',
      description: 'Allgemeine Beiträge',
    },
  })
  console.log('  ✓ iPower category "Allgemein" created/updated')

  // Create iPower posts
  for (const post of iPowerPosts) {
    const publishedAt = parseGermanDate(post.publishedAt)

    await prisma.blogPost.upsert({
      where: {
        website_slug: {
          website: Website.ipower,
          slug: post.slug,
        },
      },
      update: {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        author: post.author,
        published: true,
        publishedAt,
        metaTitle: post.title,
        metaDescription: post.excerpt || '',
      },
      create: {
        website: Website.ipower,
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        author: post.author,
        categoryId: iPowerCategory.id,
        published: true,
        publishedAt,
        metaTitle: post.title,
        metaDescription: post.excerpt || '',
      },
    })
    console.log(`  ✓ iPower post "${post.title.substring(0, 50)}..." created/updated`)
  }

  console.log('iPower journal seeding completed!')
}

// Run directly if called as main
if (require.main === module) {
  seedJournal()
    .catch((e) => {
      console.error('Error seeding journal:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
