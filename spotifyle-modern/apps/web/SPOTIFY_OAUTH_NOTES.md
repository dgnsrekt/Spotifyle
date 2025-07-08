# Spotify OAuth Configuration Notes

## Important: localhost vs 127.0.0.1

As of April 2025, Spotify has updated their redirect URI requirements:

1. **`localhost` is NOT allowed as a redirect URI**
2. **You MUST use explicit IPv4 (`http://127.0.0.1:PORT`) or IPv6 (`http://[::1]:PORT`)**
3. **HTTPS is not required for loopback addresses**

## Configuration

### Spotify App Settings
Your Spotify app must have the following redirect URI configured:
```
http://127.0.0.1:3000/api/auth/callback/spotify
```

### Access the App
Always access the application via:
```
http://127.0.0.1:3000
```

NOT via `http://localhost:3000`

## Known Issues

NextAuth.js v5 (beta) has issues with host handling where it internally uses `localhost` even when configured with `127.0.0.1`. We've implemented the following workarounds:

1. **Middleware redirect** - Automatically redirects any `localhost` access to `127.0.0.1`
2. **Custom auth route handler** - Intercepts and fixes host headers
3. **Explicit redirect_uri** - Forces the correct redirect URI in the Spotify provider config

## Testing

Run the automated tests to verify OAuth is working:
```bash
# API test
pnpm test:auth-api

# Full E2E test
pnpm test:e2e
```

## References

- [Spotify Web API Auth Docs](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [RFC 8252 - OAuth 2.0 for Native Apps](https://tools.ietf.org/html/rfc8252)
- [NextAuth.js Docs](https://authjs.dev/)