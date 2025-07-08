import { SpotifyClient } from '../spotify-client'
import { OAuthError } from '@/types/auth'
import type { SpotifyUser } from '@/types/spotify'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('SpotifyClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('fetchUserProfile', () => {
    const mockUser: SpotifyUser = {
      id: 'test-user-id',
      display_name: 'Test User',
      email: 'test@example.com',
      images: [{ url: 'https://example.com/image.jpg', height: 300, width: 300 }],
    }

    it('should fetch user profile successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response)

      const result = await SpotifyClient.fetchUserProfile('test-token')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
      )
      expect(result).toEqual(mockUser)
    })

    it('should throw OAuthError on non-200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_token',
          error_description: 'The access token expired',
        }),
      } as Response)

      // Verify the error is thrown with correct message and code
      let thrownError: OAuthError | undefined
      try {
        await SpotifyClient.fetchUserProfile('expired-token')
      } catch (error) {
        thrownError = error as OAuthError
      }
      
      expect(thrownError).toBeDefined()
      expect(thrownError).toBeInstanceOf(OAuthError)
      expect(thrownError?.message).toBe('The access token expired')
      expect(thrownError?.code).toBe('invalid_token')
    })

    it('should handle timeout', async () => {
      // Mock a fetch that will be aborted
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      await expect(
        SpotifyClient.fetchUserProfile('test-token')
      ).rejects.toMatchObject({
        message: 'Spotify API request timed out',
        code: 'TIMEOUT',
      })
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        SpotifyClient.fetchUserProfile('test-token')
      ).rejects.toThrow(OAuthError)

      await expect(
        SpotifyClient.fetchUserProfile('test-token')
      ).rejects.toMatchObject({
        message: 'Failed to fetch user profile',
        code: 'UNKNOWN_ERROR',
      })
    })

    it('should handle missing error description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'server_error',
        }),
      } as Response)

      await expect(
        SpotifyClient.fetchUserProfile('test-token')
      ).rejects.toMatchObject({
        message: 'Failed to fetch user profile',
        code: 'server_error',
      })
    })
  })

  describe('refreshAccessToken', () => {
    it('should throw not implemented error', async () => {
      await expect(
        SpotifyClient.refreshAccessToken('client-id', 'client-secret', 'refresh-token')
      ).rejects.toThrow('Not implemented yet')
    })
  })
})