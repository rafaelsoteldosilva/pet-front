// src/api/pet/contactLinks/addPetContactLinkApi.ts

import axiosInstance from "@/api/axiosInstance";

import type {AddPetContactLinkRequest} from "@/features/pet/types/petContactFormTypes";
import type {PetDataInterface} from "@/features/pet/types/petTypes";

type CreatePetContactLinkParams = {
    centerId: number;
    petId: number;
    payload: AddPetContactLinkRequest;
};

type AddPetContactLinkBackendPayload = {
    center_contact_id: number;

    role: AddPetContactLinkRequest["role"];
    specific_relationship: string | null;

    is_primary_contact: boolean;
    is_emergency_contact: boolean;

    can_authorize_treatment: boolean;
    can_receive_medical_updates: boolean;
    can_receive_billing: boolean;
    can_pickup_pet: boolean;

    pet_contact_link_notes: string | null;
};

function cleanNullableText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
}

function buildAddPetContactLinkPayload(
    payload: AddPetContactLinkRequest,
): AddPetContactLinkBackendPayload {
    return {
        center_contact_id: payload.center_contact_id,

        role: payload.role,
        specific_relationship: cleanNullableText(payload.specific_relationship),

        is_primary_contact: payload.is_primary_contact,
        is_emergency_contact: payload.is_emergency_contact,

        can_authorize_treatment: payload.can_authorize_treatment,
        can_receive_medical_updates: payload.can_receive_medical_updates,
        can_receive_billing:
            payload.role === "BILLING_RESPONSIBLE"
                ? true
                : payload.can_receive_billing,
        can_pickup_pet: payload.can_pickup_pet,

        pet_contact_link_notes: cleanNullableText(payload.pet_contact_notes),
    };
}

export async function addPetContactLinkApi({
    centerId,
    petId,
    payload,
}: CreatePetContactLinkParams): Promise<PetDataInterface> {
    const backendPayload = buildAddPetContactLinkPayload(payload);

    const response = await axiosInstance.post<PetDataInterface>(
        `/pet-contact-link/${centerId}/${petId}/add/`,
        backendPayload,
    );

    return response.data;
}
