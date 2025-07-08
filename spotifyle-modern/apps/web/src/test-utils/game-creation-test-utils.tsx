/**
 * Test utilities for game creation components
 * Provides common mocks and helpers for testing
 */

import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import type { PartialGameConfig } from '@/lib/schemas/game-config'

/**
 * Default test game configurations
 */
export const testGameConfigs = {
  empty: {} as PartialGameConfig,
  
  withType: {
    type: 'artist-trivia' as const
  } as PartialGameConfig,
  
  partial: {
    type: 'artist-trivia' as const,
    name: 'Test Game',
    difficulty: 'medium' as const
  } as PartialGameConfig,
  
  complete: {
    type: 'artist-trivia' as const,
    name: 'Complete Test Game',
    difficulty: 'hard' as const,
    questionCount: 25,
    timeLimit: 45,
    includeRecentTracks: true,
    includeTopArtists: false
  } as PartialGameConfig,
  
  findTrackArt: {
    type: 'find-track-art' as const,
    name: 'Visual Game',
    difficulty: 'easy' as const,
    questionCount: 15,
    timeLimit: 60,
    includeRecentTracks: false,
    includeTopArtists: true
  } as PartialGameConfig,
  
  multipleTrack: {
    type: 'multiple-track-lockin' as const,
    name: 'Audio Challenge',
    difficulty: 'medium' as const,
    questionCount: 12,
    timeLimit: 20,
    includeRecentTracks: true,
    includeTopArtists: true
  } as PartialGameConfig
}

/**
 * Custom render function with providers
 */
export function render(ui: ReactElement, options = {}) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, options)
  }
}

/**
 * Mock handlers for testing
 */
export const createMockHandlers = () => {
  const handleConfigChange = jest.fn()
  const handleNext = jest.fn()
  const handlePrevious = jest.fn()
  
  return {
    handleConfigChange,
    handleNext,
    handlePrevious
  }
}

/**
 * Wait for animations to complete
 */
export const waitForAnimation = () => {
  return new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Game creation step definitions for testing
 */
export const gameCreationSteps = [
  {
    id: 'type',
    title: 'Choose Game Type',
    description: 'Select the type of game you want to create'
  },
  {
    id: 'configure',
    title: 'Configure Game',
    description: 'Customize your game settings'
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your settings and create the game'
  },
  {
    id: 'generate',
    title: 'Generating Game',
    description: 'We are creating your personalized game'
  }
]

/**
 * Assert game config has expected values
 */
export function assertGameConfig(
  actual: PartialGameConfig,
  expected: PartialGameConfig
) {
  Object.entries(expected).forEach(([key, value]) => {
    expect(actual[key as keyof PartialGameConfig]).toBe(value)
  })
}

/**
 * Get accessible elements for game type cards
 */
export const gameTypeSelectors = {
  artistTrivia: 'Artist Trivia',
  findTrackArt: 'Find the Track Art',
  multipleTrack: 'Multiple Track Lock-in'
}

/**
 * Get accessible elements for configuration inputs
 */
export const configSelectors = {
  gameName: /game name/i,
  difficulty: /difficulty level/i,
  questionCount: /number of questions/i,
  timeLimit: /time per question/i,
  recentTracks: /include recent tracks/i,
  topArtists: /include top artists/i
}