// src/app/(drawer)/paciente/ficha_paciente/page.tsx

"use client";

import {useEffect, useRef, useState} from "react";

import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";
import {useSidebarContext} from "@/hooks/shell/useSidebarContext";

import ModalDialog from "../../../../shared/ui/modalDialog";
import SimpleModalDialog from "../../../../shared/ui/simpleModalDialog";

import GlobalButton from "@/shared/ui/globalButton";
import PetSelector from "@/features/pet/petSelector/petSelector";
import PetDataView from "@/features/pet/components/petDataView";

import type {GetAllPetsForCenterResult} from "@/features/pet/types/petTypes";

export default function Patient_BasicDataOfAPatient() {
    const {setMenuWithMenuId} = useSidebarContext();

    const centerId = 1;

    const {pet, loading, loadPetDataSlice} = usePetDataSlice();

    const [openSelector, setOpenSelector] = useState(false);
    const [openConfirmUsePet, setOpenConfirmUsePet] = useState(false);

    const hasHandledInitialEntry = useRef(false);

    useEffect(() => {
        setMenuWithMenuId({MenuId: "paciente"});
    }, [setMenuWithMenuId]);

    useEffect(() => {
        if (loading) return;
        if (hasHandledInitialEntry.current) return;

        hasHandledInitialEntry.current = true;

        if (pet) {
            setOpenConfirmUsePet(true);
        } else {
            setOpenSelector(true);
        }
    }, [loading, pet]);

    const handlePetSelected = async (
        selectedPet: GetAllPetsForCenterResult,
    ) => {
        const success = await loadPetDataSlice(selectedPet.id, centerId);

        if (success) {
            setOpenSelector(false);
            setOpenConfirmUsePet(false);
        }
    };

    const handleUseCurrentPet = () => {
        setOpenConfirmUsePet(false);
    };

    const handleChangePet = () => {
        setOpenConfirmUsePet(false);
        setOpenSelector(true);
    };

    return (
        <>
            {/* CONFIRM MODAL */}
            <SimpleModalDialog
                open={openConfirmUsePet}
                title="Ya hay un paciente cargado"
                description={
                    <span>
                        ¿Quieres seguir usando a{" "}
                        <strong className="font-semibold text-slate-900">
                            {pet?.name ?? "este paciente"}
                        </strong>
                        {pet?.breed?.name ? (
                            <>
                                ,{" "}
                                <strong className="font-semibold text-slate-900">
                                    {pet.breed.name}
                                </strong>
                            </>
                        ) : null}
                        ?
                    </span>
                }
                photoUrl={pet?.photo_url}
                variant="info"
                acceptLabel="Sí"
                cancelLabel="No"
                onAccept={handleUseCurrentPet}
                onCancel={handleChangePet}
            />

            {/* SELECTOR */}
            <ModalDialog
                open={openSelector}
                title="Paciente: seleccionar paciente para Datos del Paciente"
                size="xl"
                disableEscape
                closeOnOverlayClick={false}
                onClose={() => {}}
            >
                <PetSelector
                    centerId={centerId}
                    onSelect={handlePetSelected}
                    onCancel={() => setOpenSelector(false)}
                />
            </ModalDialog>

            {/* CONTENT */}
            {pet ? (
                <PetDataView enableEdition={false} />
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 text-5xl text-slate-300">🐾</div>

                        <h2 className="text-xl font-semibold text-slate-700">
                            No se ha seleccionado ningún paciente
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Selecciona un paciente para visualizar su ficha.
                        </p>

                        <div className="mt-6 w-64">
                            <GlobalButton
                                variant="primary"
                                size="md"
                                onClick={() => setOpenSelector(true)}
                            >
                                Seleccionar paciente
                            </GlobalButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
