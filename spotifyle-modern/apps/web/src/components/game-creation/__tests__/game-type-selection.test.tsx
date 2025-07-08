/**
 * Tests for GameTypeSelection component
 */

import { screen, within } from '@testing-library/react'
import { GameTypeSelection } from '../game-type-selection'
import { 
  render, 
  testGameConfigs, 
  createMockHandlers,
  gameTypeSelectors 
} from '@/test-utils/game-creation-test-utils'

describe('GameTypeSelection', () => {
  const { handleConfigChange } = createMockHandlers()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all three game type options', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Artist Trivia')).toBeInTheDocument()
      expect(screen.getByText('Find the Track Art')).toBeInTheDocument()
      expect(screen.getByText('Multiple Track Lock-in')).toBeInTheDocument()
    })

    it('should display game descriptions', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Test your knowledge about your favorite artists')).toBeInTheDocument()
      expect(screen.getByText('Match songs to their album artwork')).toBeInTheDocument()
      expect(screen.getByText('Identify tracks from multiple choice options')).toBeInTheDocument()
    })

    it('should show difficulty badges', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Difficulty: Easy')).toBeInTheDocument()
      expect(screen.getByText('Difficulty: Medium')).toBeInTheDocument()
      expect(screen.getByText('Difficulty: Hard')).toBeInTheDocument()
    })

    it('should display time estimates', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('5-10 min')).toBeInTheDocument()
      expect(screen.getByText('7-12 min')).toBeInTheDocument()
      expect(screen.getByText('10-15 min')).toBeInTheDocument()
    })

    it('should show player counts', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('1-8 players')).toBeInTheDocument()
      expect(screen.getByText('1-6 players')).toBeInTheDocument()
      expect(screen.getByText('1-4 players')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('should highlight selected game type', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const cards = screen.getAllByRole('button')
      const artistTriviaCard = cards.find(card => card.textContent?.includes('Artist Trivia'))
      expect(artistTriviaCard).toHaveClass('border-primary', 'bg-primary/5', 'shadow-md')
      expect(within(artistTriviaCard!).getByText('Selected')).toBeInTheDocument()
    })

    it('should call onConfigChange when selecting a game type', async () => {
      const { user } = render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      const findTrackArtCard = screen.getByText(gameTypeSelectors.findTrackArt)
      await user.click(findTrackArtCard)

      expect(handleConfigChange).toHaveBeenCalledWith({ type: 'find-track-art' })
    })

    it('should update selection when clicking different game type', async () => {
      const { user } = render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const multipleTrackCard = screen.getByText(gameTypeSelectors.multipleTrack)
      await user.click(multipleTrackCard)

      expect(handleConfigChange).toHaveBeenCalledWith({ type: 'multiple-track-lockin' })
    })
  })

  describe('Features Display', () => {
    it('should show abbreviated features on cards', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      // Artist Trivia features
      expect(screen.getByText('Questions about your top artists')).toBeInTheDocument()
      expect(screen.getByText('Multiple choice format')).toBeInTheDocument()

      // Find Track Art features
      expect(screen.getByText('Visual matching gameplay')).toBeInTheDocument()
      expect(screen.getByText('Track preview audio')).toBeInTheDocument()

      // Multiple Track features
      expect(screen.getByText('Audio-based identification')).toBeInTheDocument()
      expect(screen.getByText('Progressive difficulty')).toBeInTheDocument()
    })

    it('should display detailed features when game type is selected', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const detailsSection = screen.getByText('All Features:').parentElement
      expect(detailsSection).toBeInTheDocument()
      
      expect(within(detailsSection!).getByText('Difficulty scales with your music taste')).toBeInTheDocument()
      expect(within(detailsSection!).getByText('Artist photos and album covers')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible names for all interactive elements', () => {
      render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      const cards = screen.getAllByRole('button')
      cards.forEach(card => {
        expect(card).toHaveAccessibleName()
      })
    })

    it('should be keyboard navigable', async () => {
      const { user } = render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )

      await user.tab()
      const firstCard = screen.getAllByRole('button')[0]
      expect(firstCard).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(handleConfigChange).toHaveBeenCalledWith({ type: 'artist-trivia' })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined game config gracefully', () => {
      render(
        <GameTypeSelection 
          gameConfig={{}} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Artist Trivia')).toBeInTheDocument()
      expect(screen.queryByText('Selected')).not.toBeInTheDocument()
    })

    it('should not crash with null onConfigChange', () => {
      expect(() => render(
        <GameTypeSelection 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={null as any} 
        />
      )).not.toThrow()
    })
  })
})