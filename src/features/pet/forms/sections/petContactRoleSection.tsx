// src/features/pet/forms/sections/petContactRoleSection.tsx

"use client";

import {useEffect} from "react";
import {
    FieldErrors,
    FieldValues,
    useFormContext,
    useWatch,
} from "react-hook-form";

import {
    getPetContactRoleOptions,
    getRoleForContactTypeOrDefault,
    normalizeContactType,
} from "@/features/pet/rules/petContactRoleRules";

function getFieldErrorMessage(
    errors: FieldErrors<FieldValues>,
    fieldName: string,
): string | null {
    const error = errors[fieldName];

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return error.message;
    }

    return null;
}

export default function PetContactRoleSection() {
    const {
        register,
        control,
        setValue,
        formState: {errors},
    } = useFormContext<FieldValues>();

    const contactTypeValue = useWatch({
        control,
        name: "contact_type",
    });

    const selectedRoleValue = useWatch({
        control,
        name: "role",
    });

    const safeContactType = normalizeContactType(
        typeof contactTypeValue === "string" ? contactTypeValue : null,
    );

    const selectedRole =
        typeof selectedRoleValue === "string" ? selectedRoleValue : null;

    const roleOptions = getPetContactRoleOptions(safeContactType);

    useEffect(() => {
        const nextRole = getRoleForContactTypeOrDefault(
            selectedRole,
            safeContactType,
        );

        if (selectedRole !== nextRole) {
            setValue("role", nextRole, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }
    }, [safeContactType, selectedRole, setValue]);

    const roleErrorMessage = getFieldErrorMessage(errors, "role");

    const specificRelationshipErrorMessage = getFieldErrorMessage(
        errors,
        "specific_relationship",
    );

    return (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800">
                    Relación con el paciente
                </h3>

                <p className="text-xs text-slate-500">
                    Define el rol principal de este contacto respecto a la
                    mascota.
                </p>
            </div>

            <div className="space-y-2">
                <div>
                    <p className="text-sm font-medium text-slate-700">
                        {safeContactType === "INSTITUTION"
                            ? "Función de la institución"
                            : "Rol principal"}
                    </p>

                    <p className="text-xs text-slate-500">
                        {safeContactType === "INSTITUTION"
                            ? "Selecciona cómo participa esta institución en el manejo del paciente."
                            : "Selecciona la relación principal de esta persona con el paciente."}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {roleOptions.map((option) => {
                        const isSelected = selectedRole === option.value;

                        return (
                            <label
                                key={option.value}
                                className={[
                                    "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 shadow-sm transition",
                                    "hover:border-blue-300 hover:bg-blue-50/40",
                                    isSelected
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 bg-white",
                                ].join(" ")}
                            >
                                <input
                                    type="radio"
                                    value={option.value}
                                    {...register("role")}
                                    className="mt-1 h-4 w-4 accent-blue-600"
                                />

                                <span className="min-w-0 space-y-1">
                                    <span className="block text-sm font-semibold text-slate-800">
                                        {option.label}
                                    </span>

                                    <span className="block text-xs leading-5 text-slate-500">
                                        {option.description}
                                    </span>
                                </span>
                            </label>
                        );
                    })}
                </div>

                {roleErrorMessage && (
                    <p className="text-xs font-medium text-red-600">
                        {roleErrorMessage}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="specific_relationship"
                    className="text-sm font-medium text-slate-700"
                >
                    Vínculo específico
                </label>

                <input
                    id="specific_relationship"
                    type="text"
                    {...register("specific_relationship")}
                    placeholder={
                        safeContactType === "INSTITUTION"
                            ? "Ej: refugio responsable, clínica remitente, criadero registrado..."
                            : "Ej: madre, padre, vecino, cuidador principal..."
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {specificRelationshipErrorMessage ? (
                    <p className="text-xs font-medium text-red-600">
                        {specificRelationshipErrorMessage}
                    </p>
                ) : (
                    <p className="text-xs text-slate-500">
                        Campo opcional para describir mejor el vínculo real con
                        el paciente.
                    </p>
                )}
            </div>
        </section>
    );
}
