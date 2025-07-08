import Link from "next/link"
import { getSession } from "@/lib/auth-arctic"

export async function HeroCTA() {
  const session = await getSession()
  
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