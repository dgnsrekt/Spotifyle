# Database Package

This package contains the Prisma schema and database utilities for Spotifyle.

## Setup

1. Ensure PostgreSQL is running:
   ```bash
   pnpm docker:up
   ```

2. Generate Prisma client:
   ```bash
   pnpm db:generate
   ```

3. Push schema to database:
   ```bash
   pnpm db:push
   ```

## Seed Data

The seed script creates realistic test data for development:

### Test User
- **Email**: `test@spotifyle.app`
- **Session Token**: `test-session-token`
- **Purpose**: Use for testing authentication flows

### Generated Data
- **10 Users**: Mix of test user and random users with profiles
- **15 Games**: Various types and statuses
  - Artist Trivia
  - Find Track Art
  - Multiple Track Lock-in
- **Game Sessions**: Players assigned to non-waiting games
- **Answers**: Generated for completed games

### Running Seeds

```bash
# From root directory
pnpm db:seed

# Or from database package
pnpm run db:seed
```

**Note**: This will DELETE all existing data before seeding!

## Development Tools

Visit `/dev` in your browser (development only) to:
- View database statistics
- Access test user credentials
- Browse recent games
- See helpful commands

## Database Commands

```bash
# Open Prisma Studio (GUI)
pnpm db:studio

# Create migration
pnpm db:migrate

# Deploy migrations (production)
pnpm db:migrate:deploy

# Reset database (WARNING: deletes all data)
pnpm db:push --force-reset
```

## Schema Overview

### Core Models
- **User**: Authentication and profile data
- **Profile**: Game statistics and preferences
- **Game**: Game instances with type and status
- **Stage**: Individual questions/challenges in a game
- **GameSession**: Player participation in games
- **Answer**: Player responses to stages

### Game Types
- `ARTIST_TRIVIA`: Questions about artists
- `FIND_TRACK_ART`: Match tracks to album artwork
- `MULTIPLE_TRACK_LOCKIN`: Identify tracks from audio

### Game Status
- `CREATING`: Game being set up
- `WAITING`: Waiting for players
- `IN_PROGRESS`: Game is active
- `COMPLETED`: Game has ended

## Testing

The seed data is designed to support various testing scenarios:

1. **Authentication Testing**: Use test user credentials
2. **Game Flow Testing**: Games in different states
3. **Multiplayer Testing**: Multiple users in games
4. **Score Testing**: Completed games with scores
5. **UI Testing**: Variety of data for all game types

## Tips

- Use Prisma Studio to inspect and modify data visually
- The test user always has an active session
- Game codes are 6 characters (e.g., `ABC123`)
- All users have realistic Spotify-like data
- Timestamps are recent for realistic testing