// src/api/center/centerContact/updateCenterContactApi.ts

import axiosInstance from "@/api/axiosInstance";
import type {
    ContactType,
    CenterContactInterface,
} from "@/features/center/centerContact/types/centerContactTypes";

export type UpdateCenterContactPayload = {
    center_contact_type: ContactType;

    first_name?: string | null;
    last_name?: string | null;
    institution_name?: string | null;

    document_id?: string | null;
    email?: string | null;

    primary_phone?: string | null;
    secondary_phone?: string | null;
    tertiary_phone?: string | null;

    address?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;

    notes?: string | null;
    is_active: boolean;
};

type UpdateCenterContactParams = {
    centerId: number;
    centerContactId: number;
    payload: UpdateCenterContactPayload;
};

export async function updateCenterContactApi({
    centerId,
    centerContactId,
    payload,
}: UpdateCenterContactParams): Promise<CenterContactInterface> {
    const response = await axiosInstance.patch<CenterContactInterface>(
        `/center-contact/${centerId}/${centerContactId}/update/`,
        payload,
    );

    return response.data;
}
