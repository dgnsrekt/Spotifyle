import { cookies } from "next/headers";
import type { Session } from "../../src/types/auth";

/**
 * Get the current session from cookies (server-side only)
 * This should be used in API routes and server components
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) {
      return null;
    }

    // Parse and validate session
    const session = JSON.parse(sessionCookie.value) as Session;
    
    // Check if session is expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

/**
 * Validate session
 */
export async function validateSession(): Promise<Session | null> {
  try {
    const session = await getServerSession();
    if (!session) {
      return null;
    }

    // If session is close to expiring, return null (client should refresh)
    if (session.expiresAt) {
      const expiresIn = new Date(session.expiresAt).getTime() - Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresIn < fiveMinutes) {
        // Session is about to expire
        return null;
      }
    }

    return session;
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}