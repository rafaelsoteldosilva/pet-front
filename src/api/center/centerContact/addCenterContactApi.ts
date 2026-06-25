// src/api/center/centerContact/addCenterContactApi.ts

import axiosInstance from "@/api/axiosInstance";
import type {
    ContactType,
    CenterContactInterface,
} from "@/features/center/centerContact/types/centerContactTypes";

export type CreateCenterContactPayload = {
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

type CreateCenterContactParams = {
    centerId: number;
    payload: CreateCenterContactPayload;
};

export async function addCenterContactApi({
    centerId,
    payload,
}: CreateCenterContactParams): Promise<CenterContactInterface> {
    console.log("payload:: ", payload);
    const response = await axiosInstance.post<CenterContactInterface>(
        `/center-contact/${centerId}/add/`,
        payload,
    );

    return response.data;
}
