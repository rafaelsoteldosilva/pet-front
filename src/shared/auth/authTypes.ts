// src/shared/auth/authTypes.ts

export interface LoginRequest {
    email: string;
    password: string;
    veterinary_center_id: number;
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface ActiveCenter {
    id: number;
    name: string;
    role: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: AuthUser;
    active_center: ActiveCenter;
}

export interface RefreshTokenResponse {
    access: string;
}

export interface AuthCenter {
    center_id: number;
    center_name: string;
    role: string;
}

export interface MeResponse {
    user: AuthUser;
    active_center: {
        id: number | null;
        role: string | null;
    };
    centers: AuthCenter[];
}
