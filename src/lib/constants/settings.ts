export interface SettingDefinition {
  key: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'url' | 'tel'
  placeholder?: string
  description?: string
}

export interface SettingGroup {
  title: string
  description?: string
  settings: SettingDefinition[]
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Unternehmensdaten',
    description: 'Allgemeine Informationen über das Unternehmen',
    settings: [
      { key: 'company_name', label: 'Firmenname', type: 'text' },
      { key: 'company_tagline', label: 'Slogan', type: 'text' },
      { key: 'company_description', label: 'Beschreibung', type: 'textarea' },
    ],
  },
  {
    title: 'Kontaktdaten',
    description: 'Kontaktinformationen für Kunden',
    settings: [
      { key: 'contact_email', label: 'E-Mail', type: 'email', placeholder: 'info@example.de' },
      { key: 'contact_phone', label: 'Telefon', type: 'tel', placeholder: '+49 123 456789' },
      { key: 'contact_fax', label: 'Fax', type: 'tel' },
    ],
  },
  {
    title: 'Adresse',
    settings: [
      { key: 'address_street', label: 'Straße', type: 'text' },
      { key: 'address_zip', label: 'PLZ', type: 'text' },
      { key: 'address_city', label: 'Stadt', type: 'text' },
      { key: 'address_country', label: 'Land', type: 'text', placeholder: 'Deutschland' },
    ],
  },
  {
    title: 'Social Media',
    description: 'Links zu Ihren Social-Media-Profilen',
    settings: [
      { key: 'social_facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
      { key: 'social_instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/...' },
      { key: 'social_youtube', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/...' },
      { key: 'social_xing', label: 'Xing', type: 'url', placeholder: 'https://xing.com/...' },
    ],
  },
  {
    title: 'E-Mail-Konfiguration',
    description: 'Einstellungen für E-Mail-Benachrichtigungen',
    settings: [
      { key: 'email_from_name', label: 'Absendername', type: 'text', placeholder: 'Firma GmbH' },
      { key: 'email_from_address', label: 'Absenderadresse', type: 'email' },
      { key: 'email_contact_recipient', label: 'Kontaktformular-Empfänger', type: 'email' },
      { key: 'email_application_recipient', label: 'Bewerbungs-Empfänger', type: 'email' },
    ],
  },
  {
    title: 'Kontaktseite',
    description: 'Inhalte für die Kontaktseite',
    settings: [
      { key: 'contact_form_title', label: 'Formularbereich Titel', type: 'text', placeholder: 'SIE HABEN FRAGEN?' },
      { key: 'contact_form_description', label: 'Formularbereich Beschreibung', type: 'textarea', description: 'Einführungstext über dem Kontaktformular' },
      { key: 'contact_cta_title', label: 'CTA Titel (optional)', type: 'text', description: 'Titel für den schwarzen CTA-Bereich am Ende' },
      { key: 'contact_cta_description', label: 'CTA Beschreibung (optional)', type: 'textarea', description: 'Text für den schwarzen CTA-Bereich' },
      { key: 'contact_cta_image', label: 'CTA Hintergrundbild (optional)', type: 'url', description: 'Hintergrundbild für den CTA-Bereich' },
    ],
  },
  {
    title: 'Sonstiges',
    settings: [
      { key: 'google_maps_embed', label: 'Google Maps Embed URL', type: 'url', description: 'Einbettungs-URL für Google Maps auf der Kontaktseite' },
      { key: 'opening_hours', label: 'Öffnungszeiten', type: 'textarea', placeholder: 'Mo-Fr: 8:00-17:00 Uhr' },
    ],
  },
]

// Karriere ARCHIVE page settings (where all jobs are listed)
export const KARRIERE_ARCHIVE_SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Hero-Bereich',
    description: 'Kopfbereich der Karriere-Übersichtsseite',
    settings: [
      { key: 'karriere_hero_title', label: 'Titel', type: 'text', placeholder: 'Karriere bei uns: Ihre Zukunft beginnt hier' },
      { key: 'karriere_hero_description', label: 'Beschreibung', type: 'textarea', placeholder: 'Bei uns setzen wir auf Innovation...' },
      { key: 'karriere_hero_button_text', label: 'Button-Text', type: 'text', placeholder: 'Stelle finden' },
      { key: 'karriere_hero_button_link', label: 'Button-Link', type: 'text', placeholder: '#stellen' },
    ],
  },
  {
    title: 'Vorteile-Bereich (3 Karten)',
    description: 'Drei Vorteile-Karten unter dem Hero-Bereich (optional)',
    settings: [
      { key: 'karriere_benefits_active', label: 'Bereich aktivieren', type: 'text', description: 'true/false' },
      { key: 'karriere_benefit_1_title', label: 'Vorteil 1 - Titel', type: 'text', placeholder: 'Gestalte die Zukunft mit uns' },
      { key: 'karriere_benefit_1_content', label: 'Vorteil 1 - Text', type: 'textarea' },
      { key: 'karriere_benefit_2_title', label: 'Vorteil 2 - Titel', type: 'text', placeholder: 'Von der Idee zur Umsetzung' },
      { key: 'karriere_benefit_2_content', label: 'Vorteil 2 - Text', type: 'textarea' },
      { key: 'karriere_benefit_3_title', label: 'Vorteil 3 - Titel', type: 'text', placeholder: 'Gemeinsam Großes bewegen!' },
      { key: 'karriere_benefit_3_content', label: 'Vorteil 3 - Text', type: 'textarea' },
    ],
  },
  {
    title: 'Stellenangebote-Bereich',
    description: 'Überschrift für die Stellenübersicht',
    settings: [
      { key: 'karriere_jobs_title', label: 'Bereichstitel', type: 'text', placeholder: 'Offene Stellen' },
    ],
  },
  {
    title: 'Keine Stellen vorhanden',
    description: 'Anzeige wenn keine Stellenangebote aktiv sind',
    settings: [
      { key: 'karriere_empty_title', label: 'Titel', type: 'text', placeholder: 'Aktuell keine offenen Stellen' },
      { key: 'karriere_empty_description', label: 'Beschreibung', type: 'textarea', placeholder: 'Derzeit haben wir keine offenen Positionen. Schauen Sie bald wieder vorbei oder senden Sie uns eine Initiativbewerbung!' },
      { key: 'karriere_empty_button_text', label: 'Button-Text', type: 'text', placeholder: 'Initiativbewerbung senden' },
      { key: 'karriere_empty_button_link', label: 'Button-Link', type: 'text', placeholder: '/kontakt' },
    ],
  },
  {
    title: 'Über uns-Bereich',
    description: 'Text-Bild-Bereich auf der Karriereseite (optional)',
    settings: [
      { key: 'karriere_about_active', label: 'Bereich aktivieren', type: 'text', description: 'true/false' },
      { key: 'karriere_about_title', label: 'Titel', type: 'text', placeholder: 'Über uns' },
      { key: 'karriere_about_content', label: 'Inhalt', type: 'textarea', placeholder: 'Die Zukunft der Energie ist vernetzt...' },
      { key: 'karriere_about_button_text', label: 'Button-Text', type: 'text', placeholder: 'Mehr über uns' },
      { key: 'karriere_about_button_link', label: 'Button-Link', type: 'text', placeholder: '/ueber-uns' },
      { key: 'karriere_about_image_alt', label: 'Bild Alt-Text', type: 'text', placeholder: 'Unser Team' },
    ],
  },
  {
    title: 'CTA-Bereich (Archivseite)',
    description: 'Schwarzer Call-to-Action-Bereich am Ende der Karriere-Übersichtsseite (optional)',
    settings: [
      { key: 'karriere_archive_cta_active', label: 'Bereich aktivieren', type: 'text', description: 'true/false' },
      { key: 'karriere_archive_cta_title', label: 'Titel', type: 'text', placeholder: 'Wärmewende 100% erneuerbar' },
      { key: 'karriere_archive_cta_description', label: 'Beschreibung', type: 'textarea' },
      { key: 'karriere_archive_cta_button1_text', label: 'Button 1 Text', type: 'text', placeholder: 'Termin vereinbaren' },
      { key: 'karriere_archive_cta_button1_link', label: 'Button 1 Link', type: 'text', placeholder: '/kontakt' },
      { key: 'karriere_archive_cta_button2_text', label: 'Button 2 Text', type: 'text', placeholder: 'Angebot holen' },
      { key: 'karriere_archive_cta_button2_link', label: 'Button 2 Link', type: 'text', placeholder: '/kontakt' },
    ],
  },
]

// Karriere SINGLE JOB page settings (individual job detail page)
export const KARRIERE_SINGLE_SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Stellendetails - Überschriften',
    description: 'Bereichsüberschriften auf der Einzelstellenseite',
    settings: [
      { key: 'karriere_detail_apply_button', label: 'Bewerben-Button', type: 'text', placeholder: 'Jetzt bewerben' },
      { key: 'karriere_detail_tasks_title', label: 'Aufgaben-Titel', type: 'text', placeholder: 'Ihre Aufgaben' },
      { key: 'karriere_detail_profile_title', label: 'Profil-Titel', type: 'text', placeholder: 'Ihr Profil' },
      { key: 'karriere_detail_benefits_title', label: 'Benefits-Titel', type: 'text', placeholder: 'Was wir bieten' },
      { key: 'karriere_detail_overview_title', label: 'Übersicht-Titel', type: 'text', placeholder: 'Auf einen Blick' },
    ],
  },
  {
    title: 'Bewerbungsformular',
    description: 'Texte für das Bewerbungsformular',
    settings: [
      { key: 'karriere_form_title', label: 'Formular-Titel', type: 'text', placeholder: 'Jetzt bewerben' },
      { key: 'karriere_form_submit_button', label: 'Absenden-Button', type: 'text', placeholder: 'Bewerbung abschicken' },
      { key: 'karriere_form_success_message', label: 'Erfolgsmeldung', type: 'textarea', placeholder: 'Vielen Dank für Ihre Bewerbung! Wir werden uns in Kürze bei Ihnen melden.' },
      { key: 'karriere_form_error_message', label: 'Fehlermeldung', type: 'textarea', placeholder: 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' },
    ],
  },
  {
    title: 'CTA-Bereich (Einzelstellenseite)',
    description: 'Schwarzer Call-to-Action-Bereich am Ende der Einzelstellenseite (optional)',
    settings: [
      { key: 'karriere_single_cta_active', label: 'Bereich aktivieren', type: 'text', description: 'true/false' },
      { key: 'karriere_single_cta_title', label: 'Titel', type: 'text', placeholder: 'Interesse geweckt?' },
      { key: 'karriere_single_cta_description', label: 'Beschreibung', type: 'textarea' },
      { key: 'karriere_single_cta_button1_text', label: 'Button 1 Text', type: 'text', placeholder: 'Termin vereinbaren' },
      { key: 'karriere_single_cta_button1_link', label: 'Button 1 Link', type: 'text', placeholder: '/kontakt' },
      { key: 'karriere_single_cta_button2_text', label: 'Button 2 Text', type: 'text', placeholder: 'Mehr erfahren' },
      { key: 'karriere_single_cta_button2_link', label: 'Button 2 Link', type: 'text', placeholder: '/ueber-uns' },
    ],
  },
]

// Combined for backwards compatibility
export const KARRIERE_SETTING_GROUPS: SettingGroup[] = [
  ...KARRIERE_ARCHIVE_SETTING_GROUPS,
  ...KARRIERE_SINGLE_SETTING_GROUPS,
]

// Get all setting keys
export const ALL_SETTING_KEYS = SETTING_GROUPS.flatMap((group) =>
  group.settings.map((s) => s.key)
)

// Get all karriere setting keys
export const KARRIERE_SETTING_KEYS = KARRIERE_SETTING_GROUPS.flatMap((group) =>
  group.settings.map((s) => s.key)
)
