// src/api/center/centerStaff/getVeterinariansForCenterApi.ts

import axiosInstance from "@/api/axiosInstance";
import type {CenterVeterinarianOption} from "@/features/center/types/centerStaffTypes";

export async function getVeterinariansForCenterApi(
    centerId: number,
): Promise<CenterVeterinarianOption[]> {
    const response = await axiosInstance.get<CenterVeterinarianOption[]>(
        `/center-vets/${centerId}/`,
    );
    return response.data;
}
