/**
 * Spotify HTTP Client
 * Handles low-level HTTP requests with rate limiting, retries, and error handling
 */

import type {
  SpotifyApiOptions,
  SpotifyRequestContext,
  SpotifyResponse
} from '../types/client'
import {
  SpotifyApiError,
  SpotifyRateLimitError
} from '../types/client'

export class SpotifyHttpClient {
  private readonly baseUrl: string
  private readonly defaultOptions: Required<SpotifyApiOptions>
  private rateLimitState: {
    remaining: number
    resetTime: number
    limit: number
  } = {
    remaining: 100,
    resetTime: 0,
    limit: 100
  }

  constructor(
    baseUrl: string = 'https://api.spotify.com/v1',
    options: SpotifyApiOptions = {}
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.defaultOptions = {
      retries: 3,
      timeout: 10000,
      rateLimit: true,
      cache: false,
      cacheTtl: 300,
      ...options
    }
  }

  /**
   * Make an HTTP request to the Spotify API
   */
  async request<T = any>(context: SpotifyRequestContext): Promise<SpotifyResponse<T>> {
    const { endpoint, method, params, body, headers = {} } = context
    
    // Build URL - ensure proper concatenation
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const url = new URL(cleanEndpoint, this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/')
    
    // Add query parameters
    if (params && method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.set(key, value.join(','))
          } else {
            url.searchParams.set(key, String(value))
          }
        }
      })
    }

    // Check rate limits before making request
    if (this.defaultOptions.rateLimit) {
      await this.checkRateLimit()
    }

    // Prepare request
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      signal: AbortSignal.timeout(this.defaultOptions.timeout)
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    // Execute request with retries
    return this.executeWithRetries(url.toString(), requestInit, context)
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetries<T>(
    url: string,
    init: RequestInit,
    context: SpotifyRequestContext,
    attempt: number = 1
  ): Promise<SpotifyResponse<T>> {
    try {
      const response = await fetch(url, init)
      
      // Update rate limit state from headers
      this.updateRateLimitState(response)

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
        throw new SpotifyRateLimitError(
          `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
          retryAfter
        )
      }

      // Handle errors
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response)
        throw new SpotifyApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          context
        )
      }

      // Parse response
      const data = await this.parseResponse<T>(response)
      
      return {
        data,
        status: response.status,
        headers: this.parseHeaders(response),
        rateLimit: {
          limit: this.rateLimitState.limit,
          remaining: this.rateLimitState.remaining,
          resetTime: this.rateLimitState.resetTime
        }
      }

    } catch (error) {
      // Handle specific error types
      if (error instanceof SpotifyRateLimitError) {
        if (attempt <= this.defaultOptions.retries) {
          await this.sleep(error.retryAfter * 1000)
          return this.executeWithRetries(url, init, context, attempt + 1)
        }
        throw error
      }

      if (error instanceof SpotifyApiError) {
        // Retry on server errors (5xx)
        if (error.status >= 500 && attempt <= this.defaultOptions.retries) {
          await this.sleep(this.calculateBackoffDelay(attempt))
          return this.executeWithRetries(url, init, context, attempt + 1)
        }
        throw error
      }

      // Handle network errors
      if (error instanceof Error) {
        if (attempt <= this.defaultOptions.retries) {
          await this.sleep(this.calculateBackoffDelay(attempt))
          return this.executeWithRetries(url, init, context, attempt + 1)
        }
        
        throw new SpotifyApiError(
          `Network error: ${error.message}`,
          0,
          'NETWORK_ERROR',
          context
        )
      }

      throw error
    }
  }

  /**
   * Check if we need to wait for rate limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now() / 1000
    
    if (this.rateLimitState.remaining <= 0 && now < this.rateLimitState.resetTime) {
      const waitTime = (this.rateLimitState.resetTime - now) * 1000
      await this.sleep(waitTime)
    }
  }

  /**
   * Update rate limit state from response headers
   */
  private updateRateLimitState(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining')
    const reset = response.headers.get('X-RateLimit-Reset')
    const limit = response.headers.get('X-RateLimit-Limit')

    if (remaining !== null) {
      this.rateLimitState.remaining = parseInt(remaining)
    }
    if (reset !== null) {
      this.rateLimitState.resetTime = parseInt(reset)
    }
    if (limit !== null) {
      this.rateLimitState.limit = parseInt(limit)
    }
  }

  /**
   * Parse response body
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return response.json() as T
    }
    
    const text = await response.text()
    return text as any as T
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<{ message: string; code?: string }> {
    try {
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json() as any
        
        // Spotify API error format
        if (errorData.error) {
          return {
            message: errorData.error.message || 'Unknown API error',
            code: errorData.error.status?.toString()
          }
        }
        
        // Generic error
        return {
          message: errorData.message || 'Unknown error',
          code: errorData.code
        }
      }
      
      return {
        message: await response.text() || response.statusText,
        code: response.status.toString()
      }
    } catch {
      return {
        message: response.statusText || 'Unknown error',
        code: response.status.toString()
      }
    }
  }

  /**
   * Parse response headers into a plain object
   */
  private parseHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    return headers
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current rate limit state
   */
  getRateLimitState(): typeof this.rateLimitState {
    return { ...this.rateLimitState }
  }
}