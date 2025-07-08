/**
 * Tests for Game Generator
 */

import { generateGame } from '../game-generator'
import type { GameConfig } from '@/lib/schemas/game-config'
import type { SpotifyArtist, SpotifyTrack } from '@spotifyle/spotify'
import { getUserTopItems } from '@spotifyle/spotify'

// Mock dependencies
jest.mock('@spotifyle/spotify', () => ({
  getUserTopItems: jest.fn()
}))

const mockGetUserTopItems = getUserTopItems as jest.MockedFunction<typeof getUserTopItems>

// Test data
const mockArtists: SpotifyArtist[] = [
  {
    id: 'artist1',
    name: 'Test Artist 1',
    genres: ['rock', 'indie'],
    popularity: 80,
    followers: { total: 1000000 },
    images: [{ url: 'https://example.com/artist1.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/artist1' },
    href: 'https://api.spotify.com/v1/artists/artist1',
    type: 'artist',
    uri: 'spotify:artist:artist1'
  },
  {
    id: 'artist2',
    name: 'Test Artist 2',
    genres: ['pop', 'dance'],
    popularity: 70,
    followers: { total: 500000 },
    images: [{ url: 'https://example.com/artist2.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/artist2' },
    href: 'https://api.spotify.com/v1/artists/artist2',
    type: 'artist',
    uri: 'spotify:artist:artist2'
  },
  {
    id: 'artist3',
    name: 'Test Artist 3',
    genres: ['hip-hop', 'rap'],
    popularity: 90,
    followers: { total: 2000000 },
    images: [{ url: 'https://example.com/artist3.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/artist3' },
    href: 'https://api.spotify.com/v1/artists/artist3',
    type: 'artist',
    uri: 'spotify:artist:artist3'
  },
  {
    id: 'artist4',
    name: 'Test Artist 4',
    genres: ['electronic', 'ambient'],
    popularity: 60,
    followers: { total: 100000 },
    images: [{ url: 'https://example.com/artist4.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/artist4' },
    href: 'https://api.spotify.com/v1/artists/artist4',
    type: 'artist',
    uri: 'spotify:artist:artist4'
  },
  {
    id: 'artist5',
    name: 'Test Artist 5',
    genres: ['jazz', 'soul'],
    popularity: 65,
    followers: { total: 300000 },
    images: [{ url: 'https://example.com/artist5.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/artist5' },
    href: 'https://api.spotify.com/v1/artists/artist5',
    type: 'artist',
    uri: 'spotify:artist:artist5'
  }
]

const mockTracks: SpotifyTrack[] = [
  {
    id: 'track1',
    name: 'Test Track 1',
    artists: [mockArtists[0]],
    album: {
      id: 'album1',
      name: 'Test Album 1',
      images: [{ url: 'https://example.com/album1.jpg', height: 300, width: 300 }],
      release_date: '2023-01-01',
      total_tracks: 10,
      type: 'album',
      uri: 'spotify:album:album1',
      href: 'https://api.spotify.com/v1/albums/album1',
      external_urls: { spotify: 'https://spotify.com/album1' },
      artists: [mockArtists[0]]
    },
    duration_ms: 180000,
    popularity: 75,
    preview_url: 'https://example.com/preview1.mp3',
    track_number: 1,
    type: 'track',
    uri: 'spotify:track:track1',
    external_urls: { spotify: 'https://spotify.com/track1' },
    href: 'https://api.spotify.com/v1/tracks/track1',
    is_local: false,
    explicit: false
  },
  {
    id: 'track2',
    name: 'Test Track 2',
    artists: [mockArtists[1]],
    album: {
      id: 'album2',
      name: 'Test Album 2',
      images: [{ url: 'https://example.com/album2.jpg', height: 300, width: 300 }],
      release_date: '2023-02-01',
      total_tracks: 12,
      type: 'album',
      uri: 'spotify:album:album2',
      href: 'https://api.spotify.com/v1/albums/album2',
      external_urls: { spotify: 'https://spotify.com/album2' },
      artists: [mockArtists[1]]
    },
    duration_ms: 200000,
    popularity: 80,
    preview_url: 'https://example.com/preview2.mp3',
    track_number: 3,
    type: 'track',
    uri: 'spotify:track:track2',
    external_urls: { spotify: 'https://spotify.com/track2' },
    href: 'https://api.spotify.com/v1/tracks/track2',
    is_local: false,
    explicit: false
  },
  {
    id: 'track3',
    name: 'Test Track 3',
    artists: [mockArtists[2]],
    album: {
      id: 'album3',
      name: 'Test Album 3',
      images: [{ url: 'https://example.com/album3.jpg', height: 300, width: 300 }],
      release_date: '2023-03-01',
      total_tracks: 15,
      type: 'album',
      uri: 'spotify:album:album3',
      href: 'https://api.spotify.com/v1/albums/album3',
      external_urls: { spotify: 'https://spotify.com/album3' },
      artists: [mockArtists[2]]
    },
    duration_ms: 240000,
    popularity: 90,
    preview_url: 'https://example.com/preview3.mp3',
    track_number: 5,
    type: 'track',
    uri: 'spotify:track:track3',
    external_urls: { spotify: 'https://spotify.com/track3' },
    href: 'https://api.spotify.com/v1/tracks/track3',
    is_local: false,
    explicit: true
  },
  {
    id: 'track4',
    name: 'Test Track 4',
    artists: [mockArtists[3]],
    album: {
      id: 'album4',
      name: 'Test Album 4',
      images: [{ url: 'https://example.com/album4.jpg', height: 300, width: 300 }],
      release_date: '2023-04-01',
      total_tracks: 8,
      type: 'album',
      uri: 'spotify:album:album4',
      href: 'https://api.spotify.com/v1/albums/album4',
      external_urls: { spotify: 'https://spotify.com/album4' },
      artists: [mockArtists[3]]
    },
    duration_ms: 300000,
    popularity: 65,
    preview_url: 'https://example.com/preview4.mp3',
    track_number: 2,
    type: 'track',
    uri: 'spotify:track:track4',
    external_urls: { spotify: 'https://spotify.com/track4' },
    href: 'https://api.spotify.com/v1/tracks/track4',
    is_local: false,
    explicit: false
  },
  {
    id: 'track5',
    name: 'Test Track 5',
    artists: [mockArtists[4]],
    album: {
      id: 'album5',
      name: 'Test Album 5',
      images: [{ url: 'https://example.com/album5.jpg', height: 300, width: 300 }],
      release_date: '2023-05-01',
      total_tracks: 10,
      type: 'album',
      uri: 'spotify:album:album5',
      href: 'https://api.spotify.com/v1/albums/album5',
      external_urls: { spotify: 'https://spotify.com/album5' },
      artists: [mockArtists[4]]
    },
    duration_ms: 220000,
    popularity: 72,
    preview_url: 'https://example.com/preview5.mp3',
    track_number: 1,
    type: 'track',
    uri: 'spotify:track:track5',
    external_urls: { spotify: 'https://spotify.com/track5' },
    href: 'https://api.spotify.com/v1/tracks/track5',
    is_local: false,
    explicit: false
  }
]

describe('Game Generator', () => {
  const mockUserId = 'user123'
  const mockAccessToken = 'mock-access-token'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateGame', () => {
    it('should generate artist trivia game', async () => {
      const config: GameConfig = {
        type: 'artist-trivia',
        name: 'Test Game',
        difficulty: 'medium',
        questionCount: 5,
        timeLimit: 30,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      mockGetUserTopItems.mockResolvedValueOnce({
        items: mockArtists,
        total: mockArtists.length,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com',
        next: null,
        previous: null
      })

      const result = await generateGame(config, mockUserId, mockAccessToken)

      expect(result.stages).toHaveLength(5)
      expect(result.metadata.totalQuestions).toBe(5)
      expect(result.metadata.estimatedDuration).toBe(150) // 5 * 30

      // Check each stage
      result.stages.forEach((stage, index) => {
        expect(stage.order).toBe(index + 1)
        expect(stage.timeLimit).toBe(30)
        expect(stage.points).toBeGreaterThan(0)
        expect(stage.question.type).toBe('text')
        expect(stage.choices).toHaveLength(4)
        expect(stage.correctAnswer).toBeTruthy()
        
        // Verify correct answer is in choices
        const correctChoice = stage.choices.find(c => c.id === stage.correctAnswer)
        expect(correctChoice).toBeDefined()
      })
    })

    it('should generate find track art game', async () => {
      const config: GameConfig = {
        type: 'find-track-art',
        name: 'Art Game',
        difficulty: 'easy',
        questionCount: 3,
        timeLimit: 45,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      mockGetUserTopItems.mockResolvedValueOnce({
        items: mockTracks,
        total: mockTracks.length,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com',
        next: null,
        previous: null
      })

      const result = await generateGame(config, mockUserId, mockAccessToken)

      expect(result.stages).toHaveLength(3)
      expect(result.metadata.totalQuestions).toBe(3)
      expect(result.metadata.estimatedDuration).toBe(135) // 3 * 45

      result.stages.forEach(stage => {
        expect(stage.question.text).toContain('Which album cover')
        expect(stage.choices).toHaveLength(4)
        expect(stage.choices.every(c => c.imageUrl)).toBe(true)
      })
    })

    it('should generate multiple track lockin game', async () => {
      const config: GameConfig = {
        type: 'multiple-track-lockin',
        name: 'Audio Game',
        difficulty: 'hard',
        questionCount: 4,
        timeLimit: 20,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      mockGetUserTopItems.mockResolvedValueOnce({
        items: mockTracks,
        total: mockTracks.length,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com',
        next: null,
        previous: null
      })

      const result = await generateGame(config, mockUserId, mockAccessToken)

      expect(result.stages).toHaveLength(4)
      expect(result.metadata.totalQuestions).toBe(4)
      expect(result.metadata.estimatedDuration).toBe(80) // 4 * 20

      result.stages.forEach(stage => {
        expect(stage.question.type).toBe('audio')
        expect(stage.question.mediaUrl).toBeTruthy()
        expect(stage.points).toBe(200) // Hard difficulty
      })
    })

    it('should throw error for unknown game type', async () => {
      const config: GameConfig = {
        type: 'unknown-type' as any,
        name: 'Test',
        difficulty: 'medium',
        questionCount: 5,
        timeLimit: 30,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      await expect(generateGame(config, mockUserId, mockAccessToken))
        .rejects.toThrow('Unknown game type')
    })

    it('should throw error when not enough artists', async () => {
      const config: GameConfig = {
        type: 'artist-trivia',
        name: 'Test Game',
        difficulty: 'medium',
        questionCount: 5,
        timeLimit: 30,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      mockGetUserTopItems.mockResolvedValueOnce({
        items: mockArtists.slice(0, 2), // Only 2 artists
        total: 2,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com',
        next: null,
        previous: null
      })

      await expect(generateGame(config, mockUserId, mockAccessToken))
        .rejects.toThrow('Not enough artists to generate trivia questions')
    })

    it('should throw error when no tracks have preview URLs', async () => {
      const config: GameConfig = {
        type: 'multiple-track-lockin',
        name: 'Audio Game',
        difficulty: 'medium',
        questionCount: 2,
        timeLimit: 20,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      const tracksWithoutPreviews = mockTracks.map(t => ({
        ...t,
        preview_url: null
      }))

      mockGetUserTopItems.mockResolvedValueOnce({
        items: tracksWithoutPreviews,
        total: tracksWithoutPreviews.length,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com',
        next: null,
        previous: null
      })

      await expect(generateGame(config, mockUserId, mockAccessToken))
        .rejects.toThrow('Not enough tracks with preview URLs')
    })
  })

  describe('Artist Trivia Generation', () => {
    it('should generate diverse question types', async () => {
      const config: GameConfig = {
        type: 'artist-trivia',
        name: 'Test Game',
        difficulty: 'medium',
        questionCount: 10,
        timeLimit: 30,
        includeRecentTracks: true,
        includeTopArtists: true
      }

      // Mock with many artists to ensure variety
      const manyArtists = [...mockArtists]
      for (let i = 5; i <= 20; i++) {
        manyArtists.push({
          ...mockArtists[0],
          id: `artist${i}`,
          name: `Test Artist ${i}`,
          genres: [`genre${i}`],
          popularity: 50 + i,
          followers: { total: 100000 * i }
        })
      }

      mockGetUserTopItems.mockResolvedValueOnce({
        items: manyArtists,
        total: manyArtists.length,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com',
        next: null,
        previous: null
      })

      const result = await generateGame(config, mockUserId, mockAccessToken)

      // Check for question variety
      const questionTexts = result.stages.map(s => s.question.text)
      const genreQuestions = questionTexts.filter(q => q.includes('known for'))
      const popularityQuestions = questionTexts.filter(q => q.includes('popular'))
      const followerQuestions = questionTexts.filter(q => q.includes('followers'))

      expect(genreQuestions.length).toBeGreaterThan(0)
      expect(popularityQuestions.length).toBeGreaterThan(0)
      expect(followerQuestions.length).toBeGreaterThan(0)
    })

    it('should apply difficulty-based scoring', async () => {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']
      
      for (const difficulty of difficulties) {
        const config: GameConfig = {
          type: 'artist-trivia',
          name: 'Test Game',
          difficulty,
          questionCount: 2,
          timeLimit: 30,
          includeRecentTracks: true,
          includeTopArtists: true
        }

        mockGetUserTopItems.mockResolvedValueOnce({
          items: mockArtists,
          total: mockArtists.length,
          limit: 50,
          offset: 0,
          href: 'https://api.spotify.com',
          next: null,
          previous: null
        })

        const result = await generateGame(config, mockUserId, mockAccessToken)
        
        const avgPoints = result.metadata.totalPoints / result.stages.length
        
        if (difficulty === 'easy') {
          expect(avgPoints).toBeLessThan(100)
        } else if (difficulty === 'medium') {
          expect(avgPoints).toBeGreaterThanOrEqual(100)
          expect(avgPoints).toBeLessThanOrEqual(150)
        } else {
          expect(avgPoints).toBeGreaterThan(150)
        }
      }
    })
  })
})