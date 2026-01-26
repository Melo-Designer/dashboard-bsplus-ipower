import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all messages for a website
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const website = searchParams.get('website')
    const filter = searchParams.get('filter') // 'unread', 'archived', 'all'

    if (!website || !['bs_plus', 'ipower'].includes(website)) {
      return NextResponse.json({ error: 'Ungültige Website' }, { status: 400 })
    }

    const where: {
      website: 'bs_plus' | 'ipower'
      read?: boolean
      archived?: boolean
    } = {
      website: website as 'bs_plus' | 'ipower',
    }

    // Apply filters
    if (filter === 'unread') {
      where.read = false
      where.archived = false
    } else if (filter === 'archived') {
      where.archived = true
    } else {
      // Default: show non-archived
      where.archived = false
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Get counts
    const counts = await prisma.contactMessage.groupBy({
      by: ['read', 'archived'],
      where: { website: website as 'bs_plus' | 'ipower' },
      _count: true,
    })

    const unreadCount = counts
      .filter((c) => !c.read && !c.archived)
      .reduce((acc, c) => acc + c._count, 0)
    const archivedCount = counts
      .filter((c) => c.archived)
      .reduce((acc, c) => acc + c._count, 0)
    const totalCount = counts.reduce((acc, c) => acc + c._count, 0)

    return NextResponse.json({
      messages,
      counts: {
        total: totalCount,
        unread: unreadCount,
        archived: archivedCount,
      },
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}
