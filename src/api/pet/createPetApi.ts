// src/api/pet/createPetApi.ts

import axiosInstance from "@/api/axiosInstance";

import type {PetDataInterface} from "@/features/pet/types/petTypes";
import type {AddNewPetPayload} from "@/features/pet/dialogs/addNewPetDialog";

type CreatePetApiParams = {
    centerId: number;
    payload: AddNewPetPayload;
};

export async function createPetApi({
    centerId,
    payload,
}: CreatePetApiParams): Promise<PetDataInterface> {
    const response = await axiosInstance.post<PetDataInterface>(
        `/pet/${centerId}/create/`,
        payload,
    );

    return response.data;
}
