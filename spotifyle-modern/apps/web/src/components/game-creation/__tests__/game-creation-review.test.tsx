/**
 * Tests for GameCreationReview component
 */

import { screen, within } from '@testing-library/react'
import { GameCreationReview } from '../game-creation-review'
import { 
  render, 
  testGameConfigs, 
  createMockHandlers 
} from '@/test-utils/game-creation-test-utils'

describe('GameCreationReview', () => {
  const { handleConfigChange } = createMockHandlers()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should display game overview section', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Game Overview')).toBeInTheDocument()
      expect(screen.getByText('Review your game settings before creation')).toBeInTheDocument()
    })

    it('should show game name and type', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Complete Test Game')).toBeInTheDocument()
      expect(screen.getByText('Artist Trivia')).toBeInTheDocument()
      expect(screen.getByText('Answer questions about your favorite artists')).toBeInTheDocument()
    })

    it('should display difficulty badge', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      // Find difficulty badge by looking for the capitalized version
      const difficultyBadge = screen.getByText('hard Difficulty')
      expect(difficultyBadge).toBeInTheDocument()
    })
  })

  describe('Timing & Questions Display', () => {
    it('should show correct question count', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const questionsRow = screen.getByText('Questions:').parentElement
      expect(within(questionsRow!).getByText('25')).toBeInTheDocument()
    })

    it('should show correct time per question', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const timeRow = screen.getByText('Time per question:').parentElement
      expect(within(timeRow!).getByText('45s')).toBeInTheDocument()
    })

    it('should calculate and display estimated duration correctly', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      // 25 questions * 45 seconds = 1125 seconds = ~19 minutes
      const durationRow = screen.getByText('Estimated duration:').parentElement
      expect(within(durationRow!).getByText('~19 minutes')).toBeInTheDocument()
    })

    it('should handle default values correctly', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.partial} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Not set')).toBeInTheDocument() // Question count
      expect(screen.getByText('Not sets')).toBeInTheDocument() // Time limit
      expect(screen.getByText('~0 minutes')).toBeInTheDocument() // Duration
    })
  })

  describe('Music Sources Display', () => {
    it('should show recent tracks as included when true', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const recentTracksRow = screen.getByText('Recent tracks:').parentElement
      expect(within(recentTracksRow!).getByText('Included')).toBeInTheDocument()
      // Check for green color which indicates included
      const includedText = within(recentTracksRow!).getByText('Included')
      expect(includedText).toHaveClass('text-green-600')
    })

    it('should show top artists as not included when false', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const topArtistsRow = screen.getByText('Top artists:').parentElement
      expect(within(topArtistsRow!).getByText('Not included')).toBeInTheDocument()
    })

    it('should default to included when not specified', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.partial} 
          onConfigChange={handleConfigChange} 
        />
      )

      const recentTracksRow = screen.getByText('Recent tracks:').parentElement
      const topArtistsRow = screen.getByText('Top artists:').parentElement
      
      expect(within(recentTracksRow!).getByText('Included')).toBeInTheDocument()
      expect(within(topArtistsRow!).getByText('Included')).toBeInTheDocument()
    })
  })

  describe('Game Type Specific Details', () => {
    it('should show artist trivia details', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Artist Trivia Details')).toBeInTheDocument()
      expect(screen.getByText('Your trivia game will include questions about:')).toBeInTheDocument()
      expect(screen.getByText(/Artist biographical information/)).toBeInTheDocument()
      expect(screen.getByText(/Album releases and collaborations/)).toBeInTheDocument()
    })

    it('should show find track art details', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.findTrackArt} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Find the Track Art Details')).toBeInTheDocument()
      expect(screen.getByText('Your visual matching game will feature:')).toBeInTheDocument()
      expect(screen.getByText(/Album artwork from your music library/)).toBeInTheDocument()
      expect(screen.getByText(/30-second track previews/)).toBeInTheDocument()
    })

    it('should show multiple track details', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.multipleTrack} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Multiple Track Lock-in Details')).toBeInTheDocument()
      expect(screen.getByText('Your audio challenge will include:')).toBeInTheDocument()
      expect(screen.getByText(/Track previews from your listening history/)).toBeInTheDocument()
      expect(screen.getByText(/Bonus points for faster identification/)).toBeInTheDocument()
    })
  })

  describe('Ready to Create Section', () => {
    it('should display ready to create message', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Ready to Create Your Game!')).toBeInTheDocument()
      expect(screen.getByText(/Click "Create Game" to start generating/)).toBeInTheDocument()
    })

    it('should mention the correct game type in the message', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.findTrackArt} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText(/personalized find the track art game/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing game type', () => {
      expect(() => render(
        <GameCreationReview 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )).toThrow('Game type is required for review')
    })

    it('should handle zero duration calculation', () => {
      render(
        <GameCreationReview 
          gameConfig={{
            ...testGameConfigs.withType,
            questionCount: 0,
            timeLimit: 0
          }} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('~0 minutes')).toBeInTheDocument()
    })

    it('should handle very large duration calculation', () => {
      render(
        <GameCreationReview 
          gameConfig={{
            ...testGameConfigs.withType,
            questionCount: 100,
            timeLimit: 300
          }} 
          onConfigChange={handleConfigChange} 
        />
      )

      // 100 * 300 = 30000 seconds = 500 minutes
      expect(screen.getByText('~500 minutes')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check main heading exists
      expect(screen.getByRole('heading', { name: 'Complete Test Game' })).toBeInTheDocument()
    })

    it('should use semantic list elements for details', () => {
      render(
        <GameCreationReview 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThan(0)
    })
  })
})