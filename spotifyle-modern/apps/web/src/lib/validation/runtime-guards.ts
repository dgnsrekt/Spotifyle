/**
 * Runtime type guards and validation utilities
 * Provides additional safety beyond TypeScript compile-time checks
 */

/**
 * Assert that a value is not null or undefined
 * Throws with descriptive error if assertion fails
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  name = 'Value'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${name} cannot be null or undefined. Got: ${value}`)
  }
}

/**
 * Assert that an array is not empty
 */
export function assertNonEmpty<T>(
  array: T[],
  name = 'Array'
): asserts array is [T, ...T[]] {
  if (array.length === 0) {
    throw new Error(`${name} cannot be empty`)
  }
}

/**
 * Type guard to check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Type guard to check if array has elements
 */
export function hasElements<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0
}

/**
 * Safe property access with fallback
 * Prevents runtime errors from undefined property access
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  return obj?.[key] ?? fallback
}

/**
 * Safe array access with fallback
 * Prevents runtime errors from out-of-bounds access
 */
export function safeArrayGet<T>(
  array: T[] | null | undefined,
  index: number,
  fallback: T
): T {
  return array?.[index] ?? fallback
}

/**
 * Exhaustive check for switch statements
 * Ensures all cases are handled in TypeScript unions
 */
export function assertUnreachable(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`)
}

/**
 * Parse number with validation
 * Returns null if parsing fails instead of NaN
 */
export function parseNumber(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Parse integer with validation
 */
export function parseInteger(value: string | number): number | null {
  const num = parseNumber(value)
  return num !== null && Number.isInteger(num) ? num : null
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Deep clone with JSON (simple objects only)
 * Use for configurations and plain data objects
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (error) {
    throw new Error(`Failed to deep clone object: ${error}`)
  }
}

/**
 * Retry function with exponential backoff
 * Useful for API calls and async operations
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  const errorMessage = lastError?.message ?? 'Unknown error'
  throw new Error(`Function failed after ${maxRetries + 1} attempts: ${errorMessage}`)
}

/**
 * Debounce function to prevent rapid successive calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }) as T
}

/**
 * Format error messages consistently
 */
export function formatError(error: unknown, context?: string): string {
  const prefix = context ? `[${context}] ` : ''
  
  if (error instanceof Error) {
    return `${prefix}${error.message}`
  }
  
  if (typeof error === 'string') {
    return `${prefix}${error}`
  }
  
  return `${prefix}Unknown error: ${JSON.stringify(error)}`
}