import { PrismaClient } from '@prisma/client'
import type { Session, User } from '@/types/auth'
import { SessionError } from '@/types/auth'

// Singleton pattern for Prisma client
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export class DatabaseService {
  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      })
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  static async findUserBySpotifyId(spotifyId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { spotifyId },
      })
    } catch (error) {
      console.error('Error finding user by Spotify ID:', error)
      return null
    }
  }

  static async upsertUser(data: {
    email: string
    spotifyId: string
    name: string | null
    image: string | null
  }): Promise<User> {
    return await prisma.user.upsert({
      where: { email: data.email },
      update: {
        spotifyId: data.spotifyId,
        name: data.name,
        image: data.image,
      },
      create: data,
    })
  }

  static async createSession(data: {
    userId: string
    sessionToken: string
    accessToken: string
    refreshToken: string | null
    expiresAt: Date | null
  }): Promise<Session> {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const session = await prisma.session.create({
      data: {
        ...data,
        expires,
      },
      include: { user: true },
    })

    // Type assertion since we know we just created it with a valid accessToken
    return session as Session
  }

  static async findSessionByToken(sessionToken: string): Promise<Session | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })

      if (!session) return null

      // Check if session is expired
      if (new Date() > session.expires) {
        await DatabaseService.deleteSession(sessionToken)
        return null
      }

      // Check if session has access token
      if (!session.accessToken) {
        return null
      }

      return session as Session
    } catch (error) {
      console.error('Error finding session:', error)
      return null
    }
  }

  static async updateSessionTokens(
    sessionToken: string,
    data: {
      accessToken: string
      refreshToken: string | null
      expiresAt: Date | null
    }
  ): Promise<Session> {
    const session = await prisma.session.update({
      where: { sessionToken },
      data,
      include: { user: true },
    })

    if (!session) {
      throw new SessionError('Session not found')
    }

    return session as Session
  }

  static async deleteSession(sessionToken: string): Promise<void> {
    try {
      await prisma.session.delete({
        where: { sessionToken },
      })
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  static async deleteExpiredSessions(): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      })
    } catch (error) {
      console.error('Error deleting expired sessions:', error)
    }
  }
}

// Type augmentation for global prisma
declare global {
  var prisma: PrismaClient | undefined
}