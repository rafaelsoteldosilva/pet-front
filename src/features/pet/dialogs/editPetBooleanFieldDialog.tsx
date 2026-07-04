// src/features/pet/dialogs/editPetBooleanFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {
    updatePetDataApi,
    type UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleBooleanFieldSection from "@/shared/ui/forms/fields/singleBooleanFieldSection";
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
    trueLabel: string;
    falseLabel: string;

    disableFalse?: boolean;
    disableFalseReason?: string;

    showChangeReason?: boolean;
    requireChangeReason?: boolean;
    changeReasonLabel?: string;
    changeReasonDescription?: string;
    changeReasonPlaceholder?: string;
    changeReasonMaxLength?: number;

    dialogSize?: DialogSize;
};

type FormValues = {
    value: "true" | "false";
    reason: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

export default function EditPetBooleanFieldDialog({
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
    trueLabel,
    falseLabel,

    disableFalse = false,
    disableFalseReason = "No se puede desactivar esta opción.",

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

    const defaultValue: FormValues["value"] =
        currentValue === true ? "true" : "false";

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
                const trimmedReason = values.reason.trim();

                if (disableFalse && values.value === "false") {
                    throw new Error(disableFalseReason);
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
                    [fieldName]: values.value === "true",
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
                <SingleBooleanFieldSection
                    name="value"
                    label={label}
                    description={description}
                    trueLabel={trueLabel}
                    falseLabel={falseLabel}
                    disableFalse={disableFalse}
                    disableFalseReason={disableFalseReason}
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
