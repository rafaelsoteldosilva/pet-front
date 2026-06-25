// src/shared/ui/forms/fields/singleBooleanFieldSection.tsx

"use client";

import FormField from "@/shared/ui/forms/formField";
import {FieldValues, useFormContext} from "react-hook-form";

type Props = {
    name: string;
    label: string;
    description?: string;
    trueLabel: string;
    falseLabel: string;
    disableFalse?: boolean;
    disableFalseReason?: string;
};

export default function SingleBooleanFieldSection({
    name,
    label,
    description,
    trueLabel,
    falseLabel,
    disableFalse = false,
    disableFalseReason = "No se puede seleccionar esta opción.",
}: Props) {
    const {register} = useFormContext<FieldValues>();

    return (
        <FormField name={name} label={label} description={description}>
            <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
                    <input
                        {...register(name)}
                        type="radio"
                        value="true"
                        className="h-4 w-4"
                    />
                    <span>{trueLabel}</span>
                </label>

                <label
                    className={
                        disableFalse
                            ? "flex cursor-not-allowed items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-400 shadow-sm"
                            : "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
                    }
                    title={disableFalse ? disableFalseReason : undefined}
                >
                    <input
                        {...register(name)}
                        type="radio"
                        value="false"
                        disabled={disableFalse}
                        className="h-4 w-4"
                    />
                    <span>{falseLabel}</span>
                </label>

                {disableFalse ? (
                    <p className="text-xs text-slate-500">
                        {disableFalseReason}
                    </p>
                ) : null}
            </div>
        </FormField>
    );
}
