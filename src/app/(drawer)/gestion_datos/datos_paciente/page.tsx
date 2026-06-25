// src/app/(drawer)/gestion_pacientes/ficha_paciente/page.tsx

"use client";

import {useEffect, useRef, useState} from "react";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import ModalDialog from "../../../../shared/ui/modalDialog";
import SimpleModalDialog from "../../../../shared/ui/simpleModalDialog";

import GlobalButton from "@/shared/ui/globalButton";
import {GetAllPetsForCenterResult} from "@/features/pet/types/petTypes";
import {useSidebarContext} from "@/hooks/shell/useSidebarContext";
import PetSelector from "@/features/pet/petSelector/petSelector";
import {
    updatePetDataApi,
    UpdatePetDataPayload,
} from "@/api/pet/updatePetDataApi";

import PetDataView from "@/features/pet/components/petDataView";

export default function Patient_Management_BasicDataOfAPatient() {
    const {setMenuWithMenuId} = useSidebarContext();
    const centerId = 1;

    const {pet, loading, loadPetDataSlice} = usePetDataSlice();

    const [openSelector, setOpenSelector] = useState(false);
    const [openConfirmUsePet, setOpenConfirmUsePet] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectingPet, setSelectingPet] = useState(false);

    const hasHandledInitialEntry = useRef(false);

    useEffect(() => {
        setMenuWithMenuId({MenuId: "gestion_datos"});
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
        if (!selectedPet?.id) {
            console.error("Paciente seleccionado inválido:", selectedPet);
            return;
        }

        setSelectingPet(true);

        try {
            const success = await loadPetDataSlice(selectedPet.id, centerId);

            if (!success) {
                console.error(
                    "No se pudo cargar la ficha básica del paciente.",
                    {
                        petId: selectedPet.id,
                        centerId,
                        selectedPet,
                    },
                );
                return;
            }

            setOpenSelector(false);
            setOpenConfirmUsePet(false);
        } catch (error) {
            console.error(
                "Error cargando la ficha básica del paciente:",
                error,
            );
        } finally {
            setSelectingPet(false);
        }
    };

    const handleUseCurrentPet = () => {
        setOpenConfirmUsePet(false);
    };

    const handleChangePet = () => {
        setOpenConfirmUsePet(false);
        setOpenSelector(true);
    };

    const handleCancelSelector = () => {
        setOpenSelector(false);
    };

    const handleSubmitEdit = async (data: UpdatePetDataPayload) => {
        if (!pet?.veterinary_center) {
            throw new Error("No hay centro veterinario asociado al paciente.");
        }

        await updatePetDataApi({
            centerId: pet.veterinary_center.id,
            petId: pet.id,
            data,
        });

        await loadPetDataSlice(pet.id, pet.veterinary_center.id);

        setOpenEdit(false);
    };

    return (
        <>
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

            <ModalDialog
                open={openSelector}
                title="Gestión de Datos: seleccionar paciente para Datos del Paciente"
                size="xl"
                disableEscape
                closeOnOverlayClick={false}
                onClose={() => {}}
            >
                <PetSelector
                    centerId={centerId}
                    onSelect={handlePetSelected}
                    onCancel={handleCancelSelector}
                />

                {selectingPet && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Cargando ficha del paciente seleccionado…
                    </div>
                )}
            </ModalDialog>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {pet ? (
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Datos del Paciente
                            </h2>

                            <GlobalButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setOpenSelector(true)}
                            >
                                Cambiar paciente
                            </GlobalButton>
                        </div>

                        <div className="p-6">
                            <PetDataView
                                enableEdition={true}
                                onEditWholePet={() => setOpenEdit(true)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 text-5xl text-slate-300">
                                🐾
                            </div>

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
            </div>
        </>
    );
}
