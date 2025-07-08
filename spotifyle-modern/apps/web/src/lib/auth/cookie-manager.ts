import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { authConfig } from '@/config/auth.config'

export class CookieManager {
  static setSessionCookie(sessionToken: string) {
    setCookie(
      authConfig.session.cookieName,
      sessionToken,
      authConfig.session.cookieOptions
    )
  }

  static getSessionCookie(): string | undefined {
    return getCookie(authConfig.session.cookieName) as string | undefined
  }

  static deleteSessionCookie() {
    deleteCookie(authConfig.session.cookieName)
  }

  static setCodeVerifier(codeVerifier: string) {
    setCookie(
      authConfig.cookies.codeVerifier.name,
      codeVerifier,
      authConfig.cookies.codeVerifier.options
    )
  }

  static getCodeVerifier(): string | undefined {
    return getCookie(authConfig.cookies.codeVerifier.name) as string | undefined
  }

  static deleteCodeVerifier() {
    deleteCookie(authConfig.cookies.codeVerifier.name)
  }

  static setState(state: string) {
    setCookie(
      authConfig.cookies.state.name,
      state,
      authConfig.cookies.state.options
    )
  }

  static getState(): string | undefined {
    return getCookie(authConfig.cookies.state.name) as string | undefined
  }

  static deleteState() {
    deleteCookie(authConfig.cookies.state.name)
  }

  static clearAuthCookies() {
    CookieManager.deleteCodeVerifier()
    CookieManager.deleteState()
  }
}