import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@spotifyle/database'

// Only allow in development
if (process.env.NODE_ENV === 'production') {
  redirect('/')
}

async function getStats() {
  const [users, games, sessions, profiles] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.gameSession.count(),
    prisma.profile.count(),
  ])

  const gamesByType = await prisma.game.groupBy({
    by: ['type'],
    _count: true,
  })

  const gamesByStatus = await prisma.game.groupBy({
    by: ['status'],
    _count: true,
  })

  return {
    users,
    games,
    sessions,
    profiles,
    gamesByType,
    gamesByStatus,
  }
}

async function getTestUser() {
  return await prisma.user.findUnique({
    where: { email: 'test@spotifyle.app' },
    include: {
      profile: true,
      sessions: {
        take: 1,
        orderBy: { expires: 'desc' },
      },
    },
  })
}

async function getRecentGames() {
  return await prisma.game.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      creator: true,
      _count: {
        select: {
          sessions: true,
          stages: true,
        },
      },
    },
  })
}

export default async function DevPage() {
  const stats = await getStats()
  const testUser = await getTestUser()
  const recentGames = await getRecentGames()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Development Tools</h1>
        <p className="text-muted-foreground">
          Database utilities and seed data management for local development
        </p>
      </div>

      <Alert>
        <AlertTitle>⚠️ Development Only</AlertTitle>
        <AlertDescription>
          This page is only available in development mode and will redirect to home in production.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-user">Test User</TabsTrigger>
          <TabsTrigger value="games">Recent Games</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.games}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Game Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">User Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.profiles}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Games by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.gamesByType.map((item) => (
                  <div key={item.type} className="flex justify-between items-center">
                    <span className="text-sm">{item.type.replace(/_/g, ' ')}</span>
                    <Badge>{item._count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Games by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.gamesByStatus.map((item) => (
                  <div key={item.status} className="flex justify-between items-center">
                    <span className="text-sm">{item.status}</span>
                    <Badge variant={
                      item.status === 'COMPLETED' ? 'default' :
                      item.status === 'IN_PROGRESS' ? 'secondary' :
                      'outline'
                    }>
                      {item._count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test-user" className="space-y-4">
          {testUser ? (
            <Card>
              <CardHeader>
                <CardTitle>Test User Details</CardTitle>
                <CardDescription>
                  Use these credentials for testing authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Email</div>
                  <code className="text-sm bg-muted p-2 rounded">{testUser.email}</code>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-medium">User ID</div>
                  <code className="text-sm bg-muted p-2 rounded">{testUser.id}</code>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Spotify ID</div>
                  <code className="text-sm bg-muted p-2 rounded">{testUser.spotifyId}</code>
                </div>
                {testUser.sessions[0] && (
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Session Token</div>
                    <code className="text-sm bg-muted p-2 rounded break-all">
                      {testUser.sessions[0].sessionToken}
                    </code>
                  </div>
                )}
                {testUser.profile && (
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Profile Stats</div>
                    <div className="flex gap-4 text-sm">
                      <span>Games: {testUser.profile.gamesPlayed}</span>
                      <span>Won: {testUser.profile.gamesWon}</span>
                      <span>Score: {testUser.profile.totalScore}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTitle>No test user found</AlertTitle>
              <AlertDescription>
                Run `pnpm db:seed` to create test data including the test user.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <div className="space-y-4">
            {recentGames.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Game {game.code}
                      </CardTitle>
                      <CardDescription>
                        {game.type.replace(/_/g, ' ')} • Created by {game.creator.name}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      game.status === 'COMPLETED' ? 'default' :
                      game.status === 'IN_PROGRESS' ? 'secondary' :
                      'outline'
                    }>
                      {game.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{game._count.stages} stages</span>
                    <span>{game._count.sessions} players</span>
                    <span>Max {game.maxPlayers || '∞'} players</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Commands</CardTitle>
              <CardDescription>
                Useful commands for managing your development database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Seed Database</h4>
                <code className="block text-sm bg-muted p-2 rounded">
                  pnpm db:seed
                </code>
                <p className="text-sm text-muted-foreground">
                  Clears the database and populates it with test data
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Reset Database</h4>
                <code className="block text-sm bg-muted p-2 rounded">
                  pnpm db:push --force-reset
                </code>
                <p className="text-sm text-muted-foreground">
                  Resets the database schema (warning: deletes all data)
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">View Database</h4>
                <code className="block text-sm bg-muted p-2 rounded">
                  pnpm db:studio
                </code>
                <p className="text-sm text-muted-foreground">
                  Opens Prisma Studio to browse and edit data
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Generate Types</h4>
                <code className="block text-sm bg-muted p-2 rounded">
                  pnpm db:generate
                </code>
                <p className="text-sm text-muted-foreground">
                  Regenerates Prisma Client types after schema changes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}