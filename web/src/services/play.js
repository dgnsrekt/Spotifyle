import urlcat from 'urlcat';
import { BASE_API_URL, getAuthenticationHeader, getAuthenticatedUserFromStorage } from './core';
import axios from 'axios';

export async function fetchCurrentUsersGameStats() {
    const user = getAuthenticatedUserFromStorage()
    if (!user) {
        return null
    }
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

export async function fetchGameData(gameCode) {
    const user = getAuthenticatedUserFromStorage()
    const params = { player_id: user.id, game_code: gameCode }
    const url = urlcat(BASE_API_URL, "play", params);

    const instance = axios.create({
        headers: getAuthenticationHeader()
    })
    try {
        const response = await instance.get(url)
        return response.data
    } catch (error) {
        throw new Error(error.response.data)
    }
}

export async function submitAnswer(choiceID, wager) {
    const user = getAuthenticatedUserFromStorage()
    const params = { player_id: user.id, choice_id: choiceID, wager: wager }
    const url = urlcat(BASE_API_URL, "play/answer", params);

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

export async function submitStageThreeAnswer(wager, answerBody) {
    const user = getAuthenticatedUserFromStorage()
    const params = { player_id: user.id, wager: wager }
    const url = urlcat(BASE_API_URL, "play/answer/three", params);

    const instance = axios.create({
        headers: getAuthenticationHeader()
    })

    try {
        const response = await instance.post(url, answerBody)
        return response.data
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function consumeStar() {
    const user = getAuthenticatedUserFromStorage()
    const params = { player_id: user.id }
    const url = urlcat(BASE_API_URL, "play/star", params);

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