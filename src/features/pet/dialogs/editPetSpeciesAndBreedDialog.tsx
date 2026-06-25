// src/features/pet/dialogs/EditPetSpeciesAndBreedDialog.tsx

"use client";

import {useEffect, useMemo, useState} from "react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import PetIdentityPanel from "../components/petIdentityPanel";
import SpeciesAndBreedFormSection from "../forms/sections/speciesAndBreedSection";

import {PetDataInterface} from "@/features/pet/types/petTypes";
import FormSection from "@/shared/ui/forms/formSection";
import FormLayout from "@/shared/ui/forms/formLayout";
import FormDialog from "@/shared/ui/forms/formDialog";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";
import {updatePetDataApi} from "@/api/pet/updatePetDataApi";

type Props = {
    open: boolean;
    centerId: number;
    pet: PetDataInterface;
    onClose: () => void;
};

const formSchema = z.object({
    species_id: z.string().trim().min(1, "La especie es obligatoria."),
    breed_id: z.string().trim().min(1, "La raza es obligatoria."),
});

type FormValues = z.infer<typeof formSchema>;

function buildDefaultValues(pet: PetDataInterface): FormValues {
    return {
        species_id: pet.species?.id ? String(pet.species.id) : "",
        breed_id: pet.breed?.id ? String(pet.breed.id) : "",
    };
}

export default function EditPetSpeciesAndBreedDialog({
    open,
    centerId,
    pet,
    onClose,
}: Props) {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {setPetDataSlice} = usePetDataSlice();

    const defaultValues = useMemo<FormValues>(() => {
        return buildDefaultValues(pet);
    }, [pet.id, pet.species?.id, pet.breed?.id]);

    const dialogKey = useMemo(() => {
        return [
            "edit-pet-species-and-breed",
            pet.id,
            pet.species?.id ?? "no-species",
            pet.breed?.id ?? "no-breed",
        ].join("-");
    }, [pet.id, pet.species?.id, pet.breed?.id]);

    useEffect(() => {
        if (!open) {
            setSubmitError(null);
        }
    }, [open]);

    async function handleSubmit(data: FormValues) {
        try {
            setSubmitError(null);

            const updatedPet = await updatePetDataApi({
                centerId,
                petId: pet.id,
                data: {
                    species_id: data.species_id,
                    breed_id: data.breed_id,
                },
            });

            setPetDataSlice(updatedPet);
            onClose();
        } catch (error) {
            console.error(
                "EditPetSpeciesAndBreedDialog:: update failed:: ",
                error,
            );
            setSubmitError(
                "No se pudo actualizar la especie y la raza de la mascota.",
            );
        }
    }

    return (
        <FormDialog<FormValues>
            key={dialogKey}
            open={open}
            title="Editar especie y raza"
            submitLabel="Guardar"
            cancelLabel="Cancelar"
            defaultValues={defaultValues}
            onClose={onClose}
            onSubmit={handleSubmit}
            resolver={zodResolver(formSchema)}
            size="lg"
        >
            <div className="flex items-start gap-6">
                <PetIdentityPanel pet={pet} />

                <div className="flex-1">
                    <FormLayout>
                        <FormSection title="Especie y raza de la mascota">
                            <SpeciesAndBreedFormSection centerId={centerId} />
                        </FormSection>

                        {submitError && (
                            <p className="text-sm text-red-600">
                                {submitError}
                            </p>
                        )}
                    </FormLayout>
                </div>
            </div>
        </FormDialog>
    );
}
