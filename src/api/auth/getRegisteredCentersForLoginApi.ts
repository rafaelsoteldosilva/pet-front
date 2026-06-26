// src/api/auth/getRegisteredCentersForLoginApi.ts

import axiosInstance from "@/api/axiosInstance";

export interface LoginAvailableCenterInterface {
    id: number;
    name: string;
    role: string;
}

export interface GetRegisteredCentersForLoginRequest {
    email: string;
    password: string;
}

export interface GetRegisteredCentersForLoginResponse {
    centers: LoginAvailableCenterInterface[];
}

export async function getRegisteredCentersForLoginApi(
    payload: GetRegisteredCentersForLoginRequest,
): Promise<LoginAvailableCenterInterface[]> {
    const response =
        await axiosInstance.post<GetRegisteredCentersForLoginResponse>(
            "/auth/available-centers/",
            payload,
        );

    return response.data.centers;
}
