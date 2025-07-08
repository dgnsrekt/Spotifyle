# Authentication Implementation

## Overview

We've replaced NextAuth.js v5 (which had issues with localhost vs 127.0.0.1) with a custom implementation using Arctic - a lightweight OAuth library.

## How It Works

1. **Login Flow**:
   - User clicks "Continue with Spotify" → redirects to `/api/auth/signin`
   - Server creates OAuth authorization URL with PKCE
   - User authorizes on Spotify
   - Spotify redirects to `/api/auth/callback/spotify`
   - Server exchanges code for tokens
   - Server creates session and sets cookie
   - User is redirected to dashboard

2. **Session Management**:
   - Sessions stored in database with tokens
   - Session cookie used for authentication
   - Middleware protects routes

## Key Files

- `/src/lib/auth-arctic.ts` - Core auth logic
- `/src/app/api/auth/signin/route.ts` - Initiates OAuth flow
- `/src/app/api/auth/callback/spotify/route.ts` - Handles OAuth callback
- `/src/app/api/auth/signout/route.ts` - Handles logout
- `/src/middleware.ts` - Route protection

## Benefits

1. **Full control** over the OAuth flow
2. **No issues** with localhost vs 127.0.0.1
3. **Simpler** implementation
4. **Better error handling**
5. **Direct token access** for Spotify API calls

## Usage

```typescript
// Get current session (server component)
import { getSession } from "@/lib/auth-arctic"

const session = await getSession()
if (session) {
  // User is logged in
  // Access token: session.accessToken
}

// Sign out
await signOut()
```

## Security Notes

- PKCE is used for OAuth flow
- Sessions expire after 30 days
- Tokens stored securely in database
- HTTP-only cookies for session management