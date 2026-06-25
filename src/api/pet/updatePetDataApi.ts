// src/api/saving/pet/updatePetDataApi.ts

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
    | "internal_notes";

type SharedBasicPetPatch = Partial<
    Pick<PetDataInterface, SharedPatchablePetKeys>
>;

type RelationIdPatch = {
    species_id?: string;
    breed_id?: string | null;
    last_attending_vet_id?: number | null;
    status?: PetStatus;
};

export type UpdatePetDataPayload = SharedBasicPetPatch & RelationIdPatch;

type UpdateBasicPetDataApiArgs = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

export async function updatePetDataApi({
    centerId,
    petId,
    data,
}: UpdateBasicPetDataApiArgs): Promise<PetDataInterface> {
    console.log("updatePetDataApi:: data = ", data);
    const payload: UpdatePetDataPayload = {
        ...data,
    };
    console.log("updatePetDataApi:: payload = ", payload);

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

    console.log("updatePetDataApi:: again, payload = ", payload);

    const response = await axiosInstance.patch<PetDataInterface>(
        `/pet/${centerId}/${petId}/update/`,
        payload,
    );

    console.log("updatePetDataApi:: response.data = ", response.data);

    return response.data;
}
