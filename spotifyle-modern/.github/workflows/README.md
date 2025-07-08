# GitHub Actions Workflows

This directory contains our CI/CD pipeline configurations using GitHub Actions.

## Workflows

### 🔄 CI (Continuous Integration)
**File**: `ci.yml`  
**Triggers**: Push to main/develop, Pull requests  
**Purpose**: Runs all quality checks on code changes

**Jobs**:
- **Lint**: Checks code style and formatting
- **Type Check**: Validates TypeScript types
- **Unit Tests**: Runs tests across Node.js versions (18, 20, 22)
- **Build**: Builds the application and uploads artifacts
- **E2E Tests**: Runs Playwright end-to-end tests
- **Security Scan**: Audits dependencies and runs CodeQL analysis
- **Deploy Preview**: Deploys PR previews to Vercel

### 🚀 Deploy to Production
**File**: `deploy.yml`  
**Triggers**: Push to main branch, Manual dispatch  
**Purpose**: Deploys application to production environment

**Steps**:
1. Build application with production environment variables
2. Deploy to Vercel production
3. Run database migrations
4. Create GitHub deployment record
5. Send Slack notification

### 🔍 Dependency Review
**File**: `dependency-review.yml`  
**Triggers**: PRs that modify dependencies  
**Purpose**: Reviews dependency changes for security and size

**Checks**:
- Security vulnerability scanning
- License compliance (via FOSSA)
- Bundle size impact analysis

### 📦 Release
**File**: `release.yml`  
**Triggers**: Version tags (v*), Manual dispatch  
**Purpose**: Creates releases with changelogs

**Process**:
1. Generate changelog from commits
2. Create GitHub release
3. Trigger production deployment
4. Notify team via Slack

### 🔧 Maintenance
**File**: `maintenance.yml`  
**Triggers**: Weekly (Mondays 9 AM UTC), Manual dispatch  
**Purpose**: Automated maintenance tasks

**Tasks**:
- Update dependencies and create PR
- Clean up old artifacts (>30 days)
- Database backup reminders
- Weekly maintenance notifications

## Required Secrets

Add these secrets to your GitHub repository:

### Deployment
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `DATABASE_URL`: Production database connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret for production
- `SPOTIFY_CLIENT_ID`: Spotify OAuth client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify OAuth client secret

### Optional
- `TURBO_TOKEN`: Turborepo remote cache token
- `CODECOV_TOKEN`: Code coverage reporting
- `SLACK_WEBHOOK`: Slack notifications
- `FOSSA_API_KEY`: License compliance checking
- `PAT_TOKEN`: Personal access token for creating PRs

## Environment Variables

Add these as repository variables:
- `TURBO_TEAM`: Turborepo team name

## Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/spotifyle-modern/workflows/CI/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/spotifyle-modern/workflows/Deploy%20to%20Production/badge.svg)
![Maintenance](https://github.com/YOUR_USERNAME/spotifyle-modern/workflows/Maintenance/badge.svg)
```

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Test CI workflow
act -j lint

# Test with secrets
act -j deploy --secret-file .env.secrets
```

## Best Practices

1. **Cache Dependencies**: We cache pnpm dependencies for faster builds
2. **Matrix Testing**: Test across multiple Node.js versions
3. **Artifact Upload**: Build artifacts are saved for debugging
4. **Conditional Jobs**: Production deployments only on main branch
5. **Security First**: Dependency scanning on every PR
6. **Automated Updates**: Weekly dependency updates with testing

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **E2E Test Failures**: Review Playwright report artifacts
3. **Deploy Failures**: Verify all secrets are set correctly
4. **Permission Errors**: Ensure GITHUB_TOKEN has required permissions

### Debugging

Enable debug logging:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## Contributing

When adding new workflows:
1. Test locally with `act` first
2. Use reusable workflows where possible
3. Document all required secrets
4. Add status badge to README
5. Follow naming conventions (kebab-case)