"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function NavAuthSection() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div className="h-10 w-32" />
  }
  
  if (status === "loading") {
    return <div className="h-10 w-32 animate-pulse bg-gray-200 rounded-md" />
  }
  
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