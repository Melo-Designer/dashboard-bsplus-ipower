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

export interface ParsedPageSection {
  id: string
  pageId: string
  type: string
  title: string | null
  subtitle: string | null
  content: string | null
  imageUrl: string | null
  imageAlt: string | null
  imageAlign: string | null
  items?: { title: string; content: string }[]
  buttons?: { text: string; type: string; link: string; btnClass: string }[]
  cards?: AccordionCard[]
  stats?: { value: string; label: string; suffix?: string }[]
  backgroundImage: string | null
  backgroundColor: string | null
  textColor: string | null
  sortOrder: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}
