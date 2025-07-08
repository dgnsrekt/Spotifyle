import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-100">Spotifyle Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {session.user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gray-800 p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Welcome back, {session.user?.name || "Player"}!
          </h2>
          
          <div className="prose prose-invert text-gray-300">
            <p>You're successfully logged in with Spotify.</p>
            <p>Game features coming soon...</p>
            
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-medium text-gray-400">
                Debug: Session Data
              </summary>
              <pre className="mt-2 text-xs bg-gray-900 p-4 rounded overflow-auto border border-gray-700">
                {JSON.stringify(session, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </main>
    </div>
  )
}