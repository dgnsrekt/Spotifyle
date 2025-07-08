/**
 * Zod schemas for game configuration
 * Provides runtime validation and type safety for game creation
 */

import { z } from 'zod'

export const GameTypeSchema = z.enum([
  'artist-trivia',
  'find-track-art', 
  'multiple-track-lockin'
])

export const DifficultySchema = z.enum(['easy', 'medium', 'hard'])

export const GameConfigSchema = z.object({
  type: GameTypeSchema,
  name: z.string()
    .min(1, 'Game name is required')
    .max(100, 'Game name must be less than 100 characters')
    .trim(),
  difficulty: DifficultySchema,
  questionCount: z.number()
    .int('Question count must be a whole number')
    .min(1, 'Must have at least 1 question')
    .max(100, 'Cannot have more than 100 questions'),
  timeLimit: z.number()
    .int('Time limit must be a whole number') 
    .min(5, 'Time limit must be at least 5 seconds')
    .max(300, 'Time limit cannot exceed 5 minutes'),
  includeRecentTracks: z.boolean().default(true),
  includeTopArtists: z.boolean().default(true),
  genreFilter: z.array(z.string()).optional(),
  customSettings: z.record(z.unknown()).optional()
})

export const PartialGameConfigSchema = GameConfigSchema.partial()

// Type exports
export type GameType = z.infer<typeof GameTypeSchema>
export type Difficulty = z.infer<typeof DifficultySchema>
export type GameConfig = z.infer<typeof GameConfigSchema>
export type PartialGameConfig = z.infer<typeof PartialGameConfigSchema>

// Configuration constants with validation
export const QUESTION_COUNT_CONFIGS = {
  'artist-trivia': { min: 10, max: 50, default: 20, step: 5 },
  'find-track-art': { min: 8, max: 30, default: 15, step: 2 },
  'multiple-track-lockin': { min: 6, max: 25, default: 12, step: 3 }
} as const

export const TIME_LIMIT_CONFIGS = {
  'artist-trivia': { min: 15, max: 60, default: 30, step: 5 },
  'find-track-art': { min: 20, max: 90, default: 45, step: 5 },
  'multiple-track-lockin': { min: 10, max: 45, default: 20, step: 5 }
} as const

/**
 * Apply default values based on game type
 */
export function applyGameConfigDefaults(
  gameType: GameType,
  partialConfig: PartialGameConfig = {}
): PartialGameConfig {
  const questionConfig = QUESTION_COUNT_CONFIGS[gameType]
  const timeConfig = TIME_LIMIT_CONFIGS[gameType]

  return {
    type: gameType,
    questionCount: questionConfig.default,
    timeLimit: timeConfig.default,
    includeRecentTracks: true,
    includeTopArtists: true,
    ...partialConfig
  }
}

/**
 * Validate and return a complete game configuration
 */
export function validateGameConfig(config: unknown): GameConfig {
  return GameConfigSchema.parse(config)
}

/**
 * Safely parse partial game configuration
 */
export function parsePartialGameConfig(config: unknown): PartialGameConfig | null {
  const result = PartialGameConfigSchema.safeParse(config)
  return result.success ? result.data : null
}

/**
 * Get validation errors for a configuration
 */
export function getGameConfigErrors(config: unknown): string[] {
  const result = GameConfigSchema.safeParse(config)
  if (result.success) return []
  
  return result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  )
}