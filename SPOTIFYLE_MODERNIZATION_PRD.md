# Spotifyle Modernization PRD - Complete

## Executive Summary

Spotifyle is a Spotify-based gamification platform that creates music puzzles and trivia games. This PRD outlines the modernization of the existing Django/React application to a modern, performant, and maintainable architecture using Next.js, TypeScript, and modern web standards.

### Key Objectives
- Migrate from Django/React to a modern TypeScript-based stack
- Improve performance with server-side rendering and edge computing
- Enhance user experience with real-time features and optimistic UI
- Reduce operational complexity and maintenance burden
- Enable rapid feature development with type safety

## Current State Analysis

### Existing Features
1. **Authentication**: Spotify OAuth integration
2. **Game Types**:
   - Artist Trivia: Questions about artists
   - Find Track Art: Match tracks to album artwork
   - Multiple Track Lock-in: Identify tracks from choices
3. **Core Functionality**:
   - Game creation based on user's Spotify data
   - Multiplayer gameplay with scoring
   - Leaderboards and player profiles
   - Asynchronous game generation

### Technical Debt
- Outdated React patterns (class components potential)
- No TypeScript for type safety
- Complex Docker setup for local development
- Separate frontend/backend deployments
- Limited real-time capabilities
- No modern optimization techniques
- JWT stored in localStorage (security risk)
- No token refresh mechanism
- Hardcoded IP addresses in configuration

## User Stories & Requirements

### Player Stories
1. **As a player, I want to**:
   - Sign in with Spotify in one click
   - Create games instantly from my music library
   - Play games with real-time updates
   - See my scores update live on leaderboards
   - Share game links easily with friends
   - Play on any device (mobile-first)

### Creator Stories
2. **As a game creator, I want to**:
   - Generate games quickly from my Spotify data
   - Choose difficulty levels for my games
   - See who's playing my games in real-time
   - Track statistics on my created games

### Technical Requirements

#### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Core Web Vitals in "Good" range
- Offline gameplay capability
- Real-time updates < 100ms latency
- Lighthouse Score > 95 (all categories)

#### Scalability
- Support 10,000+ concurrent players
- Auto-scaling based on demand
- Edge deployment for global users
- Efficient caching strategy

#### Security
- Secure OAuth 2.0 PKCE flow
- API rate limiting
- Input validation and sanitization
- Secure session management
- httpOnly cookies for tokens
- CSRF protection
- Content Security Policy

## Technical Architecture

### Technology Stack

```yaml
Frontend:
  Framework: Next.js 14 (App Router)
  Language: TypeScript 5.3+
  Styling: Tailwind CSS + Shadcn/ui
  State: Zustand + TanStack Query
  Forms: React Hook Form + Zod
  Animation: Framer Motion
  Auth: NextAuth.js v5

Backend:
  Runtime: Bun or Node.js 20+
  Framework: Hono or Next.js API Routes
  Database: PostgreSQL 16 + Prisma ORM
  Cache: Redis (Upstash for serverless)
  Queue: Inngest or Trigger.dev
  WebSocket: Socket.io or native WebSocket

Infrastructure:
  Hosting: Vercel (Frontend) + Railway/Fly.io (Backend)
  CDN: Vercel Edge Network
  Monitoring: Sentry + Vercel Analytics
  CI/CD: GitHub Actions

External Services:
  Music Data: Spotify Web API
  Lyrics/Metadata: Genius API (optional)
  Analytics: PostHog
```

### Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Next.js App    │────▶│  Edge API       │
│  (Vercel)       │     │  (Middleware)   │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐          ┌──────▼──────┐
              │            │          │             │
              │  API       │          │  WebSocket  │
              │  (Hono)    │          │  Server     │
              │            │          │             │
              └─────┬──────┘          └──────┬──────┘
                    │                        │
         ┌──────────┴───────────┬────────────┘
         │                      │
    ┌────▼────┐          ┌──────▼──────┐     ┌─────────┐
    │         │          │             │     │         │
    │  Redis  │          │  PostgreSQL │     │ Spotify │
    │  Cache  │          │  (Prisma)   │     │   API   │
    │         │          │             │     │         │
    └─────────┘          └─────────────┘     └─────────┘
```

## Detailed Feature Specifications

### Authentication Flow
- **Spotify OAuth 2.0 PKCE Implementation**
  ```typescript
  // Detailed flow:
  1. Generate code_verifier and code_challenge
  2. Redirect to Spotify authorize endpoint
  3. Handle callback with authorization code
  4. Exchange code for tokens using PKCE
  5. Refresh token management
  6. Session creation with NextAuth
  ```
- **Token Refresh Strategy**
  - Background refresh 5 minutes before expiry
  - Graceful handling of revoked tokens
  - Queue system for concurrent refresh attempts

### Game Creation Deep Dive
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

### Game Generation Algorithms
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

## API Design & Endpoints

### RESTful API Structure
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

### WebSocket Events
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

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  spotifyId     String?   @unique
  
  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  gamesCreated  Game[]    @relation("Creator")
  gameSessions  GameSession[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  gamesPlayed     Int      @default(0)
  gamesWon        Int      @default(0)
  totalScore      Int      @default(0)
  favoriteArtists Json[]
  favoriteGenres  String[]
  achievements    Achievement[]
  
  settings        Json
  updatedAt       DateTime @updatedAt
}

model Game {
  id          String      @id @default(cuid())
  code        String      @unique @db.VarChar(6)
  type        GameType
  status      GameStatus  @default(CREATING)
  maxStages   Int         @default(5)
  maxPlayers  Int?
  
  creator     User        @relation("Creator", fields: [creatorId], references: [id])
  creatorId   String
  
  stages      Stage[]
  sessions    GameSession[]
  
  createdAt   DateTime    @default(now())
  startedAt   DateTime?
  endedAt     DateTime?
  
  @@index([code])
  @@index([status])
}

model Stage {
  id            String   @id @default(cuid())
  gameId        String
  game          Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  question      Json
  choices       Json
  correctAnswer String
  timeLimit     Int      @default(30)
  points        Int      @default(100)
  order         Int
  
  answers       Answer[]
  
  @@unique([gameId, order])
}

model GameSession {
  id          String    @id @default(cuid())
  gameId      String
  game        Game      @relation(fields: [gameId], references: [id])
  playerId    String
  player      User      @relation(fields: [playerId], references: [id])
  
  answers     Answer[]
  finalScore  Int?
  position    Int?
  
  joinedAt    DateTime  @default(now())
  leftAt      DateTime?
  
  @@unique([gameId, playerId])
}

model Answer {
  id          String      @id @default(cuid())
  sessionId   String
  session     GameSession @relation(fields: [sessionId], references: [id])
  stageId     String
  stage       Stage       @relation(fields: [stageId], references: [id])
  
  answer      String
  isCorrect   Boolean
  timeSpent   Int
  points      Int
  
  answeredAt  DateTime    @default(now())
}

enum GameType {
  ARTIST_TRIVIA
  FIND_TRACK_ART
  MULTIPLE_TRACK_LOCKIN
}

enum GameStatus {
  CREATING
  WAITING
  IN_PROGRESS
  COMPLETED
}
```

## UI/UX Specifications

### Mobile-First Design System
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

### Component Library Structure
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

### Key User Flows
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

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- **Setup & Infrastructure**
  - Initialize Next.js 14 project with TypeScript
  - Configure Tailwind CSS and Shadcn/ui
  - Set up Prisma with PostgreSQL
  - Configure development environment
  - Implement CI/CD pipeline

- **Core Models & Database**
  - Design and implement Prisma schema
  - Create database migrations
  - Set up seed data for development
  - Implement basic CRUD operations

- **Authentication**
  - Implement Spotify OAuth 2.0 PKCE flow
  - Set up NextAuth with session management
  - Create auth middleware and hooks
  - Build login/logout UI components

### Phase 2: Core Features (Weeks 3-5)
- **Game Creation Flow**
  - Spotify data fetching service
  - Game generation algorithms
  - Async job processing with Inngest
  - Progress indicators and error handling

- **Game Types Implementation**
  - Artist Trivia component and logic
  - Find Track Art gameplay
  - Multiple Track Lock-in mechanics
  - Shared game components (timer, score, etc.)

- **Player Experience**
  - Game lobby with real-time updates
  - Responsive game UI for all devices
  - Score calculation and display
  - Game end and results screen

### Phase 3: Social Features (Weeks 6-7)
- **Multiplayer & Real-time**
  - WebSocket integration for live updates
  - Player presence indicators
  - Live leaderboard updates
  - Game state synchronization

- **Profiles & Social**
  - User profile pages
  - Game history and statistics
  - Global and friend leaderboards
  - Share functionality

### Phase 4: Polish & Optimization (Weeks 8-9)
- **Performance**
  - Implement React Server Components
  - Add Suspense boundaries
  - Optimize images and assets
  - Implement caching strategies

- **User Experience**
  - Add animations and transitions
  - Implement Progressive Web App features
  - Error boundaries and fallbacks
  - Accessibility improvements

### Phase 5: Launch Preparation (Week 10)
- **Testing & QA**
  - End-to-end testing with Playwright
  - Load testing and optimization
  - Security audit
  - Bug fixes and polish

- **Deployment**
  - Production environment setup
  - Monitoring and alerting
  - Documentation updates
  - Staged rollout plan

## Performance Optimization

### Caching Strategy
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

### Code Splitting Strategy
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

## Security Enhancements

### API Security
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
```

## Success Metrics & KPIs

### Technical Metrics
- **Performance**
  - Lighthouse Score > 95 (all categories)
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s
  - API response time p95 < 200ms
  - WebSocket latency < 100ms

- **Reliability**
  - 99.9% uptime SLA
  - Error rate < 0.1%
  - Successful game creation rate > 99%
  - Zero data loss incidents

### User Engagement Metrics
- **Adoption**
  - Monthly Active Users (MAU) growth: 20% MoM
  - User retention: 40% day-7 retention
  - Games created per user: 3+ per month
  - Average session duration: 15+ minutes

- **Gameplay**
  - Game completion rate > 80%
  - Multiplayer games: 30%+ of total
  - Average players per multiplayer game: 4+
  - Return player rate: 60%+ weekly

### Business Metrics
- **Cost Efficiency**
  - Infrastructure cost per user < $0.10/month
  - Development velocity: 2x current speed
  - Time to deploy new features: < 1 day
  - Support ticket reduction: 50%

## Migration Strategy

### Data Migration Plan
1. **User Data**
   - Export existing user profiles
   - Map Django User model to new schema
   - Preserve Spotify tokens (re-auth if needed)
   - Maintain user statistics and history

2. **Game Data**
   - Archive historical games
   - Convert game formats to new schema
   - Preserve leaderboards and scores
   - Generate migration reports

### Rollout Strategy
1. **Alpha Phase** (Internal Testing)
   - Deploy to staging environment
   - Internal team testing
   - Performance benchmarking
   - Security testing

2. **Beta Phase** (Limited Release)
   - Invite-only access for power users
   - A/B testing with old platform
   - Gather feedback and iterate
   - Monitor all metrics

3. **General Availability**
   - Gradual rollout (10% → 50% → 100%)
   - Old platform in read-only mode
   - Full migration after 30 days
   - Sunset old platform

## Risk Mitigation

### Technical Risks
- **Spotify API Changes**
  - Mitigation: Abstract API layer, version pinning
- **Scaling Issues**
  - Mitigation: Load testing, auto-scaling, CDN
- **Data Loss**
  - Mitigation: Automated backups, transaction logs

### User Experience Risks
- **Learning Curve**
  - Mitigation: Tutorial system, gradual feature rollout
- **Performance Regression**
  - Mitigation: Extensive testing, rollback plan
- **Feature Parity**
  - Mitigation: Feature mapping, user feedback loops

## Development Guidelines

### Code Standards
```typescript
// Use functional components with TypeScript
export function GameCard({ game, onPlay }: GameCardProps) {
  // Implementation
}

// Consistent error handling
try {
  const data = await fetchSpotifyData(token);
  return { success: true, data };
} catch (error) {
  return { success: false, error: parseError(error) };
}

// Type-safe API routes
export async function POST(request: Request) {
  const body = await request.json();
  const validated = GameSchema.parse(body);
  // Implementation
}
```

### Testing Requirements
- Unit tests for all utilities (Vitest)
- Component tests for UI (Testing Library)
- E2E tests for critical paths (Playwright)
- API integration tests
- Performance tests for key metrics

### Development Workflow
```bash
# Git Branch Strategy
main
├── develop
│   ├── feature/auth-system
│   ├── feature/game-creation
│   └── feature/real-time-play
├── staging
└── production

# Local Development Setup
git clone <repo>
cd spotifyle-modern
cp .env.example .env.local
pnpm install
pnpm db:setup     # Create DB, run migrations, seed
pnpm dev          # Start all services
pnpm test         # Run test suite
```

## Monitoring & Observability

### Metrics to Track
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

## Cost Analysis & Projections

### Infrastructure Costs (Monthly)
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

## Future Enhancements (Post-Launch)

### Phase 6+ Features
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

## Documentation

- API documentation (auto-generated from types)
- Component storybook
- Architecture decision records (ADRs)
- Runbook for common operations

## Conclusion

This modernization plan transforms Spotifyle from a traditional Django/React application into a cutting-edge, type-safe, and performant web application. The phased approach ensures minimal disruption while delivering significant improvements in user experience, developer productivity, and operational efficiency.

### Next Steps
1. Review and approve PRD
2. Set up project repository
3. Begin Phase 1 implementation
4. Establish weekly progress reviews
5. Create feedback channels for beta users

### Success Criteria
The modernization is considered successful when:
- All existing features are migrated with improvements
- Performance metrics meet or exceed targets
- User satisfaction scores increase by 20%+
- Development velocity doubles
- Operating costs reduce by 30%+