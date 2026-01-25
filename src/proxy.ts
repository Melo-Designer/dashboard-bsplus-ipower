import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isLoggedIn = !!session

  const { pathname } = request.nextUrl
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
  ],
}
