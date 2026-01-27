import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = join(process.cwd(), 'public', 'uploads', ...pathSegments)

    // Security: prevent directory traversal
    const normalizedPath = join(process.cwd(), 'public', 'uploads', ...pathSegments)
    if (!normalizedPath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const file = await readFile(filePath)
    const ext = pathSegments[pathSegments.length - 1].split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Error serving file' }, { status: 500 })
  }
}
