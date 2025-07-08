/**
 * Game Database Service
 * Handles game persistence and retrieval
 */

import { prisma } from '@spotifyle/database'
import type { Game, GameType as PrismaGameType, Stage, GameSession } from '@spotifyle/database'
import type { GameConfig, GameType } from '@/lib/schemas/game-config'
import type { GeneratedGame, GameStage } from './game-generator'

/**
 * Map our game type to Prisma enum
 */
function mapGameTypeToPrisma(type: GameType): PrismaGameType {
  switch (type) {
    case 'artist-trivia':
      return 'ARTIST_TRIVIA'
    case 'find-track-art':
      return 'FIND_TRACK_ART'
    case 'multiple-track-lockin':
      return 'MULTIPLE_TRACK_LOCKIN'
    default:
      throw new Error(`Unknown game type: ${type}`)
  }
}

/**
 * Generate a unique 6-character game code
 */
function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Create a new game in the database
 */
export async function createGame(
  config: GameConfig,
  creatorId: string
): Promise<Game> {
  // Generate a unique game code
  let code: string
  let isUnique = false
  
  while (!isUnique) {
    code = generateGameCode()
    const existing = await prisma.game.findUnique({ where: { code } })
    if (!existing) {
      isUnique = true
    }
  }

  const game = await prisma.game.create({
    data: {
      code: code!,
      type: mapGameTypeToPrisma(config.type),
      status: 'CREATING',
      maxStages: config.questionCount,
      maxPlayers: config.customSettings?.maxPlayers as number | undefined,
      creatorId
    },
    include: {
      creator: true,
      stages: true
    }
  })

  return game
}

/**
 * Save generated game stages
 */
export async function saveGameStages(
  gameId: string,
  stages: GameStage[]
): Promise<Stage[]> {
  const stageData = stages.map(stage => ({
    gameId,
    question: stage.question,
    choices: stage.choices,
    correctAnswer: stage.correctAnswer,
    timeLimit: stage.timeLimit,
    points: stage.points,
    order: stage.order
  }))

  // Use transaction to ensure all stages are saved together
  const savedStages = await prisma.$transaction(
    stageData.map(data => 
      prisma.stage.create({ data })
    )
  )

  return savedStages
}

/**
 * Update game status
 */
export async function updateGameStatus(
  gameId: string,
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'
): Promise<Game> {
  const updateData: any = { status }
  
  if (status === 'IN_PROGRESS') {
    updateData.startedAt = new Date()
  } else if (status === 'COMPLETED') {
    updateData.endedAt = new Date()
  }

  return prisma.game.update({
    where: { id: gameId },
    data: updateData,
    include: {
      creator: true,
      stages: {
        orderBy: { order: 'asc' }
      }
    }
  })
}

/**
 * Get game by code
 */
export async function getGameByCode(code: string): Promise<Game | null> {
  return prisma.game.findUnique({
    where: { code },
    include: {
      creator: true,
      stages: {
        orderBy: { order: 'asc' }
      },
      sessions: {
        include: {
          player: true
        }
      }
    }
  })
}

/**
 * Get game by ID
 */
export async function getGameById(id: string): Promise<Game | null> {
  return prisma.game.findUnique({
    where: { id },
    include: {
      creator: true,
      stages: {
        orderBy: { order: 'asc' }
      },
      sessions: {
        include: {
          player: true,
          answers: true
        }
      }
    }
  })
}

/**
 * Get user's created games
 */
export async function getUserCreatedGames(
  userId: string,
  limit = 10
): Promise<Game[]> {
  return prisma.game.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      stages: {
        select: { id: true }
      },
      sessions: {
        select: { id: true }
      }
    }
  })
}

/**
 * Get user's played games
 */
export async function getUserPlayedGames(
  userId: string,
  limit = 10
): Promise<GameSession[]> {
  return prisma.gameSession.findMany({
    where: { playerId: userId },
    orderBy: { joinedAt: 'desc' },
    take: limit,
    include: {
      game: {
        include: {
          creator: true
        }
      },
      answers: true
    }
  })
}

/**
 * Join a game
 */
export async function joinGame(
  gameId: string,
  playerId: string
): Promise<GameSession> {
  // Check if player already joined
  const existing = await prisma.gameSession.findUnique({
    where: {
      gameId_playerId: { gameId, playerId }
    }
  })

  if (existing) {
    return existing
  }

  return prisma.gameSession.create({
    data: {
      gameId,
      playerId
    },
    include: {
      game: true,
      player: true
    }
  })
}

/**
 * Complete game creation and generation
 */
export async function completeGameGeneration(
  gameId: string,
  generatedGame: GeneratedGame
): Promise<Game> {
  // Save stages and update game status in a transaction
  const [stages, game] = await prisma.$transaction(async (tx) => {
    // Save stages
    const stageData = generatedGame.stages.map(stage => ({
      gameId,
      question: stage.question,
      choices: stage.choices,
      correctAnswer: stage.correctAnswer,
      timeLimit: stage.timeLimit,
      points: stage.points,
      order: stage.order
    }))

    const savedStages = await Promise.all(
      stageData.map(data => 
        tx.stage.create({ data })
      )
    )

    // Update game status to WAITING
    const updatedGame = await tx.game.update({
      where: { id: gameId },
      data: { status: 'WAITING' },
      include: {
        creator: true,
        stages: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return [savedStages, updatedGame]
  })

  return game
}

/**
 * Delete a game (only by creator)
 */
export async function deleteGame(
  gameId: string,
  userId: string
): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { id: gameId }
  })

  if (!game || game.creatorId !== userId) {
    return false
  }

  await prisma.game.delete({
    where: { id: gameId }
  })

  return true
}