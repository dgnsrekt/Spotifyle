#!/bin/bash

echo "🚀 Setting up Spotifyle Modern Database"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop or the Docker daemon"
    exit 1
fi

echo "✅ Docker is running"

# Start PostgreSQL with Docker Compose
echo "Starting PostgreSQL with Docker Compose..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
MAX_ATTEMPTS=30
ATTEMPT=0
while ! docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "❌ PostgreSQL failed to start after $MAX_ATTEMPTS attempts"
        exit 1
    fi
    echo "Waiting for PostgreSQL... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 1
done

echo "✅ PostgreSQL is ready"

# Run Prisma migrations
echo "Running Prisma migrations..."
cd packages/database
pnpm prisma migrate dev --name init

echo ""
echo "✅ Database setup complete!"
echo ""
echo "You can now:"
echo "  - Run 'pnpm dev' to start the development server"
echo "  - Run 'pnpm db:studio' to open Prisma Studio"
echo "  - Run 'docker-compose ps' to see running services"
echo "  - Run 'docker-compose down' to stop services"