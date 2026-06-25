// src/shared/ui/entityDialogs/singleFieldSectionLayout.tsx

"use client";

import {ReactNode} from "react";

import FormLayout from "@/shared/ui/forms/formLayout";
import FormSection from "@/shared/ui/forms/formSection";

type Props = {
    sectionTitle: string;
    children: ReactNode;
    submitError?: string | null;
    sidePanel?: ReactNode;
};

export default function SingleFieldSectionLayout({
    sectionTitle,
    children,
    submitError,
    sidePanel,
}: Props) {
    return (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
            {sidePanel ? (
                <aside className="w-full shrink-0 xl:w-56">{sidePanel}</aside>
            ) : null}

            <div className="min-w-0 flex-1">
                <FormLayout>
                    <FormSection title={sectionTitle}>{children}</FormSection>

                    {submitError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {submitError}
                        </div>
                    ) : null}
                </FormLayout>
            </div>
        </div>
    );
}
