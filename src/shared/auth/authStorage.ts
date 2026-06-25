// src/shared/auth/authStorage.ts

const ACCESS_TOKEN_KEY = "pet_control_access_token";
const REFRESH_TOKEN_KEY = "pet_control_refresh_token";
const ACTIVE_CENTER_ID_KEY = "pet_control_active_center_id";
const ACTIVE_CENTER_NAME_KEY = "pet_control_active_center_name";
const ACTIVE_CENTER_ROLE_KEY = "pet_control_active_center_role";

export function saveLoginSession(params: {
    access: string;
    refresh: string;
    activeCenterId: number;
    activeCenterName: string;
    activeCenterRole: string;
}): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, params.access);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refresh);
    window.localStorage.setItem(
        ACTIVE_CENTER_ID_KEY,
        String(params.activeCenterId),
    );
    window.localStorage.setItem(
        ACTIVE_CENTER_NAME_KEY,
        params.activeCenterName,
    );
    window.localStorage.setItem(
        ACTIVE_CENTER_ROLE_KEY,
        params.activeCenterRole,
    );
}

export function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveAccessToken(access: string): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
}

export function getActiveCenterId(): number | null {
    if (typeof window === "undefined") {
        return null;
    }

    const rawValue = window.localStorage.getItem(ACTIVE_CENTER_ID_KEY);

    if (!rawValue) {
        return null;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isInteger(parsedValue)) {
        return null;
    }

    return parsedValue;
}

export function getActiveCenterRole(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(ACTIVE_CENTER_ROLE_KEY);
}

export function clearAuthStorage(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(ACTIVE_CENTER_ID_KEY);
    window.localStorage.removeItem(ACTIVE_CENTER_NAME_KEY);
    window.localStorage.removeItem(ACTIVE_CENTER_ROLE_KEY);
}
