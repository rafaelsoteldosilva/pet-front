// src/shared/auth/authService.ts

import {getMeApi, loginApi, logoutApi} from "@/api/authApi";
import {
    clearAuthStorage,
    getRefreshToken,
    saveLoginSession,
} from "@/shared/auth/authStorage";
import {LoginRequest, LoginResponse, MeResponse} from "@/shared/auth/authTypes";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await loginApi(payload);

    saveLoginSession({
        access: response.access,
        refresh: response.refresh,
        activeCenterId: response.active_center.id,
        activeCenterName: response.active_center.name,
        activeCenterRole: response.active_center.role,
    });

    return response;
}

export async function getCurrentSession(): Promise<MeResponse> {
    return await getMeApi();
}

export async function logout(): Promise<void> {
    const refreshToken = getRefreshToken();

    try {
        if (refreshToken) {
            await logoutApi(refreshToken);
        }
    } finally {
        clearAuthStorage();

        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }
}
