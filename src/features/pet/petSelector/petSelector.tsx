// src/features/pet/petSelector/petSelector.tsx

"use client";

import {useEffect, useMemo, useState} from "react";
import clsx from "clsx";
import Image from "next/image";

import {useReduxDispatch, useReduxSelector} from "@/state/redux/reduxHooks";
import type {reduxState} from "@/state/redux/store";

import {
    clearAllPetsForCenterResults,
    fetchAllPetsForCenter,
} from "@/state/redux/slices/allPetsForCenterSlice";

import {
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE,
    type GetAllPetsForCenterResult,
    type GetAllPetsForCenterTypeValue,
} from "@/features/pet/types/petTypes";

import GlobalButton from "@/shared/ui/globalButton";
import ShowFilterInput from "./showFilterInput";
import PetsGridForSearching from "./petsGridForSearching";

/* =========================================================
   Props
   ========================================================= */

type Props = {
    centerId: number;
    onSelect: (pet: GetAllPetsForCenterResult) => void;
    onCancel: () => void;
};

type NamedObject = {
    id?: number | string | null;
    name?: string | null;
};

type SearchTab = {
    key: GetAllPetsForCenterTypeValue;
    label: string;
};

/* =========================================================
   Helpers
   ========================================================= */

function getNamedObjectText(value: unknown, fallback = "—"): string {
    if (value == null) {
        return fallback;
    }

    if (typeof value === "string") {
        const cleanValue = value.trim();

        return cleanValue || fallback;
    }

    if (typeof value === "object" && "name" in value) {
        const name = (value as NamedObject).name;

        return typeof name === "string" && name.trim() !== ""
            ? name.trim()
            : fallback;
    }

    return fallback;
}

function getPetInitial(name: string | null | undefined): string {
    const cleanName = String(name ?? "").trim();

    if (!cleanName) {
        return "?";
    }

    return cleanName.charAt(0).toUpperCase();
}

/* =========================================================
   Component
   ========================================================= */

export default function PetSelector({centerId, onSelect, onCancel}: Props) {
    const dispatch = useReduxDispatch();

    const [activeTab, setActiveTab] = useState<GetAllPetsForCenterTypeValue>(
        GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.PRIMARY_CONTACT,
    );

    const [selectedPet, setSelectedPet] =
        useState<GetAllPetsForCenterResult | null>(null);

    const [searchVersion, setSearchVersion] = useState(0);

    /* =========================================================
       Redux state
       ========================================================= */

    const pets = useReduxSelector(
        (state: reduxState) => state.allPetsForCenter.results,
    );

    const loading = useReduxSelector(
        (state: reduxState) => state.allPetsForCenter.loading,
    );

    useEffect(() => {
        dispatch(clearAllPetsForCenterResults());
        setSelectedPet(null);
        setSearchVersion((version) => version + 1);
    }, [dispatch, centerId]);

    /* =========================================================
       UI config
       ========================================================= */

    const tabs = useMemo<SearchTab[]>(
        () => [
            {
                key: GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.PRIMARY_CONTACT,
                label: "Contacto principal",
            },
            {
                key: GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.NAME,
                label: "Paciente",
            },
            {
                key: GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.MICROCHIP,
                label: "Microchip",
            },
            {
                key: GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.OWNER_GUARDIAN,
                label: "Propietario / tutor",
            },
            {
                key: GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.CONTACT,
                label: "Cualquier contacto",
            },
            {
                key: GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.HISTORY_CODE,
                label: "Historia clínica",
            },
        ],
        [],
    );

    const placeholder = useMemo(() => {
        switch (activeTab) {
            case GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.PRIMARY_CONTACT:
                return "Ingrese nombre/apellido del contacto principal (mín. 3 caracteres)...";

            case GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.OWNER_GUARDIAN:
                return "Ingrese nombre/apellido del propietario o tutor (mín. 3 caracteres)...";

            case GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.CONTACT:
                return "Ingrese nombre/apellido de cualquier contacto asociado (mín. 3 caracteres)...";

            case GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.MICROCHIP:
                return "Ingrese microchip (mín. 3 caracteres)...";

            case GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.HISTORY_CODE:
                return "Ingrese historia clínica (mín. 3 caracteres)...";

            case GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.NAME:
            default:
                return "Ingrese nombre del paciente (mín. 3 caracteres)...";
        }
    }, [activeTab]);

    /* =========================================================
       Handlers
       ========================================================= */

    const resetSearchState = () => {
        dispatch(clearAllPetsForCenterResults());
        setSelectedPet(null);
        setSearchVersion((version) => version + 1);
    };

    const handleTabChange = (tabKey: GetAllPetsForCenterTypeValue) => {
        if (tabKey === activeTab) {
            return;
        }

        setActiveTab(tabKey);
        resetSearchState();
    };

    const handleSearch = async (query: string) => {
        dispatch(clearAllPetsForCenterResults());
        setSelectedPet(null);

        await dispatch(
            fetchAllPetsForCenter({
                centerId,
                query,
                mode: activeTab,
            }),
        );

        setSearchVersion((version) => version + 1);
    };

    const handlePetSelected = (pet: GetAllPetsForCenterResult | null) => {
        setSelectedPet(pet);
    };

    const handleConfirmSelection = () => {
        if (!selectedPet) {
            return;
        }

        onSelect(selectedPet);
    };

    const handleCancel = () => {
        resetSearchState();
        onCancel();
    };

    /* =========================================================
       Derived selected pet display values
       ========================================================= */

    const selectedPetName = selectedPet?.name?.trim() || "Mascota sin nombre";

    const selectedPetSpecies = getNamedObjectText(selectedPet?.species);

    const selectedPetBreed = getNamedObjectText(
        selectedPet?.breed,
        "Raza no registrada",
    );

    /* =========================================================
       Render
       ========================================================= */

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => handleTabChange(tab.key)}
                        className={clsx(
                            "border-b-2 px-4 py-2 text-sm font-medium transition",
                            activeTab === tab.key
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700",
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                    <ShowFilterInput
                        label="Buscar"
                        placeholder={placeholder}
                        loading={loading}
                        onSearch={handleSearch}
                    />
                </div>

                <div className="pb-1">
                    <GlobalButton variant="danger" onClick={handleCancel}>
                        Cancelar
                    </GlobalButton>
                </div>
            </div>

            {pets.length > 0 && (
                <PetsGridForSearching
                    key={searchVersion}
                    pets={pets}
                    onPetSelected={handlePetSelected}
                />
            )}

            {selectedPet && (
                <div className="rounded-xl border bg-blue-50 p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold">Mascota seleccionada</h3>

                    <div className="flex items-center gap-4">
                        {selectedPet.photo_url ? (
                            <div>
                                <Image
                                    src={selectedPet.photo_url}
                                    alt={selectedPetName}
                                    width={80}
                                    height={80}
                                    sizes="80px"
                                    className="h-20 w-20 rounded-full object-cover shadow"
                                />
                            </div>
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-200 text-xl font-bold text-blue-800 shadow">
                                {getPetInitial(selectedPet.name)}
                            </div>
                        )}

                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold">
                                {selectedPetName}
                            </p>

                            <p className="truncate text-sm text-gray-600">
                                {selectedPetSpecies} — {selectedPetBreed}
                            </p>

                            <p className="text-sm text-gray-500">
                                Historia: {selectedPet.history_code ?? "—"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <GlobalButton
                            disabled={!selectedPet}
                            onClick={handleConfirmSelection}
                        >
                            Confirmar selección
                        </GlobalButton>
                    </div>
                </div>
            )}
        </div>
    );
}
