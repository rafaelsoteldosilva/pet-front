// src/shared/auth/centerStorage.ts

import {getActiveCenterId} from "@/shared/auth/authStorage";

export function requireActiveCenterId(): number {
    const centerId = getActiveCenterId();

    if (centerId === null) {
        throw new Error("No active veterinary center selected.");
    }

    return centerId;
}
