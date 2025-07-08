import { createAuthorizationURL } from "@/lib/auth-arctic"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const url = await createAuthorizationURL()
    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Failed to create authorization URL:", error)
    return NextResponse.redirect("/login?error=Configuration")
  }
}