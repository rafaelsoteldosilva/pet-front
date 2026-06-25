// src/features/pet/rules/petContactPermissionRules.ts

import {
    normalizeContactType,
    type PetContactRoleValue,
} from "./petContactRoleRules";

export type PetContactTypeValue = "PERSON" | "INSTITUTION";

export type PetContactPermissionField =
    | "is_primary_contact"
    | "is_emergency_contact"
    | "can_authorize_treatment"
    | "can_receive_medical_updates"
    | "can_receive_billing"
    | "can_pickup_pet";

export type PetContactPermissionOption = {
    field: PetContactPermissionField;
    label: string;
    description: string;
    allowedFor: readonly PetContactTypeValue[];
};

export type PetContactPermissionValues = Partial<
    Record<PetContactPermissionField, boolean>
>;

export const PERSON_CONTACT_PERMISSION_OPTIONS: readonly PetContactPermissionOption[] =
    [
        {
            field: "is_primary_contact",
            label: "Contacto principal",
            description:
                "Contacto principal para información general del paciente.",
            allowedFor: ["PERSON"],
        },
        {
            field: "is_emergency_contact",
            label: "Contacto de emergencia",
            description:
                "Persona a contactar ante una situación urgente relacionada con el paciente.",
            allowedFor: ["PERSON"],
        },
        {
            field: "can_authorize_treatment",
            label: "Puede autorizar tratamientos",
            description:
                "Persona autorizada para aprobar procedimientos, tratamientos o decisiones clínicas.",
            allowedFor: ["PERSON"],
        },
        {
            field: "can_receive_medical_updates",
            label: "Puede recibir información médica",
            description:
                "Persona autorizada para recibir actualizaciones clínicas del paciente.",
            allowedFor: ["PERSON"],
        },
        {
            field: "can_receive_billing",
            label: "Puede recibir información de pago",
            description:
                "Persona autorizada para recibir presupuestos, facturas o información de pago.",
            allowedFor: ["PERSON"],
        },
        {
            field: "can_pickup_pet",
            label: "Puede retirar al paciente",
            description:
                "Persona autorizada para retirar al paciente del centro veterinario.",
            allowedFor: ["PERSON"],
        },
    ];

export const INSTITUTION_CONTACT_PERMISSION_OPTIONS: readonly PetContactPermissionOption[] =
    [
        {
            field: "is_primary_contact",
            label: "Institución principal",
            description:
                "Institución principal asociada al paciente para comunicación general.",
            allowedFor: ["INSTITUTION"],
        },
        {
            field: "can_receive_medical_updates",
            label: "Puede recibir información médica",
            description:
                "Institución autorizada para recibir actualizaciones clínicas del paciente.",
            allowedFor: ["INSTITUTION"],
        },
        {
            field: "can_receive_billing",
            label: "Puede recibir información de pago",
            description:
                "Institución autorizada para recibir presupuestos, facturas o información de pago.",
            allowedFor: ["INSTITUTION"],
        },
    ];

export const PERSON_ONLY_PERMISSION_FIELDS: readonly PetContactPermissionField[] =
    ["is_emergency_contact", "can_authorize_treatment", "can_pickup_pet"];

export const ALL_CONTACT_PERMISSION_FIELDS: readonly PetContactPermissionField[] =
    [
        "is_primary_contact",
        "is_emergency_contact",
        "can_authorize_treatment",
        "can_receive_medical_updates",
        "can_receive_billing",
        "can_pickup_pet",
    ];

export function getPetContactPermissionOptions(
    contactType: string | null | undefined,
): readonly PetContactPermissionOption[] {
    const safeContactType = normalizeContactType(contactType);

    return safeContactType === "INSTITUTION"
        ? INSTITUTION_CONTACT_PERMISSION_OPTIONS
        : PERSON_CONTACT_PERMISSION_OPTIONS;
}

export function isPetContactPermissionField(
    value: unknown,
): value is PetContactPermissionField {
    if (typeof value !== "string") {
        return false;
    }

    return ALL_CONTACT_PERMISSION_FIELDS.includes(
        value as PetContactPermissionField,
    );
}

export function isPermissionAllowedForContactType(
    field: string | null | undefined,
    contactType: string | null | undefined,
): boolean {
    if (!field || !isPetContactPermissionField(field)) {
        return false;
    }

    return getPetContactPermissionOptions(contactType).some(
        (option) => option.field === field,
    );
}

export function getDefaultPetContactPermissionValues(): Record<
    PetContactPermissionField,
    boolean
> {
    return {
        is_primary_contact: false,
        is_emergency_contact: false,
        can_authorize_treatment: false,
        can_receive_medical_updates: false,
        can_receive_billing: false,
        can_pickup_pet: false,
    };
}

export function sanitizePetContactPermissionValues(
    values: PetContactPermissionValues,
    contactType: string | null | undefined,
): Record<PetContactPermissionField, boolean> {
    const safeContactType = normalizeContactType(contactType);

    const sanitizedValues: Record<PetContactPermissionField, boolean> = {
        is_primary_contact: values.is_primary_contact === true,
        is_emergency_contact: values.is_emergency_contact === true,
        can_authorize_treatment: values.can_authorize_treatment === true,
        can_receive_medical_updates:
            values.can_receive_medical_updates === true,
        can_receive_billing: values.can_receive_billing === true,
        can_pickup_pet: values.can_pickup_pet === true,
    };

    if (safeContactType === "INSTITUTION") {
        sanitizedValues.is_emergency_contact = false;
        sanitizedValues.can_authorize_treatment = false;
        sanitizedValues.can_pickup_pet = false;
    }

    return sanitizedValues;
}

export function getInvalidPermissionFieldsForContactType(
    values: PetContactPermissionValues,
    contactType: string | null | undefined,
): PetContactPermissionField[] {
    const safeContactType = normalizeContactType(contactType);

    if (safeContactType !== "INSTITUTION") {
        return [];
    }

    return PERSON_ONLY_PERMISSION_FIELDS.filter(
        (field) => values[field] === true,
    );
}

export function hasInvalidPermissionForContactType(
    values: PetContactPermissionValues,
    contactType: string | null | undefined,
): boolean {
    return (
        getInvalidPermissionFieldsForContactType(values, contactType).length > 0
    );
}

export function getPetContactPermissionLabel(
    field: string | null | undefined,
    contactType: string | null | undefined,
): string {
    if (!field || !isPetContactPermissionField(field)) {
        return "Permiso no definido";
    }

    const option = getPetContactPermissionOptions(contactType).find(
        (item) => item.field === field,
    );

    return option?.label ?? "Permiso no disponible";
}

export function applyPetContactRolePermissionRules(
    role: PetContactRoleValue | string | null | undefined,
    values: PetContactPermissionValues,
    contactType: string | null | undefined,
): Record<PetContactPermissionField, boolean> {
    const sanitizedValues = sanitizePetContactPermissionValues(
        values,
        contactType,
    );

    if (role === "BILLING_RESPONSIBLE") {
        sanitizedValues.can_receive_billing = true;
    }

    return sanitizedValues;
}

export function isPermissionForcedByRole(
    role: PetContactRoleValue | string | null | undefined,
    field: PetContactPermissionField,
): boolean {
    if (role === "BILLING_RESPONSIBLE" && field === "can_receive_billing") {
        return true;
    }

    return false;
}

export function getRoleForcedPermissionReason(
    role: PetContactRoleValue | string | null | undefined,
    field: PetContactPermissionField,
): string | null {
    if (role === "BILLING_RESPONSIBLE" && field === "can_receive_billing") {
        return "Un responsable de pago siempre debe poder recibir información de pago.";
    }

    return null;
}
