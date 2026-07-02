// src/app/(drawer)/gestion_datos/registrar_nuevo_paciente/page.tsx

"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import {createPetApi} from "@/api/pet/createPetApi";

import AddNewPetDialog, {
    type AddNewPetPayload,
    type NewPetSpeciesOption,
} from "@/features/pet/dialogs/addNewPetDialog";

import {useAllowedSpeciesAndBreedsSlice} from "@/hooks/pet/useAllowedSpeciesAndBreedsSlice";
import {useCenterVetsSlice} from "@/hooks/center/useCenterVetsSlice";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import {getActiveCenterId} from "@/shared/auth/authStorage";

type VeterinarianOptionForAddPetDialog = {
    id: number;
    full_name: string;
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudo registrar el paciente.";
}

export default function RegistrarNuevoPacientePage() {
    const router = useRouter();

    const [dialogOpen, setDialogOpen] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);

    const [centerId, setCenterId] = useState<number | null>(null);
    const [centerIdResolved, setCenterIdResolved] = useState(false);

    const {setPetDataSlice} = usePetDataSlice();

    const {
        speciesAndBreedsResults,
        speciesAndBreedsLoading,
        speciesAndBreedsError,
        loadedCenterId: loadedSpeciesAndBreedsCenterId,
        loadAllowedSpeciesAndBreedsSlice,
    } = useAllowedSpeciesAndBreedsSlice();

    const {
        centerVets,
        centerVetsLoading,
        centerVetsError,
        loadedCenterId: loadedCenterVetsCenterId,
        loadCenterVetsSlice,
    } = useCenterVetsSlice({centerId});

    useEffect(() => {
        const activeCenterId = getActiveCenterId();

        setCenterId(activeCenterId);
        setCenterIdResolved(true);
    }, []);

    useEffect(() => {
        if (centerId === null) return;
        if (loadedSpeciesAndBreedsCenterId === centerId) return;

        void loadAllowedSpeciesAndBreedsSlice(centerId);
    }, [
        centerId,
        loadedSpeciesAndBreedsCenterId,
        loadAllowedSpeciesAndBreedsSlice,
    ]);

    useEffect(() => {
        if (centerId === null) return;
        if (loadedCenterVetsCenterId === centerId) return;

        loadCenterVetsSlice();
    }, [centerId, loadedCenterVetsCenterId, loadCenterVetsSlice]);

    const speciesOptions = useMemo<NewPetSpeciesOption[]>(() => {
        return speciesAndBreedsResults.map((item) => ({
            id: item.species.id,
            name: item.species.name,
            breeds: item.breeds ?? [],
        }));
    }, [speciesAndBreedsResults]);

    const veterinarianOptions = useMemo<
        VeterinarianOptionForAddPetDialog[]
    >(() => {
        return centerVets.map((vet) => ({
            id: vet.id,
            full_name: vet.display_name,
        }));
    }, [centerVets]);

    const loadingInitialData =
        !centerIdResolved || speciesAndBreedsLoading || centerVetsLoading;

    const dataError = pageError ?? speciesAndBreedsError ?? centerVetsError;

    async function handleSave(payload: AddNewPetPayload) {
        setPageError(null);

        if (centerId === null) {
            setPageError("No hay un centro activo.");
            return;
        }

        setSaving(true);

        try {
            const createdPet = await createPetApi({
                centerId,
                payload,
            });

            setPetDataSlice(createdPet);

            setDialogOpen(false);

            router.push("/paciente/datos_paciente");
        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Registrar nuevo paciente
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Ingresa la información del nuevo paciente para crear su
                    ficha.
                </p>
            </div>

            {dataError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {String(dataError)}
                </div>
            )}

            {centerIdResolved && centerId === null && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    No hay un centro activo.
                </div>
            )}

            <button
                type="button"
                onClick={() => setDialogOpen(true)}
                disabled={centerId === null || loadingInitialData || saving}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {loadingInitialData
                    ? "Cargando datos..."
                    : "Registrar nuevo paciente"}
            </button>

            <AddNewPetDialog
                open={dialogOpen}
                speciesOptions={speciesOptions}
                veterinarianOptions={veterinarianOptions}
                saving={saving}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
            />
        </main>
    );
}
