import Link from "next/link"
import { getSession } from "@/lib/auth-arctic"

export async function NavAuthSection() {
  const session = await getSession()
  
  return (
    <div>
      {session ? (
        <Link
          href="/dashboard"
          className="rounded-md bg-[#1DB954] px-4 py-2 text-sm font-medium text-white hover:bg-[#1aa34a]"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-[#1DB954] px-4 py-2 text-sm font-medium text-white hover:bg-[#1aa34a]"
        >
          Sign in with Spotify
        </Link>
      )}
    </div>
  )
}