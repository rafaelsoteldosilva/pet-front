// src/features/pet/rules/petContactRoleRules.ts

import {ContactType} from "@/features/center/centerContact/types/centerContactTypes";

export type PetContactRoleValue =
    | "OWNER_GUARDIAN"
    | "CAREGIVER"
    | "BILLING_RESPONSIBLE"
    | "REFERRING_VET"
    | "RESPONSIBLE_INSTITUTION"
    | "REFERRING_INSTITUTION"
    | "BREEDER"
    | "SHELTER_OR_FOUNDATION";

export type PetContactRoleOption = {
    value: PetContactRoleValue;
    label: string;
    description: string;
};

export function normalizeContactType(
    value: string | null | undefined,
): ContactType {
    const normalizedValue = value?.trim().toUpperCase();

    return normalizedValue === "INSTITUTION" ? "INSTITUTION" : "PERSON";
}

const PERSON_ROLE_OPTIONS: readonly PetContactRoleOption[] = [
    {
        value: "OWNER_GUARDIAN",
        label: "Propietario / Tutor",
        description:
            "Persona responsable o tutora del paciente. Puede haber más de una.",
    },
    {
        value: "CAREGIVER",
        label: "Cuidador",
        description:
            "Persona que cuida al paciente, sin ser necesariamente su responsable principal.",
    },
    {
        value: "BILLING_RESPONSIBLE",
        label: "Responsable de pago",
        description:
            "Persona encargada de recibir información de pago, presupuestos o facturas.",
    },
    {
        value: "REFERRING_VET",
        label: "Veterinario remitente",
        description:
            "Profesional que remitió al paciente o participa como contacto clínico externo.",
    },
    {
        value: "BREEDER",
        label: "Criador",
        description:
            "Persona relacionada con la crianza u origen del paciente.",
    },
];

const INSTITUTION_ROLE_OPTIONS: readonly PetContactRoleOption[] = [
    {
        value: "RESPONSIBLE_INSTITUTION",
        label: "Institución responsable",
        description:
            "Entidad que actúa como responsable del paciente, por ejemplo una fundación, refugio u organización.",
    },
    {
        value: "BILLING_RESPONSIBLE",
        label: "Responsable de pago",
        description:
            "Institución encargada de recibir información de pago, presupuestos o facturas.",
    },
    {
        value: "REFERRING_INSTITUTION",
        label: "Institución remitente",
        description:
            "Clínica, fundación, refugio u otra entidad que remitió al paciente.",
    },
    {
        value: "BREEDER",
        label: "Criadero",
        description:
            "Entidad relacionada con la crianza u origen del paciente.",
    },
    {
        value: "SHELTER_OR_FOUNDATION",
        label: "Refugio o fundación",
        description:
            "Organización de rescate, refugio o fundación relacionada con el paciente.",
    },
];

export function getPetContactRoleOptions(
    contactType: ContactType,
): readonly PetContactRoleOption[] {
    return contactType === "INSTITUTION"
        ? INSTITUTION_ROLE_OPTIONS
        : PERSON_ROLE_OPTIONS;
}

export function getRoleForContactTypeOrDefault(
    currentRole: string | null | undefined,
    contactType: ContactType,
): PetContactRoleValue {
    const options = getPetContactRoleOptions(contactType);

    const currentOption = options.find(
        (option) => option.value === currentRole,
    );

    if (currentOption) {
        return currentOption.value;
    }

    return options[0].value;
}
