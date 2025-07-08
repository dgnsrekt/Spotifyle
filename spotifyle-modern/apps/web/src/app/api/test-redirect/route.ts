import { NextResponse } from "next/server"

export async function GET() {
  // Test what NextAuth sees as the base URL
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL
  const redirectUri = new URL("/api/auth/callback/spotify", authUrl || "http://127.0.0.1:3000")
  
  // Create a test authorization URL like Spotify would
  const authorizationUrl = new URL("https://accounts.spotify.com/authorize")
  authorizationUrl.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID || "")
  authorizationUrl.searchParams.set("redirect_uri", redirectUri.toString())
  authorizationUrl.searchParams.set("response_type", "code")
  authorizationUrl.searchParams.set("scope", "user-read-email")
  
  return NextResponse.json({
    environment: {
      AUTH_URL: process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    computed: {
      redirectUri: redirectUri.toString(),
      authorizationUrl: authorizationUrl.toString(),
    },
    spotifyAppRequirements: {
      mustMatch: "http://127.0.0.1:3000/api/auth/callback/spotify",
      currentlyGenerating: redirectUri.toString(),
      matches: redirectUri.toString() === "http://127.0.0.1:3000/api/auth/callback/spotify"
    }
  })
}