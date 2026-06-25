// src/features/pet/rules/petContactPrimaryRules.ts

import type {PetContactLinkInterface} from "@/features/pet/types/petTypes";

export type PrimaryContactRuleResult = {
    allowed: boolean;
    reason: string | null;
};

function allowed(): PrimaryContactRuleResult {
    return {
        allowed: true,
        reason: null,
    };
}

function blocked(reason: string): PrimaryContactRuleResult {
    return {
        allowed: false,
        reason,
    };
}

export function hasActivePrimaryPetContact(
    contacts: PetContactLinkInterface[],
): boolean {
    return contacts.some((contact) => {
        return (
            contact.is_active !== false && contact.is_primary_contact === true
        );
    });
}

export function hasAnotherActivePrimaryPetContact(
    contacts: PetContactLinkInterface[],
    currentPetContactId: number | string | null | undefined,
): boolean {
    return contacts.some((contact) => {
        if (contact.is_active === false) {
            return false;
        }

        return (
            String(contact.id) !== String(currentPetContactId) &&
            contact.is_primary_contact === true
        );
    });
}

export function canSetPetContactAsPrimary(
    contacts: PetContactLinkInterface[],
    currentPetContactId: number | string | null | undefined,
): PrimaryContactRuleResult {
    if (hasAnotherActivePrimaryPetContact(contacts, currentPetContactId)) {
        return blocked(
            "Este paciente ya tiene otro contacto principal activo.",
        );
    }

    return allowed();
}
