// src/api/pet/updatePetDataApi.ts

import type {AxiosResponse} from "axios";

import axiosInstance from "@/api/axiosInstance";
import {PetDataInterface, PetStatus} from "@/features/pet/types/petTypes";

type SharedPatchablePetKeys =
    | "name"
    | "sex"
    | "sterilized"
    | "birth_date"
    | "body_description"
    | "size"
    | "last_weight"
    | "reference"
    | "has_pedigree"
    | "pedigree_registry"
    | "visual_tag"
    | "visual_identification_or_tattoo_description"
    | "has_microchip"
    | "microchip_code"
    | "microchip_date"
    | "microchip_body_region"
    | "clinical_observations"
    | "internal_notes"
    | "last_attending_vet_external_name";

type SharedPetPatch = Partial<Pick<PetDataInterface, SharedPatchablePetKeys>>;

type RelationIdPatch = {
    species_id?: string;
    breed_id?: string | null;
    last_attending_vet_id?: number | null;
    status?: PetStatus;
};

type AuditReasonPatch = {
    reason?: string;
};

export type UpdatePetDataPayload = SharedPetPatch &
    RelationIdPatch &
    AuditReasonPatch;

type UpdatePetDataApiArgs = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

export async function updatePetDataApi({
    centerId,
    petId,
    data,
}: UpdatePetDataApiArgs): Promise<PetDataInterface> {
    const payload: UpdatePetDataPayload = {
        ...data,
    };

    if ("breed_id" in payload) {
        payload.breed_id = payload.breed_id || null;
    }

    if ("birth_date" in payload) {
        payload.birth_date = payload.birth_date || null;
    }

    if ("microchip_date" in payload) {
        payload.microchip_date = payload.microchip_date || null;
    }

    if ("last_attending_vet_id" in payload) {
        payload.last_attending_vet_id = payload.last_attending_vet_id ?? null;
    }

    if (
        "last_attending_vet_external_name" in payload &&
        typeof payload.last_attending_vet_external_name === "string"
    ) {
        const trimmedExternalVetName =
            payload.last_attending_vet_external_name.trim();

        payload.last_attending_vet_external_name =
            trimmedExternalVetName || null;
    }

    if (
        payload.last_attending_vet_external_name &&
        payload.last_attending_vet_external_name.trim()
    ) {
        payload.last_attending_vet_id = null;
    }

    if (
        "last_attending_vet_id" in payload &&
        payload.last_attending_vet_id !== null &&
        payload.last_attending_vet_id !== undefined
    ) {
        payload.last_attending_vet_external_name = null;
    }

    if ("reason" in payload && typeof payload.reason === "string") {
        const trimmedReason = payload.reason.trim();

        if (trimmedReason) {
            payload.reason = trimmedReason;
        } else {
            delete payload.reason;
        }
    }

    const response = await axiosInstance.patch<
        PetDataInterface,
        AxiosResponse<PetDataInterface>,
        UpdatePetDataPayload
    >(`/pet/${centerId}/${petId}/update/`, payload);

    return response.data;
}
