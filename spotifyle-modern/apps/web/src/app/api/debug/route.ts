import { NextResponse } from "next/server"

export async function GET() {
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL
  const actualUrl = new URL("/api/auth/callback/spotify", authUrl || "http://127.0.0.1:3000")
  
  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    constructedCallbackUrl: actualUrl.toString(),
    headers: {
      host: process.env.VERCEL_URL || "not set",
    }
  })
}