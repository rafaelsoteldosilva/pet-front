// src/api/center/centerContact/deleteCenterContactApi.ts

import axiosInstance from "@/api/axiosInstance";

type DeleteCenterContactParams = {
    centerId: number;
    centerContactId: number;
};

export async function deleteCenterContactApi({
    centerId,
    centerContactId,
}: DeleteCenterContactParams): Promise<void> {
    await axiosInstance.delete(
        `/center-contact/${centerId}/${centerContactId}/delete/`,
    );
}
