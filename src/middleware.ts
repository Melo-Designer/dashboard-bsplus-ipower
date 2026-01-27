import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  // Production
  'https://bsplus-service.de',
  'https://www.bsplus-service.de',
  'https://ipower.de',
  'https://www.ipower.de',
  // Staging
  'https://bs-plus.melodesigner.dev',
  'https://ipower.melodesigner.dev',
  // Development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
]

export function middleware(request: NextRequest) {
  // Only handle /api/public/* routes for CORS
  if (!request.nextUrl.pathname.startsWith('/api/public')) {
    return NextResponse.next()
  }

  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Website')
    response.headers.set('Access-Control-Max-Age', '86400')

    return response
  }

  // Handle actual requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Website')

  return response
}

export const config = {
  matcher: '/api/public/:path*',
}
