#!/bin/bash

echo "🚀 Setting up Spotifyle Modern Database"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL first:"
    echo "  - macOS: brew services start postgresql"
    echo "  - Linux: sudo systemctl start postgresql"
    echo "  - Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "Creating database 'spotifyle_modern' if it doesn't exist..."
createdb -h localhost -U postgres spotifyle_modern 2>/dev/null || echo "Database might already exist, continuing..."

# Run Prisma migrations
echo "Running Prisma migrations..."
cd packages/database
pnpm prisma migrate dev --name init

echo ""
echo "✅ Database setup complete!"
echo ""
echo "You can now:"
echo "  - Run 'pnpm dev' to start the development server"
echo "  - Run 'pnpm db:studio' in packages/database to open Prisma Studio"