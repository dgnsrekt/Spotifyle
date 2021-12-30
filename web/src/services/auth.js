import urlcat from 'urlcat';
import { BASE_API_URL } from './core';
import axios from 'axios';

export async function fetchSpotifyRedirect(gameCode = null) {
    const params = gameCode ? { game_code: gameCode } : null;
    const url = urlcat(BASE_API_URL, "auth", params);
    try {
        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error(error)
        return error
    }

}

export async function fetchJsonWebToken(code, state) {
    const url = urlcat(BASE_API_URL, "auth", { code, state });
    try {
        const response = await axios.post(url)
        return response.data
    } catch (error) {
        console.error(error)
        return error
    }


}