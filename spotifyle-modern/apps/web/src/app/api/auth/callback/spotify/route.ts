import { handleCallback } from "@/lib/auth-arctic"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  
  // Always use 127.0.0.1 for redirects
  const baseUrl = "http://127.0.0.1:3000"
  
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${error}`)
  }
  
  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/login?error=MissingParams`)
  }
  
  try {
    await handleCallback(code, state)
    return NextResponse.redirect(`${baseUrl}/dashboard`)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(`${baseUrl}/login?error=CallbackError`)
  }
}