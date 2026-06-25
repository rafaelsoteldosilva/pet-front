// src/features/pet/forms/sections/speciesAndBreedSection.tsx

"use client";

import {useEffect, useMemo, useRef} from "react";
import {Controller, useFormContext} from "react-hook-form";

import {useAllowedSpeciesAndBreedsSlice} from "@/hooks/pet/useAllowedSpeciesAndBreedsSlice";

type FormValues = {
    species_id: string;
    breed_id?: string;
};

type BreedOption = {
    id: number;
    name: string;
};

type SpeciesWithBreedsOption = {
    species: {
        id: number;
        name: string;
    };
    breeds: BreedOption[];
};

type Props = {
    centerId: number;
};

export default function SpeciesAndBreedFormSection({centerId}: Props) {
    const {control, watch, setValue, formState} = useFormContext<FormValues>();
    const {errors} = formState;

    const {
        results,
        loading,
        error,
        loadedCenterId,
        loadAllowedSpeciesAndBreedsSlice,
    } = useAllowedSpeciesAndBreedsSlice();

    const selectedSpeciesId = watch("species_id");
    const selectedBreedId = watch("breed_id");

    const previousSpeciesIdRef = useRef<string | undefined>(selectedSpeciesId);
    const requestedCenterIdRef = useRef<number | null>(null);

    const speciesWithBreeds: SpeciesWithBreedsOption[] = Array.isArray(results)
        ? results
        : [];

    useEffect(() => {
        if (!centerId) {
            return;
        }

        if (loading) {
            return;
        }

        if (loadedCenterId === centerId) {
            return;
        }

        if (requestedCenterIdRef.current === centerId) {
            return;
        }

        requestedCenterIdRef.current = centerId;
        loadAllowedSpeciesAndBreedsSlice(centerId);
    }, [centerId, loading, loadedCenterId, loadAllowedSpeciesAndBreedsSlice]);

    useEffect(() => {
        if (loadedCenterId === centerId) {
            requestedCenterIdRef.current = null;
        }
    }, [centerId, loadedCenterId]);

    const selectedSpeciesEntry = useMemo(() => {
        return speciesWithBreeds.find((item) => {
            return String(item.species.id) === String(selectedSpeciesId);
        });
    }, [speciesWithBreeds, selectedSpeciesId]);

    const availableBreeds: BreedOption[] = selectedSpeciesEntry?.breeds ?? [];

    useEffect(() => {
        const previousSpeciesId = previousSpeciesIdRef.current;

        const isInitialHydration =
            (!previousSpeciesId || previousSpeciesId === "") &&
            !!selectedSpeciesId;

        if (isInitialHydration) {
            previousSpeciesIdRef.current = selectedSpeciesId;
            return;
        }

        const speciesChanged =
            !!previousSpeciesId && previousSpeciesId !== selectedSpeciesId;

        if (speciesChanged) {
            setValue("breed_id", "");
        }

        previousSpeciesIdRef.current = selectedSpeciesId;
    }, [selectedSpeciesId, setValue]);

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!selectedSpeciesEntry) {
            return;
        }

        if (!selectedBreedId) {
            return;
        }

        const breedStillAvailable = availableBreeds.some((breed) => {
            return String(breed.id) === String(selectedBreedId);
        });

        if (!breedStillAvailable) {
            setValue("breed_id", "");
        }
    }, [
        loading,
        selectedSpeciesEntry,
        availableBreeds,
        selectedBreedId,
        setValue,
    ]);

    if (loading && speciesWithBreeds.length === 0) {
        return <div>Cargando catálogo...</div>;
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Error cargando especies y razas: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label
                    htmlFor="species_id"
                    className="block text-sm font-medium text-slate-700"
                >
                    Especie <span className="text-red-500">*</span>
                </label>

                <p className="text-sm text-slate-500">
                    Selecciona la especie del paciente.
                </p>

                <Controller
                    name="species_id"
                    control={control}
                    rules={{
                        required: "La especie es obligatoria.",
                    }}
                    render={({field}) => (
                        <select
                            id="species_id"
                            value={field.value ?? ""}
                            onChange={(event) => {
                                field.onChange(event.target.value);
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        >
                            <option value="">
                                Selecciona la especie del paciente
                            </option>

                            {speciesWithBreeds.map((item) => (
                                <option
                                    key={item.species.id}
                                    value={String(item.species.id)}
                                >
                                    {item.species.name}
                                </option>
                            ))}
                        </select>
                    )}
                />

                {errors.species_id && (
                    <p className="text-sm text-red-600">
                        {errors.species_id.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="breed_id"
                    className="block text-sm font-medium text-slate-700"
                >
                    Raza
                </label>

                <p className="text-sm text-slate-500">
                    Selecciona la raza del paciente.
                </p>

                <Controller
                    name="breed_id"
                    control={control}
                    render={({field}) => (
                        <select
                            id="breed_id"
                            value={field.value ?? ""}
                            onChange={(event) => {
                                field.onChange(event.target.value);
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            disabled={!selectedSpeciesId}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                            <option value="">
                                {selectedSpeciesId
                                    ? "Selecciona la raza del paciente"
                                    : "Primero selecciona una especie"}
                            </option>

                            {availableBreeds.map((item) => (
                                <option key={item.id} value={String(item.id)}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    )}
                />

                {errors.breed_id && (
                    <p className="text-sm text-red-600">
                        {errors.breed_id.message}
                    </p>
                )}
            </div>
        </div>
    );
}
