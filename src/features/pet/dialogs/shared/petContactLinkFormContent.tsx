// src/features/pet/dialogs/shared/petContactLinkFormContent.tsx

"use client";

import type {PetDataInterface} from "@/features/pet/types/petTypes";

import PetContactLinkDialogLayout from "@/features/pet/dialogs/shared/petContactLinkDialogLayout";
import PetContactLinkFields from "@/features/pet/forms/sections/petContactLinkFields";

type Props = {
    pet: PetDataInterface;
    submitError?: string | null;
    hasActivePrimaryContact: boolean;
    primaryContactDisabledReason?: string;
};

export default function PetContactLinkFormContent({
    pet,
    submitError,
    hasActivePrimaryContact,
    primaryContactDisabledReason,
}: Props) {
    return (
        <PetContactLinkDialogLayout pet={pet}>
            <div className="space-y-4">
                {submitError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {submitError}
                    </div>
                ) : null}

                <PetContactLinkFields
                    hasActivePrimaryContact={hasActivePrimaryContact}
                    primaryContactDisabledReason={primaryContactDisabledReason}
                />
            </div>
        </PetContactLinkDialogLayout>
    );
}
