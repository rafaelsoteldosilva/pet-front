// src/features/pet/dialogs/shared/petContactLinkDialogLayout.tsx

"use client";

import type {ReactNode} from "react";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";
import type {PetDataInterface} from "@/features/pet/types/petTypes";

type Props = {
    pet: PetDataInterface | null | undefined;
    children: ReactNode;
};

export default function PetContactLinkDialogLayout({pet, children}: Props) {
    if (!pet) {
        return <>{children}</>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-4 lg:self-start">
                <PetIdentityPanel pet={pet} />
            </aside>

            <div className="min-w-0">{children}</div>
        </div>
    );
}
