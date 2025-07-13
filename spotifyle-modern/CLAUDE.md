# CLAUDE.md - Project Guidelines

## Important: Check TODO.md First!

**Before starting any work, always check the `/spotifyle-modern/TODO.md` file** to understand the current state of the project and what tasks need to be completed.

## Git Workflow Rules

### Git Commit Workflow

**CRITICAL**: After completing each task (when tests pass and functionality works):
1. Stage all changes using `git add`
2. Generate a descriptive commit message based on the changes
3. Present the commit message and code changes for review
4. **STOP AND WAIT** for explicit user approval (e.g., "approved", "looks good", "proceed")
5. The user will review the code, tests, and commit message
6. **ONLY** after explicit approval, create the commit using the reviewed message
7. **NEVER** commit without explicit user approval

**Workflow Summary**:
- Complete one task from TODO.md
- Run all tests and ensure they pass
- Update TODO.md to mark the task as complete
- Stage changes with git (including TODO.md)
- Generate commit message
- Present changes and commit message for review
- **STOP and wait for explicit user approval**
- **DO NOT commit until user explicitly approves**
- Only proceed to next task after user approval

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding tests
- `refactor`: Code refactoring
- `docs`: Documentation
- `style`: Code style changes
- `perf`: Performance improvements
- `chore`: Maintenance tasks

**Example Commit Messages**:
```
feat(auth): implement Spotify OAuth flow with PKCE

- Add OAuth authorization endpoint with code challenge
- Implement token exchange with refresh support
- Include comprehensive error handling
- Add tests for all auth scenarios

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
test(game): add comprehensive game generation tests

- Test all three game types (trivia, track art, lock-in)
- Verify edge cases for insufficient user data
- Add performance benchmarks for generation
- Achieve 95% coverage for game module

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
refactor(api): optimize Spotify API client for better performance

- Implement connection pooling with aiohttp
- Add retry logic with exponential backoff
- Reduce API calls by 40% with smarter caching
- Improve error messages for debugging

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

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

## Task Management

### Task Completion Workflow

1. **Complete the implementation** for the feature/bug fix
2. **Run all tests** to ensure nothing breaks
3. **Run type checking** with `npm run typecheck`
4. **Run linting** with `npm run lint`
5. **Update TODO.md** to mark the completed task or subtask as done
6. **Generate commit message** describing the changes
7. **Present for review** before final commit

### Updating TODO.md

**Important**: Always update TODO.md when completing any task or subtask:
- Mark completed items with ✅ 
- Update progress percentages for parent tasks
- Add completion dates in format `[YYYY-MM-DD]`
- Move completed sections to "Completed" if all subtasks are done
- Include TODO.md updates in the same commit as the implementation

Example:
```markdown
# Before
- [ ] Implement Spotify OAuth with PKCE

# After  
- [x] Implement Spotify OAuth with PKCE ✅ [2024-01-13]
```

## When to Pause for Commits

Pause and notify the user after:
- Completing a major feature
- Fixing a significant bug
- Making structural changes
- Completing items from TODO.md
- Before moving to the next major task

## Documentation Structure

### Project Documentation Files
- `CLAUDE.md` - This file, development guidelines and workflows
- `TODO.md` - Current development tasks and priorities
- `COMMANDS.md` - Common development commands (to be created)
- `DOCKER.md` - Docker and containerization setup (to be created)
- `FEATURES.md` - Feature roadmap and ideas (to be created)

### Creating New Documentation
When adding new documentation:
1. Use clear, descriptive filenames in CAPS (e.g., `DEPLOYMENT.md`)
2. Include a table of contents for files over 100 lines
3. Use consistent markdown formatting
4. Keep technical docs in the project root
5. Update this section when adding new docs

## Notification System

### When to Notify the User

Always notify the user in the following situations:

1. **Task Completion**: When completing any task from TODO.md
2. **Questions**: When you have questions about implementation details or need clarification
3. **Getting Stuck**: When encountering blockers or issues that prevent progress
4. **After Staging Changes**: When changes are staged and ready for commit review
5. **Tool Failures**: When any tool fails or produces unexpected errors
6. **Test Results**: After running the test suite (pass or fail)
7. **Performance Issues**: When build times exceed 30s or tests take >5min
8. **Security Concerns**: When detecting potential security issues

### Notification Format
Since we don't have a notification script yet, use clear message formatting:
```
🔔 NOTIFICATION: [Type]
━━━━━━━━━━━━━━━━━━━━━
[Detailed message]
━━━━━━━━━━━━━━━━━━━━━
```

Example:
```
🔔 NOTIFICATION: Task Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Implemented Spotify OAuth with PKCE
- All tests passing (53/53)
- TypeScript checks clean
- Ready for commit review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

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