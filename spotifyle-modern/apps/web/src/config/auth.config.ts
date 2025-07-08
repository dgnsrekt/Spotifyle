import { env } from '@/lib/env'

export const authConfig = {
  spotify: {
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: `${env.AUTH_URL}/api/auth/callback/spotify`,
    scopes: [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative',
    ],
  },
  
  session: {
    cookieName: 'session',
    cookieOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  },
  
  cookies: {
    codeVerifier: {
      name: 'spotify_code_verifier',
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 600, // 10 minutes
      },
    },
    state: {
      name: 'spotify_auth_state',
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 600, // 10 minutes
      },
    },
  },
  
  urls: {
    base: env.AUTH_URL,
    login: '/login',
    dashboard: '/dashboard',
    home: '/',
  },
} as const

export type AuthConfig = typeof authConfig