// src/api/reading/pet/petDataApi.ts

import {PetDataInterface} from "@/features/pet/types/petTypes";
import axiosInstance from "../axiosInstance";
import {getAxiosErrorMessage} from "../shared/getAxiosErrorMessage";

export async function petDataApi(
    centerId: number,
    petId: number,
): Promise<PetDataInterface> {
    try {
        const response = await axiosInstance.get<PetDataInterface>(
            `/pet/${centerId}/${petId}/get/`,
        );
        return response.data;
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error));
    }
}
