// src/api/pet/createPetApi.ts

import axiosInstance from "@/api/axiosInstance";

import type {PetDataInterface} from "@/features/pet/types/petTypes";
import type {AddNewPetPayload} from "@/features/pet/dialogs/addNewPetDialog";

type CreatePetApiArgs = {
    centerId: number;
    payload: AddNewPetPayload;
};

export async function createPetApi({
    centerId,
    payload,
}: CreatePetApiArgs): Promise<PetDataInterface> {
    const response = await axiosInstance.post<PetDataInterface>(
        `/pets/${centerId}/create/`,
        payload,
    );

    return response.data;
}
