import { test, expect } from '@playwright/test';

test.describe('OAuth Debug Tests', () => {
  test('capture OAuth redirect chain', async ({ page, context }) => {
    console.log('=== OAuth Redirect Chain Debug ===\n');
    
    // Track all navigations
    const navigations: string[] = [];
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        navigations.push(frame.url());
        console.log(`Navigation: ${frame.url()}`);
      }
    });
    
    // Track all route changes
    await context.route('**/*', async (route, request) => {
      const url = request.url();
      console.log(`[ROUTE] ${request.method()} ${url}`);
      
      // Log headers for auth-related requests
      if (url.includes('auth') || url.includes('spotify')) {
        console.log('Headers:', request.headers());
      }
      
      await route.continue();
    });
    
    // Navigate to login
    await page.goto('/login');
    
    // Setup promise to capture OAuth URL before navigation
    let oauthUrl = '';
    await page.route('**/accounts.spotify.com/**', async route => {
      oauthUrl = route.request().url();
      console.log('\n=== Spotify OAuth URL Captured ===');
      console.log(oauthUrl);
      
      // Parse and log OAuth parameters
      const url = new URL(oauthUrl);
      console.log('\nOAuth Parameters:');
      console.log('- client_id:', url.searchParams.get('client_id'));
      console.log('- redirect_uri:', url.searchParams.get('redirect_uri'));
      console.log('- response_type:', url.searchParams.get('response_type'));
      console.log('- scope:', url.searchParams.get('scope'));
      console.log('- state:', url.searchParams.get('state'));
      console.log('- show_dialog:', url.searchParams.get('show_dialog'));
      
      // Check redirect_uri format
      const redirectUri = url.searchParams.get('redirect_uri');
      if (redirectUri) {
        console.log('\nRedirect URI Analysis:');
        console.log('- Full URI:', redirectUri);
        try {
          const redirectUrl = new URL(redirectUri);
          console.log('- Protocol:', redirectUrl.protocol);
          console.log('- Host:', redirectUrl.host);
          console.log('- Pathname:', redirectUrl.pathname);
          console.log('- Is localhost?:', redirectUrl.hostname === 'localhost');
          console.log('- Is 127.0.0.1?:', redirectUrl.hostname === '127.0.0.1');
        } catch (e) {
          console.log('- Invalid redirect URI format');
        }
      }
      
      await route.continue();
    });
    
    // Click login button
    const loginButton = page.locator('button:has-text("Continue with Spotify")');
    await loginButton.click();
    
    // Wait a moment for any redirects
    await page.waitForTimeout(3000);
    
    console.log('\n=== Navigation Summary ===');
    navigations.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
  });
  
  test('test NextAuth provider configuration', async ({ page }) => {
    console.log('=== NextAuth Provider Configuration Test ===\n');
    
    // Get provider configuration
    const response = await page.request.get('/api/auth/providers');
    const providers = await response.json();
    
    console.log('Available providers:', JSON.stringify(providers, null, 2));
    
    // Check Spotify provider
    const spotifyProvider = providers.spotify;
    if (spotifyProvider) {
      console.log('\nSpotify provider found:');
      console.log('- ID:', spotifyProvider.id);
      console.log('- Name:', spotifyProvider.name);
      console.log('- Type:', spotifyProvider.type);
      console.log('- SignIn URL:', spotifyProvider.signinUrl);
      console.log('- Callback URL:', spotifyProvider.callbackUrl);
    } else {
      console.log('\nSpotify provider NOT found!');
    }
    
    // Get CSRF token
    const csrfResponse = await page.request.get('/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('\nCSRF Token:', csrfData.csrfToken ? 'Present' : 'Missing');
  });
  
  test('check OAuth error handling', async ({ page }) => {
    console.log('=== OAuth Error Handling Test ===\n');
    
    // Test various error scenarios
    const errorScenarios = [
      { url: '/login?error=OAuthSignin', description: 'OAuth signin error' },
      { url: '/login?error=OAuthCallback', description: 'OAuth callback error' },
      { url: '/login?error=OAuthCreateAccount', description: 'OAuth account creation error' },
      { url: '/login?error=EmailCreateAccount', description: 'Email account creation error' },
      { url: '/login?error=Callback', description: 'Callback error' },
      { url: '/login?error=OAuthAccountNotLinked', description: 'Account not linked error' },
      { url: '/login?error=EmailSignin', description: 'Email signin error' },
      { url: '/login?error=CredentialsSignin', description: 'Credentials signin error' },
      { url: '/login?error=SessionRequired', description: 'Session required error' },
    ];
    
    for (const scenario of errorScenarios) {
      console.log(`\nTesting: ${scenario.description}`);
      await page.goto(scenario.url);
      
      // Check if error message is displayed
      const errorElement = page.locator('.bg-red-900\\/20');
      const hasError = await errorElement.isVisible().catch(() => false);
      
      if (hasError) {
        const errorText = await errorElement.textContent();
        console.log(`- Error displayed: ${errorText}`);
      } else {
        console.log('- No error message displayed');
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/e2e/screenshots/error-${scenario.url.split('=')[1]}.png`,
        fullPage: true 
      });
    }
  });
  
  test('simulate OAuth callback with different responses', async ({ page }) => {
    console.log('=== OAuth Callback Simulation ===\n');
    
    // Test successful callback
    console.log('Testing successful callback...');
    const successUrl = '/api/auth/callback/spotify?code=test_success_code&state=test_state';
    const successResponse = await page.goto(successUrl);
    console.log(`Success callback response: ${successResponse?.status()}`);
    console.log(`Redirected to: ${page.url()}`);
    
    // Test error callback
    console.log('\nTesting error callback...');
    const errorUrl = '/api/auth/callback/spotify?error=access_denied&state=test_state';
    const errorResponse = await page.goto(errorUrl);
    console.log(`Error callback response: ${errorResponse?.status()}`);
    console.log(`Redirected to: ${page.url()}`);
    
    // Test callback without code
    console.log('\nTesting callback without code...');
    const noCodeUrl = '/api/auth/callback/spotify?state=test_state';
    const noCodeResponse = await page.goto(noCodeUrl);
    console.log(`No code callback response: ${noCodeResponse?.status()}`);
    console.log(`Redirected to: ${page.url()}`);
  });
});