/**
 * Tests for GameConfiguration component
 */

import { screen } from '@testing-library/react'
import { GameConfiguration } from '../game-configuration'
import { 
  render, 
  testGameConfigs, 
  createMockHandlers,
  configSelectors 
} from '@/test-utils/game-creation-test-utils'

describe('GameConfiguration', () => {
  const { handleConfigChange } = createMockHandlers()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all configuration sections', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Basic Settings')).toBeInTheDocument()
      expect(screen.getByText('Music Preferences')).toBeInTheDocument()
      expect(screen.getByText('Trivia Settings')).toBeInTheDocument()
    })

    it('should display game name input', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const nameInput = screen.getByLabelText(configSelectors.gameName)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('placeholder', 'Enter a name for your game')
    })

    it('should show difficulty selector', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const difficultySelect = screen.getByRole('combobox')
      expect(difficultySelect).toBeInTheDocument()
    })

    it('should display question count slider with correct range', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Number of Questions: 20')).toBeInTheDocument()
      expect(screen.getByText('10 (Quick)')).toBeInTheDocument()
      expect(screen.getByText('50 (Extended)')).toBeInTheDocument()
    })

    it('should display time limit slider with correct range', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Time per Question: 30s')).toBeInTheDocument()
      expect(screen.getByText('15s (Fast)')).toBeInTheDocument()
      expect(screen.getByText('60s (Relaxed)')).toBeInTheDocument()
    })

    it('should show music preference switches', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByLabelText(/include recent tracks/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/include top artists/i)).toBeInTheDocument()
    })
  })

  describe('Game Type Specific Settings', () => {
    it('should show correct ranges for artist-trivia', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('~10 min game')).toBeInTheDocument()
    })

    it('should show correct ranges for find-track-art', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.findTrackArt} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Number of Questions: 15')).toBeInTheDocument()
      expect(screen.getByText('Time per Question: 60s')).toBeInTheDocument()
      expect(screen.getByText('8 (Quick)')).toBeInTheDocument()
      expect(screen.getByText('30 (Extended)')).toBeInTheDocument()
    })

    it('should show correct ranges for multiple-track-lockin', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.multipleTrack} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('Number of Questions: 12')).toBeInTheDocument()
      expect(screen.getByText('Time per Question: 20s')).toBeInTheDocument()
      expect(screen.getByText('6 (Quick)')).toBeInTheDocument()
      expect(screen.getByText('25 (Extended)')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should update game name on input', async () => {
      const { user } = render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const nameInput = screen.getByLabelText(configSelectors.gameName) as HTMLInputElement
      
      // Input starts empty since testGameConfigs.withType doesn't have a name
      expect(nameInput.value).toBe('')
      
      await user.type(nameInput, 'Test')

      // Should be called for each character
      expect(handleConfigChange).toHaveBeenCalled()
      expect(handleConfigChange).toHaveBeenCalledTimes(4) // 'T', 'e', 's', 't'
      
      // Each call receives just the single character typed
      const calls = handleConfigChange.mock.calls
      expect(calls[0][0]).toEqual({ name: 'T' })
      expect(calls[1][0]).toEqual({ name: 'e' })
      expect(calls[2][0]).toEqual({ name: 's' })
      expect(calls[3][0]).toEqual({ name: 't' })
    })

    it('should update difficulty on selection', async () => {
      const { user } = render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const difficultySelect = screen.getByRole('combobox')
      await user.click(difficultySelect)
      
      const hardOption = await screen.findByText('Hard')
      await user.click(hardOption)

      expect(handleConfigChange).toHaveBeenCalledWith({ difficulty: 'hard' })
    })

    it('should update music preferences on switch toggle', async () => {
      const { user } = render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      const recentTracksSwitch = screen.getByLabelText(/include recent tracks/i)
      await user.click(recentTracksSwitch)

      expect(handleConfigChange).toHaveBeenCalledWith({ includeRecentTracks: false })
    })
  })

  describe('Duration Calculation', () => {
    it('should update duration when question count changes', () => {
      render(
        <GameConfiguration 
          gameConfig={{
            ...testGameConfigs.withType,
            questionCount: 40,
            timeLimit: 30
          }} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('~20 min game')).toBeInTheDocument()
    })

    it('should handle edge case durations', () => {
      render(
        <GameConfiguration 
          gameConfig={{
            ...testGameConfigs.withType,
            questionCount: 10,
            timeLimit: 15
          }} 
          onConfigChange={handleConfigChange} 
        />
      )

      expect(screen.getByText('~3 min game')).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should display existing values correctly', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange} 
        />
      )

      const nameInput = screen.getByLabelText(configSelectors.gameName) as HTMLInputElement
      expect(nameInput.value).toBe('Complete Test Game')
      expect(screen.getByText('Number of Questions: 25')).toBeInTheDocument()
      expect(screen.getByText('Time per Question: 45s')).toBeInTheDocument()
    })

    it('should handle missing game type gracefully', () => {
      // Components can't throw errors that are caught by expect().toThrow()
      // Instead, we need to test that it renders an error state or use error boundaries
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => render(
        <GameConfiguration 
          gameConfig={testGameConfigs.empty} 
          onConfigChange={handleConfigChange} 
        />
      )).toThrow()
      
      consoleError.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      // Text input
      expect(screen.getByLabelText(configSelectors.gameName)).toBeInTheDocument()
      
      // Sliders - check that labels exist and sliders are present
      expect(screen.getByText(/Number of Questions:/)).toBeInTheDocument()
      const sliders = screen.getAllByRole('slider')
      expect(sliders).toHaveLength(2)
      expect(sliders[0].closest('[id="question-count"]')).toBeInTheDocument()
      
      expect(screen.getByText(/Time per Question:/)).toBeInTheDocument()
      expect(sliders[1].closest('[id="time-limit"]')).toBeInTheDocument()
      
      // Switches
      expect(screen.getByLabelText(configSelectors.recentTracks)).toBeInTheDocument()
      expect(screen.getByLabelText(configSelectors.topArtists)).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const { user } = render(
        <GameConfiguration 
          gameConfig={testGameConfigs.withType} 
          onConfigChange={handleConfigChange} 
        />
      )

      await user.tab() // Focus game name input
      expect(screen.getByLabelText(configSelectors.gameName)).toHaveFocus()

      await user.tab() // Focus difficulty selector
      expect(screen.getByRole('combobox')).toHaveFocus()
    })
  })
})