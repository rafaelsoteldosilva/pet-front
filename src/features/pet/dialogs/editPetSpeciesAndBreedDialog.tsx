// src/features/pet/dialogs/editPetSpeciesAndBreedDialog.tsx

"use client";

import axios from "axios";
import {useEffect, useMemo} from "react";
import {type DefaultValues, useFormContext, useWatch} from "react-hook-form";

import {
    updatePetDataApi,
    type UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";
import {PetDataInterface} from "@/features/pet/types/petTypes";

import {useAllowedSpeciesAndBreedsSlice} from "@/hooks/pet/useAllowedSpeciesAndBreedsSlice";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import EditSingleEntityFieldDialog from "@/shared/ui/entityDialogs/editSingleEntityFieldDialog";
import SingleSelectFieldSection from "@/shared/ui/forms/fields/singleSelectFieldSection";
import SingleTextFieldSection from "@/shared/ui/forms/fields/singleTextFieldSection";

type DialogSize = "sm" | "md" | "lg" | "xl";

type Props = {
    open: boolean;
    centerId: number;
    pet: PetDataInterface;
    onClose: () => void;
    onSaved?: (updatedPet: PetDataInterface) => void;

    title?: string;
    sectionTitle?: string;

    showChangeReason?: boolean;
    requireChangeReason?: boolean;
    changeReasonLabel?: string;
    changeReasonDescription?: string;
    changeReasonPlaceholder?: string;
    changeReasonMaxLength?: number;

    dialogSize?: DialogSize;
};

type FormValues = {
    species_id: string;
    breed_id: string;
    reason: string;
};

type UpdatePayload = {
    centerId: number;
    petId: number;
    data: UpdatePetDataPayload;
};

type SpeciesAndBreedsResult = {
    species: {
        id: number;
        name: string;
    };
    breeds: Array<{
        id: number;
        name: string;
    }>;
};

type SelectOption = {
    value: string;
    label: string;
};

function getSpeciesAndBreedSubmitError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data && typeof data === "object") {
            const responseData = data as Record<string, unknown>;

            const fieldsToCheck = [
                "species_id",
                "breed_id",
                "species",
                "breed",
                "reason",
                "detail",
                "non_field_errors",
            ];

            for (const field of fieldsToCheck) {
                const fieldError = responseData[field];

                if (Array.isArray(fieldError) && fieldError.length > 0) {
                    return String(fieldError[0]);
                }

                if (typeof fieldError === "string") {
                    return fieldError;
                }
            }
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudo actualizar la especie y la raza.";
}

function normalizeIdValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    const normalized = String(value).trim();

    if (!normalized || normalized === "0") {
        return "";
    }

    return normalized;
}

export default function EditPetSpeciesAndBreedDialog({
    open,
    centerId,
    pet,
    onClose,
    onSaved,

    title = "Editar especie y raza",
    sectionTitle = "Especie y raza",

    showChangeReason = true,
    requireChangeReason = false,
    changeReasonLabel = "Razón del Cambio (opcional)",
    changeReasonDescription = "Indica por qué se está realizando este cambio. Esta información quedará registrada para auditoría.",
    changeReasonPlaceholder = "Ej: Corrección de especie o raza registrada previamente.",
    changeReasonMaxLength = 300,

    dialogSize = "lg",
}: Props) {
    const {setPetDataSlice} = usePetDataSlice();

    const {
        speciesAndBreedsResults,
        speciesAndBreedsLoading,
        speciesAndBreedsError,
        loadedCenterId,
        loadAllowedSpeciesAndBreedsSlice,
    } = useAllowedSpeciesAndBreedsSlice();

    useEffect(() => {
        if (!open) return;
        if (!centerId) return;

        const shouldLoadSpeciesAndBreeds =
            loadedCenterId !== centerId || speciesAndBreedsResults.length === 0;

        if (shouldLoadSpeciesAndBreeds) {
            void loadAllowedSpeciesAndBreedsSlice(centerId);
        }
    }, [
        open,
        centerId,
        loadedCenterId,
        speciesAndBreedsResults.length,
        loadAllowedSpeciesAndBreedsSlice,
    ]);

    const currentSpeciesId = normalizeIdValue(pet.species?.id);
    const currentBreedId = normalizeIdValue(pet.breed?.id);

    const catalogReadyKey =
        loadedCenterId === centerId && speciesAndBreedsResults.length > 0
            ? "catalog-ready"
            : "catalog-loading";

    const dialogKey = [
        pet.id,
        open ? "open" : "closed",
        centerId,
        currentSpeciesId,
        currentBreedId,
        catalogReadyKey,
        speciesAndBreedsResults.length,
    ].join("-");

    const defaultValues: DefaultValues<FormValues> = {
        species_id: currentSpeciesId,
        breed_id: currentBreedId,
        reason: "",
    };

    return (
        <EditSingleEntityFieldDialog<
            PetDataInterface,
            FormValues,
            UpdatePayload
        >
            key={dialogKey}
            open={open}
            title={title}
            sectionTitle={sectionTitle}
            entity={pet}
            defaultValues={defaultValues}
            onClose={onClose}
            dialogSize={dialogSize}
            sidePanel={<PetIdentityPanel pet={pet} />}
            buildPayload={(values) => {
                const speciesId = Number(values.species_id);
                const breedId = values.breed_id
                    ? Number(values.breed_id)
                    : null;

                const trimmedReason = values.reason.trim();

                if (!speciesId) {
                    throw new Error("Debe seleccionar una especie.");
                }

                const selectedSpeciesGroup = speciesAndBreedsResults.find(
                    (item) => item.species.id === speciesId,
                );

                if (!selectedSpeciesGroup) {
                    throw new Error(
                        "La especie seleccionada no está disponible.",
                    );
                }

                if (breedId !== null) {
                    const breedBelongsToSpecies =
                        selectedSpeciesGroup.breeds.some(
                            (breed) => breed.id === breedId,
                        );

                    if (!breedBelongsToSpecies) {
                        throw new Error(
                            "La raza seleccionada no pertenece a la especie seleccionada.",
                        );
                    }
                }

                if (requireChangeReason && !trimmedReason) {
                    throw new Error("La razón del cambio es obligatoria.");
                }

                if (trimmedReason.length > changeReasonMaxLength) {
                    throw new Error(
                        `La razón del cambio no puede superar los ${changeReasonMaxLength} caracteres.`,
                    );
                }

                const data: UpdatePetDataPayload = {
                    species_id: values.species_id,
                    breed_id: values.breed_id || null,
                };

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
            getErrorMessage={getSpeciesAndBreedSubmitError}
        >
            <div className="w-full space-y-4">
                <SpeciesAndBreedFields
                    speciesAndBreedsResults={speciesAndBreedsResults}
                    loading={speciesAndBreedsLoading}
                    error={speciesAndBreedsError}
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

type SpeciesAndBreedFieldsProps = {
    speciesAndBreedsResults: SpeciesAndBreedsResult[];
    loading: boolean;
    error: string | null;
};

function SpeciesAndBreedFields({
    speciesAndBreedsResults,
    loading,
    error,
}: SpeciesAndBreedFieldsProps) {
    const {control, setValue} = useFormContext<FormValues>();

    const selectedSpeciesIdValue = useWatch({
        control,
        name: "species_id",
    });

    const selectedBreedIdValue = useWatch({
        control,
        name: "breed_id",
    });

    const selectedSpeciesId = selectedSpeciesIdValue
        ? Number(selectedSpeciesIdValue)
        : null;

    const selectedSpeciesGroup = useMemo(() => {
        if (!selectedSpeciesId) return null;

        return (
            speciesAndBreedsResults.find(
                (item) => item.species.id === selectedSpeciesId,
            ) ?? null
        );
    }, [speciesAndBreedsResults, selectedSpeciesId]);

    const speciesOptions: SelectOption[] = useMemo(() => {
        return [
            {
                value: "",
                label: "Seleccione una opción",
            },
            ...speciesAndBreedsResults.map((item) => ({
                value: String(item.species.id),
                label: item.species.name,
            })),
        ];
    }, [speciesAndBreedsResults]);

    const breedOptions: SelectOption[] = useMemo(() => {
        if (!selectedSpeciesGroup) {
            return [
                {
                    value: "",
                    label: "Seleccione primero una especie",
                },
            ];
        }

        return [
            {
                value: "",
                label: "Seleccione una opción",
            },
            ...selectedSpeciesGroup.breeds.map((breed) => ({
                value: String(breed.id),
                label: breed.name,
            })),
        ];
    }, [selectedSpeciesGroup]);

    useEffect(() => {
        if (!selectedBreedIdValue) return;

        const selectedBreedId = Number(selectedBreedIdValue);

        const breedBelongsToSelectedSpecies =
            selectedSpeciesGroup?.breeds.some(
                (breed) => breed.id === selectedBreedId,
            ) ?? false;

        if (!breedBelongsToSelectedSpecies) {
            setValue("breed_id", "", {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [selectedBreedIdValue, selectedSpeciesGroup, setValue]);

    return (
        <div className="space-y-3">
            {loading && (
                <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                    Cargando especies y razas...
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SingleSelectFieldSection
                    name="species_id"
                    label="Especie"
                    description="Selecciona la especie del paciente."
                    options={speciesOptions}
                />

                <SingleSelectFieldSection
                    name="breed_id"
                    label="Raza"
                    description="Selecciona la raza del paciente."
                    options={breedOptions}
                />
            </div>
        </div>
    );
}
