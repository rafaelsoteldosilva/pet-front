// src/features/pet/dialogs/editPetDateFieldDialog.tsx

"use client";

import axios from "axios";
import {type ReactNode} from "react";
import {useFormContext, useWatch} from "react-hook-form";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {updatePetDataApi} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleDateFieldSection from "@/shared/ui/forms/fields/singleDateFieldSection";

type DateFieldValidatorContext = {
    pet: PetDataInterface;
    fieldName: keyof PetDataInterface & string;
    rawValue: string;
    trimmedValue: string;
    emptyAsNull: boolean;
    min?: string;
    max?: string;
};

type DateFieldValidator = (
    value: string,
    context: DateFieldValidatorContext,
) => string | null | undefined | Promise<string | null | undefined>;

type DateFieldPreviewContext = {
    pet: PetDataInterface;
    fieldName: keyof PetDataInterface & string;
    value: string;
    emptyAsNull: boolean;
    min?: string;
    max?: string;
};

type DateFieldPreviewRenderer = (context: DateFieldPreviewContext) => ReactNode;

type Props = {
    open: boolean;
    centerId: number;
    pet: PetDataInterface;
    onClose: () => void;
    onSaved?: (updatedPet: PetDataInterface) => void;

    title: string;
    sectionTitle: string;
    fieldName: keyof PetDataInterface & string;
    label: string;
    description?: string;

    min?: string;
    max?: string;

    emptyAsNull?: boolean;
    validateValue?: DateFieldValidator | null;

    showAgePreview?: boolean;
    agePreviewTitle?: string;
    agePreviewDescription?: string;
    agePreviewEmptyText?: string;

    renderPreview?: DateFieldPreviewRenderer | null;
};

type FormValues = {
    value: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: Record<string, unknown>;
};

function normalizeDateValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    const text = String(value).trim();

    if (!text) {
        return "";
    }

    return text.slice(0, 10);
}

function parseDateOnly(value: string): Date | null {
    const normalizedValue = normalizeDateValue(value);

    if (!normalizedValue) {
        return null;
    }

    const parts = normalizedValue.split("-");

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return null;
    }

    if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function formatPetAgeFromBirthDate(
    birthDateValue: string,
    emptyText: string,
): string {
    const birthDate = parseDateOnly(birthDateValue);

    if (!birthDate) {
        return emptyText;
    }

    const today = new Date();
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    if (birthDate > todayDateOnly) {
        return "La fecha está en el futuro.";
    }

    let years = todayDateOnly.getFullYear() - birthDate.getFullYear();
    let months = todayDateOnly.getMonth() - birthDate.getMonth();

    if (todayDateOnly.getDate() < birthDate.getDate()) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (years < 0) {
        return "La fecha está en el futuro.";
    }

    const yearsText = `${years} año${years === 1 ? "" : "s"}`;
    const monthsText = `${months} mes${months === 1 ? "" : "es"}`;

    return `${yearsText} y ${monthsText}`;
}

function getDateFieldSubmitError(error: unknown, fieldName: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data && typeof data === "object") {
            const responseData = data as Record<string, unknown>;
            const fieldError = responseData[fieldName];

            if (Array.isArray(fieldError) && fieldError.length > 0) {
                return String(fieldError[0]);
            }

            if (typeof fieldError === "string") {
                return fieldError;
            }

            const detail = responseData.detail;

            if (Array.isArray(detail) && detail.length > 0) {
                return String(detail[0]);
            }

            if (typeof detail === "string") {
                return detail;
            }
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudo actualizar el campo.";
}

function DateFieldBody({
    pet,
    fieldName,
    label,
    description,
    min,
    max,
    emptyAsNull,
    showAgePreview,
    agePreviewTitle,
    agePreviewDescription,
    agePreviewEmptyText,
    renderPreview,
}: {
    pet: PetDataInterface;
    fieldName: keyof PetDataInterface & string;
    label: string;
    description?: string;
    min?: string;
    max?: string;
    emptyAsNull: boolean;
    showAgePreview: boolean;
    agePreviewTitle: string;
    agePreviewDescription: string;
    agePreviewEmptyText: string;
    renderPreview: DateFieldPreviewRenderer | null;
}) {
    const {control} = useFormContext<FormValues>();

    const watchedValue = useWatch({
        control,
        name: "value",
    });

    const normalizedValue = normalizeDateValue(watchedValue);

    return (
        <div className="space-y-4">
            <SingleDateFieldSection
                name="value"
                label={label}
                description={description}
                min={min}
                max={max}
            />

            {showAgePreview && (
                <div>
                    <p className="text-sm font-semibold text-slate-700">
                        {agePreviewTitle}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {agePreviewDescription}
                    </p>

                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm">
                        {formatPetAgeFromBirthDate(
                            normalizedValue,
                            agePreviewEmptyText,
                        )}
                    </div>
                </div>
            )}

            {renderPreview?.({
                pet,
                fieldName,
                value: normalizedValue,
                emptyAsNull,
                min,
                max,
            })}
        </div>
    );
}

export default function EditPetDateFieldDialog({
    open,
    centerId,
    pet,
    onClose,
    onSaved,
    title,
    sectionTitle,
    fieldName,
    label,
    description,
    min,
    max,
    emptyAsNull = true,
    validateValue = null,
    showAgePreview = false,
    agePreviewTitle = "Edad",
    agePreviewDescription = "Vista previa calculada automáticamente a partir de la fecha de nacimiento.",
    agePreviewEmptyText = "Selecciona una fecha para calcular la edad.",
    renderPreview = null,
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const currentValue = pet[fieldName];
    const defaultValue = normalizeDateValue(currentValue);

    return (
        <EditSingleEntityFieldDialog<
            PetDataInterface,
            FormValues,
            UpdatePayload
        >
            open={open}
            title={title}
            sectionTitle={sectionTitle}
            entity={pet}
            defaultValues={{
                value: defaultValue,
            }}
            onClose={onClose}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={async (values) => {
                const rawValue = values.value ?? "";
                const trimmedValue = normalizeDateValue(rawValue);

                if (!emptyAsNull && trimmedValue === "") {
                    throw new Error("Este campo no puede estar vacío.");
                }

                if (validateValue) {
                    const validationError = await validateValue(trimmedValue, {
                        pet,
                        fieldName,
                        rawValue,
                        trimmedValue,
                        emptyAsNull,
                        min,
                        max,
                    });

                    if (validationError) {
                        throw new Error(validationError);
                    }
                }

                const payloadValue =
                    trimmedValue === ""
                        ? emptyAsNull
                            ? null
                            : ""
                        : trimmedValue;

                return {
                    centerId,
                    petId: pet.id,
                    data: {
                        [fieldName]: payloadValue,
                    },
                };
            }}
            updateEntity={updatePetDataApi}
            onSaved={(updatedPet) => {
                setPetDataSlice(updatedPet);
                onSaved?.(updatedPet);
            }}
            getErrorMessage={(error) =>
                getDateFieldSubmitError(error, fieldName)
            }
        >
            <DateFieldBody
                pet={pet}
                fieldName={fieldName}
                label={label}
                description={description}
                min={min}
                max={max}
                emptyAsNull={emptyAsNull}
                showAgePreview={showAgePreview}
                agePreviewTitle={agePreviewTitle}
                agePreviewDescription={agePreviewDescription}
                agePreviewEmptyText={agePreviewEmptyText}
                renderPreview={renderPreview}
            />
        </EditSingleEntityFieldDialog>
    );
}
