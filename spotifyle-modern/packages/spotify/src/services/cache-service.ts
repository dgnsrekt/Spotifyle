/**
 * Spotify Cache Service
 * Caching layer for Spotify API responses to reduce API calls
 */

import type { SpotifyCacheEntry, SpotifyCacheOptions } from '../types/client'

export interface CacheStorage {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

export class SpotifyCacheService {
  private readonly storage: CacheStorage
  private readonly defaultTtl: number
  private readonly keyPrefix: string

  constructor(
    storage: CacheStorage,
    options: Partial<SpotifyCacheOptions> = {}
  ) {
    this.storage = storage
    this.defaultTtl = options.ttl || 300 // 5 minutes default
    this.keyPrefix = options.keyPrefix || 'spotify:'
  }

  /**
   * Get cached value or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.buildKey(key)
    
    // Try to get from cache first
    const cached = await this.storage.get<SpotifyCacheEntry<T>>(cacheKey)
    
    if (cached && this.isValidEntry(cached)) {
      return cached.data
    }

    // Execute fetcher and cache result
    const data = await fetcher()
    const entry: SpotifyCacheEntry<T> = {
      data,
      expiresAt: Date.now() + (ttl || this.defaultTtl) * 1000,
      key: cacheKey
    }
    
    await this.storage.set(cacheKey, entry, ttl || this.defaultTtl)
    return data
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.buildKey(key)
    const cached = await this.storage.get<SpotifyCacheEntry<T>>(cacheKey)
    
    if (cached && this.isValidEntry(cached)) {
      return cached.data
    }
    
    return null
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const cacheKey = this.buildKey(key)
    const entry: SpotifyCacheEntry<T> = {
      data: value,
      expiresAt: Date.now() + (ttl || this.defaultTtl) * 1000,
      key: cacheKey
    }
    
    await this.storage.set(cacheKey, entry, ttl || this.defaultTtl)
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.buildKey(key)
    await this.storage.delete(cacheKey)
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.storage.clear()
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = this.buildKey(key)
    const cached = await this.storage.get<SpotifyCacheEntry>(cacheKey)
    return cached !== null && this.isValidEntry(cached)
  }

  /**
   * Generate cache key for user-specific data
   */
  generateUserKey(userId: string, endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? this.serializeParams(params) : ''
    return `user:${userId}:${endpoint}${paramString ? `:${paramString}` : ''}`
  }

  /**
   * Generate cache key for general data
   */
  generateKey(type: string, id: string, params?: Record<string, any>): string {
    const paramString = params ? this.serializeParams(params) : ''
    return `${type}:${id}${paramString ? `:${paramString}` : ''}`
  }

  /**
   * Invalidate cache for user
   */
  async invalidateUser(userId: string): Promise<void> {
    // Note: This is a simplified implementation
    // In production, you might want to use a more sophisticated cache invalidation strategy
    const userPrefix = this.buildKey(`user:${userId}`)
    
    // If your cache storage supports pattern deletion, use it
    // Otherwise, you might need to track keys or implement a different strategy
    if ('deletePattern' in this.storage) {
      await (this.storage as any).deletePattern(`${userPrefix}*`)
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number
    estimatedSize: number
  }> {
    // Implementation depends on your cache storage
    // This is a placeholder
    return {
      totalKeys: 0,
      estimatedSize: 0
    }
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidEntry(entry: SpotifyCacheEntry): boolean {
    return entry.expiresAt > Date.now()
  }

  /**
   * Serialize parameters for consistent cache keys
   */
  private serializeParams(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort()
    const serialized = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
    return Buffer.from(serialized).toString('base64').substring(0, 16) // Shortened hash
  }
}

/**
 * In-memory cache storage implementation
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, SpotifyCacheEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor(cleanupIntervalMs: number = 60000) { // 1 minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as SpotifyCacheEntry<T> | undefined
    
    if (!entry) {
      return null
    }
    
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return entry as T
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry = value as SpotifyCacheEntry<T>
    this.cache.set(key, entry)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }
    
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Delete entries matching pattern (simple implementation)
   */
  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

/**
 * Cache TTL constants for different types of data
 */
export const CacheTTL = {
  // User data changes frequently
  USER_PROFILE: 300, // 5 minutes
  USER_TOP_ITEMS: 3600, // 1 hour
  USER_RECENT_TRACKS: 180, // 3 minutes
  USER_PLAYLISTS: 1800, // 30 minutes
  
  // Track/artist data is relatively stable
  TRACK_INFO: 86400, // 24 hours
  ARTIST_INFO: 86400, // 24 hours
  ALBUM_INFO: 86400, // 24 hours
  AUDIO_FEATURES: 604800, // 1 week
  
  // Search results can be cached for moderate time
  SEARCH_RESULTS: 1800, // 30 minutes
  
  // Generic/static data can be cached longer
  ARTIST_TOP_TRACKS: 86400, // 24 hours
  RELATED_ARTISTS: 86400, // 24 hours
} as const