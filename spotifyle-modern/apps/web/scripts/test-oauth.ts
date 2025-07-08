#!/usr/bin/env node
import { spawn } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const testDir = join(process.cwd(), 'tests', 'e2e')
const screenshotsDir = join(testDir, 'screenshots')
const reportsDir = join(testDir, 'reports')

// Ensure directories exist
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true })
}
if (!existsSync(reportsDir)) {
  mkdirSync(reportsDir, { recursive: true })
}

console.log('🔍 Starting OAuth Testing Suite...\n')

// Function to run a test and capture output
function runTest(testFile: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output: string[] = []
    
    const test = spawn('pnpm', ['playwright', 'test', testFile, '--reporter=list'], {
      env: { ...process.env, FORCE_COLOR: '0' },
      shell: true
    })
    
    test.stdout.on('data', (data) => {
      const text = data.toString()
      output.push(text)
      process.stdout.write(text)
    })
    
    test.stderr.on('data', (data) => {
      const text = data.toString()
      output.push(text)
      process.stderr.write(text)
    })
    
    test.on('close', (code) => {
      const fullOutput = output.join('')
      if (code !== 0) {
        console.log(`\n❌ Test failed with code ${code}`)
      }
      resolve(fullOutput)
    })
  })
}

// Function to analyze test output for common issues
function analyzeOutput(output: string) {
  console.log('\n📊 Analyzing test results...\n')
  
  const issues: string[] = []
  
  // Check for Invalid URL error
  if (output.includes('Invalid URL')) {
    issues.push('❌ Invalid URL error detected - likely an issue with URL construction in NextAuth')
    
    // Try to extract more context
    const lines = output.split('\n')
    const errorIndex = lines.findIndex(line => line.includes('Invalid URL'))
    if (errorIndex > -1) {
      console.log('Context around error:')
      for (let i = Math.max(0, errorIndex - 3); i < Math.min(lines.length, errorIndex + 3); i++) {
        console.log(lines[i])
      }
    }
  }
  
  // Check for redirect URI mismatch
  if (output.includes('redirect_uri_mismatch') || output.includes('Invalid redirect URI')) {
    issues.push('❌ Redirect URI mismatch - the URI in your app doesn\'t match Spotify\'s configuration')
  }
  
  // Check for localhost vs 127.0.0.1 issues
  if (output.includes('localhost') && output.includes('127.0.0.1')) {
    issues.push('⚠️  Mixed usage of localhost and 127.0.0.1 detected')
  }
  
  // Check for missing client ID
  if (output.includes('client_id=undefined') || output.includes('INVALID_CLIENT')) {
    issues.push('❌ Client ID is undefined or invalid')
  }
  
  // Print issues
  if (issues.length > 0) {
    console.log('🔍 Issues found:')
    issues.forEach(issue => console.log(`  ${issue}`))
  } else {
    console.log('✅ No obvious issues detected in the output')
  }
  
  // Save analysis report
  const report = {
    timestamp: new Date().toISOString(),
    issues,
    rawOutput: output
  }
  
  const reportPath = join(reportsDir, `oauth-analysis-${Date.now()}.json`)
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Full report saved to: ${reportPath}`)
}

// Main test runner
async function main() {
  try {
    console.log('1️⃣ Running Invalid URL Debug Test...\n')
    const output = await runTest('tests/e2e/invalid-url-debug.spec.ts')
    
    analyzeOutput(output)
    
    console.log('\n2️⃣ Checking test artifacts...\n')
    
    // Check if error report was generated
    const errorReportPath = join(testDir, 'oauth-error-report.json')
    if (existsSync(errorReportPath)) {
      console.log('📊 OAuth error report found. Key findings:')
      const report = require(errorReportPath)
      
      if (report.consoleErrors && report.consoleErrors.length > 0) {
        console.log(`\n  Console Errors: ${report.consoleErrors.length}`)
        report.consoleErrors.forEach((error: any, i: number) => {
          console.log(`    ${i + 1}. ${error.text}`)
        })
      }
      
      if (report.networkErrors && report.networkErrors.length > 0) {
        console.log(`\n  Network Errors: ${report.networkErrors.length}`)
        report.networkErrors.forEach((error: any, i: number) => {
          console.log(`    ${i + 1}. ${error.status} ${error.url}`)
        })
      }
    }
    
    console.log('\n✅ Testing complete!')
    console.log('\n📁 Check the following for more details:')
    console.log(`  - Screenshots: ${screenshotsDir}`)
    console.log(`  - Reports: ${reportsDir}`)
    console.log(`  - Error Report: ${errorReportPath}`)
    
  } catch (error) {
    console.error('\n❌ Test runner failed:', error)
    process.exit(1)
  }
}

// Run the tests
main()