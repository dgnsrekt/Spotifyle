# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spotifyle is a Spotify-based gamification web application that creates music-related puzzles and trivia games. It uses a microservices architecture with a Django backend (using Django Ninja for API design) and a React frontend.

## Essential Commands

### Backend Development (from `/api` directory)
```bash
# Install dependencies (using Poetry)
poetry install

# Run database migrations
python manage.py migrate

# Start development server
python manage.py runserver

# Run tests
pytest

# Run tests with watch mode
pytest-watch

# Format code
black . && isort .

# Create new Django app
python manage.py startapp <app_name>

# Create migrations after model changes
python manage.py makemigrations
```

### Frontend Development (from `/web` directory)
```bash
# Install dependencies
yarn install

# Start development server (runs on http://localhost:3000)
yarn start

# Build for production
yarn build

# Run tests
yarn test
```

### Docker Development (from root directory)
```bash
# Start all services (API, Workers, DB, Redis)
docker-compose up

# Run with rebuild
docker-compose up --build

# Stop all services
docker-compose down
```

## Architecture Overview

### Backend Structure (`/api`)
The Django backend is organized into focused apps:

1. **auth_api**: Handles Spotify OAuth and JWT authentication
   - Manages Spotify OAuth flow
   - Issues and validates JWT tokens
   - User authentication endpoints

2. **game_api**: Core game logic
   - Game creation and management
   - Three puzzle types:
     - Artist Trivia: Questions about artists
     - Find Track Art: Match tracks to album art
     - Multiple Track Lock-in: Identify tracks from multiple choices
   - Stage and choice management

3. **play_api**: Game playing functionality
   - Active game sessions
   - Score tracking
   - Game state management

4. **profile_api**: User profile management
   - Profile data and statistics
   - User preferences

5. **assets**: Spotify asset management
   - Caches and manages Spotify data (tracks, artists, albums)
   - Interfaces with Spotify Web API

6. **core**: Django project configuration
   - Settings, URLs, WSGI/ASGI configuration
   - API router setup with Django Ninja

### Frontend Structure (`/web`)
React SPA with component-based architecture:

- **src/pages**: Route-level components (Dashboard, Login, Leaderboard, etc.)
- **src/screens**: Game-specific screens for different puzzle types
- **src/services**: API integration layer with Axios
- **src/animations**: Custom CSS animations
- **src/components**: Reusable UI components

### API Design Pattern
Uses Django Ninja (FastAPI-style) for type-safe API endpoints:
- Request/response schemas with Pydantic-style validation
- Automatic OpenAPI documentation
- JWT authentication decorator pattern
- RESTful endpoint structure

### Game Flow Architecture
1. User authenticates via Spotify OAuth
2. Backend fetches user's Spotify data (artists, tracks)
3. Game creation uses Celery tasks for async processing
4. Three distinct puzzle types with different mechanics
5. Real-time scoring and leaderboard updates

### External Integrations
- **Spotify Web API**: Primary data source for music content
- **Genius API**: Additional metadata for enhanced game content

## Environment Variables

Required environment variables (set in `.env` files):

```bash
# Django
DJANGO_SECRET=<secret_key>
DEBUG=True/False

# JWT
JWT_SECRET=<jwt_secret>
JWT_ALGORITHM=HS256

# Spotify OAuth
SPOTIFY_CLIENT=<client_id>
SPOTIFY_SECRET=<client_secret>
SPOTIFY_REDIRECT=http://localhost:3000/callback

# Database
POSTGRES_USER=<username>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=spotifyle
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Celery/Redis
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# External APIs
GENIUS_CLIENT_TOKEN=<genius_api_token>
```

## Key Development Patterns

### Backend API Endpoints
- Follow Django Ninja patterns with typed request/response schemas
- Use `@auth_required` decorator for protected endpoints
- Async tasks for heavy processing go through Celery

### Frontend Service Layer
- All API calls go through service modules in `src/services/`
- Axios interceptors handle authentication headers
- Consistent error handling patterns

### Database Models
- Django ORM with PostgreSQL
- Use Django's built-in User model extended with profiles
- Proper foreign key relationships and indexes

### Testing Approach
- Backend: pytest with Django integration
- Frontend: Jest via Create React App
- Test files follow Django convention (`tests.py` in each app)

## Deployment
- Currently deployed to DigitalOcean droplet (134.122.30.228)
- Uses Docker Compose for service orchestration
- Certbot integration for SSL certificates