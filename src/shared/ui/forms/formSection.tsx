// src/shared/ui/dialogs/formSection.tsx

"use client";

import React from "react";

type FormSectionProps = {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
};

export default function FormSection({
    title,
    subtitle,
    children,
}: FormSectionProps) {
    return (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            {(title || subtitle) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                            {title}
                        </h3>
                    )}

                    {subtitle && (
                        <p className="text-sm text-slate-500">{subtitle}</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {children}
            </div>
        </section>
    );
}
