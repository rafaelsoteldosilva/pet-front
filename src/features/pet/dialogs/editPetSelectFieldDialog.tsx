// src/features/pet/dialogs/editPetSelectFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {
    updatePetDataApi,
    type UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleSelectFieldSection, {
    type SingleSelectOption,
} from "@/shared/ui/forms/fields/singleSelectFieldSection";
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

    options: SingleSelectOption[];

    allowEmpty?: boolean;
    emptyOptionLabel?: string;
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

function normalizeSelectValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return String(value);
}

export default function EditPetSelectFieldDialog({
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

    options,

    allowEmpty = false,
    emptyOptionLabel = "Sin especificar",
    emptyAsNull = true,

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
    const defaultValue = normalizeSelectValue(rawValue);

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
            sidePanel={<PetIdentityPanel pet={pet} />}
            onClose={onClose}
            dialogSize={dialogSize}
            buildPayload={(values) => {
                const selectedValue = values.value.trim();
                const trimmedReason = values.reason.trim();

                if (!allowEmpty && !selectedValue) {
                    throw new Error("Debes seleccionar una opción.");
                }

                const optionExists = options.some(
                    (option) => option.value === selectedValue,
                );

                if (selectedValue && !optionExists) {
                    throw new Error("La opción seleccionada no es válida.");
                }

                if (requireChangeReason && !trimmedReason) {
                    throw new Error("La razón del cambio es obligatoria.");
                }

                if (trimmedReason.length > changeReasonMaxLength) {
                    throw new Error(
                        `La razón del cambio no puede superar los ${changeReasonMaxLength} caracteres.`,
                    );
                }

                const payloadValue =
                    selectedValue === ""
                        ? emptyAsNull
                            ? null
                            : ""
                        : selectedValue;

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
                <SingleSelectFieldSection
                    name="value"
                    label={label}
                    description={description}
                    placeholder={emptyOptionLabel}
                    options={options}
                    includeEmptyOption={allowEmpty}
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
