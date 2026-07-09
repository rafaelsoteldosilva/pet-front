// src/api/shared/getAxiosErrorMessage.ts

import axios from "axios";

type UnknownRecord = Record<string, unknown>;

const DEFAULT_ERROR_MESSAGE =
    "Ocurrió un error inesperado. Intenta nuevamente.";

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function extractMessageFromArray(value: unknown[]): string | null {
    const messages = value
        .map((item) => extractMessageFromValue(item))
        .filter((message): message is string => Boolean(message));

    if (messages.length === 0) {
        return null;
    }

    return messages.join("\n");
}

function extractMessageFromObject(value: UnknownRecord): string | null {
    const preferredKeys = [
        "detail",
        "message",
        "error",
        "pet",
        "non_field_errors",
    ];

    for (const key of preferredKeys) {
        const message = extractMessageFromValue(value[key]);

        if (message) {
            return message;
        }
    }

    const fieldMessages: string[] = [];

    for (const [fieldName, fieldValue] of Object.entries(value)) {
        if (fieldName === "clinical_record_sources") {
            continue;
        }

        const message = extractMessageFromValue(fieldValue);

        if (!message) {
            continue;
        }

        fieldMessages.push(message);
    }

    if (fieldMessages.length === 0) {
        return null;
    }

    return fieldMessages.join("\n");
}

function extractMessageFromValue(value: unknown): string | null {
    const directString = cleanString(value);

    if (directString) {
        return directString;
    }

    if (Array.isArray(value)) {
        return extractMessageFromArray(value);
    }

    if (isRecord(value)) {
        return extractMessageFromObject(value);
    }

    return null;
}

export function getAxiosErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        const responseMessage = extractMessageFromValue(responseData);

        if (responseMessage) {
            return responseMessage;
        }

        const axiosMessage = cleanString(error.message);

        if (axiosMessage) {
            return axiosMessage;
        }

        return DEFAULT_ERROR_MESSAGE;
    }

    if (error instanceof Error) {
        return cleanString(error.message) || DEFAULT_ERROR_MESSAGE;
    }

    return DEFAULT_ERROR_MESSAGE;
}
