// src/shared/ui/forms/fields/singleTextFieldSection.tsx

"use client";

import FormField from "@/shared/ui/forms/formField";
import {FieldValues, useFormContext, useWatch} from "react-hook-form";

type Props = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    maxLength?: number;
    rows?: number;
    multiline?: boolean;
    showCounter?: boolean;
};

export default function SingleTextFieldSection({
    name,
    label,
    description,
    placeholder,
    maxLength = 300,
    rows = 4,
    multiline = false,
    showCounter = true,
}: Props) {
    const {register, control} = useFormContext<FieldValues>();

    const currentValue = useWatch({
        control,
        name,
        defaultValue: "",
    });

    const text = typeof currentValue === "string" ? currentValue : "";
    const currentLength = text.length;

    return (
        <FormField name={name} label={label} description={description}>
            <div className="space-y-2">
                {multiline ? (
                    <textarea
                        {...register(name)}
                        rows={rows}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                ) : (
                    <input
                        {...register(name)}
                        type="text"
                        maxLength={maxLength}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                )}

                {showCounter ? (
                    <div className="text-right text-xs text-slate-500">
                        {currentLength}/{maxLength}
                    </div>
                ) : null}
            </div>
        </FormField>
    );
}
