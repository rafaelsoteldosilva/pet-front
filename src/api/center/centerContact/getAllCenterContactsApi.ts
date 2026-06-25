// src/api/organization/organizationContact/getAllOrganizationContactsApi.ts

import axiosInstance from "@/api/axiosInstance";
import type {CenterContactInterface} from "@/features/center/centerContact/types/centerContactTypes";

export async function getAllCenterContactsApi(
    centerId: number,
): Promise<CenterContactInterface[]> {
    const response = await axiosInstance.get<CenterContactInterface[]>(
        `/all-center-contacts/${centerId}/`,
    );

    return response.data;
}
