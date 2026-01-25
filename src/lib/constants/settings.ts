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
    title: 'Sonstiges',
    settings: [
      { key: 'google_maps_embed', label: 'Google Maps Embed URL', type: 'url', description: 'Einbettungs-URL für Google Maps auf der Kontaktseite' },
      { key: 'opening_hours', label: 'Öffnungszeiten', type: 'textarea', placeholder: 'Mo-Fr: 8:00-17:00 Uhr' },
    ],
  },
]

// Get all setting keys
export const ALL_SETTING_KEYS = SETTING_GROUPS.flatMap((group) =>
  group.settings.map((s) => s.key)
)
