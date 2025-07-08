import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LoginButton } from "@/components/auth/login-button"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string }
}) {
  const session = await auth()
  
  // If already logged in, redirect
  if (session) {
    redirect(searchParams.from || "/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-100">
            Spotifyle
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Music trivia powered by your Spotify
          </p>
        </div>

        <div className="mt-8 space-y-6 bg-gray-800 px-8 py-10 shadow-xl rounded-lg border border-gray-700">
          {searchParams.error && (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              <p className="text-sm">
                There was an error signing in. Please try again.
              </p>
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
              Sign in to play
            </h2>
            
            <LoginButton />
            
            <p className="mt-4 text-xs text-center text-gray-500">
              By signing in, you agree to let Spotifyle access your Spotify
              listening history to create personalized music games.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}