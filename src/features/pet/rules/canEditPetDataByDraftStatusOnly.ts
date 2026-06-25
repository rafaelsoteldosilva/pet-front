// src/features/pet/rules/canEditPetDataByDraftStatusOnly.ts

import {PET_RECORD_STATUS, type PetRecordStatus} from "../types/petTypes";

export function canEditPetDataByDraftStatusOnly(
    recordStatus: PetRecordStatus | null | undefined,
): boolean {
    return recordStatus === PET_RECORD_STATUS.DRAFT;
}
