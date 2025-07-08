import { Page, BrowserContext } from '@playwright/test';

export interface OAuthTestCredentials {
  email: string;
  password: string;
}

export class OAuthTestHelper {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private credentials?: OAuthTestCredentials
  ) {}

  /**
   * Logs all OAuth-related network activity
   */
  async setupOAuthLogging() {
    const logs: any[] = [];

    // Intercept all requests
    await this.context.route('**/*', async (route, request) => {
      const url = request.url();
      
      // Log OAuth-related requests
      if (this.isOAuthRelated(url)) {
        const log = {
          timestamp: new Date().toISOString(),
          method: request.method(),
          url: url,
          headers: request.headers(),
          postData: request.postData(),
        };
        
        logs.push(log);
        console.log(`[OAuth Request] ${log.method} ${log.url}`);
        
        // Log important headers
        const importantHeaders = ['authorization', 'cookie', 'referer', 'origin'];
        importantHeaders.forEach(header => {
          if (log.headers[header]) {
            console.log(`  ${header}: ${log.headers[header]}`);
          }
        });
      }
      
      await route.continue();
    });

    return logs;
  }

  /**
   * Attempts to complete Spotify login if credentials are provided
   */
  async completeSpotifyLogin() {
    if (!this.credentials) {
      console.log('No credentials provided, skipping automatic login');
      return false;
    }

    try {
      // Wait for Spotify login page
      await this.page.waitForURL('**/accounts.spotify.com/**', { timeout: 10000 });
      console.log('Reached Spotify login page');

      // Fill in credentials
      await this.page.fill('input[id="login-username"]', this.credentials.email);
      await this.page.fill('input[id="login-password"]', this.credentials.password);
      
      // Click login
      await this.page.click('button[id="login-button"]');
      
      // Wait for redirect back to app
      await this.page.waitForURL(url => !url.toString().includes('spotify.com'), { timeout: 30000 });
      console.log('Redirected back to app');
      
      return true;
    } catch (error) {
      console.error('Failed to complete Spotify login:', error);
      return false;
    }
  }

  /**
   * Extracts OAuth parameters from URL
   */
  extractOAuthParams(url: string): Record<string, string> {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return params;
    } catch (error) {
      console.error('Failed to parse OAuth URL:', error);
      return {};
    }
  }

  /**
   * Validates OAuth redirect URI
   */
  validateRedirectUri(redirectUri: string): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    try {
      const url = new URL(redirectUri);
      
      // Check protocol
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        issues.push(`Invalid protocol: ${url.protocol}`);
      }
      
      // Check if localhost/127.0.0.1
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isHttp = url.protocol === 'http:';
      
      // Spotify allows HTTP only for localhost
      if (isHttp && !isLocalhost) {
        issues.push('HTTP is only allowed for localhost');
      }
      
      // Check for common issues
      if (url.pathname.includes(' ')) {
        issues.push('Redirect URI contains spaces');
      }
      
      if (url.search.includes('&') || url.search.includes('?')) {
        issues.push('Redirect URI should not contain query parameters');
      }
      
    } catch (error) {
      issues.push(`Invalid URL format: ${error}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Checks if a URL is OAuth-related
   */
  private isOAuthRelated(url: string): boolean {
    const patterns = [
      'spotify.com',
      '/api/auth/',
      'oauth',
      'callback',
      'authorize',
      'token',
      'signin',
      'signout',
      'login',
      'logout'
    ];
    
    return patterns.some(pattern => url.toLowerCase().includes(pattern));
  }

  /**
   * Captures and logs console errors related to OAuth
   */
  setupErrorLogging() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (this.isOAuthRelated(text)) {
          errors.push(text);
          console.error('[OAuth Error]', text);
        }
      }
    });
    
    this.page.on('pageerror', error => {
      errors.push(error.message);
      console.error('[Page Error]', error.message);
    });
    
    return errors;
  }

  /**
   * Waits for OAuth redirect and captures the URL
   */
  async waitForOAuthRedirect(timeout = 30000): Promise<string | null> {
    try {
      const response = await this.page.waitForResponse(
        response => response.url().includes('accounts.spotify.com/authorize'),
        { timeout }
      );
      
      return response.url();
    } catch (error) {
      console.error('OAuth redirect timeout:', error);
      return null;
    }
  }

  /**
   * Generates a detailed OAuth flow report
   */
  generateReport(logs: any[], errors: string[]) {
    console.log('\n=== OAuth Flow Report ===\n');
    
    console.log('Total Requests:', logs.length);
    console.log('Errors:', errors.length);
    
    // Group requests by type
    const authRequests = logs.filter(log => log.url.includes('/api/auth/'));
    const spotifyRequests = logs.filter(log => log.url.includes('spotify.com'));
    
    console.log(`\nAuth API Requests: ${authRequests.length}`);
    authRequests.forEach(log => {
      console.log(`  ${log.method} ${log.url}`);
    });
    
    console.log(`\nSpotify Requests: ${spotifyRequests.length}`);
    spotifyRequests.forEach(log => {
      console.log(`  ${log.method} ${log.url}`);
    });
    
    if (errors.length > 0) {
      console.log('\nErrors Encountered:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
  }
}