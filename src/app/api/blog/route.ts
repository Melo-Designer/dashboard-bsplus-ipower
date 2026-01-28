import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Website } from '@/generated/prisma'
import { z } from 'zod'

const blogPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
  title: z.string().min(1, 'Titel ist erforderlich'),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, 'Inhalt ist erforderlich'),
  featuredImage: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

// GET - List blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website') as Website
    const published = searchParams.get('published')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const where: {
      website: Website
      published?: boolean
      categoryId?: string
      OR?: { title: { contains: string; mode: 'insensitive' } }[]
    } = { website }

    if (published === 'true') where.published = true
    if (published === 'false') where.published = false
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ]
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get blog posts error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST - Create blog post
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { website, ...data } = body

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Website parameter erforderlich' }, { status: 400 })
    }

    const validated = blogPostSchema.parse(data)

    // Check unique slug
    const existing = await prisma.blogPost.findUnique({
      where: { website_slug: { website, slug: validated.slug } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ein Beitrag mit diesem Slug existiert bereits' }, { status: 400 })
    }

    const post = await prisma.blogPost.create({
      data: {
        website,
        slug: validated.slug,
        title: validated.title,
        excerpt: validated.excerpt,
        content: validated.content,
        featuredImage: validated.featuredImage,
        author: validated.author,
        categoryId: validated.categoryId,
        published: validated.published ?? false,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : null,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create blog post error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
