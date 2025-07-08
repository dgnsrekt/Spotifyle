import { test, expect } from '@playwright/test';
import { OAuthTestHelper } from './utils/oauth-helpers';

// Test configuration
const TEST_CONFIG = {
  // Set these if you want to test with real Spotify credentials
  SPOTIFY_TEST_EMAIL: process.env.SPOTIFY_TEST_EMAIL || '',
  SPOTIFY_TEST_PASSWORD: process.env.SPOTIFY_TEST_PASSWORD || '',
  // Enable to pause at key points for manual debugging
  PAUSE_FOR_DEBUG: process.env.PAUSE_FOR_DEBUG === 'true',
};

test.describe('Comprehensive OAuth Flow Analysis', () => {
  test('full OAuth flow with detailed logging', async ({ page, context, browser }) => {
    console.log('=== COMPREHENSIVE OAUTH FLOW TEST ===\n');
    console.log('Test started at:', new Date().toISOString());
    console.log('Base URL:', process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000');
    
    // Initialize helper
    const oauthHelper = new OAuthTestHelper(page, context, {
      email: TEST_CONFIG.SPOTIFY_TEST_EMAIL,
      password: TEST_CONFIG.SPOTIFY_TEST_PASSWORD,
    });
    
    // Setup comprehensive logging
    const networkLogs = await oauthHelper.setupOAuthLogging();
    const consoleErrors = oauthHelper.setupErrorLogging();
    
    // Track all cookies
    const cookies: any[] = [];
    context.on('response', async response => {
      const setCookieHeaders = response.headers()['set-cookie'];
      if (setCookieHeaders) {
        cookies.push({
          url: response.url(),
          cookies: setCookieHeaders,
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    // Step 1: Check environment setup
    console.log('\n--- Step 1: Environment Check ---');
    
    // Check auth providers
    const providersResponse = await page.request.get('/api/auth/providers');
    const providers = await providersResponse.json();
    console.log('Auth providers configured:', Object.keys(providers).join(', '));
    
    // Check CSRF
    const csrfResponse = await page.request.get('/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF token available:', !!csrfData.csrfToken);
    
    // Step 2: Navigate to login page
    console.log('\n--- Step 2: Login Page Navigation ---');
    await page.goto('/login');
    await expect(page).toHaveTitle(/Spotifyle/);
    console.log('Login page loaded successfully');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/1-login-page.png',
      fullPage: true 
    });
    
    // Step 3: Initiate OAuth flow
    console.log('\n--- Step 3: OAuth Flow Initiation ---');
    
    // Find and verify login button
    const loginButton = page.locator('button:has-text("Continue with Spotify")');
    await expect(loginButton).toBeVisible();
    console.log('Login button found');
    
    // Setup request interception for OAuth URL
    let oauthUrl: string | null = null;
    page.on('request', request => {
      if (request.url().includes('accounts.spotify.com/authorize')) {
        oauthUrl = request.url();
      }
    });
    
    if (TEST_CONFIG.PAUSE_FOR_DEBUG) {
      console.log('\n[DEBUG PAUSE] Ready to click login button. Press Enter to continue...');
      await page.pause();
    }
    
    // Click login button
    await loginButton.click();
    console.log('Login button clicked');
    
    // Wait for navigation or OAuth redirect
    try {
      await page.waitForURL(url => 
        url.toString().includes('spotify.com') || 
        url.toString().includes('/api/auth/') ||
        url.toString().includes('/dashboard'),
        { timeout: 10000 }
      );
    } catch (e) {
      console.log('Navigation timeout - checking current state');
    }
    
    // Step 4: Analyze OAuth redirect
    console.log('\n--- Step 4: OAuth Redirect Analysis ---');
    
    if (oauthUrl) {
      console.log('OAuth URL captured:', oauthUrl);
      
      const params = oauthHelper.extractOAuthParams(oauthUrl);
      console.log('\nOAuth Parameters:');
      Object.entries(params).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // Validate redirect URI
      const redirectUri = params.redirect_uri;
      if (redirectUri) {
        console.log('\nRedirect URI Validation:');
        const validation = oauthHelper.validateRedirectUri(redirectUri);
        console.log(`  Valid: ${validation.valid}`);
        if (!validation.valid) {
          console.log('  Issues:');
          validation.issues.forEach(issue => console.log(`    - ${issue}`));
        }
      }
    } else {
      console.log('No OAuth redirect captured - checking current URL');
      console.log('Current URL:', page.url());
    }
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/2-after-login-click.png',
      fullPage: true 
    });
    
    // Step 5: Handle Spotify login (if we reached it)
    if (page.url().includes('spotify.com')) {
      console.log('\n--- Step 5: Spotify Login Page ---');
      console.log('Reached Spotify login at:', page.url());
      
      if (TEST_CONFIG.SPOTIFY_TEST_EMAIL && TEST_CONFIG.SPOTIFY_TEST_PASSWORD) {
        console.log('Attempting automatic login...');
        const loginSuccess = await oauthHelper.completeSpotifyLogin();
        console.log('Login result:', loginSuccess ? 'Success' : 'Failed');
      } else {
        console.log('No test credentials provided - manual login required');
        
        if (TEST_CONFIG.PAUSE_FOR_DEBUG) {
          console.log('\n[DEBUG PAUSE] Please login manually, then press Enter...');
          await page.pause();
        }
      }
    }
    
    // Step 6: Check final state
    console.log('\n--- Step 6: Final State Analysis ---');
    
    // Wait for any final redirects
    await page.waitForLoadState('networkidle');
    
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    
    // Determine outcome
    if (finalUrl.includes('/dashboard')) {
      console.log('SUCCESS: Reached dashboard');
    } else if (finalUrl.includes('/login')) {
      console.log('FAILED: Back at login page');
      
      // Check for error parameter
      const url = new URL(finalUrl);
      const error = url.searchParams.get('error');
      if (error) {
        console.log('Error parameter:', error);
      }
      
      // Check for error message
      const errorElement = page.locator('.bg-red-900\\/20');
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('Error message:', errorText);
      }
    } else {
      console.log('UNKNOWN: Ended at unexpected location');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/3-final-state.png',
      fullPage: true 
    });
    
    // Step 7: Generate comprehensive report
    console.log('\n--- Step 7: Comprehensive Report ---');
    
    // Network summary
    console.log('\nNetwork Activity Summary:');
    console.log(`Total OAuth requests: ${networkLogs.length}`);
    
    const requestsByType = {
      auth: networkLogs.filter(log => log.url.includes('/api/auth/')).length,
      spotify: networkLogs.filter(log => log.url.includes('spotify.com')).length,
      callback: networkLogs.filter(log => log.url.includes('callback')).length,
    };
    
    console.log(`  Auth API requests: ${requestsByType.auth}`);
    console.log(`  Spotify requests: ${requestsByType.spotify}`);
    console.log(`  Callback requests: ${requestsByType.callback}`);
    
    // Cookie summary
    console.log('\nCookie Activity:');
    console.log(`Total Set-Cookie responses: ${cookies.length}`);
    
    const authCookies = cookies.filter(c => 
      c.cookies.toLowerCase().includes('auth') || 
      c.cookies.toLowerCase().includes('session')
    );
    console.log(`  Auth-related cookies: ${authCookies.length}`);
    
    // Error summary
    console.log('\nError Summary:');
    console.log(`Total console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:');
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Session check
    console.log('\nSession Check:');
    const sessionResponse = await page.request.get('/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('Session exists:', !!sessionData.user);
    if (sessionData.user) {
      console.log('User:', JSON.stringify(sessionData.user, null, 2));
    }
    
    // Generate detailed log file
    const detailedLog = {
      testRun: {
        startTime: new Date().toISOString(),
        baseUrl: process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000',
        finalUrl: finalUrl,
        success: finalUrl.includes('/dashboard'),
      },
      networkLogs: networkLogs,
      consoleErrors: consoleErrors,
      cookies: cookies,
      session: sessionData,
    };
    
    // Save detailed log
    await page.evaluate((log) => {
      console.log('=== DETAILED TEST LOG ===');
      console.log(JSON.stringify(log, null, 2));
    }, detailedLog);
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('Screenshots saved in: tests/e2e/screenshots/');
    console.log('Run with PAUSE_FOR_DEBUG=true for interactive debugging');
  });
});