/**
 * Game Creation Page
 * Main interface for creating new Spotifyle games
 */

import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GameCreationWizard } from '@/components/game-creation/game-creation-wizard'

export default function CreateGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Create a New Game</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your game type and customize the experience. We&apos;ll generate a unique game 
            based on your Spotify listening history.
          </p>
        </div>

        {/* Game Creation Wizard */}
        <Suspense fallback={<GameCreationSkeleton />}>
          <GameCreationWizard />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for the game creation wizard
 */
function GameCreationSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}