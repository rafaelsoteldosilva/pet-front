// src/features/pet/dialogs/editPetBooleanFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {updatePetDataApi} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleBooleanFieldSection from "@/shared/ui/forms/fields/singleBooleanFieldSection";

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
};

type FormValues = {
    value: "true" | "false";
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: Record<string, unknown>;
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
            }}
            onClose={onClose}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={(values) => {
                if (disableFalse && values.value === "false") {
                    throw new Error(disableFalseReason);
                }

                return {
                    centerId,
                    petId: pet.id,
                    data: {
                        [fieldName]: values.value === "true",
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
            <SingleBooleanFieldSection
                name="value"
                label={label}
                description={description}
                trueLabel={trueLabel}
                falseLabel={falseLabel}
                disableFalse={disableFalse}
                disableFalseReason={disableFalseReason}
            />
        </EditSingleEntityFieldDialog>
    );
}
