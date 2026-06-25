// src/features/pet/petUtils/petContactDisplayUtils.ts

import type {
    CenterContactSummaryInterface,
    PetContactLinkInterface,
} from "@/features/pet/types/petTypes";

type ContactLike = CenterContactSummaryInterface;
type UnknownRecord = Record<string, unknown>;

function getRecordValue(obj: unknown, key: string): unknown {
    if (!obj || typeof obj !== "object") return undefined;

    return (obj as UnknownRecord)[key];
}

function getStringValue(obj: unknown, key: string): string | null {
    const value = getRecordValue(obj, key);

    if (typeof value === "string") {
        const cleanValue = value.trim();
        return cleanValue || null;
    }

    if (typeof value === "number") {
        return String(value);
    }

    return null;
}

function getBooleanValue(obj: unknown, key: string): boolean {
    const value = getRecordValue(obj, key);

    return value === true;
}

export function getContactDisplayName(
    contact: ContactLike | null | undefined,
): string {
    if (!contact) return "—";

    const displayName = getStringValue(contact, "display_name");

    if (displayName) {
        return displayName;
    }

    const centerContactType = getStringValue(
        contact,
        "center_contact_type",
    )?.toUpperCase();

    const institutionName = getStringValue(contact, "institution_name");

    if (centerContactType === "INSTITUTION" && institutionName) {
        return institutionName;
    }

    const firstName = getStringValue(contact, "first_name") ?? "";
    const lastName = getStringValue(contact, "last_name") ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || institutionName || "—";
}

export function getPrimaryPhone(
    contact: ContactLike | null | undefined,
): string {
    if (!contact) return "—";

    return (
        getStringValue(contact, "primary_phone") ??
        getStringValue(contact, "secondary_phone") ??
        getStringValue(contact, "tertiary_phone") ??
        "—"
    );
}

export function getContactEmail(
    contact: ContactLike | null | undefined,
): string {
    if (!contact) return "—";

    return getStringValue(contact, "email") ?? "—";
}

export function getContactDocument(
    contact: ContactLike | null | undefined,
): string {
    if (!contact) return "—";

    return getStringValue(contact, "document_id") ?? "—";
}

export function getContactCity(
    contact: ContactLike | null | undefined,
): string {
    if (!contact) return "—";

    return getStringValue(contact, "city") ?? "—";
}

export function getPetContactRoleLabel(
    role: string | null | undefined,
): string {
    const normalizedRole = String(role ?? "")
        .trim()
        .toUpperCase();

    const roleLabels: Record<string, string> = {
        OWNER_GUARDIAN: "Propietario / Tutor",
        CAREGIVER: "Cuidador",
        BILLING_RESPONSIBLE: "Responsable de pago",
        REFERRING_VET: "Veterinario remitente",
        RESPONSIBLE_INSTITUTION: "Institución responsable",
        REFERRING_INSTITUTION: "Institución remitente",
        BREEDER: "Criador / Criadero",
        SHELTER_OR_FOUNDATION: "Refugio o fundación",
    };

    return (roleLabels[normalizedRole] ?? normalizedRole) || "Sin rol";
}

export function getPetContactGroupLabel(
    role: string | null | undefined,
): string {
    return getPetContactRoleLabel(role).toUpperCase();
}

export function getPetContactRelationship(
    item: PetContactLinkInterface,
): string | null {
    return getStringValue(item, "specific_relationship") ?? null;
}

export function isPrimaryPetContact(item: PetContactLinkInterface): boolean {
    return getBooleanValue(item, "is_primary_contact");
}

export function isEmergencyPetContact(item: PetContactLinkInterface): boolean {
    return getBooleanValue(item, "is_emergency_contact");
}

export function getPetContactBadges(item: PetContactLinkInterface): string[] {
    const badges: string[] = [];

    if (isPrimaryPetContact(item)) {
        badges.push("Principal");
    }

    if (isEmergencyPetContact(item)) {
        badges.push("Emergencia");
    }

    if (getBooleanValue(item, "can_authorize_treatment")) {
        badges.push("Autoriza tratamiento");
    }

    if (getBooleanValue(item, "can_receive_medical_updates")) {
        badges.push("Recibe información médica");
    }

    if (getBooleanValue(item, "can_receive_billing")) {
        badges.push("Facturación");
    }

    if (getBooleanValue(item, "can_pickup_pet")) {
        badges.push("Retira mascota");
    }

    return badges;
}
