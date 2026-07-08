// src/app/(drawer)/gestion_datos/registrar_nuevo_paciente/page.tsx

"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import {createPetApi} from "@/api/pet/createPetApi";

import AddNewPetDialog, {
    type AddNewPetPayload,
    type NewPetCenterContactOption,
    type NewPetSpeciesOption,
    type NewPetVeterinarianOption,
} from "@/features/pet/dialogs/addNewPetDialog";

import {useAllowedSpeciesAndBreedsSlice} from "@/hooks/pet/useAllowedSpeciesAndBreedsSlice";
import {useCenterVetsSlice} from "@/hooks/center/useCenterVetsSlice";
import {useCenterContactsSlice} from "@/hooks/center/useCenterContactsSlice";
import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";

import {getActiveCenterId} from "@/shared/auth/authStorage";

import type {CenterContactInterface} from "@/features/center/centerContact/types/centerContactTypes";

/* ======================================================
   HELPERS
   ====================================================== */

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordValue(source: unknown, key: string): unknown {
    if (!isRecord(source)) {
        return undefined;
    }

    return source[key];
}

function getStringValue(source: unknown, key: string): string {
    const value = getRecordValue(source, key);

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    return "";
}

function getNumberValue(source: unknown, key: string): number | null {
    const value = getRecordValue(source, key);

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
}

function getBooleanValue(source: unknown, key: string): boolean {
    return getRecordValue(source, key) === true;
}

function getFirstStringValue(source: unknown, keys: readonly string[]): string {
    for (const key of keys) {
        const value = getStringValue(source, key);

        if (value) {
            return value;
        }
    }

    return "";
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudo registrar el paciente.";
}

function getCenterContactId(contact: CenterContactInterface): number | null {
    const id = getNumberValue(contact, "id");

    if (id !== null) {
        return id;
    }

    return getNumberValue(contact, "center_contact_id");
}

function getCenterContactType(contact: CenterContactInterface): string | null {
    const contactType = getFirstStringValue(contact, [
        "center_contact_type",
        "contact_type",
        "type",
    ]);

    return contactType || null;
}

function getCenterContactDisplayName(contact: CenterContactInterface): string {
    const directName = getFirstStringValue(contact, [
        "display_name",
        "name",
        "full_name",
        "contact_name",
    ]);

    if (directName) {
        return directName;
    }

    const contactType = getCenterContactType(contact)?.toUpperCase();

    if (contactType === "INSTITUTION") {
        const institutionName = getFirstStringValue(contact, [
            "institution_name",
            "institution",
            "legal_name",
            "business_name",
        ]);

        return institutionName || "Contacto sin nombre";
    }

    const firstName = getFirstStringValue(contact, [
        "first_name",
        "names",
        "given_name",
    ]);

    const lastName = getFirstStringValue(contact, [
        "last_name",
        "family_name",
        "paternal_last_name",
    ]);

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return fullName || "Contacto sin nombre";
}

function getCenterContactDocumentId(
    contact: CenterContactInterface,
): string | null {
    const documentId = getFirstStringValue(contact, [
        "document_id",
        "contact_document_id",
        "national_dni",
        "rut",
        "dni",
    ]);

    return documentId || null;
}

function getCenterContactEmail(contact: CenterContactInterface): string | null {
    const email = getFirstStringValue(contact, [
        "email",
        "primary_email",
        "contact_email",
    ]);

    return email || null;
}

function getCenterContactPhone(contact: CenterContactInterface): string | null {
    const phone = getFirstStringValue(contact, [
        "cell_phone",
        "primary_phone",
        "mobile_phone",
        "mobile",
        "phone",
        "secondary_phone",
    ]);

    return phone || null;
}

function isCenterContactActive(contact: CenterContactInterface): boolean {
    if (!isRecord(contact) || !("is_active" in contact)) {
        return true;
    }

    return getBooleanValue(contact, "is_active");
}

/* ======================================================
   COMPONENT
   ====================================================== */

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

    const {
        centerContacts,
        centerContactsLoading,
        centerContactsError,
        loadedCenterId: loadedCenterContactsCenterId,
        loadCenterContactsSlice,
    } = useCenterContactsSlice({centerId});

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

        void loadCenterVetsSlice();
    }, [centerId, loadedCenterVetsCenterId, loadCenterVetsSlice]);

    useEffect(() => {
        if (centerId === null) return;
        if (loadedCenterContactsCenterId === centerId) return;

        void loadCenterContactsSlice();
    }, [centerId, loadedCenterContactsCenterId, loadCenterContactsSlice]);

    const speciesOptions = useMemo<NewPetSpeciesOption[]>(() => {
        return speciesAndBreedsResults.map((item) => ({
            id: item.species.id,
            name: item.species.name,
            breeds: item.breeds ?? [],
        }));
    }, [speciesAndBreedsResults]);

    const veterinarianOptions = useMemo<NewPetVeterinarianOption[]>(() => {
        return centerVets.map((vet) => ({
            id: vet.id,
            full_name: vet.display_name?.trim() || "Veterinario sin nombre",
        }));
    }, [centerVets]);

    const centerContactOptions = useMemo<NewPetCenterContactOption[]>(() => {
        const options: NewPetCenterContactOption[] = [];

        for (const contact of centerContacts) {
            if (!isCenterContactActive(contact)) {
                continue;
            }

            const id = getCenterContactId(contact);

            if (id === null) {
                continue;
            }

            options.push({
                id,
                display_name: getCenterContactDisplayName(contact),
                center_contact_type: getCenterContactType(contact),
                document_id: getCenterContactDocumentId(contact),
                email: getCenterContactEmail(contact),
                phone: getCenterContactPhone(contact),
            });
        }

        return options;
    }, [centerContacts]);

    const loadingInitialData =
        !centerIdResolved ||
        speciesAndBreedsLoading ||
        centerVetsLoading ||
        centerContactsLoading;

    const dataError =
        pageError ??
        speciesAndBreedsError ??
        centerVetsError ??
        centerContactsError;

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
                centerContactOptions={centerContactOptions}
                saving={saving}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
            />
        </main>
    );
}
