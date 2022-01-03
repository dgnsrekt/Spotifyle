export const BASE_API_URL = "http://134.122.30.228:8000/api"

export function getAuthenticationHeader() {
    const auth = localStorage.getItem("auth")
    const { token_type, access_token } = JSON.parse(auth)
    return { Authorization: token_type + " " + access_token }
}

export function getAuthenticatedUserFromStorage() {
    const user = localStorage.getItem("user")
    if (!user) {
        return null
    }
    return JSON.parse(user)
}
