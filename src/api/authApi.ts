// src/api/authApi.ts

import axios from "axios";

import axiosInstance from "@/api/axiosInstance";

import {
    LoginRequest,
    LoginResponse,
    MeResponse,
    RefreshTokenResponse,
} from "@/shared/auth/authTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
}

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login/`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    return response.data;
}

export async function refreshTokenApi(
    refresh: string,
): Promise<RefreshTokenResponse> {
    const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh/`,
        {
            refresh,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    return response.data;
}

export async function logoutApi(refresh: string): Promise<void> {
    await axiosInstance.post("/auth/logout/", {
        refresh,
    });
}

export async function getMeApi(): Promise<MeResponse> {
    const response = await axiosInstance.get<MeResponse>("/auth/me/");

    return response.data;
}
