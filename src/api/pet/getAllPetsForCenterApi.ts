// src/api/reading/pet/getAllPetsForCenterApi.ts

import axiosInstance from "../axiosInstance";
import {GetAllPetsForCenterResult} from "@/features/pet/types/petTypes";
import {getAxiosErrorMessage} from "../shared/getAxiosErrorMessage";

export async function getAllPetsForCenterApi(
    centerId: number,
    searchType: string,
    query: string,
): Promise<GetAllPetsForCenterResult[]> {
    try {
        const response = await axiosInstance.get<GetAllPetsForCenterResult[]>(
            `/all-pets/${centerId}/`,
            {
                params: {
                    search_type: searchType,
                    query,
                },
            },
        );

        return response.data;
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error));
    }
}
