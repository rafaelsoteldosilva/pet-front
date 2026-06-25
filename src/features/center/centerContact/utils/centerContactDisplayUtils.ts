// src/features/center/centernContact/utils/centerContactDisplayUtils.ts

import type {
    ContactType,
    CenterContactInterface,
} from "@/features/center/centerContact/types/centerContactTypes";

export const CONTACT_TYPE_PERSON: ContactType = "PERSON";
export const CONTACT_TYPE_INSTITUTION: ContactType = "INSTITUTION";

export function cleanString(value: unknown): string {
    if (typeof value !== "string") return "";

    return value.trim();
}

export function getText(value: unknown): string {
    if (value == null) return "—";

    if (typeof value === "string") {
        const cleanValue = value.trim();
        return cleanValue || "—";
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    return "—";
}

export function getContactId(
    contact: CenterContactInterface | null,
): number | null {
    if (!contact) return null;

    return typeof contact.id === "number" ? contact.id : null;
}

export function isDeletedContact(
    contact: CenterContactInterface | null | undefined,
): boolean {
    return contact?.is_active === false;
}

export function isPersonContact(
    contactType: ContactType | string | null | undefined,
): boolean {
    const normalizedValue = String(contactType ?? "")
        .trim()
        .toUpperCase();

    return normalizedValue === CONTACT_TYPE_PERSON;
}

export function isInstitutionContact(
    contactType: ContactType | string | null | undefined,
): boolean {
    const normalizedValue = String(contactType ?? "")
        .trim()
        .toUpperCase();

    return normalizedValue === CONTACT_TYPE_INSTITUTION;
}

export function getContactTypeLabel(
    contactType: ContactType | string | null | undefined,
): string {
    if (isPersonContact(contactType)) return "Persona";
    if (isInstitutionContact(contactType)) return "Institución";

    return getText(contactType);
}

export function getCenterContactDisplayName(
    contact: CenterContactInterface | null,
): string {
    if (!contact) return "—";

    const displayName = cleanString(contact.display_name);

    if (displayName) return displayName;

    if (isInstitutionContact(contact.center_contact_type)) {
        const institutionName = cleanString(contact.institution_name);

        return institutionName || "—";
    }

    const firstName = cleanString(contact.first_name);
    const lastName = cleanString(contact.last_name);
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "—";
}

export function getActiveLabel(
    value: boolean | null | undefined,
): "Activo" | "Eliminado" {
    return value === false ? "Eliminado" : "Activo";
}
