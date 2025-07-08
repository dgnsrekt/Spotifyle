# Spotifyle Modernization PRD

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

Backend:
  Runtime: Bun or Node.js 20+
  Framework: Hono or Next.js API Routes
  Database: PostgreSQL 16 + Prisma ORM
  Cache: Redis (Upstash for serverless)
  Queue: Inngest or Trigger.dev
  Auth: Lucia Auth v3

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

### Data Models (Prisma Schema)

```prisma
model User {
  id            String   @id @default(cuid())
  spotifyId     String   @unique
  email         String   @unique
  displayName   String
  profileImage  String?
  accessToken   String   @db.Text
  refreshToken  String   @db.Text
  tokenExpiry   DateTime
  
  profile       Profile?
  gamesCreated  Game[]   @relation("Creator")
  gamesPlayed   Player[]
  scores        Score[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Game {
  id            String   @id @default(cuid())
  code          String   @unique @db.VarChar(6)
  type          GameType
  status        GameStatus @default(CREATING)
  maxStages     Int      @default(5)
  maxPlayers    Int?
  
  creator       User     @relation("Creator", fields: [creatorId], references: [id])
  creatorId     String
  
  stages        Stage[]
  players       Player[]
  scores        Score[]
  
  createdAt     DateTime @default(now())
  startedAt     DateTime?
  endedAt       DateTime?
  
  @@index([code])
  @@index([status])
}

enum GameType {
  ARTIST_TRIVIA
  FIND_TRACK_ART
  MULTIPLE_TRACK_LOCKIN
}

model Stage {
  id            String   @id @default(cuid())
  gameId        String
  game          Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  question      Json     // Flexible question data
  choices       Json     // Array of choices
  correctAnswer String
  timeLimit     Int      @default(30) // seconds
  points        Int      @default(100)
  
  order         Int
  
  @@unique([gameId, order])
}
```

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
  - Set up Lucia Auth with session management
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

### Documentation
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
<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "create-prd-structure", "content": "Create PRD structure and executive summary", "status": "completed", "priority": "high"}, {"id": "define-user-stories", "content": "Define user stories and requirements", "status": "completed", "priority": "high"}, {"id": "technical-architecture", "content": "Document technical architecture and migration plan", "status": "completed", "priority": "high"}, {"id": "implementation-roadmap", "content": "Create phased implementation roadmap", "status": "in_progress", "priority": "medium"}, {"id": "success-metrics", "content": "Define success metrics and KPIs", "status": "pending", "priority": "medium"}]