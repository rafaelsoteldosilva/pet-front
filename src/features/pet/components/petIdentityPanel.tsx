"use client";

import clsx from "clsx";

import {
    PET_STATUS,
    type PetDataInterface,
    type PetStatus,
} from "@/features/pet/types/petTypes";

import PetPhoto from "./petPhoto";

type Props = {
    pet: PetDataInterface;
    className?: string;
};

function normalizePetStatus(
    status: PetStatus | string | null | undefined,
): PetStatus | null {
    const normalized = String(status ?? "")
        .trim()
        .toUpperCase();

    switch (normalized) {
        case "ACTIVE":
        case "ACTIVO":
            return PET_STATUS.ACTIVE;

        case "INACTIVE":
        case "INACTIVO":
            return PET_STATUS.INACTIVE;

        case "DECEASED":
        case "FALLECIDO":
            return PET_STATUS.DECEASED;

        case "ARCHIVED":
        case "ARCHIVADO":
            return PET_STATUS.ARCHIVED;

        default:
            return null;
    }
}

function getStatusUi(status: PetStatus | string | null | undefined) {
    const normalized = normalizePetStatus(status);

    switch (normalized) {
        case PET_STATUS.ACTIVE:
            return {
                label: "Activo",
                className: "bg-green-100 text-green-700",
            };

        case PET_STATUS.INACTIVE:
            return {
                label: "Inactivo",
                className: "bg-slate-200 text-slate-700",
            };

        case PET_STATUS.DECEASED:
            return {
                label: "Fallecido",
                className: "bg-red-100 text-red-700",
            };

        case PET_STATUS.ARCHIVED:
            return {
                label: "Archivado",
                className: "bg-slate-200 text-slate-700",
            };

        default:
            return {
                label: "—",
                className: "bg-slate-100 text-slate-600",
            };
    }
}

export default function PetIdentityPanel({pet, className}: Props) {
    const status = getStatusUi(pet.status);

    return (
        <div
            className={clsx(
                "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                className,
            )}
        >
            <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                    <PetPhoto
                        photoUrl={pet.photo_url}
                        alt={pet.name ?? "Mascota"}
                        size="md"
                    />
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                    {pet.name || "—"}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                    {pet.species?.name ?? "—"}
                    {pet.breed?.name ? ` · ${pet.breed.name}` : ""}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                    Historia clínica: {pet.history_code ?? "—"}
                </p>

                <span
                    className={clsx(
                        "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        status.className,
                    )}
                >
                    {status.label}
                </span>
            </div>
        </div>
    );
}
