"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function HeroCTA() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div className="mt-10 h-12 w-32" />
  }
  
  if (status === "loading") {
    return <div className="mt-10 h-12 w-32 animate-pulse bg-gray-200 rounded-md" />
  }
  
  return (
    <div className="mt-10">
      {session ? (
        <Link
          href="/dashboard"
          className="rounded-md bg-[#1DB954] px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-[#1aa34a]"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-[#1DB954] px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-[#1aa34a]"
        >
          Get Started
        </Link>
      )}
    </div>
  )
}