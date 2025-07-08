/**
 * Tests for GameGeneration component
 */

import { screen, waitFor, act } from '@testing-library/react'
import { GameGeneration } from '../game-generation'
import { 
  render, 
  testGameConfigs, 
  createMockHandlers
} from '@/test-utils/game-creation-test-utils'

// Mock timers for animation testing
jest.useFakeTimers()

describe('GameGeneration', () => {
  const { handleConfigChange } = createMockHandlers()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Rendering', () => {
    it('should display generation header', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      expect(screen.getByText('Creating Your Game')).toBeInTheDocument()
      expect(screen.getByText(/Generating your personalized artist trivia game/)).toBeInTheDocument()
    })

    it('should show overall progress bar', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(screen.getByText('Generation Progress')).toBeInTheDocument()
    })

    it('should display all generation steps', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      expect(screen.getByText('Analyzing Spotify Data')).toBeInTheDocument()
      expect(screen.getByText('Selecting Game Content')).toBeInTheDocument()
      expect(screen.getByText('Generating Questions')).toBeInTheDocument()
      expect(screen.getByText('Finalizing Game')).toBeInTheDocument()
    })

    it('should show game configuration summary', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      expect(screen.getByText('Your Game Configuration')).toBeInTheDocument()
      expect(screen.getByText('Complete Test Game')).toBeInTheDocument()
      expect(screen.getByText('artist trivia')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument() // question count
      expect(screen.getByText('hard')).toBeInTheDocument() // difficulty
    })
  })

  describe('Progress Animation', () => {
    it('should start at 0% progress', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should animate through steps when generating', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Initial state - first step should be in progress
      expect(screen.getByText('Analyzing Spotify Data').parentElement?.parentElement).toHaveTextContent('In Progress')

      // Fast-forward first step completion (2000ms)
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText('Analyzing Spotify Data').parentElement?.parentElement).toHaveTextContent('Complete')
      })

      // Second step should now be in progress
      expect(screen.getByText('Selecting Game Content').parentElement?.parentElement).toHaveTextContent('In Progress')
    })

    it('should update progress percentage', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Advance to 25% (first step complete)
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument()
      })
    })

    it('should complete all steps', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Complete all steps (2000 + 1500 + 2500 + 1000 = 7000ms)
      act(() => {
        jest.advanceTimersByTime(7000)
      })

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument()
        expect(screen.getAllByText('Complete')).toHaveLength(4)
      })
    })
  })

  describe('Time Estimation', () => {
    it('should show estimated time remaining', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Total time is 7 seconds
      expect(screen.getByText(/Estimated time remaining: 7 seconds/)).toBeInTheDocument()
    })

    it('should update time remaining as progress increases', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Advance to 50%
      act(() => {
        jest.advanceTimersByTime(3500)
      })

      await waitFor(() => {
        expect(screen.getByText(/Estimated time remaining: [3-4] seconds/)).toBeInTheDocument()
      })
    })
  })

  describe('Different Game Types', () => {
    it('should display correct game type for find-track-art', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.findTrackArt} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      const description = screen.getByText(/Generating your personalized find track art game/)
      expect(description).toBeInTheDocument()
      const configSummary = screen.getByText('find track art', { selector: 'p' })
      expect(configSummary).toBeInTheDocument()
    })

    it('should display correct game type for multiple-track-lockin', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.multipleTrack} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      const description = screen.getByText(/Generating your personalized multiple track lockin game/)
      expect(description).toBeInTheDocument()
      const configSummary = screen.getByText('multiple track lockin', { selector: 'p' })
      expect(configSummary).toBeInTheDocument()
    })
  })

  describe('Step Icons and States', () => {
    it('should show loading spinner for current step', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // First step should have loading indicator
      const firstStep = screen.getByText('Analyzing Spotify Data').closest('[class*="flex items-start"]')
      expect(firstStep).toHaveTextContent('In Progress')
      // Check for animate-spin class on loader
      const loader = firstStep?.querySelector('[class*="animate-spin"]')
      expect(loader).toBeInTheDocument()
    })

    it('should show check icon for completed steps', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Complete first step
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        const firstStep = screen.getByText('Analyzing Spotify Data').closest('[class*="flex items-start"]')
        expect(firstStep).toHaveTextContent('Complete')
        // Should have success styling
        expect(firstStep?.querySelector('[class*="text-green"]')).toBeInTheDocument()
      })
    })
  })

  describe('Tips Section', () => {
    it('should display did you know tip', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      expect(screen.getByText('💡 Did you know?')).toBeInTheDocument()
      expect(screen.getByText(/advanced algorithms that analyze your Spotify listening patterns/)).toBeInTheDocument()
    })
  })

  describe('Non-generating State', () => {
    it('should not animate when isGenerating is false', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={false}
        />
      )

      expect(screen.getByText('0%')).toBeInTheDocument()

      // Advance time
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Should still be at 0%
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible progress information', () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should announce step completion to screen readers', async () => {
      render(
        <GameGeneration 
          gameConfig={testGameConfigs.complete} 
          onConfigChange={handleConfigChange}
          isGenerating={true}
        />
      )

      // Complete first step
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        const completeStep = screen.getByText('Analyzing Spotify Data').closest('[class*="flex items-start"]')
        expect(completeStep).toHaveTextContent('Complete')
      })
    })
  })
})