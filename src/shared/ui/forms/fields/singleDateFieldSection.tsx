// src/shared/ui/forms/fields/singleDateFieldSection.tsx

"use client";

import FormField from "@/shared/ui/forms/formField";
import {FieldValues, useFormContext} from "react-hook-form";

type Props = {
    name: string;
    label: string;
    description?: string;
    min?: string;
    max?: string;
};

export default function SingleDateFieldSection({
    name,
    label,
    description,
    min,
    max,
}: Props) {
    const {register} = useFormContext<FieldValues>();

    return (
        <FormField name={name} label={label} description={description}>
            <input
                {...register(name)}
                type="date"
                min={min}
                max={max}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
        </FormField>
    );
}
