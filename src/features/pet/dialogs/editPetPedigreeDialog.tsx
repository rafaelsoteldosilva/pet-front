// src/features/pet/dialogs/editPetPedigreeDialog.tsx

"use client";

import {useEffect} from "react";
import {useFormContext, useWatch} from "react-hook-form";

import type {PetDataInterface} from "@/features/pet/types/petTypes";
import {
    updatePetDataApi,
    type UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";
import {getAxiosErrorMessage} from "@/api/shared/getAxiosErrorMessage";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleBooleanFieldSection from "@/shared/ui/forms/fields/singleBooleanFieldSection";
import SingleTextFieldSection from "@/shared/ui/forms/fields/singleTextFieldSection";
import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

type DialogSize = "sm" | "md" | "lg" | "xl";

type BooleanRadioValue = "true" | "false";

type Props = {
    open: boolean;
    centerId: number;
    pet: PetDataInterface;
    onClose: () => void;
    onSaved?: (updatedPet: PetDataInterface) => void;
    dialogSize?: DialogSize;
};

type FormValues = {
    has_pedigree: BooleanRadioValue;
    pedigree_registry: string;
    reason: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

const PEDIGREE_REQUIRED_MESSAGE =
    "El registro de pedigrí es obligatorio cuando la mascota tiene pedigrí.";

const PEDIGREE_MAX_LENGTH_MESSAGE =
    "El registro de pedigrí no puede superar los 50 caracteres.";

function normalizeTextValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return String(value);
}

function normalizeBooleanValue(value: unknown): boolean {
    if (value === true) return true;
    if (value === false) return false;

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (normalized === "true") return true;
        if (normalized === "false") return false;
        if (normalized === "1") return true;
        if (normalized === "0") return false;
        if (normalized === "si") return true;
        if (normalized === "sí") return true;
        if (normalized === "no") return false;
    }

    if (typeof value === "number") {
        return value === 1;
    }

    return false;
}

function toBooleanRadioValue(value: unknown): BooleanRadioValue {
    return normalizeBooleanValue(value) ? "true" : "false";
}

function getDialogErrorMessage(error: unknown) {
    if (
        error instanceof Error &&
        !(error as {isAxiosError?: boolean}).isAxiosError
    ) {
        return error.message;
    }

    return getAxiosErrorMessage(error);
}

function PedigreeFields() {
    const {
        register,
        setValue,
        clearErrors,
        formState: {errors},
    } = useFormContext<FormValues>();

    const watchedHasPedigree = useWatch<FormValues, "has_pedigree">({
        name: "has_pedigree",
    });

    const watchedPedigreeRegistry = useWatch<FormValues, "pedigree_registry">({
        name: "pedigree_registry",
    });

    const hasPedigree = watchedHasPedigree === "true";
    const pedigreeRegistry = normalizeTextValue(watchedPedigreeRegistry);

    const pedigreeRegistryError =
        typeof errors.pedigree_registry?.message === "string"
            ? errors.pedigree_registry.message
            : null;

    useEffect(() => {
        if (hasPedigree) return;

        setValue("pedigree_registry", "", {
            shouldDirty: pedigreeRegistry.trim() !== "",
            shouldTouch: false,
            shouldValidate: false,
        });

        clearErrors("pedigree_registry");
    }, [hasPedigree, pedigreeRegistry, setValue, clearErrors]);

    return (
        <div className="w-full space-y-4">
            <SingleBooleanFieldSection
                name="has_pedigree"
                label="¿Tiene pedigrí?"
                description="Indica si la mascota posee pedigrí."
                trueLabel="Sí"
                falseLabel="No"
            />

            {hasPedigree && (
                <div>
                    <label
                        htmlFor="pedigree_registry"
                        className="mb-1 block text-sm font-semibold text-slate-800"
                    >
                        Registro de Pedigrí
                    </label>

                    <p className="mb-2 text-xs text-slate-500">
                        Obligatorio cuando la mascota tiene pedigrí.
                    </p>

                    <input
                        id="pedigree_registry"
                        type="text"
                        maxLength={50}
                        placeholder="Ej: ABC-12345"
                        {...register("pedigree_registry", {
                            validate: (value) => {
                                const trimmedValue =
                                    normalizeTextValue(value).trim();

                                if (!trimmedValue) {
                                    return PEDIGREE_REQUIRED_MESSAGE;
                                }

                                if (trimmedValue.length > 50) {
                                    return PEDIGREE_MAX_LENGTH_MESSAGE;
                                }

                                return true;
                            },
                        })}
                        className={[
                            "w-full rounded-xl border px-4 py-2 text-sm text-slate-900 outline-none",
                            "focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
                            pedigreeRegistryError
                                ? "border-red-300 bg-red-50"
                                : "border-slate-300 bg-white",
                        ].join(" ")}
                    />

                    <div className="mt-1 flex justify-between gap-3 text-xs">
                        <span
                            className={
                                pedigreeRegistryError
                                    ? "font-medium text-red-600"
                                    : "text-slate-500"
                            }
                        >
                            {pedigreeRegistryError ?? ""}
                        </span>

                        <span className="shrink-0 text-slate-400">
                            {pedigreeRegistry.length}/50
                        </span>
                    </div>
                </div>
            )}

            {!hasPedigree && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Al guardar, el registro de pedigrí se limpiará
                    automáticamente.
                </div>
            )}

            <SingleTextFieldSection
                name="reason"
                label="Razón del Cambio (opcional)"
                description="Indica por qué se está realizando este cambio. Esta información quedará registrada para auditoría."
                placeholder="Ej: Corrección del registro de pedigrí informado por el responsable."
                maxLength={300}
                rows={3}
                multiline={true}
                showCounter={true}
            />
        </div>
    );
}

export default function EditPetPedigreeDialog({
    open,
    centerId,
    pet,
    onClose,
    onSaved,
    dialogSize = "lg",
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const currentHasPedigreeValue = toBooleanRadioValue(pet.has_pedigree);
    const currentPedigreeRegistry = normalizeTextValue(pet.pedigree_registry);

    const dialogKey = [
        pet.id,
        open ? "open" : "closed",
        currentHasPedigreeValue,
        currentPedigreeRegistry,
    ].join("-");

    return (
        <EditSingleEntityFieldDialog<
            PetDataInterface,
            FormValues,
            UpdatePayload
        >
            key={dialogKey}
            open={open}
            title="Editar pedigrí"
            sectionTitle="Pedigrí de la Mascota"
            entity={pet}
            defaultValues={{
                has_pedigree: currentHasPedigreeValue,
                pedigree_registry: currentPedigreeRegistry,
                reason: "",
            }}
            onClose={onClose}
            dialogSize={dialogSize}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={(values) => {
                const hasPedigree = values.has_pedigree === "true";
                const trimmedReason = normalizeTextValue(values.reason).trim();

                if (trimmedReason.length > 300) {
                    throw new Error(
                        "La razón del cambio no puede superar los 300 caracteres.",
                    );
                }

                const data = {
                    has_pedigree: hasPedigree,
                    pedigree_registry: null,
                } as UpdatePetDataPayload;

                if (hasPedigree) {
                    const trimmedPedigreeRegistry = normalizeTextValue(
                        values.pedigree_registry,
                    ).trim();

                    if (!trimmedPedigreeRegistry) {
                        throw new Error(PEDIGREE_REQUIRED_MESSAGE);
                    }

                    if (trimmedPedigreeRegistry.length > 50) {
                        throw new Error(PEDIGREE_MAX_LENGTH_MESSAGE);
                    }

                    data.pedigree_registry = trimmedPedigreeRegistry;
                }

                if (trimmedReason) {
                    data.reason = trimmedReason;
                }

                return {
                    centerId,
                    petId: pet.id,
                    data,
                };
            }}
            updateEntity={updatePetDataApi}
            onSaved={(updatedPet) => {
                setPetDataSlice(updatedPet);
                onSaved?.(updatedPet);
            }}
            getErrorMessage={getDialogErrorMessage}
        >
            <PedigreeFields />
        </EditSingleEntityFieldDialog>
    );
}
