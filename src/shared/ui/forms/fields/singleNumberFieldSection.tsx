// src/shared/ui/forms/fields/singleNumberFieldSection.tsx

"use client";

import FormField from "@/shared/ui/forms/formField";
import {FieldValues, useFormContext} from "react-hook-form";

type Props = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    suffix?: string;
    step?: number | string;
    min?: number;
    max?: number;
};

export default function SingleNumberFieldSection({
    name,
    label,
    description,
    placeholder,
    suffix,
    step = "1",
    min,
    max,
}: Props) {
    const {register} = useFormContext<FieldValues>();

    return (
        <FormField name={name} label={label} description={description}>
            <div className="relative">
                <input
                    {...register(name)}
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                    className={
                        suffix
                            ? "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-12 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            : "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    }
                />

                {suffix ? (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
                        {suffix}
                    </span>
                ) : null}
            </div>
        </FormField>
    );
}
