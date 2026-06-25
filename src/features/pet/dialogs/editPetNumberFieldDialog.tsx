// src/features/pet/dialogs/editPetNumberFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {updatePetDataApi} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleNumberFieldSection from "@/shared/ui/forms/fields/singleNumberFieldSection";
// import SingleNumberFieldSection from "@/shared/ui/forms/fields/singleNumberFieldSection";

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
};

type FormValues = {
    value: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: Record<string, unknown>;
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
            }}
            onClose={onClose}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={(values) => {
                const trimmedValue = values.value.trim();

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
            getErrorMessage={(error) => {
                if (error instanceof Error) {
                    return error.message;
                }

                return "No se pudo actualizar el campo.";
            }}
        >
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
        </EditSingleEntityFieldDialog>
    );
}
