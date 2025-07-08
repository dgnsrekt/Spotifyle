# Spotifyle Modernization PRD - Expanded Version

## Areas for Improvement & Additional Details

### 1. Detailed Feature Specifications

#### Authentication Flow (Missing Details)
- **Spotify OAuth 2.0 PKCE Implementation**
  ```typescript
  // Detailed flow:
  1. Generate code_verifier and code_challenge
  2. Redirect to Spotify authorize endpoint
  3. Handle callback with authorization code
  4. Exchange code for tokens using PKCE
  5. Refresh token management
  6. Session creation with Lucia Auth
  ```
- **Token Refresh Strategy**
  - Background refresh 5 minutes before expiry
  - Graceful handling of revoked tokens
  - Queue system for concurrent refresh attempts

#### Game Creation Deep Dive
- **Spotify Data Requirements**
  ```typescript
  interface SpotifyDataRequirements {
    minTracks: 50,
    minArtists: 20,
    minPlaylistsFollowed: 5,
    recentlyPlayed: 20, // last 50 tracks
    topItems: {
      artists: 10,
      tracks: 20,
      timeRanges: ['short_term', 'medium_term', 'long_term']
    }
  }
  ```
  
- **Game Generation Algorithm Details**
  ```typescript
  // Artist Trivia Generation
  1. Fetch user's top artists (3 time ranges)
  2. Get related artists for diversity
  3. Fetch artist details (genres, popularity, images)
  4. Generate questions:
     - "Which genre is {artist} known for?"
     - "When did {artist} release {album}?"
     - "Which artist collaborated with {artist} on {track}?"
  5. Create distractors from similar artists
  
  // Find Track Art Generation
  1. Select tracks from different albums
  2. Ensure visual distinction between album arts
  3. Preload images for performance
  4. Generate difficulty based on:
     - Album popularity
     - Visual similarity score
     - User's listening history
  ```

### 2. API Design & Endpoints

#### RESTful API Structure
```typescript
// Authentication
POST   /api/auth/spotify/authorize
GET    /api/auth/spotify/callback
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/session

// Games
GET    /api/games                 // List games (paginated)
POST   /api/games                 // Create new game
GET    /api/games/:code           // Get game details
DELETE /api/games/:code           // Delete game
GET    /api/games/:code/stages    // Get all stages
POST   /api/games/:code/start     // Start game

// Playing
POST   /api/play/:code/join       // Join game
POST   /api/play/:code/answer     // Submit answer
GET    /api/play/:code/state      // Get current state
POST   /api/play/:code/leave      // Leave game

// Profiles
GET    /api/users/:id             // Get user profile
PATCH  /api/users/:id             // Update profile
GET    /api/users/:id/games       // User's created games
GET    /api/users/:id/history     // Game history

// Leaderboards
GET    /api/leaderboards/global   // Global leaderboard
GET    /api/leaderboards/friends  // Friends leaderboard
GET    /api/leaderboards/game/:code // Game-specific
```

#### WebSocket Events
```typescript
// Client -> Server
interface ClientEvents {
  'game:join': { gameCode: string, userId: string }
  'game:answer': { stageId: string, answer: string }
  'game:ready': { gameCode: string }
  'player:typing': { gameCode: string }
}

// Server -> Client
interface ServerEvents {
  'game:playerJoined': { player: Player }
  'game:playerLeft': { playerId: string }
  'game:started': { firstStage: Stage }
  'game:stageComplete': { results: StageResults, nextStage?: Stage }
  'game:ended': { finalResults: GameResults }
  'game:error': { message: string, code: string }
  'player:update': { playerId: string, score: number }
}
```

### 3. UI/UX Specifications

#### Mobile-First Design System
```css
/* Breakpoints */
--mobile: 0-639px
--tablet: 640px-1023px  
--desktop: 1024px+

/* Touch targets */
--min-touch-target: 44px
--button-padding: 12px 24px
--card-spacing: 16px

/* Animation timings */
--instant: 100ms
--fast: 200ms
--normal: 300ms
--slow: 500ms
```

#### Component Library Structure
```
components/
├── ui/                    # Base components
│   ├── Button/
│   ├── Card/
│   ├── Modal/
│   └── Toast/
├── game/                  # Game-specific
│   ├── GameCard/
│   ├── PlayerList/
│   ├── Timer/
│   └── ScoreBoard/
├── spotify/               # Spotify-related
│   ├── TrackCard/
│   ├── ArtistBadge/
│   └── AlbumArt/
└── layout/               # Layout components
    ├── Header/
    ├── Navigation/
    └── Footer/
```

#### Key User Flows (Detailed)
1. **First-Time User Flow**
   - Landing page with value proposition
   - "Login with Spotify" CTA
   - OAuth flow with permissions explanation
   - Welcome screen with tutorial option
   - Dashboard with suggested actions

2. **Game Creation Flow**
   - Select game type (with previews)
   - Configure options (difficulty, stages, time)
   - Preview generated questions
   - Share options (link, QR code, social)
   - Real-time player join notifications

3. **Gameplay Flow**
   - Lobby with countdown
   - Question presentation with timer
   - Answer feedback (correct/incorrect)
   - Live score updates
   - Between-stage leaderboard
   - Final results with share options

### 4. Database Schema Expansions

```prisma
// Additional models needed

model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  gamesPlayed     Int      @default(0)
  gamesWon        Int      @default(0)
  totalScore      Int      @default(0)
  favoriteArtists Json[]   // Cached from Spotify
  favoriteGenres  String[]
  achievements    Achievement[]
  
  settings        Json     // User preferences
  
  updatedAt       DateTime @updatedAt
}

model Achievement {
  id          String   @id @default(cuid())
  type        String   // "games_played", "perfect_score", etc.
  name        String
  description String
  iconUrl     String
  
  profiles    Profile[]
  
  createdAt   DateTime @default(now())
}

model GameSession {
  id          String   @id @default(cuid())
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id])
  
  playerId    String
  player      User     @relation(fields: [playerId], references: [id])
  
  answers     Answer[]
  finalScore  Int?
  position    Int?     // Final ranking
  
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
}

model Answer {
  id          String      @id @default(cuid())
  sessionId   String
  session     GameSession @relation(fields: [sessionId], references: [id])
  
  stageId     String
  stage       Stage       @relation(fields: [stageId], references: [id])
  
  answer      String
  isCorrect   Boolean
  timeSpent   Int         // milliseconds
  points      Int
  
  answeredAt  DateTime    @default(now())
}
```

### 5. Performance Optimization Details

#### Caching Strategy
```typescript
// Multi-layer caching
1. Browser Cache
   - Static assets: 1 year
   - API responses: varies by endpoint
   - Service Worker for offline

2. CDN Cache (Vercel Edge)
   - Static pages: 1 hour
   - API responses: 5 minutes
   - User-specific: no cache

3. Redis Cache
   - Session data: 24 hours
   - Game state: duration of game
   - Leaderboards: 1 minute
   - Spotify data: 1 hour

4. Database Query Cache
   - Prepared statements
   - Connection pooling
   - Read replicas for scaling
```

#### Code Splitting Strategy
```typescript
// Route-based splitting
app/
├── (auth)/login/page.tsx        // ~50KB
├── (game)/create/page.tsx       // ~80KB
├── (game)/play/[code]/page.tsx  // ~120KB
├── dashboard/page.tsx           // ~60KB
└── leaderboard/page.tsx         // ~40KB

// Component lazy loading
const GameCanvas = lazy(() => import('./GameCanvas'))
const SpotifyPlayer = lazy(() => import('./SpotifyPlayer'))
const ShareModal = lazy(() => import('./ShareModal'))
```

### 6. Security Enhancements

#### API Security
```typescript
// Rate limiting tiers
const rateLimits = {
  public: { window: '1m', max: 30 },
  authenticated: { window: '1m', max: 100 },
  gameCreation: { window: '1h', max: 10 },
  spotifyApi: { window: '1m', max: 60 }
}

// Input validation schemas
const gameCreationSchema = z.object({
  type: z.enum(['ARTIST_TRIVIA', 'FIND_TRACK_ART', 'MULTIPLE_TRACK_LOCKIN']),
  maxStages: z.number().min(3).max(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isPublic: z.boolean()
})

// CSRF protection
// Content Security Policy
// SQL injection prevention via Prisma
// XSS protection via React
```

### 7. Monitoring & Observability

#### Metrics to Track
```yaml
Application Metrics:
  - Request rate by endpoint
  - Response time percentiles
  - Error rate by type
  - Database query performance
  - WebSocket connection count
  - Cache hit rates

Business Metrics:
  - Games created per hour
  - Active players
  - Game completion rate
  - Feature adoption rate
  - User engagement score

Infrastructure Metrics:
  - CPU/Memory usage
  - Database connections
  - Redis memory usage
  - CDN bandwidth
  - Cost per user
```

### 8. Development Workflow Details

#### Git Branch Strategy
```bash
main
├── develop
│   ├── feature/auth-system
│   ├── feature/game-creation
│   └── feature/real-time-play
├── staging
└── production

# Commit conventions
feat: Add Spotify PKCE authentication
fix: Resolve WebSocket reconnection issue
perf: Optimize image loading in game
docs: Update API documentation
test: Add integration tests for game flow
```

#### Local Development Setup
```bash
# Prerequisites
- Node.js 20+ or Bun 1.0+
- PostgreSQL 16+
- Redis 7+
- pnpm 8+

# Setup commands
git clone <repo>
cd spotifyle-modern
cp .env.example .env.local
pnpm install
pnpm db:setup     # Create DB, run migrations, seed
pnpm dev          # Start all services
pnpm test         # Run test suite
```

### 9. Cost Analysis & Projections

#### Infrastructure Costs (Monthly)
```yaml
Vercel:
  - Pro plan: $20
  - Bandwidth: ~$50 (10TB)
  - Functions: ~$30

Database (Railway/Supabase):
  - PostgreSQL: $20
  - Backups: $5

Redis (Upstash):
  - Requests: ~$10
  - Storage: ~$5

Monitoring:
  - Sentry: $26
  - PostHog: $0 (free tier)

Total: ~$166/month for 10K MAU
Cost per user: ~$0.017
```

### 10. Future Enhancements (Post-Launch)

#### Phase 6+ Features
1. **AI-Powered Features**
   - Custom question generation with GPT
   - Difficulty auto-adjustment
   - Personalized game recommendations

2. **Social Features**
   - Friend system
   - Private leagues
   - Chat during games
   - Tournaments

3. **Monetization**
   - Premium features (unlimited games)
   - Custom branded games
   - Ad-supported free tier

4. **Platform Expansion**
   - iOS/Android apps (React Native)
   - Apple Music integration
   - YouTube Music support
   - Custom music uploads