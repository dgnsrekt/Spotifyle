# Spotifyle Modern

A modern rewrite of Spotifyle using Next.js 14, TypeScript, and Prisma.

## Prerequisites

- Node.js 20+ or Bun 1.0+
- PostgreSQL 16+
- pnpm 8+
- Spotify Developer App (for OAuth)

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   - Your Spotify Client ID and Secret from https://developer.spotify.com/dashboard
   - Generate a NextAuth secret: `openssl rand -base64 32`
   - Update DATABASE_URL if using different PostgreSQL credentials

3. **Set up the database**
   ```bash
   # Make sure PostgreSQL is running
   # Then run:
   pnpm db:setup
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at http://localhost:3000

## Project Structure

```
spotifyle-modern/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── database/         # Prisma schema and client
│   ├── ui/              # Shared UI components (coming soon)
│   ├── auth/            # Auth utilities (coming soon)
│   └── spotify/         # Spotify API client (coming soon)
├── scripts/             # Utility scripts
└── turbo.json          # Turborepo configuration
```

## Available Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Run linting
pnpm format       # Format code

# Database
pnpm db:setup     # Initial database setup
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS (+ Shadcn/ui coming soon)
- **Deployment**: Vercel (planned)

## Development Status

See [TODO.md](./TODO.md) for current progress and upcoming tasks.