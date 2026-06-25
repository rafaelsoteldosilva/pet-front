// src/api/reading/catalog/getAllowedSpeciesAndBreedsApi.ts

import axiosInstance from "../axiosInstance";
import {getAxiosErrorMessage} from "../shared/getAxiosErrorMessage";
import {AllowedSpeciesAndBreedsResult} from "@/features/pet/types/petTypes";

export async function getAllowedSpeciesAndBreedsApi(
    centerId: number,
): Promise<AllowedSpeciesAndBreedsResult> {
    try {
        const url = `/all-catalog/species-breeds/${centerId}/`;

        const response =
            await axiosInstance.get<AllowedSpeciesAndBreedsResult>(url);

        return response.data;
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error));
    }
}
