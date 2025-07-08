"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    >
      Sign out
    </button>
  )
}