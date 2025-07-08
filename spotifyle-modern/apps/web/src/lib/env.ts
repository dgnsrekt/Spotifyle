import { z } from 'zod'

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  AUTH_URL: z.string().url().default('http://127.0.0.1:3000'),
  
  // Spotify OAuth
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  
  // Optional: Additional config
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(error.flatten().fieldErrors)
      throw new Error('Invalid environment variables')
    }
    throw error
  }
}

// Export validated env object
export const env = parseEnv()

// Export type for env object
export type Env = z.infer<typeof envSchema>