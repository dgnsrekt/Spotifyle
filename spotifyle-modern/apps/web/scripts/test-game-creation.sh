#!/bin/bash

# Test game creation via Inngest
# This script sends a POST request to create a new game

echo "🎮 Testing Spotifyle Game Creation with Inngest"
echo "============================================="
echo ""

# First, let's test if the server is running
echo "1. Checking if server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|404"; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: npm run dev"
    exit 1
fi

echo ""
echo "2. Creating a new game..."
echo ""

# Create game with Artist Trivia
echo "Creating Artist Trivia game:"
curl -X POST http://127.0.0.1:3000/api/game/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session={\"user\":{\"id\":\"test-user-123\",\"email\":\"test@example.com\"},\"expiresAt\":\"2025-01-01T00:00:00.000Z\"}" \
  -d '{
    "gameType": "artist_trivia",
    "options": {
      "artistCount": 10,
      "trackCount": 20,
      "difficulty": "medium"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "============================================="
echo ""

# Alternative game types you can test:

echo "Other game types you can test:"
echo ""
echo "Find Track Art:"
echo 'curl -X POST http://127.0.0.1:3000/api/game/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session={\"user\":{\"id\":\"test-user-123\",\"email\":\"test@example.com\"},\"expiresAt\":\"2025-01-01T00:00:00.000Z\"}" \
  -d '\''{"gameType": "find_track_art", "options": {"difficulty": "easy"}}'\'''

echo ""
echo "Multiple Track Lock-in:"
echo 'curl -X POST http://127.0.0.1:3000/api/game/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session={\"user\":{\"id\":\"test-user-123\",\"email\":\"test@example.com\"},\"expiresAt\":\"2025-01-01T00:00:00.000Z\"}" \
  -d '\''{"gameType": "multiple_track_lockin", "options": {"difficulty": "hard"}}'\'''

echo ""
echo "============================================="
echo ""
echo "📝 Notes:"
echo "- The session cookie is mocked for testing"
echo "- In production, you'd get a real session from /api/auth/signin"
echo "- Check game status: GET /api/game/{gameId}/status"
echo "- View Inngest Dev UI: http://127.0.0.1:3000/api/inngest"