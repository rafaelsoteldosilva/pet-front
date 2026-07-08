// src/api/pet/deleteDraftPetApi.ts

import axiosInstance from "@/api/axiosInstance";

type DeleteDraftPetApiArgs = {
    centerId: number;
    petId: number;
};

export async function deleteDraftPetApi({
    centerId,
    petId,
}: DeleteDraftPetApiArgs): Promise<void> {
    await axiosInstance.delete(`/pet/${centerId}/${petId}/delete-draft/`);
}
