// src/shared/utils/utilityFunctions.ts

import {
    PET_RECORD_STATUS,
    type PetRecordStatus,
} from "@/features/pet/types/petTypes";

type PetWithBirthDate = {
    birth_date?: string | null;
};

export function validateMicrochipCode(value: string): string | null {
    if (value === "") return null;

    if (!/^\d{15}$/.test(value)) {
        return "El código de microchip debe contener exactamente 15 dígitos numéricos.";
    }

    return null;
}

export function validateMicrochipDate(
    value: string,
    context: {pet: PetWithBirthDate},
): string | null {
    if (value === "") return null;

    const birthDate = context.pet.birth_date;

    if (!birthDate) return null;

    if (value < birthDate) {
        return "La fecha de implantación del microchip no puede ser anterior a la fecha de nacimiento de la mascota.";
    }

    return null;
}

export function normalizePetRecordStatus(
    status: PetRecordStatus | string | null | undefined,
): PetRecordStatus | null {
    const normalized = String(status ?? "")
        .trim()
        .toUpperCase();

    switch (normalized) {
        case "DRAFT":
        case "BORRADOR":
            return PET_RECORD_STATUS.DRAFT;

        case "CLINICAL":
        case "CLINICO":
        case "CLÍNICO":
            return PET_RECORD_STATUS.CLINICAL;

        case "ARCHIVED":
        case "ARCHIVADO":
            return PET_RECORD_STATUS.ARCHIVED;

        default:
            return null;
    }
}
