import urlcat from 'urlcat';
import { BASE_API_URL, getAuthenticationHeader, getAuthenticatedUserFromStorage } from './core';
import axios from 'axios';

export async function fetchCurrentUsersGameStats(limit = 5) {
    const user = getAuthenticatedUserFromStorage()
    const params = { player_id: user.id }
    const url = urlcat(BASE_API_URL, "play/profile", params);

    const instance = axios.create({
        headers: getAuthenticationHeader()
    })

    try {
        const response = await instance.get(url)
        return response.data
    } catch (error) {
        console.error(error)
        return null
    }

}