/**
 * Game Creation Wizard
 * Multi-step wizard for creating Spotifyle games
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GameTypeSelection } from './game-type-selection'
import { GameConfiguration } from './game-configuration'
import { GameGeneration } from './game-generation'
import { GameCreationReview } from './game-creation-review'
import type {
  PartialGameConfig
} from '@/lib/schemas/game-config'
import {
  applyGameConfigDefaults
} from '@/lib/schemas/game-config'

interface StepProps {
  gameConfig: PartialGameConfig
  onConfigChange: (updates: PartialGameConfig) => void
  isGenerating?: boolean
}

export interface GameCreationStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<StepProps>
}

const steps: GameCreationStep[] = [
  {
    id: 'type',
    title: 'Choose Game Type',
    description: 'Select the type of game you want to create',
    component: GameTypeSelection,
  },
  {
    id: 'configure',
    title: 'Configure Game',
    description: 'Customize your game settings',
    component: GameConfiguration,
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your settings and create the game',
    component: GameCreationReview,
  },
  {
    id: 'generate',
    title: 'Generating Game',
    description: 'We are creating your personalized game',
    component: GameGeneration,
  },
]

export function GameCreationWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [gameConfig, setGameConfig] = useState<PartialGameConfig>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const currentStep = steps[currentStepIndex]
  if (!currentStep) {
    throw new Error(`Invalid step index: ${currentStepIndex}`)
  }
  
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1
  const isReviewStep = currentStep.id === 'review'
  const isGenerationStep = currentStep.id === 'generate'

  const progress = ((currentStepIndex + 1) / steps.length) * 100


  const handlePrevious = () => {
    if (!isFirstStep && !isGenerating) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleConfigChange = (updates: PartialGameConfig) => {
    setGameConfig(prev => ({ ...prev, ...updates }))
  }

  // Set default values when moving to configuration step
  const handleNext = async () => {
    if (currentStep.id === 'type' && gameConfig.type && currentStepIndex === 0) {
      // Apply defaults when entering configuration step
      const configWithDefaults = applyGameConfigDefaults(gameConfig.type, gameConfig)
      setGameConfig(configWithDefaults)
    }
    
    if (isReviewStep && !isGenerating) {
      // Start game generation
      setIsGenerating(true)
      setCurrentStepIndex(currentStepIndex + 1)
      
      // TODO: Implement actual game generation logic
      // For now, simulate the process
      setTimeout(() => {
        setIsGenerating(false)
        // Navigate to game or show completion
      }, 3000)
    } else if (!isLastStep && !isGenerating) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const isNextDisabled = () => {
    switch (currentStep.id) {
      case 'type':
        return !gameConfig.type
      case 'configure':
        return !gameConfig.name || !gameConfig.difficulty
      case 'generate':
        return true
      default:
        return false
    }
  }

  const StepComponent = currentStep.component

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Content */}
          <div className="mb-8">
            <StepComponent
              gameConfig={gameConfig}
              onConfigChange={handleConfigChange}
              isGenerating={isGenerating}
            />
          </div>

          {/* Navigation */}
          {!isGenerationStep && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep || isGenerating}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={isNextDisabled() || isGenerating}
                className="flex items-center gap-2"
              >
                {isReviewStep ? 'Create Game' : 'Next'}
                {!isReviewStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}