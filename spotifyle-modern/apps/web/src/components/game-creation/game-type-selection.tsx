/**
 * Game Type Selection Component
 * Allows users to choose between different game types
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Music, 
  Image as ImageIcon, 
  Layers3,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import type { GameType, PartialGameConfig } from '@/lib/schemas/game-config'

interface GameTypeOption {
  id: GameType
  title: string
  description: string
  longDescription: string
  icon: React.ComponentType<{ className?: string }>
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  playerCount: string
  features: string[]
}

const gameTypes: GameTypeOption[] = [
  {
    id: 'artist-trivia',
    title: 'Artist Trivia',
    description: 'Test your knowledge about your favorite artists',
    longDescription: 'Answer questions about the artists you listen to most. Questions are generated from your top artists and their details like genres, albums, and career facts.',
    icon: Music,
    difficulty: 'Easy',
    estimatedTime: '5-10 min',
    playerCount: '1-8 players',
    features: [
      'Questions about your top artists',
      'Multiple choice format', 
      'Difficulty scales with your music taste',
      'Artist photos and album covers'
    ]
  },
  {
    id: 'find-track-art',
    title: 'Find the Track Art',
    description: 'Match songs to their album artwork',
    longDescription: 'Listen to track previews and identify the correct album artwork. This game tests your visual memory and knowledge of album covers from your music library.',
    icon: ImageIcon,
    difficulty: 'Medium',
    estimatedTime: '7-12 min',
    playerCount: '1-6 players',
    features: [
      'Visual matching gameplay',
      'Track preview audio',
      'Album art from your library',
      'Increasing difficulty levels'
    ]
  },
  {
    id: 'multiple-track-lockin',
    title: 'Multiple Track Lock-in',
    description: 'Identify tracks from multiple choice options',
    longDescription: 'Listen to track previews and choose the correct song from multiple options. The challenge increases as similar-sounding tracks and artists are included in the choices.',
    icon: Layers3,
    difficulty: 'Hard',
    estimatedTime: '10-15 min',
    playerCount: '1-4 players',
    features: [
      'Audio-based identification',
      'Progressive difficulty',
      'Genre and tempo variations',
      'Bonus rounds with rare tracks'
    ]
  }
]

interface GameTypeSelectionProps {
  gameConfig: PartialGameConfig
  onConfigChange: (updates: PartialGameConfig) => void
}

export function GameTypeSelection({ gameConfig, onConfigChange }: GameTypeSelectionProps) {
  const handleGameTypeSelect = (gameType: GameType) => {
    onConfigChange({ type: gameType })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {gameTypes.map((type) => {
          const isSelected = gameConfig.type === type.id
          const Icon = type.icon

          return (
            <Card
              key={type.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "hover:border-primary/50"
              )}
              onClick={() => handleGameTypeSelect(type.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleGameTypeSelect(type.id)
                }
              }}
              aria-pressed={isSelected}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                  <Icon className={cn(
                    "h-8 w-8",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
                <CardDescription className="text-sm">
                  {type.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Game Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Difficulty: {type.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{type.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{type.playerCount}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Features:</h4>
                  <div className="space-y-1">
                    {type.features.slice(0, 2).map((feature) => (
                      <div key={feature} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="h-1 w-1 bg-primary rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="pt-2">
                    <Badge variant="default" className="w-full justify-center">
                      Selected
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Game Details */}
      <Card className={cn(
        "bg-muted/30 transition-all duration-300 min-h-[200px]",
        !gameConfig.type && "opacity-50"
      )}>
        <CardHeader>
          <CardTitle className="text-lg">
            {gameConfig.type 
              ? gameTypes.find(t => t.id === gameConfig.type)?.title 
              : "Select a Game Type"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gameConfig.type ? (
            <>
              <p className="text-muted-foreground mb-4">
                {gameTypes.find(t => t.id === gameConfig.type)?.longDescription}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">All Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {gameTypes.find(t => t.id === gameConfig.type)?.features.map((feature) => (
                    <div key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Choose one of the game types above to see more details about the gameplay and features.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}