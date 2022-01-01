import urlcat from 'urlcat';
import { BASE_API_URL, getAuthenticationHeader, getAuthenticatedUserFromStorage } from './core';
import axios from 'axios';

export async function fetchGamesCurrentUserPublished(limit = 5) {
    const user = getAuthenticatedUserFromStorage()
    const params = { publisher_id: user.id, limit: limit }
    const url = urlcat(BASE_API_URL, "game/publisher/:publisher_id", params);

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

export async function createNewGame(maxStages = 10) {
    const user = getAuthenticatedUserFromStorage()
    const params = { publisher_id: user.id, max_stages: maxStages }
    const url = urlcat(BASE_API_URL, "game", params);
    const instance = axios.create({
        headers: getAuthenticationHeader()
    })

    try {
        const response = await instance.post(url)
        return response.data
    } catch (error) {
        console.error(error)
        return null
    }

}

export async function checkGameBuildStatus(taskID) {
    const user = getAuthenticatedUserFromStorage()
    const params = { status_id: taskID }
    const url = urlcat(BASE_API_URL, "game/check", params);
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