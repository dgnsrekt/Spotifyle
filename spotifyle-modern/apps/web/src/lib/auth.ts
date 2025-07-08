import NextAuth from "next-auth"
import Spotify from "next-auth/providers/spotify"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@spotifyle/database"

const prisma = new PrismaClient()

// Spotify scopes we need
const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative"
].join(" ")

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add access token to session for API calls
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string
      }
      
      // Add user id to session
      if (token?.sub) {
        session.user.id = token.sub
      }
      
      return session
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      
      // Add Spotify ID if available
      if (profile?.id) {
        token.spotifyId = profile.id
      }
      
      // TODO: Implement token refresh logic here
      
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  session: {
    strategy: "jwt",
  },
})