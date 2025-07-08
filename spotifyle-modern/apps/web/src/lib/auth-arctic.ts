import { Spotify } from "arctic"
import { cookies } from "next/headers"
import { generateCodeVerifier, generateState } from "arctic"
import { PrismaClient } from "@spotifyle/database"

const prisma = new PrismaClient()

// Initialize Spotify OAuth client
export const spotify = new Spotify(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
  "http://127.0.0.1:3000/api/auth/callback/spotify"
)

// Spotify scopes
const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative"
]

// Create authorization URL
export async function createAuthorizationURL() {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  
  const url = await spotify.createAuthorizationURL(state, codeVerifier, scopes)
  
  // Store state and code verifier in cookies
  const cookieStore = await cookies()
  cookieStore.set("spotify_oauth_state", state, {
    path: "/",
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  })
  
  cookieStore.set("spotify_code_verifier", codeVerifier, {
    path: "/",
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  })
  
  return url.toString()
}

// Handle OAuth callback
export async function handleCallback(code: string, state: string) {
  const cookieStore = await cookies()
  const storedState = cookieStore.get("spotify_oauth_state")?.value
  const codeVerifier = cookieStore.get("spotify_code_verifier")?.value
  
  if (!storedState || !codeVerifier || state !== storedState) {
    throw new Error("Invalid state")
  }
  
  // Exchange code for tokens
  const tokens = await spotify.validateAuthorizationCode(code, codeVerifier)
  
  // Fetch user profile
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }
  
  const spotifyUser = await response.json()
  
  // Create or update user in database
  const user = await prisma.user.upsert({
    where: { email: spotifyUser.email },
    update: {
      name: spotifyUser.display_name,
      image: spotifyUser.images?.[0]?.url,
    },
    create: {
      email: spotifyUser.email,
      name: spotifyUser.display_name,
      image: spotifyUser.images?.[0]?.url,
    }
  })
  
  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      sessionToken: generateSessionToken(),
      accessToken: tokens.accessToken(),
      refreshToken: tokens.refreshToken() || null,
      expiresAt: tokens.accessTokenExpiresAt() ? new Date(tokens.accessTokenExpiresAt()) : null,
    }
  })
  
  // Set session cookie
  cookieStore.set("session", session.sessionToken, {
    path: "/",
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: "lax"
  })
  
  // Clean up OAuth cookies
  cookieStore.delete("spotify_oauth_state")
  cookieStore.delete("spotify_code_verifier")
  
  return { user, session }
}

// Get current session
export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  
  if (!sessionToken) {
    return null
  }
  
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })
  
  if (!session || session.expires < new Date()) {
    return null
  }
  
  return session
}

// Sign out
export async function signOut() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  
  if (sessionToken) {
    await prisma.session.delete({
      where: { sessionToken }
    }).catch(() => {})
  }
  
  cookieStore.delete("session")
}

// Generate session token
function generateSessionToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}