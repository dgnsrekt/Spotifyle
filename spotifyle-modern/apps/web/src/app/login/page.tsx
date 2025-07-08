import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-arctic"
import { LoginButton } from "@/components/auth/login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>
}) {
  const session = await getSession()
  const params = await searchParams
  
  // If already logged in, redirect
  if (session) {
    redirect(params.from || "/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Spotifyle
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Music trivia powered by your Spotify
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to play</CardTitle>
            {params.error && (
              <CardDescription className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mt-4">
                There was an error signing in. Please try again.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginButton />
            
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to let Spotifyle access your Spotify
              listening history to create personalized music games.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}