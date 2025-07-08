#!/usr/bin/env node

async function testAuthAPI() {
  console.log('🔍 Testing Arctic OAuth endpoints...\n')
  
  const baseUrl = 'http://127.0.0.1:3000'
  
  // Check if server is running
  try {
    await fetch(baseUrl)
  } catch (error) {
    console.error('❌ Server is not running at', baseUrl)
    console.log('\nPlease start the dev server first:')
    console.log('  pnpm dev')
    process.exit(1)
  }
  
  try {
    // Test 1: Test signin endpoint
    console.log('1️⃣ Testing /api/auth/signin')
    const signinRes = await fetch(`${baseUrl}/api/auth/signin`, {
      headers: {
        'Host': '127.0.0.1:3000',
      },
      redirect: 'manual' // Don't follow redirects
    })
    
    console.log('Status:', signinRes.status)
    console.log('Headers:', Object.fromEntries(signinRes.headers.entries()))
    
    if (signinRes.headers.get('location')) {
      const location = signinRes.headers.get('location')!
      console.log('\n📍 Redirect URL:', location)
      
      try {
        const url = new URL(location)
        console.log('\nParsed OAuth URL:')
        console.log('  Base:', url.origin + url.pathname)
        console.log('  Parameters:')
        url.searchParams.forEach((value, key) => {
          console.log(`    ${key}: ${value}`)
        })
        
        // Check for issues
        const redirectUri = url.searchParams.get('redirect_uri')
        if (redirectUri) {
          console.log('\n🔍 Redirect URI Check:')
          console.log('  Found:', redirectUri)
          console.log('  Expected:', `${baseUrl}/api/auth/callback/spotify`)
          console.log('  Match:', redirectUri === `${baseUrl}/api/auth/callback/spotify` ? '✅' : '❌')
        }
        
        const clientId = url.searchParams.get('client_id')
        if (!clientId || clientId === 'undefined') {
          console.log('\n❌ Client ID is missing or undefined!')
        } else {
          console.log('\n✅ Client ID found:', clientId)
        }
        
        // Check PKCE parameters
        const codeChallenge = url.searchParams.get('code_challenge')
        const codeChallengeMethod = url.searchParams.get('code_challenge_method')
        if (codeChallenge && codeChallengeMethod) {
          console.log('\n✅ PKCE parameters found')
          console.log('  code_challenge_method:', codeChallengeMethod)
        } else {
          console.log('\n❌ PKCE parameters missing!')
        }
      } catch (e) {
        console.log('\n❌ Failed to parse redirect URL:', e)
      }
    } else {
      console.log('\n❌ No redirect location found')
      const body = await signinRes.text()
      console.log('Response body:', body.substring(0, 500))
    }
    
    // Test 2: Test session endpoint (should return no session)
    console.log('\n2️⃣ Testing session check (should be empty)')
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`)
    console.log('Status:', sessionRes.status)
    if (sessionRes.status === 200) {
      const session = await sessionRes.json()
      console.log('Session:', JSON.stringify(session, null, 2))
    } else {
      console.log('❌ Session endpoint returned:', sessionRes.status)
    }
    
    // Test 3: Test signout endpoint
    console.log('\n3️⃣ Testing /api/auth/signout')
    const signoutRes = await fetch(`${baseUrl}/api/auth/signout`, {
      method: 'POST',
      redirect: 'manual'
    })
    console.log('Status:', signoutRes.status)
    if (signoutRes.headers.get('location')) {
      console.log('Redirect to:', signoutRes.headers.get('location'))
    }
    
    // Test 4: Check environment variables
    console.log('\n4️⃣ Checking environment configuration')
    console.log('  AUTH_URL:', process.env.AUTH_URL || '❌ Not set')
    console.log('  SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Not set')
    console.log('  SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Not set')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

// Run the test
testAuthAPI().catch(console.error)