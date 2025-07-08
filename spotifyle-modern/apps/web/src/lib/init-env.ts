/**
 * Environment validation initialization
 * Import this at the top of next.config.js to validate env vars at build time
 */

// Skip validation in test environment
if (process.env.NODE_ENV === 'test') {
  console.log('🧪 Skipping environment validation in test environment')
  // Export early to avoid loading env.ts
  module.exports = { env: process.env }
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require('./env')

  // This will throw if env vars are invalid
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL', 
    'NEXTAUTH_SECRET',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET'
  ] as const

  console.log('🔍 Validating environment variables...')

  // Check each required var
  for (const varName of requiredVars) {
    if (!env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`)
      process.exit(1)
    }
  }

  console.log('✅ Environment variables validated successfully')

  // Log configuration in development
  if (env.NODE_ENV === 'development') {
    console.log('\n📋 Configuration:')
    console.log(`- Node Environment: ${env.NODE_ENV}`)
    console.log(`- NextAuth URL: ${env.NEXTAUTH_URL}`)
    console.log(`- Database: ${env.DATABASE_URL.split('@')[1]}`) // Hide credentials
    console.log(`- Spotify Client ID: ${env.SPOTIFY_CLIENT_ID.substring(0, 8)}...`)
    console.log(`- Feature Flags:`)
    console.log(`  - Multiplayer: ${env.ENABLE_MULTIPLAYER}`)
    console.log(`  - Leaderboards: ${env.ENABLE_LEADERBOARDS}`)
    console.log(`  - Maintenance: ${env.MAINTENANCE_MODE}`)
    console.log()
  }

  module.exports = { env }
}