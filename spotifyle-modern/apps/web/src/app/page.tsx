import { NavAuthSection } from "@/components/nav-auth-section"
import { HeroCTA } from "@/components/hero-cta"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-100">Spotifyle</h1>
            <NavAuthSection />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
              Music trivia powered by{" "}
              <span className="text-[#1DB954]">your Spotify</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              Challenge your friends with personalized music games based on your
              listening history. How well do you really know your favorite
              artists?
            </p>
            <HeroCTA />
          </div>

          <div className="mt-24 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-[#1DB954]">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-100">
                Artist Trivia
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Test your knowledge about your favorite artists
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-[#1DB954]">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-100">
                Find Track Art
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Match songs to their album artwork
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-[#1DB954]">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-100">
                Track Lock-in
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Identify tracks from multiple choices
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            © 2025 Spotifyle. A modern music trivia experience.
          </p>
        </div>
      </footer>
    </div>
  )
}