// src/features/pet/dialogs/editPetTextFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {
    updatePetDataApi,
    type UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleTextFieldSection from "@/shared/ui/forms/fields/singleTextFieldSection";
import PetIdentityPanel from "../components/petIdentityPanel";

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
    maxLength?: number;
    rows?: number;
    multiline?: boolean;
    emptyAsNull?: boolean;
    showCounter?: boolean;
    validateValue?: ((value: string) => string | null) | null;

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

function normalizeTextValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return String(value);
}

export default function EditPetTextFieldDialog({
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
    maxLength = 300,
    rows = 4,
    multiline = false,
    emptyAsNull = true,
    showCounter = true,
    validateValue = null,

    showChangeReason = true,
    requireChangeReason = false,
    changeReasonLabel = "Razón del Cambio (opcional)",
    changeReasonDescription = "Indica por qué se está realizando este cambio. Esta información quedará registrada para auditoría.",
    changeReasonPlaceholder = "Ej: Corrección de información registrada previamente.",
    changeReasonMaxLength = 300,

    dialogSize = "md",
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const rawValue = pet[fieldName];
    const defaultValue = normalizeTextValue(rawValue);

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
            dialogSize={dialogSize}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={(values) => {
                const trimmedValue = values.value.trim();
                const trimmedReason = values.reason.trim();

                if (trimmedValue.length > maxLength) {
                    throw new Error(
                        `El campo no puede superar los ${maxLength} caracteres.`,
                    );
                }

                const validationError = validateValue?.(trimmedValue);

                if (validationError) {
                    throw new Error(validationError);
                }

                if (requireChangeReason && !trimmedReason) {
                    throw new Error("La razón del cambio es obligatoria.");
                }

                if (trimmedReason.length > changeReasonMaxLength) {
                    throw new Error(
                        `La razón del cambio no puede superar los ${changeReasonMaxLength} caracteres.`,
                    );
                }

                const fieldValue =
                    emptyAsNull && trimmedValue === "" ? null : trimmedValue;

                const data = {
                    [fieldName]: fieldValue,
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
                <SingleTextFieldSection
                    name="value"
                    label={label}
                    description={description}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    rows={rows}
                    multiline={multiline}
                    showCounter={showCounter}
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
