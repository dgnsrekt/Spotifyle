/**
 * Tests for Game Database Service
 */

import { prisma } from '@spotifyle/database'
import {
  createGame,
  saveGameStages,
  updateGameStatus,
  getGameByCode,
  getGameById,
  getUserCreatedGames,
  getUserPlayedGames,
  joinGame,
  completeGameGeneration,
  deleteGame
} from '../game-db-service'
import type { GameConfig } from '@/lib/schemas/game-config'
import type { GameStage } from '../game-generator'

// Mock Prisma
jest.mock('@spotifyle/database', () => ({
  prisma: {
    game: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    stage: {
      create: jest.fn()
    },
    gameSession: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    },
    $transaction: jest.fn()
  }
}))

describe('Game Database Service', () => {
  const mockUserId = 'user123'
  const mockGameId = 'game123'
  const mockGameCode = 'ABC123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createGame', () => {
    it('should create a new game with unique code', async () => {
      const config: GameConfig = {
        type: 'artist-trivia',
        name: 'Test Game',
        difficulty: 'medium',
        questionCount: 10,
        timeLimit: 30,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      const mockGame = {
        id: mockGameId,
        code: mockGameCode,
        type: 'ARTIST_TRIVIA',
        status: 'CREATING',
        maxStages: 10,
        creatorId: mockUserId,
        creator: { id: mockUserId, name: 'Test User' },
        stages: []
      }

      ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(null)
      ;(prisma.game.create as jest.Mock).mockResolvedValueOnce(mockGame)

      const result = await createGame(config, mockUserId)

      expect(prisma.game.findUnique).toHaveBeenCalled()
      expect(prisma.game.create).toHaveBeenCalledWith({
        data: {
          code: expect.any(String),
          type: 'ARTIST_TRIVIA',
          status: 'CREATING',
          maxStages: 10,
          maxPlayers: undefined,
          creatorId: mockUserId
        },
        include: {
          creator: true,
          stages: true
        }
      })
      expect(result).toEqual(mockGame)
    })

    it('should retry if code already exists', async () => {
      const config: GameConfig = {
        type: 'artist-trivia',
        name: 'Test Game',
        difficulty: 'medium',
        questionCount: 10,
        timeLimit: 30,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      const existingGame = { id: 'existing', code: 'ABC123' }
      const mockGame = {
        id: mockGameId,
        code: 'DEF456',
        type: 'ARTIST_TRIVIA',
        status: 'CREATING',
        maxStages: 10,
        creatorId: mockUserId,
        creator: { id: mockUserId, name: 'Test User' },
        stages: []
      }

      ;(prisma.game.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingGame) // First code exists
        .mockResolvedValueOnce(null) // Second code is unique
      ;(prisma.game.create as jest.Mock).mockResolvedValueOnce(mockGame)

      const result = await createGame(config, mockUserId)

      expect(prisma.game.findUnique).toHaveBeenCalledTimes(2)
      expect(result.code).not.toBe(existingGame.code)
    })

    it('should map game types correctly', async () => {
      const gameTypes: Array<{ input: GameConfig['type'], expected: string }> = [
        { input: 'artist-trivia', expected: 'ARTIST_TRIVIA' },
        { input: 'find-track-art', expected: 'FIND_TRACK_ART' },
        { input: 'multiple-track-lockin', expected: 'MULTIPLE_TRACK_LOCKIN' }
      ]

      for (const { input, expected } of gameTypes) {
        const config: GameConfig = {
          type: input,
          name: 'Test',
          difficulty: 'medium',
          questionCount: 5,
          timeLimit: 30,
          includeRecentTracks: true,
          includeTopArtists: true
        }

        ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(null)
        ;(prisma.game.create as jest.Mock).mockResolvedValueOnce({
          id: mockGameId,
          code: mockGameCode,
          type: expected
        })

        await createGame(config, mockUserId)

        expect(prisma.game.create).toHaveBeenLastCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              type: expected
            })
          })
        )
      }
    })
  })

  describe('saveGameStages', () => {
    it('should save all stages in transaction', async () => {
      const stages: GameStage[] = [
        {
          question: { text: 'Question 1', type: 'text' },
          choices: [
            { id: '1', text: 'Choice 1' },
            { id: '2', text: 'Choice 2' }
          ],
          correctAnswer: '1',
          timeLimit: 30,
          points: 100,
          order: 1
        },
        {
          question: { text: 'Question 2', type: 'text' },
          choices: [
            { id: '3', text: 'Choice 3' },
            { id: '4', text: 'Choice 4' }
          ],
          correctAnswer: '3',
          timeLimit: 30,
          points: 100,
          order: 2
        }
      ]

      const mockSavedStages = stages.map((s, i) => ({
        id: `stage${i}`,
        gameId: mockGameId,
        ...s
      }))

      ;(prisma.$transaction as jest.Mock).mockImplementationOnce(async (promises) => {
        // The transaction receives an array of prisma.stage.create promises
        // Each promise would create a stage
        return mockSavedStages
      })
      
      // Mock the stage.create to return the promise behavior
      ;(prisma.stage.create as jest.Mock).mockImplementation((data) => 
        Promise.resolve(mockSavedStages[0])
      )

      const result = await saveGameStages(mockGameId, stages)

      expect(prisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.anything(),
          expect.anything()
        ])
      )
      expect(result).toEqual(mockSavedStages)
    })
  })

  describe('updateGameStatus', () => {
    it('should update status to WAITING', async () => {
      const mockUpdatedGame = {
        id: mockGameId,
        status: 'WAITING',
        creator: { id: mockUserId },
        stages: []
      }

      ;(prisma.game.update as jest.Mock).mockResolvedValueOnce(mockUpdatedGame)

      const result = await updateGameStatus(mockGameId, 'WAITING')

      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: mockGameId },
        data: { status: 'WAITING' },
        include: {
          creator: true,
          stages: { orderBy: { order: 'asc' } }
        }
      })
      expect(result).toEqual(mockUpdatedGame)
    })

    it('should set startedAt when status is IN_PROGRESS', async () => {
      const mockUpdatedGame = {
        id: mockGameId,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }

      ;(prisma.game.update as jest.Mock).mockResolvedValueOnce(mockUpdatedGame)

      await updateGameStatus(mockGameId, 'IN_PROGRESS')

      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: mockGameId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: expect.any(Date)
        },
        include: expect.any(Object)
      })
    })

    it('should set endedAt when status is COMPLETED', async () => {
      const mockUpdatedGame = {
        id: mockGameId,
        status: 'COMPLETED',
        endedAt: new Date()
      }

      ;(prisma.game.update as jest.Mock).mockResolvedValueOnce(mockUpdatedGame)

      await updateGameStatus(mockGameId, 'COMPLETED')

      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: mockGameId },
        data: {
          status: 'COMPLETED',
          endedAt: expect.any(Date)
        },
        include: expect.any(Object)
      })
    })
  })

  describe('getGameByCode', () => {
    it('should fetch game with all relations', async () => {
      const mockGame = {
        id: mockGameId,
        code: mockGameCode,
        creator: { id: mockUserId },
        stages: [{ id: 'stage1' }],
        sessions: [{ id: 'session1', player: { id: 'player1' } }]
      }

      ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(mockGame)

      const result = await getGameByCode(mockGameCode)

      expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { code: mockGameCode },
        include: {
          creator: true,
          stages: { orderBy: { order: 'asc' } },
          sessions: { include: { player: true } }
        }
      })
      expect(result).toEqual(mockGame)
    })

    it('should return null if game not found', async () => {
      ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(null)

      const result = await getGameByCode('INVALID')

      expect(result).toBeNull()
    })
  })

  describe('joinGame', () => {
    it('should create new session if not exists', async () => {
      const mockSession = {
        id: 'session123',
        gameId: mockGameId,
        playerId: 'player123',
        game: { id: mockGameId },
        player: { id: 'player123' }
      }

      ;(prisma.gameSession.findUnique as jest.Mock).mockResolvedValueOnce(null)
      ;(prisma.gameSession.create as jest.Mock).mockResolvedValueOnce(mockSession)

      const result = await joinGame(mockGameId, 'player123')

      expect(prisma.gameSession.create).toHaveBeenCalledWith({
        data: {
          gameId: mockGameId,
          playerId: 'player123'
        },
        include: {
          game: true,
          player: true
        }
      })
      expect(result).toEqual(mockSession)
    })

    it('should return existing session if already joined', async () => {
      const mockSession = {
        id: 'session123',
        gameId: mockGameId,
        playerId: 'player123'
      }

      ;(prisma.gameSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession)

      const result = await joinGame(mockGameId, 'player123')

      expect(prisma.gameSession.create).not.toHaveBeenCalled()
      expect(result).toEqual(mockSession)
    })
  })

  describe('completeGameGeneration', () => {
    it('should save stages and update status in transaction', async () => {
      const generatedGame = {
        stages: [
          {
            question: { text: 'Q1', type: 'text' as const },
            choices: [{ id: '1', text: 'C1' }],
            correctAnswer: '1',
            timeLimit: 30,
            points: 100,
            order: 1
          }
        ],
        metadata: {
          totalQuestions: 1,
          totalPoints: 100,
          estimatedDuration: 30
        }
      }

      const mockStages = [{ id: 'stage1' }]
      const mockUpdatedGame = {
        id: mockGameId,
        status: 'WAITING',
        creator: { id: mockUserId },
        stages: mockStages
      }

      ;(prisma.$transaction as jest.Mock).mockImplementationOnce(async (fn) => {
        const tx = {
          stage: { create: jest.fn().mockResolvedValue(mockStages[0]) },
          game: { update: jest.fn().mockResolvedValue(mockUpdatedGame) }
        }
        return fn(tx)
      })

      const result = await completeGameGeneration(mockGameId, generatedGame)

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('deleteGame', () => {
    it('should delete game if user is creator', async () => {
      const mockGame = {
        id: mockGameId,
        creatorId: mockUserId
      }

      ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(mockGame)
      ;(prisma.game.delete as jest.Mock).mockResolvedValueOnce(mockGame)

      const result = await deleteGame(mockGameId, mockUserId)

      expect(prisma.game.delete).toHaveBeenCalledWith({
        where: { id: mockGameId }
      })
      expect(result).toBe(true)
    })

    it('should not delete game if user is not creator', async () => {
      const mockGame = {
        id: mockGameId,
        creatorId: 'otheruser'
      }

      ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(mockGame)

      const result = await deleteGame(mockGameId, mockUserId)

      expect(prisma.game.delete).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should return false if game not found', async () => {
      ;(prisma.game.findUnique as jest.Mock).mockResolvedValueOnce(null)

      const result = await deleteGame(mockGameId, mockUserId)

      expect(prisma.game.delete).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})