export const PAGE_HEADERS = [
  {
    slug: 'kontakt',
    label: 'Kontakt',
    defaultTitle: 'Kontakt',
  },
  {
    slug: 'ueber-uns',
    label: 'Über uns',
    defaultTitle: 'Über uns',
  },
  {
    slug: 'karriere',
    label: 'Karriere',
    defaultTitle: 'Karriere',
  },
  {
    slug: 'journal',
    label: 'Journal / Blog',
    defaultTitle: 'Journal',
  },
] as const

export const TEXT_COLOR_OPTIONS = [
  { value: 'light', label: 'Hell (weiß)' },
  { value: 'dark', label: 'Dunkel (schwarz)' },
] as const

export const LEGAL_PAGE_TYPES = [
  {
    type: 'impressum',
    label: 'Impressum',
    defaultTitle: 'Impressum',
  },
  {
    type: 'datenschutz',
    label: 'Datenschutzerklärung',
    defaultTitle: 'Datenschutzerklärung',
  },
  {
    type: 'barrierefreiheit',
    label: 'Barrierefreiheitserklärung',
    defaultTitle: 'Erklärung zur Barrierefreiheit',
  },
] as const
