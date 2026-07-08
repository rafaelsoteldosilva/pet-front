// src/features/pet/dialogs/editPetMicrochipDialog.tsx

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

import {
    validateMicrochipCode,
    validateMicrochipDate,
} from "@/shared/utils/utilityFunctions";

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
    has_microchip: BooleanRadioValue;
    microchip_code: string;
    microchip_date: string;
    microchip_body_region: string;
    reason: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

type MicrochipFieldsProps = {
    pet: PetDataInterface;
};

const MICROCHIP_CODE_REQUIRED_MESSAGE =
    "El código del microchip es obligatorio cuando la mascota tiene microchip.";

const MICROCHIP_REGION_REQUIRED_MESSAGE =
    "La ubicación corporal del microchip es obligatoria cuando la mascota tiene microchip.";

const MICROCHIP_REGION_MAX_LENGTH_MESSAGE =
    "La ubicación corporal no puede superar los 80 caracteres.";

function normalizeTextValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return String(value);
}

function normalizeDateValue(value: unknown): string {
    const rawValue = normalizeTextValue(value).trim();

    if (!rawValue) return "";

    return rawValue.slice(0, 10);
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

function MicrochipFields({pet}: MicrochipFieldsProps) {
    const {
        register,
        setValue,
        clearErrors,
        formState: {errors},
    } = useFormContext<FormValues>();

    const watchedHasMicrochip = useWatch<FormValues, "has_microchip">({
        name: "has_microchip",
    });

    const watchedMicrochipCode = useWatch<FormValues, "microchip_code">({
        name: "microchip_code",
    });

    const watchedMicrochipBodyRegion = useWatch<
        FormValues,
        "microchip_body_region"
    >({
        name: "microchip_body_region",
    });

    const hasMicrochip = watchedHasMicrochip === "true";
    const microchipCode = normalizeTextValue(watchedMicrochipCode);
    const microchipBodyRegion = normalizeTextValue(watchedMicrochipBodyRegion);

    const microchipCodeError =
        typeof errors.microchip_code?.message === "string"
            ? errors.microchip_code.message
            : null;

    const microchipDateError =
        typeof errors.microchip_date?.message === "string"
            ? errors.microchip_date.message
            : null;

    const microchipBodyRegionError =
        typeof errors.microchip_body_region?.message === "string"
            ? errors.microchip_body_region.message
            : null;

    useEffect(() => {
        if (hasMicrochip) return;

        setValue("microchip_code", "", {
            shouldDirty: microchipCode.trim() !== "",
            shouldTouch: false,
            shouldValidate: false,
        });

        setValue("microchip_date", "", {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
        });

        setValue("microchip_body_region", "", {
            shouldDirty: microchipBodyRegion.trim() !== "",
            shouldTouch: false,
            shouldValidate: false,
        });

        clearErrors([
            "microchip_code",
            "microchip_date",
            "microchip_body_region",
        ]);
    }, [
        hasMicrochip,
        microchipCode,
        microchipBodyRegion,
        setValue,
        clearErrors,
    ]);

    return (
        <div className="w-full space-y-4">
            <SingleBooleanFieldSection
                name="has_microchip"
                label="¿Tiene microchip?"
                description="Indica si la mascota tiene microchip."
                trueLabel="Sí"
                falseLabel="No"
            />

            {hasMicrochip && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="microchip_code"
                            className="mb-1 block text-sm font-semibold text-slate-800"
                        >
                            Código Microchip
                        </label>

                        <p className="mb-2 text-xs text-slate-500">
                            Obligatorio cuando la mascota tiene microchip.
                        </p>

                        <input
                            id="microchip_code"
                            type="text"
                            maxLength={30}
                            placeholder="Ej: 123456789012345"
                            {...register("microchip_code", {
                                validate: (value) => {
                                    const trimmedValue =
                                        normalizeTextValue(value).trim();

                                    if (!trimmedValue) {
                                        return MICROCHIP_CODE_REQUIRED_MESSAGE;
                                    }

                                    const validationError =
                                        validateMicrochipCode(trimmedValue);

                                    if (validationError) {
                                        return validationError;
                                    }

                                    return true;
                                },
                            })}
                            className={[
                                "w-full rounded-xl border px-4 py-2 text-sm text-slate-900 outline-none",
                                "focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
                                microchipCodeError
                                    ? "border-red-300 bg-red-50"
                                    : "border-slate-300 bg-white",
                            ].join(" ")}
                        />

                        <div className="mt-1 flex justify-between gap-3 text-xs">
                            <span
                                className={
                                    microchipCodeError
                                        ? "font-medium text-red-600"
                                        : "text-slate-500"
                                }
                            >
                                {microchipCodeError ?? ""}
                            </span>

                            <span className="shrink-0 text-slate-400">
                                {microchipCode.length}/30
                            </span>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="microchip_date"
                            className="mb-1 block text-sm font-semibold text-slate-800"
                        >
                            Fecha de Implantación
                        </label>

                        <p className="mb-2 text-xs text-slate-500">
                            Opcional. No puede ser futura ni anterior al
                            nacimiento.
                        </p>

                        <input
                            id="microchip_date"
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            {...register("microchip_date", {
                                validate: (value) => {
                                    const trimmedValue =
                                        normalizeDateValue(value);

                                    if (!trimmedValue) return true;

                                    const validationError =
                                        validateMicrochipDate(trimmedValue, {
                                            pet,
                                        });

                                    if (validationError) {
                                        return validationError;
                                    }

                                    return true;
                                },
                            })}
                            className={[
                                "w-full rounded-xl border px-4 py-2 text-sm text-slate-900 outline-none",
                                "focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
                                microchipDateError
                                    ? "border-red-300 bg-red-50"
                                    : "border-slate-300 bg-white",
                            ].join(" ")}
                        />

                        {microchipDateError && (
                            <p className="mt-1 text-xs font-medium text-red-600">
                                {microchipDateError}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="microchip_body_region"
                            className="mb-1 block text-sm font-semibold text-slate-800"
                        >
                            Ubicación corporal
                        </label>

                        <p className="mb-2 text-xs text-slate-500">
                            Obligatorio cuando la mascota tiene microchip.
                        </p>

                        <input
                            id="microchip_body_region"
                            type="text"
                            maxLength={80}
                            placeholder="Ej: Lado izquierdo del cuello"
                            {...register("microchip_body_region", {
                                validate: (value) => {
                                    const trimmedValue =
                                        normalizeTextValue(value).trim();

                                    if (!trimmedValue) {
                                        return MICROCHIP_REGION_REQUIRED_MESSAGE;
                                    }

                                    if (trimmedValue.length > 80) {
                                        return MICROCHIP_REGION_MAX_LENGTH_MESSAGE;
                                    }

                                    return true;
                                },
                            })}
                            className={[
                                "w-full rounded-xl border px-4 py-2 text-sm text-slate-900 outline-none",
                                "focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
                                microchipBodyRegionError
                                    ? "border-red-300 bg-red-50"
                                    : "border-slate-300 bg-white",
                            ].join(" ")}
                        />

                        <div className="mt-1 flex justify-between gap-3 text-xs">
                            <span
                                className={
                                    microchipBodyRegionError
                                        ? "font-medium text-red-600"
                                        : "text-slate-500"
                                }
                            >
                                {microchipBodyRegionError ?? ""}
                            </span>

                            <span className="shrink-0 text-slate-400">
                                {microchipBodyRegion.length}/80
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {!hasMicrochip && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Al guardar, el código, la fecha de implantación y la
                    ubicación corporal del microchip se limpiarán
                    automáticamente.
                </div>
            )}

            <SingleTextFieldSection
                name="reason"
                label="Razón del Cambio (opcional)"
                description="Indica por qué se está realizando este cambio. Esta información quedará registrada para auditoría."
                placeholder="Ej: Corrección de datos del microchip."
                maxLength={300}
                rows={3}
                multiline={true}
                showCounter={true}
            />
        </div>
    );
}

export default function EditPetMicrochipDialog({
    open,
    centerId,
    pet,
    onClose,
    onSaved,
    dialogSize = "lg",
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const currentHasMicrochipValue = toBooleanRadioValue(pet.has_microchip);
    const currentMicrochipCode = normalizeTextValue(pet.microchip_code);
    const currentMicrochipDate = normalizeDateValue(pet.microchip_date);
    const currentMicrochipBodyRegion = normalizeTextValue(
        pet.microchip_body_region,
    );

    const dialogKey = [
        pet.id,
        open ? "open" : "closed",
        currentHasMicrochipValue,
        currentMicrochipCode,
        currentMicrochipDate,
        currentMicrochipBodyRegion,
    ].join("-");

    return (
        <EditSingleEntityFieldDialog<
            PetDataInterface,
            FormValues,
            UpdatePayload
        >
            key={dialogKey}
            open={open}
            title="Editar microchip"
            sectionTitle="Microchip de la Mascota"
            entity={pet}
            defaultValues={{
                has_microchip: currentHasMicrochipValue,
                microchip_code: currentMicrochipCode,
                microchip_date: currentMicrochipDate,
                microchip_body_region: currentMicrochipBodyRegion,
                reason: "",
            }}
            onClose={onClose}
            dialogSize={dialogSize}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={(values) => {
                const hasMicrochip = values.has_microchip === "true";
                const trimmedReason = normalizeTextValue(values.reason).trim();

                if (trimmedReason.length > 300) {
                    throw new Error(
                        "La razón del cambio no puede superar los 300 caracteres.",
                    );
                }

                const data = {
                    has_microchip: hasMicrochip,
                    microchip_code: null,
                    microchip_date: null,
                    microchip_body_region: null,
                } as UpdatePetDataPayload;

                if (hasMicrochip) {
                    const trimmedMicrochipCode = normalizeTextValue(
                        values.microchip_code,
                    ).trim();

                    const trimmedMicrochipDate = normalizeDateValue(
                        values.microchip_date,
                    );

                    const trimmedMicrochipBodyRegion = normalizeTextValue(
                        values.microchip_body_region,
                    ).trim();

                    if (!trimmedMicrochipCode) {
                        throw new Error(MICROCHIP_CODE_REQUIRED_MESSAGE);
                    }

                    const microchipCodeValidationError =
                        validateMicrochipCode(trimmedMicrochipCode);

                    if (microchipCodeValidationError) {
                        throw new Error(microchipCodeValidationError);
                    }

                    if (trimmedMicrochipDate) {
                        const microchipDateValidationError =
                            validateMicrochipDate(trimmedMicrochipDate, {
                                pet,
                            });

                        if (microchipDateValidationError) {
                            throw new Error(microchipDateValidationError);
                        }
                    }

                    if (!trimmedMicrochipBodyRegion) {
                        throw new Error(MICROCHIP_REGION_REQUIRED_MESSAGE);
                    }

                    if (trimmedMicrochipBodyRegion.length > 80) {
                        throw new Error(MICROCHIP_REGION_MAX_LENGTH_MESSAGE);
                    }

                    data.microchip_code = trimmedMicrochipCode;
                    data.microchip_date = trimmedMicrochipDate || null;
                    data.microchip_body_region = trimmedMicrochipBodyRegion;
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
            <MicrochipFields pet={pet} />
        </EditSingleEntityFieldDialog>
    );
}
