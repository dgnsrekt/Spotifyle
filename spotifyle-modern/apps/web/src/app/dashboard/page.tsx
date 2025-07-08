import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth-arctic"
import { LogoutButton } from "@/components/auth/logout-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Play, Trophy, History } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  const initials = session.user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "SP"

  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-semibold">Spotifyle Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {session.user?.email}
                </span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome back, {session.user?.name || "Player"}!
            </CardTitle>
            <CardDescription>
              You&apos;re successfully logged in with Spotify.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/create-game">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create Game</h3>
                      <p className="text-sm text-muted-foreground">Start a new game</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Play Game</h3>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Leaderboard</h3>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <History className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Game History</h3>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main CTA */}
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Ready to create your first game?</h3>
              <p className="text-muted-foreground mb-4">
                Generate personalized music games based on your Spotify listening history
              </p>
              <Link href="/create-game">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Game
                </Button>
              </Link>
            </div>
            
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Debug: Session Data
              </summary>
              <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}