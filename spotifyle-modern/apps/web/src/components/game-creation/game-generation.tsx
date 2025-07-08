/**
 * Game Generation Component
 * Shows progress while the game is being generated
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Music, 
  Database, 
  Sparkles, 
  CheckCircle2,
  Clock
} from 'lucide-react'
import type { PartialGameConfig } from '@/lib/schemas/game-config'

interface GameGenerationProps {
  gameConfig: PartialGameConfig
  onConfigChange: (updates: PartialGameConfig) => void
  isGenerating?: boolean
}

interface GenerationStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  estimatedTime: number
}

const generationSteps: GenerationStep[] = [
  {
    id: 'spotify-data',
    title: 'Analyzing Spotify Data',
    description: 'Fetching your listening history and preferences',
    icon: Music,
    estimatedTime: 2000
  },
  {
    id: 'content-selection',
    title: 'Selecting Game Content',
    description: 'Choosing the best tracks and artists for your game',
    icon: Database,
    estimatedTime: 1500
  },
  {
    id: 'game-generation',
    title: 'Generating Questions',
    description: 'Creating personalized questions and challenges',
    icon: Sparkles,
    estimatedTime: 2500
  },
  {
    id: 'finalization',
    title: 'Finalizing Game',
    description: 'Optimizing and preparing your game',
    icon: CheckCircle2,
    estimatedTime: 1000
  }
]

export function GameGeneration({ gameConfig, isGenerating }: GameGenerationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const totalEstimatedTime = generationSteps.reduce((sum, step) => sum + step.estimatedTime, 0)
  const currentStep = generationSteps[currentStepIndex]

  useEffect(() => {
    if (!isGenerating) return

    let stepTimer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    const runStep = (stepIndex: number) => {
      if (stepIndex >= generationSteps.length) {
        setProgress(100)
        return
      }

      const step = generationSteps[stepIndex]
      if (!step) {
        throw new Error(`Invalid generation step index: ${stepIndex}`)
      }
      
      const stepProgress = (stepIndex / generationSteps.length) * 100

      setCurrentStepIndex(stepIndex)
      setProgress(stepProgress)

      // Simulate step progress
      let stepProgressValue = 0
      progressTimer = setInterval(() => {
        stepProgressValue += 2
        const totalProgress = stepProgress + (stepProgressValue / 100) * (100 / generationSteps.length)
        setProgress(Math.min(totalProgress, 100))
      }, step.estimatedTime / 50)

      // Complete step after estimated time
      stepTimer = setTimeout(() => {
        clearInterval(progressTimer)
        setCompletedSteps(prev => [...prev, step.id])
        runStep(stepIndex + 1)
      }, step.estimatedTime)
    }

    runStep(0)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(progressTimer)
    }
  }, [isGenerating])

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId)
  const isStepCurrent = (stepId: string) => currentStep?.id === stepId && !isStepCompleted(stepId)

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating Your Game
          </CardTitle>
          <CardDescription>
            Generating your personalized {gameConfig.type?.replace('-', ' ')} game...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generation Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Estimated time remaining: {Math.ceil((100 - progress) * totalEstimatedTime / 100 / 1000)} seconds
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Steps</CardTitle>
          <CardDescription>
            Follow along as we build your personalized game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generationSteps.map((step) => {
              const Icon = step.icon
              const completed = isStepCompleted(step.id)
              const current = isStepCurrent(step.id)

              return (
                <div key={step.id} className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${completed 
                      ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-950 dark:border-green-400' 
                      : current 
                        ? 'bg-primary/10 border-primary text-primary animate-pulse' 
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : current ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${current ? 'text-primary' : completed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {step.title}
                      </h4>
                      {completed && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                          Complete
                        </Badge>
                      )}
                      {current && (
                        <Badge variant="default" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${current ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Game Configuration Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Your Game Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{gameConfig.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium capitalize">{gameConfig.type?.replace('-', ' ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Questions:</span>
              <p className="font-medium">{gameConfig.questionCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty:</span>
              <p className="font-medium capitalize">{gameConfig.difficulty}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              💡 Did you know?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Your game content is generated using advanced algorithms that analyze your Spotify 
              listening patterns to create the most engaging and personalized experience possible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}