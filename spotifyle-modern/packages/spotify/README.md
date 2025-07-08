# @spotifyle/spotify

A comprehensive TypeScript client for the Spotify Web API, designed specifically for the Spotifyle gaming platform.

## Features

- 🔑 **OAuth Token Management** - Automatic token refresh and secure storage
- 🚀 **Rate Limiting** - Built-in rate limiting with exponential backoff
- 📦 **Caching Layer** - Configurable caching to reduce API calls
- 🛡️ **Type Safety** - Full TypeScript support with Zod validation
- 🔄 **Retry Logic** - Automatic retries for failed requests
- 🎮 **Game-Ready** - High-level services optimized for game data collection

## Installation

```bash
pnpm add @spotifyle/spotify
```

## Quick Start

### Basic Setup

```typescript
import { SpotifyClient, MemoryTokenStorage } from '@spotifyle/spotify'

const client = new SpotifyClient(
  {
    clientId: 'your-spotify-client-id',
    clientSecret: 'your-spotify-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['user-read-private', 'user-top-read', 'user-read-recently-played']
  },
  new MemoryTokenStorage()
)
```

### Authentication Flow

```typescript
// 1. Get authorization URL
const authUrl = client.getAuthorizationUrl('optional-state')

// 2. After user authorizes, exchange code for tokens
await client.exchangeCodeForTokens(userId, authorizationCode)

// 3. Make authenticated requests
const profile = await client.getCurrentUser(userId)
```

### User Data Collection

```typescript
import { SpotifyUserDataService } from '@spotifyle/spotify'

const userDataService = new SpotifyUserDataService(client)

// Collect comprehensive game data
const gameData = await userDataService.collectGameData(
  userId,
  (progress) => {
    console.log(`${progress.step}: ${progress.progress}% - ${progress.message}`)
  }
)
```

## API Reference

### SpotifyClient

The main client for interacting with Spotify's Web API.

#### Methods

- `getCurrentUser(userId)` - Get current user's profile
- `getTopArtists(userId, params)` - Get user's top artists
- `getTopTracks(userId, params)` - Get user's top tracks
- `getRecentlyPlayed(userId, params)` - Get recently played tracks
- `search(userId, params)` - Search for tracks, artists, albums, playlists
- `getArtist(userId, artistId)` - Get artist details
- `getArtistTopTracks(userId, artistId)` - Get artist's top tracks
- `getTrack(userId, trackId)` - Get track details
- `getAudioFeatures(userId, trackId)` - Get track's audio features

### SpotifyUserDataService

High-level service for collecting user data optimized for game creation.

#### Methods

- `getUserProfile(userId)` - Get simplified user profile
- `getTopArtists(userId, timeRange, limit)` - Get top artists by time range
- `getTopTracks(userId, timeRange, limit)` - Get top tracks by time range
- `getRecentTracks(userId, limit)` - Get recent listening history
- `getArtistDetails(userId, artistId)` - Get enriched artist information
- `collectGameData(userId, onProgress)` - Collect comprehensive game data
- `validateUserDataForGames(userId)` - Check if user has sufficient data

### Caching

Built-in caching reduces API calls and improves performance.

```typescript
import { SpotifyCacheService, MemoryCacheStorage, CacheTTL } from '@spotifyle/spotify'

const cache = new SpotifyCacheService(
  new MemoryCacheStorage(),
  { ttl: CacheTTL.USER_PROFILE }
)

// Use cache with any async function
const data = await cache.getOrSet(
  'user-profile-123',
  () => client.getCurrentUser(userId),
  CacheTTL.USER_PROFILE
)
```

### Token Storage

Implement the `TokenStorage` interface for persistent token storage:

```typescript
import { TokenStorage } from '@spotifyle/spotify'

class DatabaseTokenStorage implements TokenStorage {
  async get(userId: string) {
    // Retrieve tokens from database
  }
  
  async set(userId: string, tokens: SpotifyTokens) {
    // Store tokens in database
  }
  
  async delete(userId: string) {
    // Remove tokens from database
  }
}
```

## Configuration

### Client Options

```typescript
const client = new SpotifyClient(config, tokenStorage, {
  retries: 3,           // Number of retries for failed requests
  timeout: 10000,       // Request timeout in milliseconds
  rateLimit: true,      // Enable automatic rate limiting
  cache: false,         // Enable response caching
  cacheTtl: 300        // Default cache TTL in seconds
})
```

### Cache TTL Constants

Pre-defined cache durations for different types of data:

- `CacheTTL.USER_PROFILE` - 5 minutes
- `CacheTTL.USER_TOP_ITEMS` - 1 hour
- `CacheTTL.TRACK_INFO` - 24 hours
- `CacheTTL.AUDIO_FEATURES` - 1 week

## Error Handling

The client provides specific error types for different scenarios:

```typescript
import { 
  isSpotifyApiError, 
  isSpotifyAuthError, 
  isSpotifyRateLimitError 
} from '@spotifyle/spotify'

try {
  await client.getCurrentUser(userId)
} catch (error) {
  if (isSpotifyAuthError(error)) {
    // Handle authentication errors (re-auth required)
  } else if (isSpotifyRateLimitError(error)) {
    // Handle rate limiting (wait and retry)
  } else if (isSpotifyApiError(error)) {
    // Handle API errors
  }
}
```

## TypeScript Support

Full TypeScript support with detailed types for all Spotify API responses:

```typescript
import type { 
  SpotifyUser, 
  SpotifyTrack, 
  SpotifyArtist,
  SpotifyGameData 
} from '@spotifyle/spotify'
```

## Rate Limiting

The client automatically handles Spotify's rate limits:

- Monitors `X-RateLimit-*` headers
- Implements exponential backoff for retries
- Queues requests when rate limit is exceeded
- Provides rate limit status via `getRateLimitState()`

## Development

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

### Building

```bash
pnpm build
```

## License

MIT - see LICENSE file for details