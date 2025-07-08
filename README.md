# Spotifyle
Spotify Gamification

## Project Structure Overview

```
Spotifyle/
├── api/                    # Django Backend
│   ├── auth_api/          # Authentication & Spotify OAuth
│   ├── game_api/          # Game logic & puzzle management
│   ├── play_api/          # Game playing & scoring
│   ├── profile_api/       # User profiles & statistics
│   ├── assets/            # Spotify data management
│   ├── core/              # Django settings & configuration
│   ├── manage.py          # Django management script
│   ├── pyproject.toml     # Python dependencies (Poetry)
│   └── pytest.ini         # Test configuration
│
├── web/                    # React Frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── pages/         # Route-level components
│   │   ├── screens/       # Game-specific screens
│   │   ├── services/      # API integration layer
│   │   ├── components/    # Reusable UI components
│   │   └── animations/    # Custom CSS animations
│   ├── package.json       # Node dependencies
│   └── yarn.lock          # Dependency lock file
│
├── docker-compose.yml      # Service orchestration
├── Dockerfile.api         # Backend container
├── Dockerfile.web         # Frontend container
├── .env.example           # Environment variables template
└── CLAUDE.md              # AI assistant guidelines
```

### Backend Architecture (Django + Django Ninja)

- **auth_api**: Handles Spotify OAuth flow and JWT authentication
- **game_api**: Core game logic with three puzzle types:
  - Artist Trivia
  - Find Track Art
  - Multiple Track Lock-in
- **play_api**: Manages active game sessions and scoring
- **profile_api**: User profiles and game statistics
- **assets**: Interfaces with Spotify Web API for music data
- **core**: Django project configuration and API routing

### Frontend Architecture (React)

- **pages**: Dashboard, Login, Leaderboard, Game Overview, Profile
- **screens**: Active Game, Game Creation, Puzzle-specific screens
- **services**: Axios-based API client with auth interceptors
- **components**: Shared UI components
- **animations**: Custom CSS animations for game interactions

### Infrastructure

- **PostgreSQL**: Primary database
- **Redis**: Caching and Celery message broker
- **Celery**: Asynchronous task processing for game generation
- **Docker Compose**: Local development environment
- **Nginx**: Production web server (when deployed)
