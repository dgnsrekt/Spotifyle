# COMMANDS.md - Common Development Commands

This file contains frequently used commands for the Spotifyle Modern project.

## Table of Contents
- [Development](#development)
- [Testing](#testing)
- [Database](#database)
- [Code Quality](#code-quality)
- [Git Workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

## Development

### Starting the Development Server
```bash
# Start all services (recommended)
pnpm dev

# Start with Turbopack (experimental, faster HMR)
pnpm dev:turbo

# Clean up any hanging dev servers
pnpm dev:clean
```

### Building the Project
```bash
# Build all packages
pnpm build

# Build specific workspace
pnpm --filter web build
pnpm --filter @spotifyle/database build
```

### Package Management
```bash
# Install all dependencies
pnpm install

# Add a dependency to web app
pnpm --filter web add <package-name>

# Add a dev dependency
pnpm --filter web add -D <package-name>

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

## Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug

# Test OAuth flow specifically
pnpm test:e2e:oauth
pnpm test:oauth

# Test auth API endpoints
pnpm test:auth-api
```

### Installing Playwright
```bash
# Install Playwright browsers
pnpm playwright:install
```

## Database

### Prisma Commands
```bash
# Generate Prisma Client
pnpm db:generate

# Push schema changes to database (dev only)
pnpm db:push

# Create and run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Reset database (CAUTION: deletes all data)
pnpm db:reset

# Seed database with test data
pnpm db:seed
```

### Database URLs
```bash
# Development
DATABASE_URL="postgresql://user:password@localhost:5432/spotifyle_dev"

# Test
DATABASE_URL="postgresql://user:password@localhost:5432/spotifyle_test"
```

## Code Quality

### Type Checking
```bash
# Run TypeScript type checking
pnpm typecheck

# Run strict type checking
pnpm typecheck:strict

# Type check specific files
npx tsc --noEmit src/app/page.tsx
```

### Linting
```bash
# Run ESLint
pnpm lint

# Run Biome linter
pnpm lint:biome

# Fix linting issues
pnpm lint:fix

# Run all linters
pnpm lint:all
```

### Formatting
```bash
# Format code with Biome
pnpm format

# Check formatting without fixing
pnpm format:check
```

### Full Quality Check
```bash
# Run all checks (type, lint, test)
pnpm check

# Run all checks including E2E
pnpm check:full
```

## Git Workflow

### Committing Changes
```bash
# Stage all changes
git add .

# Stage specific files
git add src/app/api/auth/

# Check status
git status

# Create commit (after review)
git commit -m "feat(auth): implement Spotify OAuth with PKCE

- Add OAuth authorization endpoint
- Implement token exchange
- Add comprehensive tests

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin <branch-name>
```

### Branch Management
```bash
# Create new feature branch
git checkout -b feat/game-creation

# Switch branches
git checkout main
git checkout claude-branch

# Update branch with main
git pull origin main
git merge main
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill Next.js dev server
pkill -f "next dev"

# Force kill by port
kill -9 $(lsof -t -i:3000)
```

### Clear Caches
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear all build artifacts
pnpm clean
```

### Database Issues
```bash
# Reset database and reseed
pnpm db:reset
pnpm db:seed

# Check PostgreSQL status
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start
```

### Environment Variables
```bash
# Check if env vars are loaded
env | grep SPOTIFY

# Source environment file
source .env.local
```

## Quick Reference

### Most Used Commands
```bash
pnpm dev              # Start development
pnpm test            # Run tests
pnpm typecheck       # Check types
pnpm lint            # Lint code
pnpm db:generate     # Update Prisma client
pnpm build           # Build project
```

### Before Committing Checklist
```bash
pnpm test            # ✓ All tests pass
pnpm typecheck       # ✓ No type errors
pnpm lint            # ✓ No lint errors
pnpm build           # ✓ Builds successfully
```

### Testing Flow
```bash
pnpm test            # Unit tests
pnpm test:e2e        # E2E tests
pnpm test:auth-api   # API tests
curl -v http://127.0.0.1:3000/api/auth/signin  # Manual test
```