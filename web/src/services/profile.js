import urlcat from 'urlcat';
import { BASE_API_URL, getAuthenticationHeader } from './core';
import axios from 'axios';

export async function fetchCurrentUsersProfile() {
    const url = urlcat(BASE_API_URL, "profile/me");
    try {
        const instance = axios.create({
            headers: getAuthenticationHeader()
        })
        const response = await instance.get(url)
        return response.data
    } catch (error) {
        console.error(error)
        return null
    }

}

export async function updateCurrentUsersProfile(profileData) {
    const url = urlcat(BASE_API_URL, "profile/me");
    const instance = axios.create({
        headers: getAuthenticationHeader()
    })

    try {
        const response = await instance.put(url, profileData)
        return response.data
    } catch (error) {
        console.error(error)
        return error
    }

}

