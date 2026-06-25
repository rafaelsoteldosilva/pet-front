// src/features/pet/dialogs/editPetSelectFieldDialog.tsx

"use client";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import {updatePetDataApi} from "@/api/pet/updatePetDataApi";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleSelectFieldSection, {
    SingleSelectOption,
} from "@/shared/ui/forms/fields/singleSelectFieldSection";

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

    parseValue?: (value: string) => unknown;
};

type FormValues = {
    value: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: Record<string, unknown>;
};

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
    parseValue,
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const currentValue = pet[fieldName];

    const defaultValue =
        typeof currentValue === "string"
            ? currentValue
            : currentValue == null
              ? ""
              : String(currentValue);

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
                if (!allowEmpty && values.value === "") {
                    throw new Error("Selecciona una opción válida.");
                }

                const payloadValue =
                    values.value === ""
                        ? emptyAsNull
                            ? null
                            : ""
                        : parseValue
                          ? parseValue(values.value)
                          : values.value;

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
            <SingleSelectFieldSection
                name="value"
                label={label}
                description={description}
                placeholder={emptyOptionLabel}
                options={options}
            />
        </EditSingleEntityFieldDialog>
    );
}
