export const BASE_API_URL = "http://localhost:8000/api"


export function getAuthenticationHeader() {
    const auth = sessionStorage.getItem("auth")
    const { token_type, access_token } = JSON.parse(auth)
    return { Authorization: token_type + " " + access_token }
}

export function getAuthenticatedUserFromStorage() {
    const user = sessionStorage.getItem("user")
    if (!user) {
        return null
    }
    return JSON.parse(user)
}
