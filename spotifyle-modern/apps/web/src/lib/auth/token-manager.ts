import crypto from 'crypto'
import type { AuthTokens } from '@/types/auth'

export class TokenManager {
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static generateState(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Buffer.from(digest).toString('base64url')
  }

  static extractTokens(tokenResponse: {
    accessToken: () => string
    refreshToken: () => string | null
    accessTokenExpiresAt: () => Date | null
  }): AuthTokens {
    const accessToken = tokenResponse.accessToken()
    const refreshToken = tokenResponse.refreshToken()
    const expiresAt = tokenResponse.accessTokenExpiresAt()

    return {
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt: expiresAt,
    }
  }

  static isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false
    return new Date() >= expiresAt
  }

  static calculateTokenExpiry(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000)
  }
}