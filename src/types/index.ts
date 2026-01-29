// Re-export Prisma types
export type {
  User,
  Media,
  Setting,
  Slide,
  HomepageSection,
  Page,
  PageSection,
  BlogPost,
  BlogCategory,
  Tag,
  JobListing,
  JobApplication,
  PageHeader,
  LegalPage,
  ContactMessage,
} from '@/generated/prisma'

export { Website, SectionType, JobStatus, ApplicationStatus } from '@/generated/prisma'

// Website configuration
export type WebsiteKey = 'bs_plus' | 'ipower'

export const WEBSITES: Record<WebsiteKey, {
  name: string
  shortName: string
  primaryColor: string
  secondaryColor: string
  domain: string
}> = {
  bs_plus: {
    name: 'BS Plus MotorenService GmbH',
    shortName: 'BS Plus',
    primaryColor: '#C83C00',
    secondaryColor: '#26505D',
    domain: 'bsplus-service.de',
  },
  ipower: {
    name: 'iPower GmbH',
    shortName: 'iPower',
    primaryColor: '#BB1E10',
    secondaryColor: '#005E83',
    domain: 'ipower.de',
  },
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Parsed types (with JSON fields parsed)
export interface ParsedHomepageSection {
  id: string
  website: WebsiteKey
  identifier: string
  title: string
  subtitle: string | null
  description: string | null
  backgroundImage: string | null
  backgroundColor: string | null
  textColor: string | null
  cards: AccordionCard[]
  sortOrder: number
  active: boolean
  // Navigation settings (top navbar)
  showInNavbar: boolean
  navbarName: string | null
  navbarPosition: number | null
  createdAt: Date
  updatedAt: Date
}

export interface AccordionCard {
  title: string
  content: string
  linkUrl?: string
  linkText?: string
  btnClass?: 'primary' | 'secondary'
}

// Triple section item
export interface TripleItem {
  title: string
  content: string
}

// Statistics item for numbers section
export interface StatItem {
  number: string
  title: string
}

// Button configuration
export interface ButtonItem {
  text: string
  type?: 'internal' | 'external' | 'button'
  link: string
  btnClass?: 'primary' | 'secondary'
}

export interface ParsedPageSection {
  id: string
  pageId: string
  type: 'triple' | 'text_image' | 'black_cta' | 'numbers' | 'hero' | 'accordion'
  title: string | null
  subtitle: string | null
  content: string | null
  imageUrl: string | null
  imageAlt: string | null
  imageAlign: 'left' | 'right' | null
  items: TripleItem[]
  buttons: ButtonItem[]
  cards: AccordionCard[]
  stats: StatItem[]
  backgroundImage: string | null
  backgroundColor: string | null
  textColor: string | null
  sortOrder: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ParsedPage {
  id: string
  website: WebsiteKey
  slug: string
  title: string
  metaTitle: string | null
  metaDescription: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  heroDescription: string | null
  heroImage: string | null
  heroButtonText: string | null
  heroButtonLink: string | null
  heroTextColor: string | null
  heroCardColor: string | null
  active: boolean
  // Sidebar navigation settings
  showInSidebar: boolean
  sidebarName: string | null
  sidebarPosition: number | null
  sections: ParsedPageSection[]
  createdAt: Date
  updatedAt: Date
}
