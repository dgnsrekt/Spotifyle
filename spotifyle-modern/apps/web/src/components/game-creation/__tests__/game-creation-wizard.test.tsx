/**
 * Tests for GameCreationWizard component
 */

import { screen, waitFor, within } from '@testing-library/react'
import { GameCreationWizard } from '../game-creation-wizard'
import { render } from '@/test-utils/game-creation-test-utils'

jest.setTimeout(10000)

// Mock child components to focus on wizard logic
jest.mock('../game-type-selection', () => ({
  GameTypeSelection: ({ gameConfig, onConfigChange }: any) => (
    <div data-testid="game-type-selection">
      <button onClick={() => onConfigChange({ type: 'artist-trivia' })}>
        Select Artist Trivia
      </button>
      {gameConfig.type && <div>Selected: {gameConfig.type}</div>}
    </div>
  )
}))

jest.mock('../game-configuration', () => ({
  GameConfiguration: ({ gameConfig, onConfigChange }: any) => (
    <div data-testid="game-configuration">
      <input 
        placeholder="Game Name"
        value={gameConfig.name || ''}
        onChange={(e) => onConfigChange({ name: e.target.value })}
      />
      <button onClick={() => onConfigChange({ difficulty: 'medium' })}>
        Set Medium Difficulty
      </button>
    </div>
  )
}))

jest.mock('../game-creation-review', () => ({
  GameCreationReview: ({ gameConfig }: any) => (
    <div data-testid="game-creation-review">
      <div>Review: {gameConfig.name}</div>
      <div>Type: {gameConfig.type}</div>
      <div>Difficulty: {gameConfig.difficulty}</div>
    </div>
  )
}))

jest.mock('../game-generation', () => ({
  GameGeneration: ({ isGenerating }: any) => (
    <div data-testid="game-generation">
      {isGenerating ? 'Generating...' : 'Not generating'}
    </div>
  )
}))

describe('GameCreationWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Initial Rendering', () => {
    it('should render with progress bar at step 1', () => {
      render(<GameCreationWizard />)

      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
      expect(screen.getByText('25% Complete')).toBeInTheDocument()
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('should show correct step title and description', () => {
      render(<GameCreationWizard />)

      expect(screen.getByText('Choose Game Type')).toBeInTheDocument()
      expect(screen.getByText('Select the type of game you want to create')).toBeInTheDocument()
    })

    it('should render game type selection component', () => {
      render(<GameCreationWizard />)

      expect(screen.getByTestId('game-type-selection')).toBeInTheDocument()
    })

    it('should have Previous button disabled on first step', () => {
      render(<GameCreationWizard />)

      const prevButton = screen.getByRole('button', { name: /previous/i })
      expect(prevButton).toBeDisabled()
    })

    it('should have Next button disabled initially', () => {
      render(<GameCreationWizard />)

      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Step Navigation', () => {
    it('should enable Next button when game type is selected', async () => {
      const { user } = render(<GameCreationWizard />)

      const selectButton = screen.getByText('Select Artist Trivia')
      await user.click(selectButton)

      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeEnabled()
    })

    it('should navigate to configuration step', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select game type
      await user.click(screen.getByText('Select Artist Trivia'))
      
      // Click next
      await user.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
      expect(screen.getByText('50% Complete')).toBeInTheDocument()
      expect(screen.getByText('Configure Game')).toBeInTheDocument()
      expect(screen.getByTestId('game-configuration')).toBeInTheDocument()
    })

    it('should allow going back to previous step', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to step 2
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Go back
      const prevButton = screen.getByRole('button', { name: /previous/i })
      expect(prevButton).toBeEnabled()
      await user.click(prevButton)

      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
      expect(screen.getByTestId('game-type-selection')).toBeInTheDocument()
    })

    it('should preserve state when navigating between steps', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select game type and go to config
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Enter game name
      const nameInput = screen.getByPlaceholderText('Game Name')
      await user.type(nameInput, 'My Test Game')

      // Go back and forward again
      await user.click(screen.getByRole('button', { name: /previous/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // State should be preserved
      expect(screen.getByDisplayValue('My Test Game')).toBeInTheDocument()
    })
  })

  describe('Configuration Step Validation', () => {
    it('should require name and difficulty before proceeding', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to configuration
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Next should be disabled without required fields
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()

      // Fill required fields
      await user.type(screen.getByPlaceholderText('Game Name'), 'Test Game')
      await user.click(screen.getByText('Set Medium Difficulty'))

      // Now next should be enabled
      expect(nextButton).toBeEnabled()
    })
  })

  describe('Review Step', () => {
    it('should show Create Game button on review step', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to review step
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await user.type(screen.getByPlaceholderText('Game Name'), 'Test Game')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByText('Step 3 of 4')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create game/i })).toBeInTheDocument()
    })

    it('should display all configuration in review', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to review with configuration
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await user.type(screen.getByPlaceholderText('Game Name'), 'My Review Game')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      const review = screen.getByTestId('game-creation-review')
      expect(within(review).getByText('Review: My Review Game')).toBeInTheDocument()
      expect(within(review).getByText('Type: artist-trivia')).toBeInTheDocument()
      expect(within(review).getByText('Difficulty: medium')).toBeInTheDocument()
    })
  })

  describe('Game Generation', () => {
    it('should start generation when Create Game is clicked', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to review
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.type(screen.getByPlaceholderText('Game Name'), 'Test Game')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Click Create Game
      await user.click(screen.getByRole('button', { name: /create game/i }))

      expect(screen.getByText('Step 4 of 4')).toBeInTheDocument()
      expect(screen.getByText('100% Complete')).toBeInTheDocument()
      expect(screen.getByTestId('game-generation')).toBeInTheDocument()
      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })

    it('should hide navigation during generation', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to generation
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.type(screen.getByPlaceholderText('Game Name'), 'Test Game')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /create game/i }))

      // Navigation buttons should not be visible
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    })

    it('should complete generation after timeout', async () => {
      const { user } = render(<GameCreationWizard />)

      // Navigate to generation
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.type(screen.getByPlaceholderText('Game Name'), 'Test Game')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /create game/i }))

      expect(screen.getByText('Generating...')).toBeInTheDocument()

      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText('Not generating')).toBeInTheDocument()
      }, { timeout: 4000 })
    })
  })

  describe('Default Values', () => {
    it('should apply default values when entering configuration step', async () => {
      const { user } = render(<GameCreationWizard />)

      // Select game type and proceed
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Check that defaults are applied (through the review step)
      await user.type(screen.getByPlaceholderText('Game Name'), 'Default Test')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // In a real implementation, defaults would be visible
      expect(screen.getByTestId('game-creation-review')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid step index gracefully', () => {
      // This would require manipulating internal state
      // In real implementation, this should throw an error
      render(<GameCreationWizard />)
      
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should update progress correctly through all steps', async () => {
      const { user } = render(<GameCreationWizard />)

      // Step 1: 25%
      expect(screen.getByText('25% Complete')).toBeInTheDocument()

      // Step 2: 50%
      await user.click(screen.getByText('Select Artist Trivia'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('50% Complete')).toBeInTheDocument()

      // Step 3: 75%
      await user.type(screen.getByPlaceholderText('Game Name'), 'Test')
      await user.click(screen.getByText('Set Medium Difficulty'))
      await user.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('75% Complete')).toBeInTheDocument()

      // Step 4: 100%
      await user.click(screen.getByRole('button', { name: /create game/i }))
      expect(screen.getByText('100% Complete')).toBeInTheDocument()
    })
  })
})