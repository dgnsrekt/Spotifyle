/**
 * Tests for SpotifyCacheService
 */

import { SpotifyCacheService, MemoryCacheStorage, CacheTTL } from '../cache-service'
import type { SpotifyCacheEntry } from '../../types/client'

describe('SpotifyCacheService', () => {
  let cacheService: SpotifyCacheService
  let storage: MemoryCacheStorage

  beforeEach(() => {
    storage = new MemoryCacheStorage()
    cacheService = new SpotifyCacheService(storage, {
      ttl: 300, // 5 minutes
      keyPrefix: 'test:'
    })
  })

  afterEach(() => {
    storage.destroy()
  })

  describe('getOrSet', () => {
    it('should execute fetcher and cache result on cache miss', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test-data' })
      
      const result = await cacheService.getOrSet('test-key', fetcher, 300)
      
      expect(result).toEqual({ data: 'test-data' })
      expect(fetcher).toHaveBeenCalledTimes(1)
      
      // Check that data was cached
      const cached = await storage.get('test:test-key')
      expect(cached).toBeTruthy()
      expect((cached as SpotifyCacheEntry).data).toEqual({ data: 'test-data' })
    })

    it('should return cached result on cache hit', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'cached-data' })
      
      // First call - cache miss
      const firstResult = await cacheService.getOrSet('test-key', fetcher, 300)
      
      // Second call - cache hit (should return same result)
      const result = await cacheService.getOrSet('test-key', fetcher, 300)
      
      expect(result).toEqual({ data: 'cached-data' })
      expect(firstResult).toEqual({ data: 'cached-data' })
      expect(fetcher).toHaveBeenCalledTimes(1) // Should not be called again
    })

    it('should refresh expired cache entries', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'old-data' })
        .mockResolvedValueOnce({ data: 'new-data' })
      
      // Cache with very short TTL
      await cacheService.getOrSet('test-key', fetcher, 0.001) // 1ms
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Should fetch new data
      const result = await cacheService.getOrSet('test-key', fetcher, 300)
      
      expect(result).toEqual({ data: 'new-data' })
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('should use default TTL when not specified', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test-data' })
      
      await cacheService.getOrSet('test-key', fetcher)
      
      const cached = await storage.get('test:test-key') as SpotifyCacheEntry
      expect(cached.expiresAt).toBeGreaterThan(Date.now() + 250000) // Should be close to 5 minutes
    })
  })

  describe('get', () => {
    it('should return cached value if valid', async () => {
      await cacheService.set('test-key', { data: 'cached-data' }, 300)
      
      const result = await cacheService.get('test-key')
      expect(result).toEqual({ data: 'cached-data' })
    })

    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non-existent')
      expect(result).toBeNull()
    })

    it('should return null for expired entries', async () => {
      await cacheService.set('test-key', { data: 'expired-data' }, 0.001)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const result = await cacheService.get('test-key')
      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('should store value with specified TTL', async () => {
      await cacheService.set('test-key', { data: 'test-data' }, 600)
      
      const cached = await storage.get('test:test-key') as SpotifyCacheEntry
      expect(cached.data).toEqual({ data: 'test-data' })
      expect(cached.expiresAt).toBeGreaterThan(Date.now() + 550000) // Should be close to 10 minutes
    })

    it('should use default TTL when not specified', async () => {
      await cacheService.set('test-key', { data: 'test-data' })
      
      const cached = await storage.get('test:test-key') as SpotifyCacheEntry
      expect(cached.expiresAt).toBeGreaterThan(Date.now() + 250000) // Should be close to 5 minutes
    })
  })

  describe('delete', () => {
    it('should remove cached entry', async () => {
      await cacheService.set('test-key', { data: 'test-data' })
      
      let result = await cacheService.get('test-key')
      expect(result).toBeTruthy()
      
      await cacheService.delete('test-key')
      
      result = await cacheService.get('test-key')
      expect(result).toBeNull()
    })
  })

  describe('has', () => {
    it('should return true for existing valid entries', async () => {
      await cacheService.set('test-key', { data: 'test-data' })
      
      const exists = await cacheService.has('test-key')
      expect(exists).toBe(true)
    })

    it('should return false for non-existent entries', async () => {
      const exists = await cacheService.has('non-existent')
      expect(exists).toBe(false)
    })

    it('should return false for expired entries', async () => {
      await cacheService.set('test-key', { data: 'expired-data' }, 0.001)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const exists = await cacheService.has('test-key')
      expect(exists).toBe(false)
    })
  })

  describe('Key generation', () => {
    it('should generate user-specific keys', () => {
      const key = cacheService.generateUserKey('user123', 'top-artists', { limit: 20 })
      expect(key).toMatch(/^user:user123:top-artists:/)
    })

    it('should generate general keys', () => {
      const key = cacheService.generateKey('track', 'track123')
      expect(key).toBe('track:track123')
    })

    it('should include parameters in key generation', () => {
      const key = cacheService.generateKey('search', 'query', { limit: 20, type: 'track' })
      expect(key).toMatch(/^search:query:/)
    })

    it('should generate consistent keys for same parameters', () => {
      const key1 = cacheService.generateUserKey('user123', 'top-tracks', { limit: 20, time_range: 'short_term' })
      const key2 = cacheService.generateUserKey('user123', 'top-tracks', { time_range: 'short_term', limit: 20 })
      
      expect(key1).toBe(key2) // Order shouldn't matter
    })
  })

  describe('Clear', () => {
    it('should clear all cached entries', async () => {
      await cacheService.set('key1', { data: 'data1' })
      await cacheService.set('key2', { data: 'data2' })
      
      await cacheService.clear()
      
      const result1 = await cacheService.get('key1')
      const result2 = await cacheService.get('key2')
      
      expect(result1).toBeNull()
      expect(result2).toBeNull()
    })
  })
})

describe('MemoryCacheStorage', () => {
  let storage: MemoryCacheStorage

  beforeEach(() => {
    storage = new MemoryCacheStorage(100) // 100ms cleanup interval for testing
  })

  afterEach(() => {
    storage.destroy()
  })

  describe('Basic operations', () => {
    it('should store and retrieve values', async () => {
      const entry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() + 10000,
        key: 'test-key'
      }
      
      await storage.set('test-key', entry)
      const result = await storage.get('test-key')
      
      expect(result).toEqual(entry)
    })

    it('should return null for non-existent keys', async () => {
      const result = await storage.get('non-existent')
      expect(result).toBeNull()
    })

    it('should delete entries', async () => {
      const entry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() + 10000,
        key: 'test-key'
      }
      
      await storage.set('test-key', entry)
      await storage.delete('test-key')
      
      const result = await storage.get('test-key')
      expect(result).toBeNull()
    })

    it('should clear all entries', async () => {
      const entry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() + 10000,
        key: 'test-key'
      }
      
      await storage.set('key1', entry)
      await storage.set('key2', entry)
      
      expect(storage.size()).toBe(2)
      
      await storage.clear()
      expect(storage.size()).toBe(0)
    })
  })

  describe('Expiration handling', () => {
    it('should return null for expired entries', async () => {
      const expiredEntry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() - 1000, // Already expired
        key: 'expired-key'
      }
      
      await storage.set('expired-key', expiredEntry)
      const result = await storage.get('expired-key')
      
      expect(result).toBeNull()
    })

    it('should remove expired entries on get', async () => {
      const expiredEntry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() - 1000,
        key: 'expired-key'
      }
      
      await storage.set('expired-key', expiredEntry)
      expect(storage.size()).toBe(1)
      
      await storage.get('expired-key')
      expect(storage.size()).toBe(0) // Should be removed
    })

    it('should handle has() correctly for expired entries', async () => {
      const expiredEntry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() - 1000,
        key: 'expired-key'
      }
      
      await storage.set('expired-key', expiredEntry)
      const exists = await storage.has('expired-key')
      
      expect(exists).toBe(false)
    })

    it('should clean up expired entries automatically', async () => {
      const expiredEntry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() + 50, // Expires in 50ms
        key: 'soon-expired'
      }
      
      await storage.set('soon-expired', expiredEntry)
      expect(storage.size()).toBe(1)
      
      // Wait for expiration and cleanup
      await new Promise(resolve => setTimeout(resolve, 200))
      
      expect(storage.size()).toBe(0)
    })
  })

  describe('Pattern deletion', () => {
    it('should delete entries matching pattern', async () => {
      const entry: SpotifyCacheEntry = {
        data: { test: 'data' },
        expiresAt: Date.now() + 10000,
        key: 'test-key'
      }
      
      await storage.set('user:123:tracks', entry)
      await storage.set('user:123:artists', entry)
      await storage.set('user:456:tracks', entry)
      await storage.set('other:data', entry)
      
      expect(storage.size()).toBe(4)
      
      await storage.deletePattern('user:123:*')
      
      expect(storage.size()).toBe(2)
      expect(await storage.has('user:123:tracks')).toBe(false)
      expect(await storage.has('user:123:artists')).toBe(false)
      expect(await storage.has('user:456:tracks')).toBe(true)
      expect(await storage.has('other:data')).toBe(true)
    })
  })
})

describe('CacheTTL constants', () => {
  it('should have reasonable TTL values', () => {
    expect(CacheTTL.USER_PROFILE).toBe(300) // 5 minutes
    expect(CacheTTL.USER_TOP_ITEMS).toBe(3600) // 1 hour
    expect(CacheTTL.TRACK_INFO).toBe(86400) // 24 hours
    expect(CacheTTL.AUDIO_FEATURES).toBe(604800) // 1 week
    expect(CacheTTL.SEARCH_RESULTS).toBe(1800) // 30 minutes
  })

  it('should have longer TTL for more stable data', () => {
    // User data changes more frequently than track metadata
    expect(CacheTTL.USER_RECENT_TRACKS).toBeLessThan(CacheTTL.TRACK_INFO)
    expect(CacheTTL.USER_TOP_ITEMS).toBeLessThan(CacheTTL.AUDIO_FEATURES)
    
    // Audio features are very stable
    expect(CacheTTL.AUDIO_FEATURES).toBeGreaterThan(CacheTTL.ARTIST_INFO)
  })
})