import { test, expect, Page, ConsoleMessage, Request, Response } from '@playwright/test';

// Types for tracking
interface NetworkLog {
  method: string;
  url: string;
  status?: number;
  headers?: Record<string, string>;
  postData?: string;
  responseBody?: string;
  error?: string;
  timing: {
    start: number;
    end?: number;
    duration?: number;
  };
}

interface ConsoleLog {
  type: string;
  text: string;
  location?: string;
  timestamp: number;
}

// Helper to collect network logs
async function setupNetworkLogging(page: Page) {
  const networkLogs: NetworkLog[] = [];
  
  // Log all requests
  page.on('request', (request: Request) => {
    const log: NetworkLog = {
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      postData: request.postData() || undefined,
      timing: {
        start: Date.now(),
      },
    };
    
    // Only log OAuth-related requests
    if (
      request.url().includes('spotify') ||
      request.url().includes('auth') ||
      request.url().includes('api.spotify.com') ||
      request.url().includes('accounts.spotify.com') ||
      request.url().includes('/api/auth/')
    ) {
      networkLogs.push(log);
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });
  
  // Log all responses
  page.on('response', async (response: Response) => {
    const request = response.request();
    const matchingLog = networkLogs.find(
      log => log.url === request.url() && log.method === request.method() && !log.status
    );
    
    if (matchingLog) {
      matchingLog.status = response.status();
      matchingLog.timing.end = Date.now();
      matchingLog.timing.duration = matchingLog.timing.end - matchingLog.timing.start;
      
      // Try to get response body for error responses
      if (response.status() >= 400) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json') || contentType.includes('text')) {
            matchingLog.responseBody = await response.text();
          }
        } catch (e) {
          matchingLog.responseBody = `Could not read response body: ${e}`;
        }
      }
      
      console.log(`[RESPONSE] ${response.status()} ${response.url()} (${matchingLog.timing.duration}ms)`);
    }
  });
  
  // Log failed requests
  page.on('requestfailed', (request: Request) => {
    const failure = request.failure();
    console.error(`[REQUEST FAILED] ${request.method()} ${request.url()}: ${failure?.errorText}`);
    
    const matchingLog = networkLogs.find(
      log => log.url === request.url() && log.method === request.method() && !log.status
    );
    
    if (matchingLog) {
      matchingLog.error = failure?.errorText;
      matchingLog.timing.end = Date.now();
      matchingLog.timing.duration = matchingLog.timing.end - matchingLog.timing.start;
    }
  });
  
  return networkLogs;
}

// Helper to collect console logs
function setupConsoleLogging(page: Page) {
  const consoleLogs: ConsoleLog[] = [];
  
  page.on('console', (msg: ConsoleMessage) => {
    const log: ConsoleLog = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : undefined,
      timestamp: Date.now(),
    };
    
    consoleLogs.push(log);
    
    // Log to test console with appropriate level
    const prefix = `[BROWSER ${msg.type().toUpperCase()}]`;
    if (msg.type() === 'error') {
      console.error(`${prefix} ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      console.warn(`${prefix} ${msg.text()}`);
    } else {
      console.log(`${prefix} ${msg.text()}`);
    }
  });
  
  return consoleLogs;
}

test.describe('Spotify OAuth Flow', () => {
  test('should complete OAuth login flow', async ({ page, context }) => {
    // Setup logging
    const networkLogs = await setupNetworkLogging(page);
    const consoleLogs = setupConsoleLogging(page);
    
    // Enable detailed error logging
    page.on('pageerror', error => {
      console.error('[PAGE ERROR]', error.message);
      console.error(error.stack);
    });
    
    // Start test
    console.log('Starting OAuth flow test...');
    
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Spotifyle/);
    
    // Check for login button
    const loginButton = page.locator('button:has-text("Continue with Spotify")');
    await expect(loginButton).toBeVisible();
    
    // Set up promise to wait for OAuth redirect
    const oauthPromise = page.waitForRequest(request => 
      request.url().includes('accounts.spotify.com/authorize') ||
      request.url().includes('/api/auth/signin/spotify')
    );
    
    // Click login button
    console.log('Clicking login button...');
    await loginButton.click();
    
    // Wait for OAuth redirect
    try {
      const oauthRequest = await oauthPromise;
      console.log('OAuth request initiated:', oauthRequest.url());
      
      // Log OAuth parameters
      const url = new URL(oauthRequest.url());
      console.log('OAuth parameters:');
      url.searchParams.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // Check if we're redirected to Spotify
      if (oauthRequest.url().includes('accounts.spotify.com')) {
        console.log('Redirected to Spotify login page');
        
        // Wait for Spotify page to load
        await page.waitForLoadState('domcontentloaded');
        
        // Log current URL
        console.log('Current URL:', page.url());
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: 'tests/e2e/screenshots/spotify-login-page.png',
          fullPage: true 
        });
      }
    } catch (error) {
      console.error('OAuth redirect failed:', error);
      
      // Take screenshot on error
      await page.screenshot({ 
        path: 'tests/e2e/screenshots/oauth-error.png',
        fullPage: true 
      });
    }
    
    // Wait a bit to capture any additional logs
    await page.waitForTimeout(2000);
    
    // Generate report
    console.log('\n=== TEST REPORT ===');
    console.log('\nNetwork Logs Summary:');
    networkLogs.forEach(log => {
      console.log(`${log.method} ${log.url}`);
      if (log.status) console.log(`  Status: ${log.status}`);
      if (log.error) console.log(`  Error: ${log.error}`);
      if (log.responseBody) console.log(`  Response: ${log.responseBody}`);
      if (log.timing.duration) console.log(`  Duration: ${log.timing.duration}ms`);
    });
    
    console.log('\nConsole Logs Summary:');
    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');
    console.log(`  Total logs: ${consoleLogs.length}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach(log => {
        console.log(`  ${log.text}`);
        if (log.location) console.log(`    at ${log.location}`);
      });
    }
  });
  
  test('should handle OAuth callback correctly', async ({ page }) => {
    // This test simulates returning from Spotify with auth code
    const networkLogs = await setupNetworkLogging(page);
    const consoleLogs = setupConsoleLogging(page);
    
    // Simulate callback URL with auth code
    const callbackUrl = '/api/auth/callback/spotify?code=test_auth_code&state=test_state';
    
    console.log('Testing OAuth callback handling...');
    
    try {
      await page.goto(callbackUrl);
      
      // Wait for any redirects
      await page.waitForLoadState('networkidle');
      
      // Log final URL
      console.log('Final URL after callback:', page.url());
      
      // Check where we ended up
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard')) {
        console.log('Successfully redirected to dashboard');
      } else if (currentUrl.includes('/login')) {
        console.log('Redirected back to login - auth might have failed');
        
        // Check for error message
        const errorMessage = await page.locator('.bg-red-900\\/20').textContent().catch(() => null);
        if (errorMessage) {
          console.log('Error message found:', errorMessage);
        }
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/e2e/screenshots/oauth-callback-result.png',
        fullPage: true 
      });
      
    } catch (error) {
      console.error('Callback test failed:', error);
    }
    
    // Log network activity
    console.log('\nCallback Network Activity:');
    networkLogs.forEach(log => {
      if (log.url.includes('callback') || log.url.includes('auth')) {
        console.log(`${log.method} ${log.url} - Status: ${log.status || 'pending'}`);
      }
    });
  });
  
  test('should check environment configuration', async ({ page }) => {
    console.log('Checking environment configuration...');
    
    // Navigate to debug endpoint if available
    try {
      const response = await page.request.get('/api/debug');
      const data = await response.json();
      
      console.log('Debug info:', data);
      
      // Check for required environment variables
      const requiredVars = ['NEXTAUTH_URL', 'AUTH_SPOTIFY_ID', 'AUTH_SPOTIFY_SECRET'];
      requiredVars.forEach(varName => {
        if (data[varName]) {
          console.log(`✓ ${varName} is configured`);
        } else {
          console.log(`✗ ${varName} is missing`);
        }
      });
    } catch (error) {
      console.log('Debug endpoint not available');
    }
    
    // Check if auth endpoints are accessible
    const authEndpoints = [
      '/api/auth/providers',
      '/api/auth/csrf',
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await page.request.get(endpoint);
        console.log(`${endpoint}: ${response.status()} ${response.statusText()}`);
      } catch (error) {
        console.log(`${endpoint}: Failed - ${error}`);
      }
    }
  });
});