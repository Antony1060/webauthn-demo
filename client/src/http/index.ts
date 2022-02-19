import axios from "axios";
import { store } from "../store";

export const http = axios.create({
    baseURL: process.env.BASE_URL
});

http.interceptors.request.use(config => {
    const token = store.getState().auth.token;

    if(token && config.headers)
        config.headers["Authorization"] = `Bearer ${token}`;

    return config;
})