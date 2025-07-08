import { z } from 'zod'

/**
 * Server-side environment variables schema
 * These are validated at build/startup time
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // NextAuth.js
  NEXTAUTH_URL: z.string().url().default('http://127.0.0.1:3000'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // Spotify OAuth
  SPOTIFY_CLIENT_ID: z.string().min(1, 'SPOTIFY_CLIENT_ID is required'),
  SPOTIFY_CLIENT_SECRET: z.string().min(1, 'SPOTIFY_CLIENT_SECRET is required'),
  SPOTIFY_REDIRECT_URI: z.string().url().optional(),
  
  // Optional: External APIs
  GENIUS_CLIENT_TOKEN: z.string().optional(),
  
  // Optional: Analytics & Monitoring
  SENTRY_DSN: z.string().url().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().optional(),
  
  // Optional: Deployment
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  
  // Optional: Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  
  // Optional: Feature flags
  ENABLE_MULTIPLAYER: z.string().transform(val => val === 'true').optional().default('true'),
  ENABLE_LEADERBOARDS: z.string().transform(val => val === 'true').optional().default('true'),
  MAINTENANCE_MODE: z.string().transform(val => val === 'true').optional().default('false'),
})

/**
 * Client-side environment variables schema
 * Only public variables that start with NEXT_PUBLIC_
 */
const clientEnvSchema = z.object({
  // Optional: Public API endpoints
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // Optional: Public analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  
  // Optional: Public feature flags
  NEXT_PUBLIC_ENABLE_PWA: z.string().transform(val => val === 'true').optional(),
  NEXT_PUBLIC_SHOW_DEV_TOOLS: z.string().transform(val => val === 'true').optional(),
})

/**
 * Parse and validate environment variables
 * This runs at build time and throws if validation fails
 */
function parseEnv() {
  // For server-side env vars
  if (typeof window === 'undefined') {
    const parsed = envSchema.safeParse(process.env)
    
    if (!parsed.success) {
      console.error('❌ Invalid environment variables:')
      console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2))
      
      // In development, show helpful error message
      if (process.env.NODE_ENV === 'development') {
        console.error('\n📋 Required environment variables:')
        console.error('DATABASE_URL=postgresql://user:pass@localhost:5432/db')
        console.error('NEXTAUTH_URL=http://127.0.0.1:3000')
        console.error('NEXTAUTH_SECRET=your-secret-at-least-32-chars-long')
        console.error('SPOTIFY_CLIENT_ID=your-spotify-client-id')
        console.error('SPOTIFY_CLIENT_SECRET=your-spotify-client-secret')
        console.error('\n💡 Copy .env.example to .env.local and fill in the values')
      }
      
      throw new Error('Invalid environment variables')
    }
    
    return parsed.data
  }
  
  // For client-side, return empty object (use clientEnv instead)
  return {} as z.infer<typeof envSchema>
}

/**
 * Parse and validate client environment variables
 */
function parseClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
    NEXT_PUBLIC_SHOW_DEV_TOOLS: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS,
  })
  
  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:')
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2))
    throw new Error('Invalid client environment variables')
  }
  
  return parsed.data
}

// Export validated env objects
// Skip validation in test environment to avoid issues with test setup timing
export const env = process.env.NODE_ENV === 'test' 
  ? (process.env as unknown as z.infer<typeof envSchema>) 
  : parseEnv()
export const clientEnv = process.env.NODE_ENV === 'test'
  ? ({} as z.infer<typeof clientEnvSchema>)
  : parseClientEnv()

// Export types
export type Env = z.infer<typeof envSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

// Helper functions
export const isProd = env.NODE_ENV === 'production'
export const isDev = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

/**
 * Get the base URL for the application
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }
  
  return env.NEXTAUTH_URL
}

/**
 * Get Spotify OAuth redirect URI
 */
export function getSpotifyRedirectUri() {
  return env.SPOTIFY_REDIRECT_URI || `${getBaseUrl()}/api/auth/callback/spotify`
}