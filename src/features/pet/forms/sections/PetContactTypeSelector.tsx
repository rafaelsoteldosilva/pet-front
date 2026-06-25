// src/features/pet/forms/sections/PetContactTypeSelector.tsx

"use client";

import {useFormContext, useWatch} from "react-hook-form";
import {PetContactFormValues} from "@/features/pet/forms/schemas/petContactSchema";

type ContactTypeOption = {
    value: PetContactFormValues["contact_type"];
    title: string;
    description: string;
};

const CONTACT_TYPE_OPTIONS: ContactTypeOption[] = [
    {
        value: "PERSON",
        title: "Persona",
        description:
            "Propietario, tutor, cuidador, responsable de pago, veterinario u otra persona relacionada.",
    },
    {
        value: "INSTITUTION",
        title: "Institución",
        description:
            "Fundación, criadero, refugio, clínica remitente u otra institución.",
    },
];

export default function PetContactTypeSelector() {
    const {control, setValue} = useFormContext<PetContactFormValues>();

    const selectedContactType =
        useWatch({
            control,
            name: "contact_type",
        }) ?? "PERSON";

    function handleSelectContactType(
        value: PetContactFormValues["contact_type"],
    ) {
        setValue("contact_type", value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
            <div className="mb-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                    Tipo de contacto
                </h3>

                <p className="text-xs leading-5 text-slate-500">
                    Selecciona si el contacto corresponde a una persona natural
                    o a una institución.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {CONTACT_TYPE_OPTIONS.map((option) => {
                    const checked = selectedContactType === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                handleSelectContactType(option.value)
                            }
                            className={
                                checked
                                    ? "rounded-xl border border-blue-400 bg-blue-50 px-4 py-3 text-left shadow-sm ring-2 ring-blue-100"
                                    : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            }
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={
                                        checked
                                            ? "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-blue-600 bg-blue-600"
                                            : "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white"
                                    }
                                >
                                    {checked ? (
                                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    ) : null}
                                </span>

                                <span className="space-y-1">
                                    <span
                                        className={
                                            checked
                                                ? "block text-sm font-bold text-blue-900"
                                                : "block text-sm font-semibold text-slate-800"
                                        }
                                    >
                                        {option.title}
                                    </span>

                                    <span className="block text-xs leading-5 text-slate-500">
                                        {option.description}
                                    </span>
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
