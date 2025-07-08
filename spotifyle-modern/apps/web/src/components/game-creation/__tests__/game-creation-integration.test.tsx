/**
 * Integration tests for the complete game creation flow
 * Tests the real components working together
 */

import { screen, waitFor, within } from '@testing-library/react'
import { GameCreationWizard } from '../game-creation-wizard'
import { render } from '@/test-utils/game-creation-test-utils'

jest.setTimeout(10000)

describe('Game Creation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Flow - Artist Trivia', () => {
    it('should complete full wizard flow for artist trivia game', async () => {
      const { user } = render(<GameCreationWizard />)

      // Step 1: Select Game Type
      expect(screen.getByText('Choose Game Type')).toBeInTheDocument()
      
      const artistTriviaCard = screen.getByText('Artist Trivia').parentElement?.parentElement
      expect(artistTriviaCard).toBeInTheDocument()
      await user.click(artistTriviaCard!)

      // Verify selection
      expect(screen.getByText('Selected')).toBeInTheDocument()
      
      // Navigate to configuration
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Step 2: Configure Game
      expect(screen.getByText('Configure Game')).toBeInTheDocument()
      
      // Fill in configuration
      const nameInput = screen.getByLabelText(/game name/i)
      await user.type(nameInput, 'My Artist Knowledge Test')

      // Select difficulty
      const difficultySelect = screen.getByRole('combobox')
      await user.click(difficultySelect)
      await user.click(await screen.findByText('Hard'))

      // Verify question slider is present
      expect(screen.getByText(/Number of Questions:/)).toBeInTheDocument()
      const sliders = screen.getAllByRole('slider')
      expect(sliders.length).toBeGreaterThanOrEqual(2) // At least question and time sliders

      // Toggle music preferences
      const recentTracksSwitch = screen.getByLabelText(/include recent tracks/i)
      await user.click(recentTracksSwitch) // Turn off

      // Navigate to review
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Step 3: Review
      expect(screen.getByText('Review & Create')).toBeInTheDocument()
      
      // Verify all settings are displayed correctly
      expect(screen.getByText('My Artist Knowledge Test')).toBeInTheDocument()
      expect(screen.getByText('hard Difficulty')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument() // Default questions
      expect(screen.getByText('30s')).toBeInTheDocument() // Default time
      
      // Check music sources
      const recentTracksRow = screen.getByText('Recent tracks:').parentElement
      expect(within(recentTracksRow!).getByText('Not included')).toBeInTheDocument()
      
      const topArtistsRow = screen.getByText('Top artists:').parentElement
      expect(within(topArtistsRow!).getByText('Included')).toBeInTheDocument()

      // Create game
      await user.click(screen.getByRole('button', { name: /create game/i }))

      // Step 4: Generation
      expect(screen.getByText('Generating Game')).toBeInTheDocument()
      expect(screen.getByText('Creating Your Game')).toBeInTheDocument()
      expect(screen.getByText(/Generating your personalized artist trivia game/)).toBeInTheDocument()
    })
  })

  describe('Complete Flow - Find Track Art', () => {
    it('should complete full wizard flow for visual game', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select Find Track Art
      const findTrackCard = screen.getByText('Find the Track Art').parentElement?.parentElement
      await user.click(findTrackCard!)
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Configure with different settings
      await user.type(screen.getByLabelText(/game name/i), 'Album Art Challenge')
      
      const difficultySelect = screen.getByRole('combobox')
      await user.click(difficultySelect)
      await user.click(await screen.findByText('Easy'))

      // Verify game-specific ranges
      expect(screen.getByText('Number of Questions: 15')).toBeInTheDocument() // Default for find-track
      expect(screen.getByText('Time per Question: 45s')).toBeInTheDocument()
      expect(screen.getByText('~12 min game')).toBeInTheDocument() // 15 * 45 / 60 = 12.5, rounded to 12

      await user.click(screen.getByRole('button', { name: /next/i }))

      // Review should show visual game details
      expect(screen.getByText('Album Art Challenge')).toBeInTheDocument()
      expect(screen.getByText('Find the Track Art Details')).toBeInTheDocument()
      expect(screen.getByText(/Album artwork from your music library/)).toBeInTheDocument()
    })
  })

  describe('Navigation and State Persistence', () => {
    it('should preserve configuration when navigating back and forth', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select game type
      await user.click(screen.getByText('Multiple Track Lock-in').parentElement?.parentElement!)
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Configure
      await user.type(screen.getByLabelText(/game name/i), 'Audio Challenge Pro')
      
      // Change both switches
      await user.click(screen.getByLabelText(/include recent tracks/i))
      await user.click(screen.getByLabelText(/include top artists/i))

      // Go back to game selection
      await user.click(screen.getByRole('button', { name: /previous/i }))
      
      // Verify selection is preserved
      expect(screen.getByText('Selected')).toBeInTheDocument()
      
      // Go forward again
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Verify configuration is preserved
      expect(screen.getByDisplayValue('Audio Challenge Pro')).toBeInTheDocument()
      
      // Continue to review
      const difficultySelect = screen.getByRole('combobox')
      await user.click(difficultySelect)
      await user.click(await screen.findByText('Medium'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Verify switches were preserved correctly
      const recentTracksRow = screen.getByText('Recent tracks:').parentElement
      expect(within(recentTracksRow!).getByText('Not included')).toBeInTheDocument()
      
      const topArtistsRow = screen.getByText('Top artists:').parentElement
      expect(within(topArtistsRow!).getByText('Not included')).toBeInTheDocument()
    })
  })

  describe('Validation and Error Prevention', () => {
    it('should prevent advancing without required fields', async () => {
      const { user } = render(<GameCreationWizard />)

      // Try to advance without selecting game type
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()

      // Select game type
      await user.click(screen.getByText('Artist Trivia').parentElement?.parentElement!)
      expect(nextButton).toBeEnabled()
      await user.click(nextButton)

      // Try to advance without name and difficulty
      const configNextButton = screen.getByRole('button', { name: /next/i })
      expect(configNextButton).toBeDisabled()

      // Add name only
      await user.type(screen.getByLabelText(/game name/i), 'Test')
      expect(configNextButton).toBeDisabled()

      // Add difficulty
      const difficultySelect = screen.getByRole('combobox')
      await user.click(difficultySelect)
      await user.click(await screen.findByText('Medium'))
      
      // Now should be enabled
      expect(configNextButton).toBeEnabled()
    })
  })

  describe('Default Values Application', () => {
    it('should apply correct defaults when entering configuration', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select Artist Trivia
      await user.click(screen.getByText('Artist Trivia').parentElement?.parentElement!)
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Check defaults are applied
      expect(screen.getByText('Number of Questions: 20')).toBeInTheDocument()
      expect(screen.getByText('Time per Question: 30s')).toBeInTheDocument()
      expect(screen.getByText('~10 min game')).toBeInTheDocument()

      // Music preferences should default to true (checked)
      const recentTracksSwitch = screen.getByLabelText(/include recent tracks/i) as HTMLInputElement
      expect(recentTracksSwitch).toBeChecked()
      
      const topArtistsSwitch = screen.getByLabelText(/include top artists/i) as HTMLInputElement
      expect(topArtistsSwitch).toBeChecked()
    })

    it('should calculate duration correctly with different settings', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select Find Track Art (different defaults)
      await user.click(screen.getByText('Find the Track Art').parentElement?.parentElement!)
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Verify different defaults
      expect(screen.getByText('Number of Questions: 15')).toBeInTheDocument()
      expect(screen.getByText('Time per Question: 45s')).toBeInTheDocument()
      
      // Duration should be: 15 * 45 / 60 = ~12 minutes (rounded up)
      expect(screen.getByText('~12 min game')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should maintain focus management through wizard steps', async () => {
      const { user } = render(<GameCreationWizard />)

      // Initial focus
      await user.tab()
      const firstCard = screen.getAllByRole('button')[0]
      expect(firstCard).toHaveFocus()

      // Select with keyboard
      await user.keyboard('{Enter}')
      
      // Tab through to next button
      let attempts = 0
      while (attempts < 10) {
        await user.tab()
        const activeElement = document.activeElement
        if (activeElement?.textContent?.includes('Next')) {
          break
        }
        attempts++
      }
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toHaveFocus()
      
      await user.keyboard('{Enter}')

      // Focus management after navigation
      // The configuration page should be displayed
      expect(screen.getByText('Configure Game')).toBeInTheDocument()
      expect(screen.getByLabelText(/game name/i)).toBeInTheDocument()
    })

    it('should have proper ARIA labels throughout flow', () => {
      render(<GameCreationWizard />)

      // Progress bar
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()

      // All interactive elements should have accessible names
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })
  })
})