import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { TOKEN_KEY } from './constants'

// public routes that don't require auth
const publicRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Get token from cookie
  const session = request.cookies.get(TOKEN_KEY)?.value || ''

  // Check if the path is in public routes
  const isPublicRoute = publicRoutes.includes(path)

  if (!session && !isPublicRoute) {
    const url = new URL('/login', request.url)
    // Add the original path as a "callbackUrl" parameter
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return NextResponse.next()
}

// Configure matcher for middleware
export const config = {
  // Use a more specific matcher that includes all routes you want to protect
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}