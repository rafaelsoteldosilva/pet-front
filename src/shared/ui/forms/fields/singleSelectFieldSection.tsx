// src/shared/ui/forms/fields/singleSelectFieldSection.tsx

"use client";

import {FieldValues, useFormContext} from "react-hook-form";

import FormField from "@/shared/ui/forms/formField";

export type SingleSelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

type Props = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    options: SingleSelectOption[];

    includeEmptyOption?: boolean;
};

export default function SingleSelectFieldSection({
    name,
    label,
    description,
    placeholder = "Seleccione una opción",
    options,
    includeEmptyOption = true,
}: Props) {
    const {register} = useFormContext<FieldValues>();

    return (
        <FormField name={name} label={label} description={description}>
            <select
                {...register(name)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
                {includeEmptyOption && <option value="">{placeholder}</option>}

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </FormField>
    );
}
