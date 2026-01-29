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

  // ============================================
  // KARRIERE PAGE SETTINGS - ARCHIVE (Job Listing)
  // ============================================

  // Hero section
  karriere_hero_button_text: 'Stelle finden',
  karriere_hero_button_link: '#stellen',
  karriere_section_hero_color: 'primary',

  // Benefits section (3 columns) - OPTIONAL
  karriere_benefits_active: 'true',
  karriere_benefit_1_title: 'Gestalte die Zukunft mit uns',
  karriere_benefit_1_content: 'Werde Teil eines innovativen Teams und entwickle nachhaltige Energielösungen für morgen.',
  karriere_benefit_2_title: 'Von der Idee zur Umsetzung',
  karriere_benefit_2_content: 'Bei uns kannst du deine Ideen einbringen und aktiv an spannenden Projekten mitwirken.',
  karriere_benefit_3_title: 'Gemeinsam Großes bewegen!',
  karriere_benefit_3_content: 'In einem starken Team arbeiten wir zusammen an nachhaltigen Lösungen für die Energiewende.',

  // Jobs section
  karriere_jobs_title: 'Offene Stellen',

  // Empty state (when no jobs)
  karriere_empty_title: 'Aktuell keine offenen Stellen',
  karriere_empty_description: 'Derzeit haben wir keine offenen Positionen. Schauen Sie bald wieder vorbei oder senden Sie uns eine Initiativbewerbung!',
  karriere_empty_button_text: 'Initiativbewerbung senden',
  karriere_empty_button_link: '/kontakt',

  // About section (text + image) - OPTIONAL
  karriere_about_active: 'true',
  karriere_about_title: 'Über uns',
  karriere_about_content: 'BSplus MotorenService GmbH ist Ihr kompetenter Partner für die Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen. Mit jahrelanger Erfahrung bieten wir professionelle Lösungen für BHKW-Betreiber.',
  karriere_about_button_text: 'Mehr über uns',
  karriere_about_button_link: '/ueber-uns',
  karriere_about_image: '',
  karriere_about_image_alt: 'Unser Team',

  // Archive CTA section (dark) - OPTIONAL
  karriere_archive_cta_active: 'true',
  karriere_archive_cta_title: 'Wärmewende 100% erneuerbar',
  karriere_archive_cta_description: 'Wir begleiten Sie auf dem Weg zu einer nachhaltigen und dezentralen Energieversorgung.',
  karriere_archive_cta_button1_text: 'Kontakt aufnehmen',
  karriere_archive_cta_button1_link: '/kontakt',
  karriere_archive_cta_button2_text: '',
  karriere_archive_cta_button2_link: '',
  karriere_archive_cta_image: '',

  // ============================================
  // KARRIERE PAGE SETTINGS - SINGLE JOB DETAIL
  // ============================================

  // Section headings
  karriere_detail_apply_button: 'Jetzt bewerben',
  karriere_detail_tasks_title: 'Ihre Aufgaben',
  karriere_detail_profile_title: 'Ihr Profil',
  karriere_detail_benefits_title: 'Was wir bieten',
  karriere_detail_overview_title: 'Auf einen Blick',

  // Application form
  karriere_form_title: 'Jetzt bewerben',
  karriere_form_submit_button: 'Bewerbung abschicken',
  karriere_form_success_message: 'Vielen Dank für Ihre Bewerbung! Wir werden uns in Kürze bei Ihnen melden.',
  karriere_form_error_message: 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',

  // Single CTA section (dark) - OPTIONAL
  karriere_single_cta_active: 'true',
  karriere_single_cta_title: 'Interesse geweckt?',
  karriere_single_cta_description: 'Wir freuen uns auf Ihre Bewerbung und darauf, Sie kennenzulernen!',
  karriere_single_cta_button1_text: 'Kontakt aufnehmen',
  karriere_single_cta_button1_link: '/kontakt',
  karriere_single_cta_button2_text: 'Mehr über uns',
  karriere_single_cta_button2_link: '/ueber-uns',
  karriere_single_cta_image: '',

  // ============================================
  // JOURNAL PAGE SETTINGS - ARCHIVE (Alle Beiträge)
  // ============================================

  // SectionTextImage - OPTIONAL
  journal_text_image_active: 'false',
  journal_text_image_title: 'Über BSplus',
  journal_text_image_content: 'Erfahren Sie mehr über unsere Expertise im Bereich BHKW Service und Gasmotoren.',
  journal_text_image_image: '/uploads/2026/01/1769673411-wn4m43ck.webp',
  journal_text_image_image_alt: 'Über BSplus',
  journal_text_image_align: 'left',
  journal_text_image_mode: 'light',
  journal_text_image_button_text: '',
  journal_text_image_button_link: '',
  journal_text_image_button_style: 'secondary',

  // Archive CTA section (dark) - OPTIONAL
  journal_cta_active: 'false',
  journal_cta_title: 'Ihr Partner für BHKW Service',
  journal_cta_content: 'Mit jahrzehntelanger Erfahrung und einem hochqualifizierten Team stehen wir Ihnen bei allen Fragen rund um Gasmotoren und BHKW zur Seite.',
  journal_cta_image: '',
  journal_cta_button1_text: 'Kontakt aufnehmen',
  journal_cta_button1_link: '/kontakt',
  journal_cta_button1_style: 'primary',
  journal_cta_button2_text: '',
  journal_cta_button2_link: '',
  journal_cta_button2_style: 'secondary',

  // ============================================
  // JOURNAL PAGE SETTINGS - SINGLE POST (Einzelner Beitrag)
  // ============================================

  // Single CTA section (dark) - OPTIONAL
  journal_single_cta_active: 'false',
  journal_single_cta_title: 'Ihr Partner für BHKW Service',
  journal_single_cta_content: 'Mit jahrzehntelanger Erfahrung und einem hochqualifizierten Team stehen wir Ihnen bei allen Fragen rund um Gasmotoren und BHKW zur Seite.',
  journal_single_cta_image: '',
  journal_single_cta_button1_text: 'Kontakt aufnehmen',
  journal_single_cta_button1_link: '/kontakt',
  journal_single_cta_button1_style: 'primary',
  journal_single_cta_button2_text: '',
  journal_single_cta_button2_link: '',
  journal_single_cta_button2_style: 'secondary',
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

  // ============================================
  // KARRIERE PAGE SETTINGS - ARCHIVE (Job Listing)
  // ============================================

  // Hero section
  karriere_hero_button_text: 'Stelle finden',
  karriere_hero_button_link: '#stellen',
  karriere_section_hero_color: 'secondary',

  // Benefits section (3 columns) - OPTIONAL
  karriere_benefits_active: 'true',
  karriere_benefit_1_title: 'Gestalte die Zukunft mit uns',
  karriere_benefit_1_content: 'Werde Teil eines innovativen Teams und entwickle nachhaltige Energielösungen für morgen.',
  karriere_benefit_2_title: 'Von der Idee zur Umsetzung',
  karriere_benefit_2_content: 'Bei uns kannst du deine Ideen einbringen und aktiv an spannenden Projekten mitwirken.',
  karriere_benefit_3_title: 'Gemeinsam Großes bewegen!',
  karriere_benefit_3_content: 'In einem starken Team arbeiten wir zusammen an nachhaltigen Lösungen für die Energiewende.',

  // Jobs section
  karriere_jobs_title: 'Offene Stellen',

  // Empty state (when no jobs)
  karriere_empty_title: 'Aktuell keine offenen Stellen',
  karriere_empty_description: 'Derzeit haben wir keine offenen Positionen. Schauen Sie bald wieder vorbei oder senden Sie uns eine Initiativbewerbung!',
  karriere_empty_button_text: 'Initiativbewerbung senden',
  karriere_empty_button_link: '/kontakt',

  // About section (text + image) - OPTIONAL
  karriere_about_active: 'true',
  karriere_about_title: 'Über uns',
  karriere_about_content: 'iPower bietet Planungs- und Ingenieurlösungen in den Bereichen Energie, Wärme, Infrastruktur und Bau an. Mit unserer Expertise unterstützen wir die Energiewende und entwickeln nachhaltige Konzepte.',
  karriere_about_button_text: 'Mehr über uns',
  karriere_about_button_link: '/ueber-uns',
  karriere_about_image: '',
  karriere_about_image_alt: 'Unser Team',

  // Archive CTA section (dark) - OPTIONAL
  karriere_archive_cta_active: 'true',
  karriere_archive_cta_title: 'Wärmewende 100% erneuerbar',
  karriere_archive_cta_description: 'Wir begleiten Sie auf dem Weg zu einer nachhaltigen und dezentralen Energieversorgung.',
  karriere_archive_cta_button1_text: 'Kontakt aufnehmen',
  karriere_archive_cta_button1_link: '/kontakt',
  karriere_archive_cta_button2_text: '',
  karriere_archive_cta_button2_link: '',
  karriere_archive_cta_image: '',

  // ============================================
  // KARRIERE PAGE SETTINGS - SINGLE JOB DETAIL
  // ============================================

  // Section headings
  karriere_detail_apply_button: 'Jetzt bewerben',
  karriere_detail_tasks_title: 'Ihre Aufgaben',
  karriere_detail_profile_title: 'Ihr Profil',
  karriere_detail_benefits_title: 'Was wir bieten',
  karriere_detail_overview_title: 'Auf einen Blick',

  // Application form
  karriere_form_title: 'Jetzt bewerben',
  karriere_form_submit_button: 'Bewerbung abschicken',
  karriere_form_success_message: 'Vielen Dank für Ihre Bewerbung! Wir werden uns in Kürze bei Ihnen melden.',
  karriere_form_error_message: 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',

  // Single CTA section (dark) - OPTIONAL
  karriere_single_cta_active: 'true',
  karriere_single_cta_title: 'Interesse geweckt?',
  karriere_single_cta_description: 'Wir freuen uns auf Ihre Bewerbung und darauf, Sie kennenzulernen!',
  karriere_single_cta_button1_text: 'Kontakt aufnehmen',
  karriere_single_cta_button1_link: '/kontakt',
  karriere_single_cta_button2_text: 'Mehr über uns',
  karriere_single_cta_button2_link: '/ueber-uns',
  karriere_single_cta_image: '',

  // ============================================
  // JOURNAL PAGE SETTINGS - ARCHIVE (Alle Beiträge)
  // ============================================

  // SectionTextImage - OPTIONAL
  journal_text_image_active: 'true',
  journal_text_image_title: 'Über iPower',
  journal_text_image_content: 'Erat sit eget nascetur ultricies sed non vestibulum. Dui quam cursus dignissim in molestie sit amet quisque magna. Ultricies gravida ante faucibus non netus justo amet. Consectetur in justo natoque auctor eget. Pellentesque lectus facilisis pretium eget mauris tempor est nunc. Faucibus vitae ac magna blandit.',
  journal_text_image_image: '/uploads/2026/01/1769673146-xxmulnug.jpg',
  journal_text_image_image_alt: 'Über iPower',
  journal_text_image_align: 'left',
  journal_text_image_mode: 'light',
  journal_text_image_button_text: 'Mehr über iPower',
  journal_text_image_button_link: '/ueber-uns',
  journal_text_image_button_style: 'secondary',

  // Archive CTA section (dark) - OPTIONAL
  journal_cta_active: 'true',
  journal_cta_title: 'Wärmewende 100% erneuerbar',
  journal_cta_content: 'Erneuerbare Wärmenetze unterscheiden sich von herkömmlichen Nah- und Fernwärmenetzen, weil sie auf fossile Brennstoffe verzichten. Wir setzten auf ungenutzte Abwärmepotenziale, vernetzen Sektoren und nutzen grüne Energie.',
  journal_cta_image: '/uploads/2026/01/1769673146-y6yxs079.jpg',
  journal_cta_button1_text: 'Termin vereinbaren',
  journal_cta_button1_link: '/kontakt',
  journal_cta_button1_style: 'primary',
  journal_cta_button2_text: 'Angebot holen',
  journal_cta_button2_link: '/kontakt',
  journal_cta_button2_style: 'secondary',

  // ============================================
  // JOURNAL PAGE SETTINGS - SINGLE POST (Einzelner Beitrag)
  // ============================================

  // Single CTA section (dark) - OPTIONAL
  journal_single_cta_active: 'true',
  journal_single_cta_title: 'Wärmewende 100% erneuerbar',
  journal_single_cta_content: 'Erneuerbare Wärmenetze unterscheiden sich von herkömmlichen Nah- und Fernwärmenetzen, weil sie auf fossile Brennstoffe verzichten. Wir setzten auf ungenutzte Abwärmepotenziale, vernetzen Sektoren und nutzen grüne Energie.',
  journal_single_cta_image: '/uploads/2026/01/1769673146-y6yxs079.jpg',
  journal_single_cta_button1_text: 'Termin vereinbaren',
  journal_single_cta_button1_link: '/kontakt',
  journal_single_cta_button1_style: 'primary',
  journal_single_cta_button2_text: 'Angebot holen',
  journal_single_cta_button2_link: '/kontakt',
  journal_single_cta_button2_style: 'secondary',
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
