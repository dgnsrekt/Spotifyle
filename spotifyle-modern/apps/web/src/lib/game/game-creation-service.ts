/**
 * Game Creation Service
 * Orchestrates the complete game creation process
 */

import type { GameConfig } from '@/lib/schemas/game-config'
import { validateGameConfig } from '@/lib/schemas/game-config'
import { generateGame } from './game-generator'
import { createGame, completeGameGeneration } from './game-db-service'
import { getSession } from '@/lib/auth/auth-service'

export interface GameCreationResult {
  gameId: string
  gameCode: string
  status: 'success' | 'error'
  error?: string
}

/**
 * Create and generate a new game
 */
export async function createAndGenerateGame(
  config: GameConfig
): Promise<GameCreationResult> {
  try {
    // Get current user session
    const session = await getSession()
    if (!session?.user?.id || !session.accessToken) {
      return {
        gameId: '',
        gameCode: '',
        status: 'error',
        error: 'User not authenticated'
      }
    }

    // Validate game configuration
    const validatedConfig = validateGameConfig(config)

    // Create game record in database
    const game = await createGame(validatedConfig, session.user.id)

    try {
      // Generate game content
      const generatedGame = await generateGame(
        validatedConfig,
        session.user.id,
        session.accessToken
      )

      // Save generated content and update status
      await completeGameGeneration(game.id, generatedGame)

      return {
        gameId: game.id,
        gameCode: game.code,
        status: 'success'
      }
    } catch (error) {
      // If generation fails, we should clean up the game record
      // In a real app, we might want to keep it with a FAILED status instead
      console.error('Game generation failed:', error)
      
      return {
        gameId: game.id,
        gameCode: game.code,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate game content'
      }
    }
  } catch (error) {
    console.error('Game creation failed:', error)
    
    return {
      gameId: '',
      gameCode: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to create game'
    }
  }
}

/**
 * Create game with progress tracking
 * This would be used when we implement async job processing
 */
export interface GameCreationProgress {
  stage: 'creating' | 'fetching_data' | 'generating_questions' | 'saving' | 'complete'
  progress: number // 0-100
  message: string
}

export async function createGameWithProgress(
  config: GameConfig,
  onProgress: (progress: GameCreationProgress) => void
): Promise<GameCreationResult> {
  try {
    onProgress({
      stage: 'creating',
      progress: 0,
      message: 'Creating game...'
    })

    // Get current user session
    const session = await getSession()
    if (!session?.user?.id || !session.accessToken) {
      return {
        gameId: '',
        gameCode: '',
        status: 'error',
        error: 'User not authenticated'
      }
    }

    // Validate game configuration
    const validatedConfig = validateGameConfig(config)

    onProgress({
      stage: 'creating',
      progress: 20,
      message: 'Setting up game...'
    })

    // Create game record in database
    const game = await createGame(validatedConfig, session.user.id)

    onProgress({
      stage: 'fetching_data',
      progress: 40,
      message: 'Fetching your Spotify data...'
    })

    try {
      // Generate game content
      const generatedGame = await generateGame(
        validatedConfig,
        session.user.id,
        session.accessToken
      )

      onProgress({
        stage: 'generating_questions',
        progress: 70,
        message: 'Generating questions...'
      })

      // Save generated content
      await completeGameGeneration(game.id, generatedGame)

      onProgress({
        stage: 'saving',
        progress: 90,
        message: 'Saving game...'
      })

      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Game created successfully!'
      })

      return {
        gameId: game.id,
        gameCode: game.code,
        status: 'success'
      }
    } catch (error) {
      console.error('Game generation failed:', error)
      
      return {
        gameId: game.id,
        gameCode: game.code,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate game content'
      }
    }
  } catch (error) {
    console.error('Game creation failed:', error)
    
    return {
      gameId: '',
      gameCode: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to create game'
    }
  }
}

/**
 * Validate if user has enough data to create a game
 */
export async function validateUserCanCreateGame(
  gameType: string
): Promise<{ canCreate: boolean; reason?: string }> {
  const session = await getSession()
  if (!session?.user?.id || !session.accessToken) {
    return {
      canCreate: false,
      reason: 'You must be logged in to create a game'
    }
  }

  // In the future, we could check if the user has enough tracks/artists
  // For now, we'll let the generation process handle this

  return { canCreate: true }
}