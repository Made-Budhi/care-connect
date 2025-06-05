import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

export const axiosPublic = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    timeout: 10000,
})

export const axiosPrivate = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    timeout: 10000,
});