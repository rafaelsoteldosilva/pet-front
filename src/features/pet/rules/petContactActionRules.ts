// src/features/pet/rules/petContactActionRules.ts

import type {PetRecordStatus} from "@/features/pet/types/petTypes";
import {canEditPetDataByDraftStatusOnly} from "@/features/pet/rules/canEditPetDataByDraftStatusOnly";

export type PetContactAction = "add" | "edit" | "remove";

export type PetContactActionRuleResult = {
    allowed: boolean;
    reason: string | null;
};

function allowed(): PetContactActionRuleResult {
    return {
        allowed: true,
        reason: null,
    };
}

function blocked(reason: string): PetContactActionRuleResult {
    return {
        allowed: false,
        reason,
    };
}

export function canManagePetContacts(
    recordStatus: PetRecordStatus | null | undefined,
): PetContactActionRuleResult {
    if (!recordStatus) {
        return blocked(
            "No se puede modificar contactos porque el estado de la ficha clínica no es válido.",
        );
    }

    if (!canEditPetDataByDraftStatusOnly(recordStatus)) {
        return blocked(
            "No se puede modificar contactos porque la ficha clínica no está en estado borrador.",
        );
    }

    return allowed();
}

export function canAddPetContact(
    recordStatus: PetRecordStatus | null | undefined,
): PetContactActionRuleResult {
    return canManagePetContacts(recordStatus);
}

export function canEditPetContact(
    recordStatus: PetRecordStatus | null | undefined,
): PetContactActionRuleResult {
    return canManagePetContacts(recordStatus);
}

export function canRemovePetContact(
    recordStatus: PetRecordStatus | null | undefined,
): PetContactActionRuleResult {
    return canManagePetContacts(recordStatus);
}

export function canDoPetContactAction(
    action: PetContactAction,
    recordStatus: PetRecordStatus | null | undefined,
): PetContactActionRuleResult {
    switch (action) {
        case "add":
            return canAddPetContact(recordStatus);

        case "edit":
            return canEditPetContact(recordStatus);

        case "remove":
            return canRemovePetContact(recordStatus);

        default:
            return blocked("Acción de contacto no permitida.");
    }
}
