import { SectionType } from '@/generated/prisma'

export interface SectionTypeConfig {
  name: string
  description: string
  icon: string
  fields: string[]
  itemsLabel?: string
  maxItems?: number
  canDuplicate?: boolean
}

export const SECTION_TYPES: Record<string, SectionTypeConfig> = {
  triple: {
    name: 'Drei Spalten',
    description: 'Drei Informationskarten nebeneinander',
    icon: 'Columns3',
    fields: ['title', 'items'],
    itemsLabel: 'Spalten (genau 3)',
    maxItems: 3,
  },
  text_image: {
    name: 'Text & Bild',
    description: 'Text neben einem Bild (links oder rechts)',
    icon: 'LayoutList',
    fields: ['title', 'content', 'imageUrl', 'imageAlt', 'imageAlign', 'buttons'],
    canDuplicate: true,
  },
  black_cta: {
    name: 'Dunkler CTA',
    description: 'Dunkler Abschnitt mit Handlungsaufforderung',
    icon: 'Square',
    fields: ['title', 'content', 'backgroundImage', 'buttons'],
  },
  numbers: {
    name: 'Zahlen & Statistiken',
    description: 'Beeindruckende Zahlen und Fakten',
    icon: 'Hash',
    fields: ['title', 'stats'],
  },
} as const

export type PageSectionType = keyof typeof SECTION_TYPES

// Helper to get section type label
export function getSectionTypeName(type: string): string {
  return SECTION_TYPES[type]?.name || type
}

// Helper to get section type description
export function getSectionTypeDescription(type: string): string {
  return SECTION_TYPES[type]?.description || ''
}

// Get available section types as array
export function getAvailableSectionTypes(): Array<{ value: string; label: string; description: string }> {
  return Object.entries(SECTION_TYPES).map(([value, config]) => ({
    value,
    label: config.name,
    description: config.description,
  }))
}
