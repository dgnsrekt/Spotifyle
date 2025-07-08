// Re-export auth functions from the modular auth service
// This maintains backward compatibility while using the new modular structure

export { AuthService } from './auth/auth-service'
export { CookieManager } from './auth/cookie-manager'
export { TokenManager } from './auth/token-manager'
export { SpotifyClient } from './auth/spotify-client'
export { DatabaseService } from './auth/db-service'

// Export main auth functions for backward compatibility
export { AuthService as default } from './auth/auth-service'

// Convenience exports
export const createAuthorizationURL = AuthService.createAuthorizationURL
export const handleCallback = AuthService.handleCallback
export const getSession = AuthService.getSession
export const signOut = AuthService.signOut