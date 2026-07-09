// src/api/getApiErrorMessage.ts

import axios from "axios";

type ApiErrorResponse = {
    detail?: unknown;
    non_field_errors?: unknown;
    [key: string]: unknown;
};

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const responseData = error.response?.data;

        if (typeof responseData?.detail === "string") {
            return responseData.detail;
        }

        if (Array.isArray(responseData?.non_field_errors)) {
            return responseData.non_field_errors.join(" ");
        }

        if (responseData && typeof responseData === "object") {
            const firstFieldError = Object.values(responseData).find(
                (value) => typeof value === "string" || Array.isArray(value),
            );

            if (typeof firstFieldError === "string") {
                return firstFieldError;
            }

            if (Array.isArray(firstFieldError)) {
                return firstFieldError.join(" ");
            }
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}
