# Playwright E2E Tests for Spotify OAuth

This directory contains end-to-end tests specifically designed to debug and test the Spotify OAuth login flow.

## Setup

1. Install dependencies (already done):
   ```bash
   pnpm install
   ```

2. Install Playwright browsers (already done):
   ```bash
   pnpm playwright:install
   ```

## Available Tests

### 1. Basic OAuth Flow Test (`spotify-oauth.spec.ts`)
Tests the basic OAuth flow and captures:
- Network requests and responses
- Console logs and errors
- Screenshots at key points
- OAuth redirect parameters

Run with:
```bash
pnpm test:e2e:oauth
```

### 2. OAuth Debug Test (`oauth-debug.spec.ts`)
Detailed debugging tests that:
- Capture the complete redirect chain
- Test NextAuth provider configuration
- Simulate various error scenarios
- Test OAuth callbacks with different responses

Run with:
```bash
pnpm test:e2e:oauth-debug
```

### 3. Comprehensive OAuth Test (`oauth-comprehensive.spec.ts`)
The most detailed test that:
- Performs step-by-step analysis
- Validates redirect URIs
- Captures all network activity
- Tracks cookies and sessions
- Generates detailed reports

Run with:
```bash
pnpm test:e2e oauth-comprehensive.spec.ts
```

## Running Tests

### Run all tests:
```bash
pnpm test:e2e
```

### Run with UI mode (interactive):
```bash
pnpm test:e2e:ui
```

### Run in debug mode:
```bash
pnpm test:e2e:debug
```

### Run with manual intervention:
```bash
PAUSE_FOR_DEBUG=true pnpm test:e2e oauth-comprehensive.spec.ts
```

### Run with test credentials (optional):
```bash
SPOTIFY_TEST_EMAIL="your-test-email@example.com" \
SPOTIFY_TEST_PASSWORD="your-test-password" \
pnpm test:e2e oauth-comprehensive.spec.ts
```

## Understanding Test Output

The tests will generate:

1. **Console Output**: Detailed logs of the OAuth flow including:
   - Network requests to Spotify and auth endpoints
   - OAuth parameters (client_id, redirect_uri, scopes, etc.)
   - Redirect chain
   - Errors and warnings

2. **Screenshots**: Saved in `tests/e2e/screenshots/`:
   - `1-login-page.png`: Initial login page
   - `2-after-login-click.png`: State after clicking login
   - `3-final-state.png`: Final state (dashboard or error)
   - Additional error-specific screenshots

3. **Test Reports**: 
   - HTML report in `playwright-report/`
   - JSON results in `test-results/results.json`

## Common OAuth Issues to Look For

1. **Redirect URI Mismatch**:
   - Check if the redirect_uri in the OAuth request matches Spotify app settings
   - Verify protocol (http vs https)
   - Check hostname (localhost vs 127.0.0.1)

2. **Missing Environment Variables**:
   - `NEXTAUTH_URL`
   - `AUTH_SPOTIFY_ID` 
   - `AUTH_SPOTIFY_SECRET`

3. **Cookie/Session Issues**:
   - Check if auth cookies are being set properly
   - Verify session persistence after OAuth callback

4. **Network Errors**:
   - Failed requests to Spotify API
   - CORS issues
   - SSL/TLS errors in development

## Debugging Tips

1. **Use Playwright UI Mode**:
   ```bash
   pnpm test:e2e:ui
   ```
   This allows you to step through the test and see exactly what's happening.

2. **Enable Trace Viewer**:
   After a test failure, view the trace:
   ```bash
   pnpm exec playwright show-trace
   ```

3. **Check Network Logs**:
   Look for patterns in the console output:
   - `[REQUEST]` - Outgoing requests
   - `[RESPONSE]` - Response status codes
   - `[OAuth Request]` - OAuth-specific requests
   - `[OAuth Error]` - OAuth-related errors

4. **Manual Testing**:
   Use `PAUSE_FOR_DEBUG=true` to pause the test and manually interact with the browser.

## Next Steps

Based on the test results, common fixes include:

1. Updating redirect URI in Spotify app settings
2. Fixing environment variable configuration
3. Adjusting NextAuth configuration
4. Handling specific OAuth error codes

The comprehensive test output will provide specific guidance on what needs to be fixed.