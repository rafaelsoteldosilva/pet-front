// src/api/pet/contactsLinks/updatePetContactLinkApi.ts

import axiosInstance from "@/api/axiosInstance";
import {PetDataInterface} from "@/features/pet/types/petTypes";
import {EditPetContactRequest} from "@/features/pet/types/petContactFormTypes";

export async function updatePetContactLinkApi(
    centerId: number,
    petId: number,
    petContactId: number,
    payload: EditPetContactRequest,
): Promise<PetDataInterface> {
    const response = await axiosInstance.patch<PetDataInterface>(
        `/pet-contact-link/${centerId}/${petId}/${petContactId}/update/`,
        payload,
    );

    return response.data;
}
