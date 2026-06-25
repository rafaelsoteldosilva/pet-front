// src/app/api/shared/getAxiosErrorMessage.ts

import axios, {AxiosError} from "axios";

type ErrorDetail = {
    detail?: string;
    [key: string]: unknown;
};

export function getAxiosErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorDetail>;

        const data = axiosError.response?.data;
        const detail =
            typeof data?.detail === "string" ? data.detail : undefined;

        return (
            detail ||
            axiosError.message ||
            "Error desconocido en la comunicación con el servidor"
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Error desconocido";
}
