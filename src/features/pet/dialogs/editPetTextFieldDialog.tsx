// src/features/pet/dialogs/EditPetTextFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {updatePetDataApi} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleTextFieldSection from "@/shared/ui/forms/fields/singleTextFieldSection";

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
};

type FormValues = {
    value: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: Record<string, unknown>;
};

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
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const rawValue = pet[fieldName];

    const defaultValue = typeof rawValue === "string" ? rawValue : "";

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
            buildPayload={(values) => {
                const trimmedValue = values.value.trim();

                const validationError = validateValue?.(trimmedValue);

                if (validationError) {
                    throw new Error(validationError);
                }

                return {
                    centerId,
                    petId: pet.id,
                    data: {
                        [fieldName]:
                            emptyAsNull && trimmedValue === ""
                                ? null
                                : trimmedValue,
                    },
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
        </EditSingleEntityFieldDialog>
    );
}
