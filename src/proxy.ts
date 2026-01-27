import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

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

function handleCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Website')

  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight for public API routes
  if (pathname.startsWith('/api/public') && request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    const response = new NextResponse(null, { status: 204 })

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Website')
    response.headers.set('Access-Control-Max-Age', '86400')

    return response
  }

  // Handle CORS for public API routes
  if (pathname.startsWith('/api/public')) {
    const response = NextResponse.next()
    return handleCors(request, response)
  }

  const session = await auth()
  const isLoggedIn = !!session

  const isAuthPage = pathname.startsWith('/anmelden') || pathname.startsWith('/passwort')
  const isDashboard = pathname === '/' || pathname.startsWith('/dashboard')
  const isApi = pathname.startsWith('/api')

  // Allow public API routes (e.g., content fetch)
  if (isApi) {
    // Only protect dashboard API routes
    if (pathname.startsWith('/api/dashboard') && !isLoggedIn) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if (isDashboard && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/anmelden?callbackUrl=${callbackUrl}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/anmelden',
    '/passwort-vergessen',
    '/passwort-zuruecksetzen',
    '/api/dashboard/:path*',
    '/api/public/:path*',
  ],
}
