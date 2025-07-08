/**
 * Game Configuration Component
 * Allows users to customize their game settings
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Clock, 
  Hash, 
  Zap, 
  Music, 
  TrendingUp,
  Filter
} from 'lucide-react'
import type { GameConfig, PartialGameConfig } from '@/lib/schemas/game-config'
import { QUESTION_COUNT_CONFIGS, TIME_LIMIT_CONFIGS } from '@/lib/schemas/game-config'

interface GameConfigurationProps {
  gameConfig: PartialGameConfig
  onConfigChange: (updates: PartialGameConfig) => void
}

// Configuration options for different game types
const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Broader choices, more time' },
  { value: 'medium', label: 'Medium', description: 'Balanced challenge' },
  { value: 'hard', label: 'Hard', description: 'Similar artists, less time' }
] as const

export function GameConfiguration({ gameConfig, onConfigChange }: GameConfigurationProps) {
  const gameType = gameConfig.type
  if (!gameType) {
    throw new Error('Game type is required for configuration')
  }
  
  const questionConfig = QUESTION_COUNT_CONFIGS[gameType]
  const timeConfig = TIME_LIMIT_CONFIGS[gameType]

  const handleInputChange = (field: keyof GameConfig, value: unknown) => {
    onConfigChange({ [field]: value })
  }

  const currentQuestionCount = gameConfig.questionCount || questionConfig.default
  const currentTimeLimit = gameConfig.timeLimit || timeConfig.default

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Basic Settings
          </CardTitle>
          <CardDescription>
            Configure the core game parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Name */}
          <div className="space-y-2">
            <Label htmlFor="game-name">Game Name</Label>
            <Input
              id="game-name"
              placeholder="Enter a name for your game"
              value={gameConfig.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be visible to other players when you share the game
            </p>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select
              value={gameConfig.difficulty || ''}
              onValueChange={(value) => handleInputChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {option.description}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Question Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Number of Questions: {currentQuestionCount}
              </Label>
              <Badge variant="outline">
                ~{Math.ceil(currentQuestionCount * currentTimeLimit / 60)} min game
              </Badge>
            </div>
            <Slider
              value={[currentQuestionCount]}
              onValueChange={([value]) => handleInputChange('questionCount', value)}
              min={questionConfig.min}
              max={questionConfig.max}
              step={questionConfig.step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{questionConfig.min} (Quick)</span>
              <span>{questionConfig.max} (Extended)</span>
            </div>
          </div>

          {/* Time Limit */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time per Question: {currentTimeLimit}s
            </Label>
            <Slider
              value={[currentTimeLimit]}
              onValueChange={([value]) => handleInputChange('timeLimit', value)}
              min={timeConfig.min}
              max={timeConfig.max}
              step={timeConfig.step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{timeConfig.min}s (Fast)</span>
              <span>{timeConfig.max}s (Relaxed)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Music Preferences
          </CardTitle>
          <CardDescription>
            Choose which parts of your music library to include
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Include Recent Tracks */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Include Recent Tracks
              </Label>
              <p className="text-sm text-muted-foreground">
                Use songs you&apos;ve listened to recently
              </p>
            </div>
            <Switch
              checked={gameConfig.includeRecentTracks ?? true}
              onCheckedChange={(checked) => handleInputChange('includeRecentTracks', checked)}
            />
          </div>

          <Separator />

          {/* Include Top Artists */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Include Top Artists
              </Label>
              <p className="text-sm text-muted-foreground">
                Focus on your most-played artists
              </p>
            </div>
            <Switch
              checked={gameConfig.includeTopArtists ?? true}
              onCheckedChange={(checked) => handleInputChange('includeTopArtists', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Game Type Specific Settings */}
      {gameType === 'artist-trivia' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Trivia Settings
            </CardTitle>
            <CardDescription>
              Customize your trivia experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Questions will be generated about your top artists</p>
              <p>• Includes artist facts, discography, and collaborations</p>
              <p>• Difficulty affects question complexity and choice similarity</p>
            </div>
          </CardContent>
        </Card>
      )}

      {gameType === 'find-track-art' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Visual Game Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Album artwork from your music library</p>
              <p>• Track previews will play automatically</p>
              <p>• Higher difficulty includes similar-looking covers</p>
            </div>
          </CardContent>
        </Card>
      )}

      {gameType === 'multiple-track-lockin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Audio Challenge Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• 30-second track previews</p>
              <p>• Multiple choice with similar-sounding tracks</p>
              <p>• Bonus points for faster identification</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}