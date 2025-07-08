import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-arctic"

export async function GET() {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ user: null })
  }
  
  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    }
  })
}