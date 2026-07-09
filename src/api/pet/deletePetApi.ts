// src/api/pet/deletePetApi.ts

import axiosInstance from "@/api/axiosInstance";

type DeletePetApiArgs = {
    centerId: number;
    petId: number;
};

export async function deletePetApi({
    centerId,
    petId,
}: DeletePetApiArgs): Promise<void> {
    await axiosInstance.delete(`/pet/${centerId}/${petId}/delete/`);
}
