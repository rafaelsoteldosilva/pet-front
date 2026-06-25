// src/shared/utils/chileanRutUtils.ts

export const CHILEAN_RUT_INCOMPLETE_MESSAGE =
    "Ingresa un RUT completo. Ejemplo: 26.445.363-1.";

export const CHILEAN_RUT_INVALID_MESSAGE =
    "Ingresa un RUT chileno válido. Ejemplo: 26.445.363-1.";

const RUT_BODY_MIN_LENGTH = 7;
const RUT_BODY_MAX_LENGTH = 8;

export function cleanChileanRut(value: unknown): string {
    if (typeof value !== "string" && typeof value !== "number") {
        return "";
    }

    return String(value)
        .toUpperCase()
        .replace(/[^0-9K]/g, "");
}

export function formatChileanRut(value: unknown): string {
    const cleanValue = cleanChileanRut(value);

    if (!cleanValue) {
        return "";
    }

    if (cleanValue.length === 1) {
        return cleanValue;
    }

    const body = cleanValue.slice(0, -1);
    const verificationDigit = cleanValue.slice(-1);

    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedBody}-${verificationDigit}`;
}

function calculateChileanRutVerificationDigit(body: string): string {
    let sum = 0;
    let multiplier = 2;

    for (let index = body.length - 1; index >= 0; index -= 1) {
        sum += Number(body[index]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = 11 - (sum % 11);

    if (remainder === 11) return "0";
    if (remainder === 10) return "K";

    return String(remainder);
}

export function getChileanRutValidationMessage(value: unknown): string | null {
    const cleanValue = cleanChileanRut(value);

    if (!cleanValue) {
        return null;
    }

    if (cleanValue.length < RUT_BODY_MIN_LENGTH + 1) {
        return CHILEAN_RUT_INCOMPLETE_MESSAGE;
    }

    const body = cleanValue.slice(0, -1);
    const verificationDigit = cleanValue.slice(-1);

    if (!/^\d+$/.test(body)) {
        return CHILEAN_RUT_INVALID_MESSAGE;
    }

    if (!/^[0-9K]$/.test(verificationDigit)) {
        return CHILEAN_RUT_INVALID_MESSAGE;
    }

    if (body.length < RUT_BODY_MIN_LENGTH) {
        return CHILEAN_RUT_INCOMPLETE_MESSAGE;
    }

    if (body.length > RUT_BODY_MAX_LENGTH) {
        return CHILEAN_RUT_INVALID_MESSAGE;
    }

    const expectedVerificationDigit =
        calculateChileanRutVerificationDigit(body);

    if (verificationDigit !== expectedVerificationDigit) {
        return CHILEAN_RUT_INVALID_MESSAGE;
    }

    return null;
}
