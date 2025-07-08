import { NextRequest, NextResponse } from "next/server"

export default async function middleware(request: NextRequest) {
  // Check if accessing via localhost and redirect to 127.0.0.1
  const host = request.headers.get('host')
  if (host?.includes('localhost')) {
    const url = new URL(request.url)
    url.hostname = '127.0.0.1'
    return NextResponse.redirect(url.toString())
  }
  
  return NextResponse.next()
}

// Optionally, don't invoke Middleware on certain paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}