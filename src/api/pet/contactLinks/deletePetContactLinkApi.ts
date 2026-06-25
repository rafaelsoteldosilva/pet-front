// src/api/pet/contacts/deletePetContactLinkApi.ts

import axiosInstance from "@/api/axiosInstance";
import {PetDataInterface} from "@/features/pet/types/petTypes";

export async function deletePetContactLinkApi(
    centerId: number,
    petId: number,
    petContactId: number,
): Promise<PetDataInterface> {
    const response = await axiosInstance.delete<PetDataInterface>(
        `/pet-contact-link/${centerId}/${petId}/${petContactId}/delete/`,
    );

    return response.data;
}
