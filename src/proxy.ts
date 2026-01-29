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

// Auth pages (public for unauthenticated users)
const AUTH_ROUTES = [
  '/anmelden',
  '/passwort-vergessen',
  '/passwort-zuruecksetzen',
]

// Public API prefixes (no auth required)
const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/public',
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

  // Check authentication
  const session = await auth()
  const isAuthenticated = !!session

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isApiRoute = pathname.startsWith('/api/')

  // Allow public API routes (auth and public)
  if (isPublicApi) {
    return NextResponse.next()
  }

  // Protected API routes - return 401 if not authenticated
  if (isApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: 'Nicht autorisiert' },
      { status: 401 }
    )
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow auth pages for unauthenticated users
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login (for all dashboard pages)
  if (!isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/anmelden?callbackUrl=${callbackUrl}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
