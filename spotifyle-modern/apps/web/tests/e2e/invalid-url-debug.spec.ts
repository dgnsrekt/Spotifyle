import { test, expect } from '@playwright/test'

test.describe('Debug Invalid URL Error', () => {
  test('capture Invalid URL error details', async ({ page, context }) => {
    // Enhanced error capturing
    const errors: any[] = []
    const networkErrors: any[] = []
    
    // Capture console errors with stack traces
    page.on('console', async (msg) => {
      if (msg.type() === 'error') {
        const error = {
          text: msg.text(),
          location: msg.location(),
          stack: await Promise.all(msg.args().map(arg => arg.jsonValue())).catch(() => 'Could not serialize'),
          timestamp: new Date().toISOString()
        }
        errors.push(error)
        console.log('🔴 Console Error:', error)
      }
    })
    
    // Capture page errors
    page.on('pageerror', (error) => {
      console.log('🔴 Page Error:', error.message)
      console.log('Stack:', error.stack)
    })
    
    // Monitor all network requests
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('auth') || url.includes('spotify')) {
        console.log(`📤 Request: ${request.method()} ${url}`)
        console.log('Headers:', request.headers())
      }
    })
    
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('auth') || url.includes('spotify')) {
        console.log(`📥 Response: ${response.status()} ${url}`)
        if (!response.ok()) {
          const body = await response.text().catch(() => 'Could not read body')
          networkErrors.push({
            url,
            status: response.status(),
            statusText: response.statusText(),
            body
          })
        }
      }
    })
    
    // Navigate to login page
    console.log('🔍 Navigating to login page...')
    await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle' })
    
    // Check the current URL
    console.log('📍 Current URL:', page.url())
    
    // Capture the login button
    const loginButton = page.locator('button:has-text("Continue with Spotify")')
    await expect(loginButton).toBeVisible()
    
    // Intercept the OAuth request to see what URL is being constructed
    await page.route('**/api/auth/signin/spotify*', async (route) => {
      const request = route.request()
      console.log('🎯 OAuth Sign-in Request:', {
        url: request.url(),
        method: request.method(),
        postData: request.postData(),
        headers: request.headers()
      })
      
      // Continue with the request
      await route.continue()
    })
    
    // Also intercept the callback
    await page.route('**/api/auth/callback/spotify*', async (route) => {
      const request = route.request()
      console.log('🎯 OAuth Callback Request:', {
        url: request.url(),
        searchParams: new URL(request.url()).searchParams.toString()
      })
      await route.continue()
    })
    
    // Click the login button
    console.log('🖱️ Clicking login button...')
    await loginButton.click()
    
    // Wait a bit to capture any errors
    await page.waitForTimeout(3000)
    
    // Check if we're still on the login page with an error
    const currentUrl = page.url()
    console.log('📍 URL after click:', currentUrl)
    
    if (currentUrl.includes('error=')) {
      console.log('❌ Login failed, error in URL')
      
      // Try to find error messages on the page
      const errorText = await page.textContent('body').catch(() => '')
      console.log('📄 Page content:', errorText?.substring(0, 500) || 'No content')
    }
    
    // Log all captured errors
    if (errors.length > 0) {
      console.log('\n🔴 All Console Errors:')
      errors.forEach((error, i) => {
        console.log(`\nError ${i + 1}:`, error)
      })
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🔴 All Network Errors:')
      networkErrors.forEach((error, i) => {
        console.log(`\nNetwork Error ${i + 1}:`, error)
      })
    }
    
    // Save a screenshot
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/invalid-url-error.png',
      fullPage: true 
    })
    
    // Create a detailed error report
    const report = {
      timestamp: new Date().toISOString(),
      currentUrl,
      consoleErrors: errors,
      networkErrors,
      cookies: await context.cookies(),
      localStorage: await page.evaluate(() => {
        const items: Record<string, string> = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) items[key] = localStorage.getItem(key) || ''
        }
        return items
      }),
      sessionStorage: await page.evaluate(() => {
        const items: Record<string, string> = {}
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key) items[key] = sessionStorage.getItem(key) || ''
        }
        return items
      })
    }
    
    // Save the report
    const fs = require('fs')
    fs.writeFileSync(
      'tests/e2e/oauth-error-report.json',
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n📊 Error report saved to tests/e2e/oauth-error-report.json')
  })
  
  test('test NextAuth endpoints directly', async ({ page }) => {
    console.log('\n🔍 Testing NextAuth endpoints...\n')
    
    // Test providers endpoint
    const providersResponse = await page.request.get('http://127.0.0.1:3000/api/auth/providers')
    console.log('📥 /api/auth/providers:', {
      status: providersResponse.status(),
      body: await providersResponse.json()
    })
    
    // Test session endpoint
    const sessionResponse = await page.request.get('http://127.0.0.1:3000/api/auth/session')
    console.log('📥 /api/auth/session:', {
      status: sessionResponse.status(),
      body: await sessionResponse.json()
    })
    
    // Test CSRF endpoint
    const csrfResponse = await page.request.get('http://127.0.0.1:3000/api/auth/csrf')
    console.log('📥 /api/auth/csrf:', {
      status: csrfResponse.status(),
      body: await csrfResponse.json()
    })
    
    // Test signin endpoint
    const signinResponse = await page.request.post('http://127.0.0.1:3000/api/auth/signin/spotify', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'csrfToken=test&callbackUrl=http://127.0.0.1:3000/dashboard'
    })
    
    console.log('📥 /api/auth/signin/spotify:', {
      status: signinResponse.status(),
      headers: signinResponse.headers(),
      body: await signinResponse.text()
    })
  })
})