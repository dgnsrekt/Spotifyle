/**
 * Tests for game configuration schemas
 * Validates Zod schemas catch configuration errors
 */

import {
  GameConfigSchema,
  PartialGameConfigSchema,
  applyGameConfigDefaults,
  validateGameConfig,
  parsePartialGameConfig,
  getGameConfigErrors,
  type GameType
} from '../game-config'

describe('GameConfigSchema', () => {
  const validConfig = {
    type: 'artist-trivia' as GameType,
    name: 'My Awesome Game',
    difficulty: 'medium' as const,
    questionCount: 20,
    timeLimit: 30,
    includeRecentTracks: true,
    includeTopArtists: true
  }

  it('should validate a complete valid configuration', () => {
    expect(() => GameConfigSchema.parse(validConfig)).not.toThrow()
  })

  it('should reject invalid game types', () => {
    const invalidConfig = { ...validConfig, type: 'invalid-type' }
    expect(() => GameConfigSchema.parse(invalidConfig)).toThrow()
  })

  it('should reject empty game names', () => {
    const invalidConfig = { ...validConfig, name: '' }
    expect(() => GameConfigSchema.parse(invalidConfig)).toThrow()
  })

  it('should reject names that are too long', () => {
    const invalidConfig = { ...validConfig, name: 'x'.repeat(101) }
    expect(() => GameConfigSchema.parse(invalidConfig)).toThrow()
  })

  it('should reject invalid question counts', () => {
    const invalidConfig = { ...validConfig, questionCount: 0 }
    expect(() => GameConfigSchema.parse(invalidConfig)).toThrow()
  })

  it('should reject invalid time limits', () => {
    const invalidConfig = { ...validConfig, timeLimit: 4 }
    expect(() => GameConfigSchema.parse(invalidConfig)).toThrow()
  })

  it('should trim whitespace from names', () => {
    const configWithWhitespace = { ...validConfig, name: '  My Game  ' }
    const parsed = GameConfigSchema.parse(configWithWhitespace)
    expect(parsed.name).toBe('My Game')
  })
})

describe('PartialGameConfigSchema', () => {
  it('should accept partial configurations', () => {
    const partialConfig = { type: 'artist-trivia' as GameType }
    expect(() => PartialGameConfigSchema.parse(partialConfig)).not.toThrow()
  })

  it('should accept empty objects', () => {
    expect(() => PartialGameConfigSchema.parse({})).not.toThrow()
  })

  it('should still validate provided fields', () => {
    const invalidPartial = { questionCount: 'not-a-number' }
    expect(() => PartialGameConfigSchema.parse(invalidPartial)).toThrow()
  })
})

describe('applyGameConfigDefaults', () => {
  it('should apply correct defaults for artist-trivia', () => {
    const result = applyGameConfigDefaults('artist-trivia')
    expect(result).toEqual({
      type: 'artist-trivia',
      questionCount: 20,
      timeLimit: 30,
      includeRecentTracks: true,
      includeTopArtists: true
    })
  })

  it('should apply correct defaults for find-track-art', () => {
    const result = applyGameConfigDefaults('find-track-art')
    expect(result).toEqual({
      type: 'find-track-art',
      questionCount: 15,
      timeLimit: 45,
      includeRecentTracks: true,
      includeTopArtists: true
    })
  })

  it('should preserve existing values', () => {
    const existing = { questionCount: 25 }
    const result = applyGameConfigDefaults('artist-trivia', existing)
    expect(result.questionCount).toBe(25)
    expect(result.timeLimit).toBe(30) // default applied
  })

  it('should override false boolean values correctly', () => {
    const existing = { includeRecentTracks: false }
    const result = applyGameConfigDefaults('artist-trivia', existing)
    expect(result.includeRecentTracks).toBe(false)
    expect(result.includeTopArtists).toBe(true) // default applied
  })
})

describe('validateGameConfig', () => {
  it('should return valid config when successful', () => {
    const validConfig = {
      type: 'artist-trivia' as GameType,
      name: 'Test Game',
      difficulty: 'easy' as const,
      questionCount: 15,
      timeLimit: 25,
      includeRecentTracks: true,
      includeTopArtists: false
    }
    
    const result = validateGameConfig(validConfig)
    expect(result).toEqual(validConfig)
  })

  it('should throw on invalid config', () => {
    const invalidConfig = { type: 'invalid' }
    expect(() => validateGameConfig(invalidConfig)).toThrow()
  })
})

describe('parsePartialGameConfig', () => {
  it('should return parsed config on success', () => {
    const partialConfig = { type: 'artist-trivia' as GameType, name: 'Test' }
    const result = parsePartialGameConfig(partialConfig)
    expect(result).toEqual(partialConfig)
  })

  it('should return null on failure', () => {
    const invalidConfig = { questionCount: 'invalid' }
    const result = parsePartialGameConfig(invalidConfig)
    expect(result).toBeNull()
  })
})

describe('getGameConfigErrors', () => {
  it('should return empty array for valid config', () => {
    const validConfig = {
      type: 'artist-trivia' as GameType,
      name: 'Test Game',
      difficulty: 'medium' as const,
      questionCount: 20,
      timeLimit: 30,
      includeRecentTracks: true,
      includeTopArtists: true
    }
    
    const errors = getGameConfigErrors(validConfig)
    expect(errors).toEqual([])
  })

  it('should return descriptive errors for invalid config', () => {
    const invalidConfig = {
      type: 'invalid-type',
      name: '',
      questionCount: -1
    }
    
    const errors = getGameConfigErrors(invalidConfig)
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('type:'),
        expect.stringContaining('name:'),
        expect.stringContaining('questionCount:')
      ])
    )
  })

  it('should handle missing required fields', () => {
    const incompleteConfig = { type: 'artist-trivia' as GameType }
    const errors = getGameConfigErrors(incompleteConfig)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('Configuration constants', () => {
  it('should have valid defaults within min/max ranges', () => {
    const { QUESTION_COUNT_CONFIGS, TIME_LIMIT_CONFIGS } = require('../game-config')
    
    Object.entries(QUESTION_COUNT_CONFIGS).forEach(([_gameType, config]) => {
      const typedConfig = config as { min: number; max: number; default: number }
      expect(typedConfig.default).toBeGreaterThanOrEqual(typedConfig.min)
      expect(typedConfig.default).toBeLessThanOrEqual(typedConfig.max)
    })
    
    Object.entries(TIME_LIMIT_CONFIGS).forEach(([_gameType, config]) => {
      const typedConfig = config as { min: number; max: number; default: number }
      expect(typedConfig.default).toBeGreaterThanOrEqual(typedConfig.min)
      expect(typedConfig.default).toBeLessThanOrEqual(typedConfig.max)
    })
  })
})