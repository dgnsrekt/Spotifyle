/**
 * Tests for Game Creation Service
 */

// Mock auth service before importing anything that uses it
jest.mock('@/lib/auth/auth-service', () => ({
  AuthService: {
    getSession: jest.fn()
  }
}))

// Mock dependencies
jest.mock('../game-generator')
jest.mock('../game-db-service')
jest.mock('../spotify-data-fetcher')
jest.mock('@/lib/schemas/game-config', () => ({
  ...jest.requireActual('@/lib/schemas/game-config'),
  validateGameConfig: jest.fn(config => config)
}))

import { createAndGenerateGame, createGameWithProgress, validateUserCanCreateGame } from '../game-creation-service'
import { generateGame } from '../game-generator'
import { createGame, completeGameGeneration } from '../game-db-service'
import { AuthService } from '@/lib/auth/auth-service'
import { validateGameConfig } from '@/lib/schemas/game-config'
import type { GameConfig } from '@/lib/schemas/game-config'

const mockGenerateGame = generateGame as jest.MockedFunction<typeof generateGame>
const mockCreateGame = createGame as jest.MockedFunction<typeof createGame>
const mockCompleteGameGeneration = completeGameGeneration as jest.MockedFunction<typeof completeGameGeneration>
const mockGetSession = AuthService.getSession as jest.MockedFunction<typeof AuthService.getSession>
const mockValidateGameConfig = validateGameConfig as jest.MockedFunction<typeof validateGameConfig>

describe('Game Creation Service', () => {
  const mockConfig: GameConfig = {
    type: 'artist-trivia',
    name: 'Test Game',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 30,
    includeRecentTracks: true,
    includeTopArtists: true
  }

  const mockSession = {
    user: { id: 'user123', name: 'Test User', email: 'test@example.com' },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }

  const mockGame = {
    id: 'game123',
    code: 'ABC123',
    type: 'ARTIST_TRIVIA' as const,
    status: 'CREATING' as const,
    maxStages: 10,
    creatorId: 'user123',
    creator: { id: 'user123', name: 'Test User' },
    stages: [],
    sessions: [],
    createdAt: new Date(),
    startedAt: null,
    endedAt: null,
    maxPlayers: null
  }

  const mockGeneratedGame = {
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createAndGenerateGame', () => {
    it('should successfully create and generate a game', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockValidateGameConfig.mockReturnValueOnce(mockConfig)
      mockCreateGame.mockResolvedValueOnce(mockGame)
      mockGenerateGame.mockResolvedValueOnce(mockGeneratedGame)
      mockCompleteGameGeneration.mockResolvedValueOnce({
        ...mockGame,
        status: 'WAITING'
      })

      const result = await createAndGenerateGame(mockConfig)

      expect(result).toEqual({
        gameId: 'game123',
        gameCode: 'ABC123',
        status: 'success'
      })

      expect(mockGetSession).toHaveBeenCalled()
      expect(mockValidateGameConfig).toHaveBeenCalledWith(mockConfig)
      expect(mockCreateGame).toHaveBeenCalledWith(mockConfig, 'user123')
      expect(mockGenerateGame).toHaveBeenCalledWith(
        mockConfig,
        'user123',
        'mock-access-token'
      )
      expect(mockCompleteGameGeneration).toHaveBeenCalledWith('game123', mockGeneratedGame)
    })

    it('should return error if user not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce(null)

      const result = await createAndGenerateGame(mockConfig)

      expect(result).toEqual({
        gameId: '',
        gameCode: '',
        status: 'error',
        error: 'User not authenticated'
      })

      expect(mockCreateGame).not.toHaveBeenCalled()
      expect(mockGenerateGame).not.toHaveBeenCalled()
    })

    it('should return error if session missing access token', async () => {
      mockGetSession.mockResolvedValueOnce({
        ...mockSession,
        accessToken: null
      })

      const result = await createAndGenerateGame(mockConfig)

      expect(result).toEqual({
        gameId: '',
        gameCode: '',
        status: 'error',
        error: 'User not authenticated'
      })
    })

    it('should handle validation errors', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockValidateGameConfig.mockImplementationOnce(() => {
        throw new Error('Invalid game configuration')
      })

      const result = await createAndGenerateGame(mockConfig)

      expect(result).toEqual({
        gameId: '',
        gameCode: '',
        status: 'error',
        error: 'Invalid game configuration'
      })
    })

    it('should handle game creation errors', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockValidateGameConfig.mockReturnValueOnce(mockConfig)
      mockCreateGame.mockRejectedValueOnce(new Error('Database error'))

      const result = await createAndGenerateGame(mockConfig)

      expect(result).toEqual({
        gameId: '',
        gameCode: '',
        status: 'error',
        error: 'Database error'
      })
    })

    it('should handle game generation errors', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockValidateGameConfig.mockReturnValueOnce(mockConfig)
      mockCreateGame.mockResolvedValueOnce(mockGame)
      mockGenerateGame.mockRejectedValueOnce(new Error('Not enough data'))

      const result = await createAndGenerateGame(mockConfig)

      expect(result).toEqual({
        gameId: 'game123',
        gameCode: 'ABC123',
        status: 'error',
        error: 'Not enough data'
      })

      // Should not call completeGameGeneration if generation fails
      expect(mockCompleteGameGeneration).not.toHaveBeenCalled()
    })
  })

  describe('createGameWithProgress', () => {
    it('should create game with progress updates', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockValidateGameConfig.mockReturnValueOnce(mockConfig)
      mockCreateGame.mockResolvedValueOnce(mockGame)
      mockGenerateGame.mockResolvedValueOnce(mockGeneratedGame)
      mockCompleteGameGeneration.mockResolvedValueOnce({
        ...mockGame,
        status: 'WAITING'
      })

      const progressUpdates: any[] = []
      const onProgress = jest.fn((progress) => {
        progressUpdates.push(progress)
      })

      const result = await createGameWithProgress(mockConfig, onProgress)

      expect(result).toEqual({
        gameId: 'game123',
        gameCode: 'ABC123',
        status: 'success'
      })

      // Verify progress updates
      expect(onProgress).toHaveBeenCalledTimes(6)
      expect(progressUpdates[0]).toMatchObject({
        stage: 'creating',
        progress: 0,
        message: 'Creating game...'
      })
      expect(progressUpdates[1]).toMatchObject({
        stage: 'creating',
        progress: 20,
        message: 'Setting up game...'
      })
      expect(progressUpdates[2]).toMatchObject({
        stage: 'fetching_data',
        progress: 40,
        message: 'Fetching your Spotify data...'
      })
      expect(progressUpdates[3]).toMatchObject({
        stage: 'generating_questions',
        progress: 70,
        message: 'Generating questions...'
      })
      expect(progressUpdates[4]).toMatchObject({
        stage: 'saving',
        progress: 90,
        message: 'Saving game...'
      })
      expect(progressUpdates[5]).toMatchObject({
        stage: 'complete',
        progress: 100,
        message: 'Game created successfully!'
      })
    })

    it('should handle errors with progress', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockValidateGameConfig.mockReturnValueOnce(mockConfig)
      mockCreateGame.mockResolvedValueOnce(mockGame)
      mockGenerateGame.mockRejectedValueOnce(new Error('Generation failed'))

      const onProgress = jest.fn()

      const result = await createGameWithProgress(mockConfig, onProgress)

      expect(result).toEqual({
        gameId: 'game123',
        gameCode: 'ABC123',
        status: 'error',
        error: 'Generation failed'
      })

      // Should have made some progress before failing
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'fetching_data',
          progress: 40
        })
      )
    })
  })

  describe('validateUserCanCreateGame', () => {
    it('should allow authenticated user to create game', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)

      const result = await validateUserCanCreateGame('artist-trivia')

      expect(result).toEqual({
        canCreate: true
      })
    })

    it('should not allow unauthenticated user', async () => {
      mockGetSession.mockResolvedValueOnce(null)

      const result = await validateUserCanCreateGame('artist-trivia')

      expect(result).toEqual({
        canCreate: false,
        reason: 'You must be logged in to create a game'
      })
    })

    it('should not allow user without access token', async () => {
      mockGetSession.mockResolvedValueOnce({
        ...mockSession,
        accessToken: null
      })

      const result = await validateUserCanCreateGame('artist-trivia')

      expect(result).toEqual({
        canCreate: false,
        reason: 'You must be logged in to create a game'
      })
    })
  })
})