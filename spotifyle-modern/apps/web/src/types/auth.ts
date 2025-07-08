// Authentication Types

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  user: User
}

export interface User {
  id: string
  email: string
  emailVerified: Date | null
  name: string | null
  image: string | null
  spotifyId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
}

export interface AuthorizationParams {
  state: string
  codeVerifier: string
  redirectUrl?: string
}

export interface AuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class OAuthError extends AuthError {
  constructor(message: string, code: string) {
    super(message, code, 400)
    this.name = 'OAuthError'
  }
}

export class SessionError extends AuthError {
  constructor(message: string) {
    super(message, 'SESSION_ERROR', 401)
    this.name = 'SessionError'
  }
}