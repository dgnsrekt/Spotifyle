import { signOut } from "@/lib/auth-arctic"
import { NextResponse } from "next/server"

export async function POST() {
  await signOut()
  // Always use 127.0.0.1 for redirects
  return NextResponse.redirect("http://127.0.0.1:3000/")
}