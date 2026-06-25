// src/shared/ui/dialogs/FormField.tsx

"use client";

import React from "react";
import {useFormContext, FieldErrors} from "react-hook-form";

type FormFieldProps = {
    name: string;
    label: string;
    children: React.ReactNode;
    required?: boolean;
    description?: string;
};

function getNestedError(errors: FieldErrors, path: string) {
    return path.split(".").reduce<any>((acc, key) => acc?.[key], errors);
}

export default function FormField({
    name,
    label,
    children,
    required = false,
    description,
}: FormFieldProps) {
    const {
        formState: {errors},
    } = useFormContext();

    const error = getNestedError(errors, name);

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-rose-500">*</span>}
            </label>

            {description && (
                <p className="text-xs text-slate-500">{description}</p>
            )}

            {children}

            {error?.message && (
                <p className="text-xs font-medium text-rose-600">
                    {String(error.message)}
                </p>
            )}
        </div>
    );
}
