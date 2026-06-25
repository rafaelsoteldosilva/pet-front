// src/features/pet/dialogs/shared/petContactLinkPrimaryContactUtils.ts

import type {
    PetDataInterface,
    PetContactLinkInterface,
} from "@/features/pet/types/petTypes";
import {getContactDisplayName} from "@/features/pet/petUtils/petContactDisplayUtils";

type PetContactWithPossibleActiveFlag = PetContactLinkInterface & {
    is_active?: boolean | null;
};

export type PrimaryContactDisabledInfo = {
    hasActivePrimaryContact: boolean;
    primaryContactDisabledReason?: string;
};

function getPetContactId(
    petContact: PetContactLinkInterface | null | undefined,
): number | null {
    if (!petContact) return null;

    const id = Number(petContact.id);

    return Number.isFinite(id) ? id : null;
}

function isSamePetContact(
    firstContact: PetContactLinkInterface | null | undefined,
    secondContact: PetContactLinkInterface | null | undefined,
): boolean {
    const firstId = getPetContactId(firstContact);
    const secondId = getPetContactId(secondContact);

    if (firstId === null || secondId === null) return false;

    return firstId === secondId;
}

function isActivePetContact(petContact: PetContactLinkInterface): boolean {
    const contactWithActiveFlag =
        petContact as PetContactWithPossibleActiveFlag;

    return contactWithActiveFlag.is_active !== false;
}

function getReadablePetContactName(
    petContact: PetContactLinkInterface | null | undefined,
): string | null {
    if (!petContact) return null;

    const name = getContactDisplayName(petContact.center_contact);

    if (!name || name === "—") return null;

    return name;
}

function getPossiblePetContactCollections(
    pet: PetDataInterface,
): Array<PetContactLinkInterface | null | undefined> {
    const primaryContact =
        pet.contact_links?.find(
            (contact) =>
                contact.is_active !== false &&
                contact.is_primary_contact === true,
        ) ?? null;

    return [
        primaryContact,
        ...(pet.contact_links ?? []),
        ...(pet.owner_guardians ?? []),
        ...(pet.caregivers ?? []),
        ...(pet.billing_responsibles ?? []),
        ...(pet.referring_vets ?? []),
        ...(pet.responsible_institution ?? []),
        ...(pet.referring_institutions ?? []),
        ...(pet.breeders ?? []),
        ...(pet.shelters_or_foundations ?? []),
        ...(pet.emergency_contacts ?? []),
        ...(pet.pickup_authorized_contacts ?? []),
        ...(pet.treatment_authorization_contacts ?? []),
        ...(pet.medical_update_contacts ?? []),
        ...(pet.billing_update_contacts ?? []),
    ];
}

function findActivePrimaryContact(
    pet: PetDataInterface,
    currentPetContactToExclude?: PetContactLinkInterface | null,
): PetContactLinkInterface | null {
    const seenIds = new Set<number>();

    for (const candidate of getPossiblePetContactCollections(pet)) {
        if (!candidate) continue;

        const candidateId = getPetContactId(candidate);

        if (candidateId !== null) {
            if (seenIds.has(candidateId)) continue;
            seenIds.add(candidateId);
        }

        if (
            currentPetContactToExclude &&
            isSamePetContact(candidate, currentPetContactToExclude)
        ) {
            continue;
        }

        if (candidate.is_primary_contact !== true) continue;
        if (!isActivePetContact(candidate)) continue;

        return candidate;
    }

    return null;
}

export function getPrimaryContactInfoForAdding(
    pet: PetDataInterface,
): PrimaryContactDisabledInfo {
    const activePrimaryContact = findActivePrimaryContact(pet);
    const activePrimaryContactName =
        getReadablePetContactName(activePrimaryContact);

    if (!activePrimaryContact) {
        return {
            hasActivePrimaryContact: false,
            primaryContactDisabledReason: undefined,
        };
    }

    if (activePrimaryContactName) {
        return {
            hasActivePrimaryContact: true,
            primaryContactDisabledReason:
                `Sólo puede haber un contacto principal. Este paciente ya tiene uno: ` +
                `${activePrimaryContactName}. Para asignar otro, primero edita ` +
                "ese contacto y quítale la marca de contacto principal.",
        };
    }

    return {
        hasActivePrimaryContact: true,
        primaryContactDisabledReason:
            "Este paciente ya tiene un contacto principal. Para asignar otro, " +
            "primero edita el contacto principal actual y quítale esa marca.",
    };
}

export function getPrimaryContactInfoForEdit(
    pet: PetDataInterface,
    currentPetContact: PetContactLinkInterface,
): PrimaryContactDisabledInfo {
    const anotherPrimaryContact = findActivePrimaryContact(
        pet,
        currentPetContact,
    );

    const anotherPrimaryContactName = getReadablePetContactName(
        anotherPrimaryContact,
    );

    if (!anotherPrimaryContact) {
        return {
            hasActivePrimaryContact: false,
            primaryContactDisabledReason: undefined,
        };
    }

    if (anotherPrimaryContactName) {
        return {
            hasActivePrimaryContact: true,
            primaryContactDisabledReason:
                `Este paciente ya tiene otro contacto principal activo: ` +
                `${anotherPrimaryContactName}. Para marcar este contacto como ` +
                "principal, primero debes quitar esa marca del contacto principal actual.",
        };
    }

    return {
        hasActivePrimaryContact: true,
        primaryContactDisabledReason:
            "Este paciente ya tiene otro contacto principal activo. Para marcar este contacto " +
            "como principal, primero debes quitar esa marca del contacto principal actual.",
    };
}
