/**
 * Type declarations for process.env
 * This provides autocomplete for environment variables
 */
declare namespace NodeJS {
  interface ProcessEnv {
    // Required
    NODE_ENV: 'development' | 'test' | 'production'
    DATABASE_URL: string
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    SPOTIFY_CLIENT_ID: string
    SPOTIFY_CLIENT_SECRET: string
    
    // Optional
    SPOTIFY_REDIRECT_URI?: string
    GENIUS_CLIENT_TOKEN?: string
    SENTRY_DSN?: string
    POSTHOG_API_KEY?: string
    POSTHOG_HOST?: string
    VERCEL_URL?: string
    VERCEL_ENV?: 'production' | 'preview' | 'development'
    LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'
    ENABLE_MULTIPLAYER?: string
    ENABLE_LEADERBOARDS?: string
    MAINTENANCE_MODE?: string
    
    // Client-side (public)
    NEXT_PUBLIC_API_URL?: string
    NEXT_PUBLIC_GA_ID?: string
    NEXT_PUBLIC_POSTHOG_KEY?: string
    NEXT_PUBLIC_POSTHOG_HOST?: string
    NEXT_PUBLIC_ENABLE_PWA?: string
    NEXT_PUBLIC_SHOW_DEV_TOOLS?: string
  }
}