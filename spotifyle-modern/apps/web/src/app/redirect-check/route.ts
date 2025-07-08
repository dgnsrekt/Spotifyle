import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host')
  
  // If accessing via localhost, redirect to 127.0.0.1
  if (host?.includes('localhost')) {
    const url = new URL(request.url)
    url.hostname = '127.0.0.1'
    return NextResponse.redirect(url.toString())
  }
  
  // Otherwise, redirect to home
  return NextResponse.redirect(new URL('/', request.url))
}