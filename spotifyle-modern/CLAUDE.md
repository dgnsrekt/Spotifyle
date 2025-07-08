# CLAUDE.md - Project Guidelines

## Important: Check TODO.md First!

**Before starting any work, always check the `/spotifyle-modern/TODO.md` file** to understand the current state of the project and what tasks need to be completed.

## Git Workflow Rules

1. **NEVER** create commits unless explicitly asked by the user
2. The user will handle all git commits and pushes
3. Always pause between completed tasks to give the user a chance to commit
4. When staging files, provide the commit message but let the user execute the commit

## Testing Requirements

**IMPORTANT: Before considering ANY task complete, you MUST:**

### 1. TypeScript Type Checking
```bash
npx tsc --noEmit
```
- Must pass with zero errors
- Fix all type errors before proceeding

### 2. Linting
```bash
npm run lint
```
- Must pass with zero errors
- Fix all linting issues before proceeding

### 3. API Testing
```bash
npm run test:auth-api
```
- Run automated API tests
- Verify all endpoints return expected responses

### 4. Manual Testing with Curl
Test critical endpoints manually:
```bash
# Test auth signin
curl -v http://127.0.0.1:3000/api/auth/signin

# Test session
curl -v http://127.0.0.1:3000/api/auth/session

# Test other critical endpoints
```

### 5. E2E Testing (when applicable)
```bash
npm run test:e2e
```
- Run Playwright tests for user flows
- Especially important for authentication flows

### 6. Build Verification
```bash
npm run build
```
- Ensure the project builds successfully
- Check for any build-time errors

### 7. Dev Server Testing
- Start the dev server and manually test the feature
- Check browser console for errors
- Verify no hydration errors
- Test the complete user flow

## Additional Testing Tools

### Check for Common Issues:
- **Console Errors**: Open browser DevTools and check for any errors
- **Network Tab**: Verify API calls are successful
- **React DevTools**: Check for unnecessary re-renders
- **Lighthouse**: Run performance audits when adding new features

### Security Checks:
- Verify no secrets are exposed in code
- Check that environment variables are properly used
- Ensure authentication is properly implemented

## Development Best Practices

1. **Always read existing code** before making changes
2. **Follow existing patterns** in the codebase
3. **Use existing libraries** - don't introduce new ones without checking
4. **Test incrementally** - don't wait until the end to test
5. **Handle errors gracefully** - always add error boundaries and try/catch blocks

## When to Pause for Commits

Pause and notify the user after:
- Completing a major feature
- Fixing a significant bug
- Making structural changes
- Completing items from TODO.md
- Before moving to the next major task

## Spotify OAuth Specific Notes

- Spotify requires `127.0.0.1` not `localhost` for redirect URIs
- Always use `http://127.0.0.1:3000` in development
- PKCE is required for OAuth flow
- Test OAuth flow thoroughly as it's critical for the app