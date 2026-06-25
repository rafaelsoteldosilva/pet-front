// src/appi/axiosInstance.ts

import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";

import {
    clearAuthStorage,
    getAccessToken,
    getRefreshToken,
    saveAccessToken,
} from "@/shared/auth/authStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
}

type RetriableAxiosRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

function redirectToLogin(): void {
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

axiosInstance.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | RetriableAxiosRequestConfig
            | undefined;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            clearAuthStorage();
            redirectToLogin();

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshResponse = await axios.post<{
                access: string;
                refresh?: string;
            }>(
                `${API_BASE_URL}/auth/refresh/`,
                {
                    refresh: refreshToken,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const newAccessToken = refreshResponse.data.access;

            saveAccessToken(newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axiosInstance(originalRequest);
        } catch (refreshError) {
            clearAuthStorage();
            redirectToLogin();

            return Promise.reject(refreshError);
        }
    },
);

export default axiosInstance;
