import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-arctic"
import { LogoutButton } from "@/components/auth/logout-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
          <CardContent>
            <p className="text-muted-foreground">Game features coming soon...</p>
            
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