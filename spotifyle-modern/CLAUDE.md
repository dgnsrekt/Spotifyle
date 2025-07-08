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

### 1. Unit Tests - MANDATORY
```bash
npm test
```
- **ALL TESTS MUST PASS** - No exceptions
- If tests fail, fix them before proceeding
- Never skip or disable failing tests
- Current requirement: 53/53 tests passing

### 2. TypeScript Type Checking
```bash
npx tsc --noEmit
```
- Must pass with zero errors
- Fix all type errors before proceeding

### 3. Linting
```bash
npm run lint
```
- Must pass with zero errors
- Fix all linting issues before proceeding

### 4. API Testing
```bash
npm run test:auth-api
```
- Run automated API tests
- Verify all endpoints return expected responses

### 5. Manual Testing with Curl
Test critical endpoints manually:
```bash
# Test auth signin
curl -v http://127.0.0.1:3000/api/auth/signin

# Test session
curl -v http://127.0.0.1:3000/api/auth/session

# Test other critical endpoints
```

### 6. E2E Testing (when applicable)
```bash
npm run test:e2e
```
- Run Playwright tests for user flows
- Especially important for authentication flows

### 7. Build Verification
```bash
npm run build
```
- Ensure the project builds successfully
- Check for any build-time errors

### 8. Dev Server Testing
- Start the dev server and manually test the feature
- Check browser console for errors
- Verify no hydration errors
- Test the complete user flow

### 9. Visual Testing with Playwright MCP
```bash
# Use Playwright MCP to visually verify the UI
mcp__playwright__browser_navigate
mcp__playwright__browser_take_screenshot
```
- Navigate to key pages (/, /login, /dashboard)
- Take screenshots to verify UI styling and layout
- Check for visual regressions
- Verify dark mode is applied correctly
- Ensure Tailwind CSS and Shadcn/ui components render properly
- Test responsive layouts at different viewport sizes

### 10. Clean Up Development Server
```bash
# IMPORTANT: Always kill the dev server when done testing
pkill -f "next dev"
```
- Kill any running Next.js dev servers to free up ports
- This prevents "address already in use" errors in future sessions
- Always clean up background processes before marking task complete

### 11. Reflect and Improve
Before marking any task complete, take a moment to consider:

**Code Quality Improvements:**
- Could any code be refactored for better readability or performance?
- Are there any magic numbers or strings that should be constants?
- Is there duplicated code that could be extracted into a utility function?
- Are error messages clear and helpful?

**Test Coverage Enhancements:**
- Are there edge cases not covered by existing tests?
- Could integration tests be added to verify component interactions?
- Should there be tests for error scenarios and unhappy paths?
- Would snapshot tests help catch UI regressions?

**Documentation Updates:**
- Does the code have adequate inline comments for complex logic?
- Should any new patterns or conventions be documented in CLAUDE.md?
- Are there any gotchas or setup steps that future developers should know?
- Could the TODO.md be updated with discovered technical debt?

**Development Process Improvements:**
- Were there any pain points in this task that could be automated?
- Should any new scripts be added to package.json for common tasks?
- Could the CLAUDE.md workflow be optimized based on this experience?
- Are there any tools or extensions that would make development easier?

**Security and Performance:**
- Are all user inputs properly validated and sanitized?
- Are there any potential performance bottlenecks?
- Could any API calls be cached or debounced?
- Are sensitive data and tokens properly secured?

**Future-Proofing:**
- Is the implementation flexible enough for future requirements?
- Are there any upcoming Next.js or library updates to prepare for?
- Could the architecture be improved to handle scale?
- Are there any accessibility improvements that could be made?

Take action on at least one improvement before proceeding, even if small. Continuous improvement makes the codebase more maintainable and robust over time.

## Test Standards

1. **Write tests for all new code** - No code without tests
2. **Fix failing tests immediately** - Don't accumulate test debt
3. **Test edge cases** - Not just happy paths
4. **Keep tests simple and focused** - One test, one assertion
5. **Use descriptive test names** - Should explain what and why

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

## Known Issues & Gotchas

### Tailwind CSS Version Compatibility
- **Issue**: Tailwind CSS v4 uses new import syntax (`@import "tailwindcss"`) that requires `@tailwindcss/postcss`
- **Solution**: Use Tailwind CSS v3 with traditional directives (`@tailwind base/components/utilities`)
- **Note**: When upgrading to v4, update both PostCSS config and CSS imports

### ESM Module Compatibility
- **Issue**: Some modules like `arctic` use ESM exports that Jest doesn't handle by default
- **Solution**: Mock the module in tests or update Jest config with `transformIgnorePatterns`
- **Note**: Consider using vitest for better ESM support in the future