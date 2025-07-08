/**
 * Game Creation Review Component
 * Shows a summary of game settings before creation
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Music, 
  Image as ImageIcon, 
  Layers3,
  Clock, 
  CheckCircle2
} from 'lucide-react'
import type { PartialGameConfig } from '@/lib/schemas/game-config'

interface GameCreationReviewProps {
  gameConfig: PartialGameConfig
  onConfigChange: (updates: PartialGameConfig) => void
}

const gameTypeDetails = {
  'artist-trivia': {
    title: 'Artist Trivia',
    icon: Music,
    description: 'Answer questions about your favorite artists'
  },
  'find-track-art': {
    title: 'Find the Track Art',
    icon: ImageIcon,
    description: 'Match songs to their album artwork'
  },
  'multiple-track-lockin': {
    title: 'Multiple Track Lock-in',
    icon: Layers3,
    description: 'Identify tracks from multiple choice options'
  }
} as const

export function GameCreationReview({ gameConfig }: GameCreationReviewProps) {
  const gameType = gameConfig.type
  if (!gameType) {
    throw new Error('Game type is required for review')
  }
  
  const gameDetails = gameTypeDetails[gameType]
  const Icon = gameDetails.icon

  // Use nullish coalescing to provide proper defaults
  const questionCount = gameConfig.questionCount ?? 0
  const timeLimit = gameConfig.timeLimit ?? 0
  const estimatedDuration = Math.ceil((questionCount * timeLimit) / 60)

  return (
    <div className="space-y-6">
      {/* Game Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Game Overview
          </CardTitle>
          <CardDescription>
            Review your game settings before creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Type */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{gameConfig.name}</h3>
              <p className="text-muted-foreground">{gameDetails.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{gameDetails.title}</Badge>
                <Badge variant="outline" className="capitalize">
                  {gameConfig.difficulty} Difficulty
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Game Settings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Questions & Timing */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timing & Questions
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">{questionCount || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time per question:</span>
                  <span className="font-medium">{timeLimit || 'Not set'}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated duration:</span>
                  <Badge variant="outline">~{estimatedDuration || 0} minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant="secondary" className="capitalize">
                    {gameConfig.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Music Sources */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Music className="h-4 w-4" />
                Music Sources
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Recent tracks:</span>
                  <div className="flex items-center gap-2">
                    {(gameConfig.includeRecentTracks ?? true) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Included</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not included</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Top artists:</span>
                  <div className="flex items-center gap-2">
                    {(gameConfig.includeTopArtists ?? true) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Included</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not included</span>
                    )}
                  </div>
                </div>
                <div className="pt-2 text-xs text-muted-foreground">
                  <p>Game content will be generated from your Spotify listening history</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Type Specific Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {gameDetails.title} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gameType === 'artist-trivia' && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Your trivia game will include questions about:
              </p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Artist biographical information and career highlights
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Album releases and collaborations
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Musical genres and styles
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Awards and achievements
                </li>
              </ul>
            </div>
          )}

          {gameType === 'find-track-art' && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Your visual matching game will feature:
              </p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Album artwork from your music library
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  30-second track previews for identification
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Multiple choice artwork options
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Progressive difficulty with similar album covers
                </li>
              </ul>
            </div>
          )}

          {gameType === 'multiple-track-lockin' && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Your audio challenge will include:
              </p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Track previews from your listening history
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Multiple choice with similar-sounding options
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Bonus points for faster identification
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Genre and tempo variations for challenge
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready to Create */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">
                Ready to Create Your Game!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-200">
                Click &quot;Create Game&quot; to start generating your personalized {gameDetails.title.toLowerCase()} game.
                This process may take a few moments as we analyze your Spotify data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}