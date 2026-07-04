// src/features/pet/dialogs/editPetNumberFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {
    updatePetDataApi,
    type UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleNumberFieldSection from "@/shared/ui/forms/fields/singleNumberFieldSection";
import SingleTextFieldSection from "@/shared/ui/forms/fields/singleTextFieldSection";

type DialogSize = "sm" | "md" | "lg" | "xl";

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
    placeholder?: string;
    suffix?: string;
    step?: number | string;
    min?: number;
    max?: number;
    emptyAsNull?: boolean;

    showChangeReason?: boolean;
    requireChangeReason?: boolean;
    changeReasonLabel?: string;
    changeReasonDescription?: string;
    changeReasonPlaceholder?: string;
    changeReasonMaxLength?: number;

    dialogSize?: DialogSize;
};

type FormValues = {
    value: string;
    reason: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

export default function EditPetNumberFieldDialog({
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
    placeholder,
    suffix,
    step = "1",
    min,
    max,
    emptyAsNull = true,

    showChangeReason = true,
    requireChangeReason = false,
    changeReasonLabel = "Razón del Cambio (opcional)",
    changeReasonDescription = "Indica por qué se está realizando este cambio. Esta información quedará registrada para auditoría.",
    changeReasonPlaceholder = "Ej: Corrección de información registrada previamente.",
    changeReasonMaxLength = 300,

    dialogSize = "lg",
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const currentValue = pet[fieldName];
    const defaultValue = currentValue == null ? "" : String(currentValue);

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
                reason: "",
            }}
            onClose={onClose}
            sidePanel={<PetIdentityPanel pet={pet} />}
            dialogSize={dialogSize}
            buildPayload={(values) => {
                const trimmedValue = values.value.trim();
                const trimmedReason = values.reason.trim();

                let payloadValue: number | string | null;

                if (trimmedValue === "") {
                    payloadValue = emptyAsNull ? null : "";
                } else {
                    const parsedValue = Number(trimmedValue);

                    if (Number.isNaN(parsedValue)) {
                        throw new Error("Ingresa un valor numérico válido.");
                    }

                    if (min !== undefined && parsedValue < min) {
                        throw new Error(
                            `El valor no puede ser menor que ${min}.`,
                        );
                    }

                    if (max !== undefined && parsedValue > max) {
                        throw new Error(
                            `El valor no puede ser mayor que ${max}.`,
                        );
                    }

                    payloadValue = parsedValue;
                }

                if (requireChangeReason && !trimmedReason) {
                    throw new Error("La razón del cambio es obligatoria.");
                }

                if (trimmedReason.length > changeReasonMaxLength) {
                    throw new Error(
                        `La razón del cambio no puede superar los ${changeReasonMaxLength} caracteres.`,
                    );
                }

                const data = {
                    [fieldName]: payloadValue,
                } as UpdatePetDataPayload;

                if (showChangeReason && trimmedReason) {
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
            getErrorMessage={(error) => {
                if (error instanceof Error) {
                    return error.message;
                }

                return "No se pudo actualizar el campo.";
            }}
        >
            <div className="w-full space-y-4">
                <SingleNumberFieldSection
                    name="value"
                    label={label}
                    description={description}
                    placeholder={placeholder}
                    suffix={suffix}
                    step={step}
                    min={min}
                    max={max}
                />

                {showChangeReason && (
                    <SingleTextFieldSection
                        name="reason"
                        label={changeReasonLabel}
                        description={changeReasonDescription}
                        placeholder={changeReasonPlaceholder}
                        maxLength={changeReasonMaxLength}
                        rows={3}
                        multiline={true}
                        showCounter={true}
                    />
                )}
            </div>
        </EditSingleEntityFieldDialog>
    );
}
