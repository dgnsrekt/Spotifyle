export * from '@prisma/client'
export { PrismaClient } from '@prisma/client'

// Re-export enums for easier access
export { GameType, GameStatus } from '@prisma/client'

// Create and export a singleton instance
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export const db = prisma // Alias for compatibility

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma