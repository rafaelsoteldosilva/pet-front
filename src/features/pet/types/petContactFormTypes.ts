// src/features/pet/types/petContactFormTypes.ts

import {ContactType} from "@/features/center/centerContact/types/centerContactTypes";
import type {PetContactFormValues} from "../forms/schemas/petContactSchema";

/* ======================================================
   API request type
   ====================================================== */

export type AddPetContactRequest = {
    contact_type: PetContactFormValues["contact_type"];

    first_name: string | null;
    last_name: string | null;
    institution: string | null;

    country_code: string;
    document_id: string;

    email: string | null;

    cell_phone: string | null;
    home_phone: string | null;
    work_phone: string | null;

    address: string | null;
    city: string | null;

    contact_observations: string | null;
    contact_notes: string | null;

    role: PetContactFormValues["role"];
    specific_relationship: string | null;

    is_primary_contact: boolean;
    can_authorize_treatment: boolean;
    can_pickup_pet: boolean;
    can_receive_billing: boolean;
    is_emergency_contact: boolean;
    can_receive_medical_updates: boolean;

    pet_contact_notes: string | null;
};

export type AddPetContactLinkRequest = {
    center_contact_id: number;

    role: PetContactFormValues["role"];
    specific_relationship: string | null;

    is_primary_contact: boolean;
    is_emergency_contact: boolean;

    can_authorize_treatment: boolean;
    can_receive_medical_updates: boolean;
    can_receive_billing: boolean;
    can_pickup_pet: boolean;

    pet_contact_notes: string | null;
};

/* ======================================================
   Helpers
   ====================================================== */

function cleanNullableString(value: string | null | undefined): string | null {
    if (typeof value !== "string") return null;

    const trimmed = value.trim();

    return trimmed === "" ? null : trimmed;
}

function cleanUpperRequiredString(value: string): string {
    return value.trim().toUpperCase();
}

/* ======================================================
   Mapper
   ====================================================== */

export function toAddPetContactRequest(
    values: PetContactFormValues,
): AddPetContactRequest {
    return {
        contact_type: values.contact_type,

        first_name: cleanNullableString(values.first_name),
        last_name: cleanNullableString(values.last_name),
        institution: cleanNullableString(values.institution),

        country_code: cleanUpperRequiredString(values.country_code),
        document_id: cleanUpperRequiredString(values.document_id),

        email: cleanNullableString(values.email),

        cell_phone: cleanNullableString(values.cell_phone),
        home_phone: cleanNullableString(values.home_phone),
        work_phone: cleanNullableString(values.work_phone),

        address: cleanNullableString(values.address),
        city: cleanNullableString(values.city),

        contact_observations: cleanNullableString(values.contact_observations),
        contact_notes: cleanNullableString(values.contact_notes),

        role: values.role,
        specific_relationship: cleanNullableString(
            values.specific_relationship,
        ),

        is_primary_contact: values.is_primary_contact,
        can_authorize_treatment: values.can_authorize_treatment,
        can_pickup_pet: values.can_pickup_pet,
        can_receive_billing: values.can_receive_billing,
        can_receive_medical_updates: values.can_receive_medical_updates,
        is_emergency_contact: values.is_emergency_contact,

        pet_contact_notes: cleanNullableString(values.pet_contact_notes),
    };
}

/* ======================================================
   Optional display helpers
   ====================================================== */

export function getContactFullNameFromFormValues(
    values: PetContactFormValues,
): string {
    if (values.contact_type === "INSTITUTION") {
        return cleanNullableString(values.institution) ?? "Institución";
    }

    const firstName = cleanNullableString(values.first_name) ?? "";
    const lastName = cleanNullableString(values.last_name) ?? "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Persona";
}

export function getPrimaryPhoneFromFormValues(
    values: PetContactFormValues,
): string | null {
    return (
        cleanNullableString(values.cell_phone) ??
        cleanNullableString(values.home_phone) ??
        cleanNullableString(values.work_phone)
    );
}

export type EditPetContactRequest = {
    center_contact_type?: ContactType;

    first_name?: string | null;
    last_name?: string | null;
    institution_name?: string | null;

    country?: string | null;
    document_id?: string | null;

    email?: string | null;

    primary_phone?: string | null;
    secondary_phone?: string | null;
    tertiary_phone?: string | null;

    address?: string | null;
    city?: string | null;
    region?: string | null;

    center_contact_notes?: string | null;

    role?: PetContactFormValues["role"];
    specific_relationship?: string | null;

    is_primary_contact?: boolean;
    is_emergency_contact?: boolean;
    can_authorize_treatment?: boolean;
    can_receive_medical_updates?: boolean;
    can_receive_billing?: boolean;
    can_pickup_pet?: boolean;

    pet_contact_link_notes?: string | null;
};
