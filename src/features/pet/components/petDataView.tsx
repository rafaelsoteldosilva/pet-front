// src/features/pet/components/petDataView.tsx

"use client";

import {useState, type ReactNode} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import clsx from "clsx";

import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";
import {useAllPetsForCenterSlice} from "@/hooks/pet/useAllPetsForCenterSlice";
import {
    PET_STATUS,
    type PetDataInterface,
    type PetContactLinkInterface,
    type PetStatus,
} from "../types/petTypes";
import {canEditPetDataByDraftStatusOnly} from "@/features/pet/rules/canEditPetDataByDraftStatusOnly";
import GlobalButton from "@/shared/ui/globalButton";

import {deletePetContactLinkApi} from "@/api/pet/contactLinks/deletePetContactLinkApi";
import {deleteDraftPetApi} from "@/api/pet/deleteDraftPetApi";
import {getAxiosErrorMessage} from "@/api/shared/getAxiosErrorMessage";

import EditPetSpeciesAndBreedDialog from "../dialogs/editPetSpeciesAndBreedDialog";

import {
    PET_SEX_OPTIONS,
    PET_SIZE_OPTIONS,
} from "@/features/pet/constants/optionsForSelectBasedFields";

import {normalizePetRecordStatus} from "@/shared/utils/utilityFunctions";

import PetContactLinksPanel from "@/features/pet/components/petContactLinksPanel";
import AddCenterContactToPetContactLinksDialog from "../dialogs/addCenterContactToPetContactLinksDialog";
import EditPetTextFieldDialog from "../dialogs/editPetTextFieldDialog";
import EditPetSelectFieldDialog from "../dialogs/editPetSelectFieldDialog";
import EditPetBooleanFieldDialog from "../dialogs/editPetBooleanFieldDialog";
import EditPetDateFieldDialog from "../dialogs/editPetDateFieldDialog";
import EditPetNumberFieldDialog from "../dialogs/editPetNumberFieldDialog";

import {
    canAddPetContact,
    canEditPetContact,
    canRemovePetContact,
} from "../rules/petContactActionRules";
import {hasActivePrimaryPetContact} from "../rules/petContactPrimaryRules";
import {useCenterVetsSlice} from "@/hooks/center/useCenterVetsSlice";
import EditPetLastAttendingVeterinarianDialog from "../dialogs/editPetLastAttendingVeterinarianDialog";
import EditPetPedigreeDialog from "../dialogs/editPetPedigreeDialog";
import EditPetMicrochipDialog from "../dialogs/editPetMicrochipDialog";

/* ======================================================
   Utils
   ====================================================== */

function formatSex(sex: "m" | "f" | "u" | string | null | undefined) {
    if (sex === "m") return "Macho";
    if (sex === "f") return "Hembra";
    if (sex === "u") return "Indefinido";
    return "—";
}

function formatYesNo(val: boolean) {
    return val ? "Sí" : "No";
}

function formatAge(birthDate: string | null) {
    if (!birthDate) return "—";

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return "—";

    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (today.getDate() < birth.getDate()) {
        months--;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    if (years < 0) return "—";

    const y = years > 0 ? `${years} año${years !== 1 ? "s" : ""}` : "";
    const m = `${months} mes${months !== 1 ? "es" : ""}`;

    return y ? `${y} y ${m}` : m;
}

function formatDisplayDate(value: string | null | undefined) {
    if (!value) return "—";

    const dateOnly = value.slice(0, 10);
    const parts = dateOnly.split("-");

    if (parts.length !== 3) return "—";

    const [year, month, day] = parts;

    if (!year || !month || !day) return "—";

    const monthIndex = Number(month) - 1;

    const monthLabels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const monthLabel = monthLabels[monthIndex];

    if (!monthLabel) return "—";

    return `${monthLabel}/${day.padStart(2, "0")}/${year}`;
}

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

function formatStatus(status: PetStatus | string | null | undefined) {
    const normalizedStatus = normalizePetStatus(status);

    switch (normalizedStatus) {
        case PET_STATUS.ACTIVE:
            return {label: "Activo", color: "bg-green-100 text-green-700"};

        case PET_STATUS.INACTIVE:
            return {label: "Inactivo", color: "bg-gray-200 text-gray-700"};

        case PET_STATUS.DECEASED:
            return {label: "Fallecido", color: "bg-red-100 text-red-700"};

        case PET_STATUS.ARCHIVED:
            return {label: "Archivado", color: "bg-slate-200 text-slate-700"};

        default:
            return {label: "—", color: "bg-slate-100 text-slate-600"};
    }
}

function formatVetName(vet: unknown) {
    if (!vet || typeof vet !== "object") return "—";

    const vetRecord = vet as {
        name?: string | null;
        full_name?: string | null;
        first_name?: string | null;
        last_name?: string | null;
    };

    if (typeof vetRecord.name === "string" && vetRecord.name.trim()) {
        return vetRecord.name.trim();
    }

    const full =
        vetRecord.full_name ??
        `${vetRecord.first_name ?? ""} ${vetRecord.last_name ?? ""}`.trim();

    return full || "—";
}

function formatLastAttendingVet(pet: PetDataInterface) {
    const internalVetName = formatVetName(pet.last_attending_vet);

    if (internalVetName !== "—") {
        return internalVetName;
    }

    const externalVetName = pet.last_attending_vet_external_name?.trim();

    if (externalVetName) {
        return `${externalVetName} (externo)`;
    }

    return "—";
}

function formatSize(size: string | null | undefined) {
    if (!size) return "—";

    switch (size) {
        case "small":
            return "Pequeño";
        case "medium":
            return "Mediano";
        case "large":
            return "Grande";
        case "xlarge":
            return "Gigante";
        default:
            return size;
    }
}

function validateBirthDate(value: string): string | null {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return "La fecha de nacimiento no puede estar vacía.";
    }

    const parts = trimmedValue.split("-");

    if (parts.length !== 3) {
        return "La fecha de nacimiento no es válida.";
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return "La fecha de nacimiento no es válida.";
    }

    const selectedDate = new Date(year, month - 1, day);

    const isRealDate =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month - 1 &&
        selectedDate.getDate() === day;

    if (!isRealDate) {
        return "La fecha de nacimiento no es válida.";
    }

    const today = new Date();
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    if (selectedDate > todayDateOnly) {
        return "La fecha de nacimiento no puede ser futura.";
    }

    return null;
}

/* ======================================================
   Component
   ====================================================== */

type Props = {
    enableEdition?: boolean;
    onEditWholePet?: () => void;
    onDeletedDraftPet?: () => void;
};

export default function PetDataView({
    enableEdition = false,
    onEditWholePet,
    onDeletedDraftPet,
}: Props) {
    const router = useRouter();
    const centerId = 1;

    const {removePetFromAllPetsForCenterSlice} = useAllPetsForCenterSlice({
        centerId,
    });

    const {
        petData,
        petDataLoading,
        petDataError,
        clearPetDataSlice,
        setPetDataSlice,
    } = usePetDataSlice();

    const {
        centerVets,
        centerVetsLoading,
        centerVetsError,
        loadedCenterId: centerVetsLoadedCenterId,
        loadCenterVetsSlice,
    } = useCenterVetsSlice({centerId});

    const [openNameDialog, setOpenNameDialog] = useState(false);
    const [openBirthDateDialog, setOpenBirthDateDialog] = useState(false);
    const [openSpeciesDialog, setOpenSpeciesDialog] = useState(false);

    const [openBodyDescriptionDialog, setOpenBodyDescriptionDialog] =
        useState(false);
    const [openReferenceDialog, setOpenReferenceDialog] = useState(false);

    const [openSexDialog, setOpenSexDialog] = useState(false);
    const [openSizeDialog, setOpenSizeDialog] = useState(false);

    const [openSterilizedDialog, setOpenSterilizedDialog] = useState(false);
    const [openPedigreeDialog, setOpenPedigreeDialog] = useState(false);
    const [openMicrochipDialog, setOpenMicrochipDialog] = useState(false);

    const [openLastWeightDialog, setOpenLastWeightDialog] = useState(false);
    const [openVisualTagDialog, setOpenVisualTagDialog] = useState(false);
    const [
        openVisualIdentificationOrTattooDescriptionDialog,
        setOpenVisualIdentificationOrTattooDescriptionDialog,
    ] = useState(false);

    const [openClinicalObservationsDialog, setOpenClinicalObservationsDialog] =
        useState(false);

    const [openInternalNotesDialog, setOpenInternalNotesDialog] =
        useState(false);

    const [openAddContactDialog, setOpenAddContactDialog] = useState(false);

    const [openLastVeterinarianDialog, setOpenLastVeterinarianDialog] =
        useState(false);

    const [contactDeleteError, setContactDeleteError] = useState<string | null>(
        null,
    );

    const [deleteDraftPetError, setDeleteDraftPetError] = useState<
        string | null
    >(null);

    const [deletingPetContactId, setDeletingPetContactId] = useState<
        number | null
    >(null);

    const [deletingDraftPet, setDeletingDraftPet] = useState(false);

    if (petDataLoading) {
        return <div className="text-slate-500">Cargando paciente…</div>;
    }

    if (petDataError) {
        return <div className="text-red-600">{petDataError}</div>;
    }

    if (!petData) return null;

    const petId = petData.id;

    const petContactLinks: PetContactLinkInterface[] = Array.isArray(
        petData.contact_links,
    )
        ? petData.contact_links
        : [];

    const hasActivePrimaryContact = hasActivePrimaryPetContact(petContactLinks);

    const clinicalRecordStatus = normalizePetRecordStatus(
        petData.clinical_record_status,
    );

    const addPetContactRule = canAddPetContact(clinicalRecordStatus);
    const editPetContactRule = canEditPetContact(clinicalRecordStatus);
    const removePetContactRule = canRemovePetContact(clinicalRecordStatus);

    const canAddContacts = enableEdition && addPetContactRule.allowed;
    const canEditContacts = enableEdition && editPetContactRule.allowed;
    const canRemoveContacts = enableEdition && removePetContactRule.allowed;

    const canEditPetData =
        clinicalRecordStatus !== null &&
        canEditPetDataByDraftStatusOnly(clinicalRecordStatus) &&
        enableEdition;

    const canDeleteDraftPet = canEditPetData;

    const status = formatStatus(petData.status);

    const showWholePetEditButton =
        canEditPetData && typeof onEditWholePet === "function";

    function handleOpenLastVeterinarianDialog() {
        setOpenLastVeterinarianDialog(true);

        if (centerVetsLoading) {
            return;
        }

        if (centerVetsLoadedCenterId === centerId) {
            return;
        }

        void loadCenterVetsSlice();
    }

    function handlePetContactSaved(updatedPet: PetDataInterface) {
        setPetDataSlice(updatedPet);
        setOpenAddContactDialog(false);
    }

    function handlePetContactUpdated(updatedPet: PetDataInterface) {
        setPetDataSlice(updatedPet);
    }

    function handleLastVeterinarianSaved(updatedPet: PetDataInterface) {
        setPetDataSlice(updatedPet);
        setOpenLastVeterinarianDialog(false);
    }

    async function handleRemovePetContact(contact: PetContactLinkInterface) {
        const petContactId = Number(contact.id);

        if (!Number.isFinite(petContactId)) {
            setContactDeleteError(
                "No se pudo identificar la relación del contacto con el paciente.",
            );
            return;
        }

        const confirmed = window.confirm(
            "¿Quitar este vínculo con el paciente?",
        );

        if (!confirmed) {
            return;
        }

        setContactDeleteError(null);
        setDeletingPetContactId(petContactId);

        try {
            const updatedPet = await deletePetContactLinkApi(
                centerId,
                petId,
                petContactId,
            );

            setPetDataSlice(updatedPet);
        } catch (error) {
            console.error("PetDataView::handleRemovePetContact error:", error);
            setContactDeleteError(getAxiosErrorMessage(error));
        } finally {
            setDeletingPetContactId(null);
        }
    }

    async function handleDeletePetDraft() {
        if (!canDeleteDraftPet || deletingDraftPet) {
            return;
        }

        const confirmed = window.confirm(
            "¿Eliminar este paciente en borrador? Esta acción no se puede deshacer.",
        );

        if (!confirmed) {
            return;
        }

        setDeleteDraftPetError(null);
        setDeletingDraftPet(true);

        try {
            await deleteDraftPetApi({
                centerId,
                petId,
            });

            removePetFromAllPetsForCenterSlice(petId);
            clearPetDataSlice();

            if (typeof onDeletedDraftPet === "function") {
                onDeletedDraftPet();
            } else {
                router.back();
            }

            router.refresh();
        } catch (error) {
            console.error("PetDataView::handleDeletePetDraft error:", error);
            setDeleteDraftPetError(getAxiosErrorMessage(error));
        } finally {
            setDeletingDraftPet(false);
        }
    }

    /* ======================================================
       Field edit functions
       ====================================================== */

    const editName = canEditPetData ? () => setOpenNameDialog(true) : undefined;

    const editBirthDate = canEditPetData
        ? () => setOpenBirthDateDialog(true)
        : undefined;

    const editSpeciesAndBreed = canEditPetData
        ? () => setOpenSpeciesDialog(true)
        : undefined;

    const editVisualIdentificationOrTattooDescription = canEditPetData
        ? () => setOpenVisualIdentificationOrTattooDescriptionDialog(true)
        : undefined;

    const editMicrochip = canEditPetData
        ? () => setOpenMicrochipDialog(true)
        : undefined;

    const editClinicalObservations = canEditPetData
        ? () => setOpenClinicalObservationsDialog(true)
        : undefined;

    const editInternalNotes = canEditPetData
        ? () => setOpenInternalNotesDialog(true)
        : undefined;

    const editVet = canEditPetData
        ? handleOpenLastVeterinarianDialog
        : undefined;

    const editBodyDescription = canEditPetData
        ? () => setOpenBodyDescriptionDialog(true)
        : undefined;

    const editReference = canEditPetData
        ? () => setOpenReferenceDialog(true)
        : undefined;

    const editSex = canEditPetData ? () => setOpenSexDialog(true) : undefined;

    const editSize = canEditPetData ? () => setOpenSizeDialog(true) : undefined;

    const editSterilized = canEditPetData
        ? () => setOpenSterilizedDialog(true)
        : undefined;

    const editPedigree = canEditPetData
        ? () => setOpenPedigreeDialog(true)
        : undefined;

    const editVisualTag = canEditPetData
        ? () => setOpenVisualTagDialog(true)
        : undefined;

    const editLastWeight = canEditPetData
        ? () => setOpenLastWeightDialog(true)
        : undefined;

    const addPetContact = canAddContacts
        ? () => setOpenAddContactDialog(true)
        : undefined;

    return (
        <div>
            <div className="mb-8 flex items-start gap-8">
                {canEditPetData ? (
                    <GlobalButton
                        variant="ghost"
                        onClick={() => console.log("edit photo")}
                        className="h-auto p-0"
                    >
                        <div className="group relative h-48 w-48 overflow-hidden rounded-xl bg-slate-100">
                            {petData.photo_url ? (
                                <Image
                                    src={petData.photo_url}
                                    alt={petData.name}
                                    width={192}
                                    height={192}
                                    sizes="100vw"
                                    style={{width: "100%", height: "auto"}}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                                    Sin foto
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                <span className="text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                                    Cambiar foto
                                </span>
                            </div>
                        </div>
                    </GlobalButton>
                ) : (
                    <div className="relative h-48 w-48 overflow-hidden rounded-xl bg-slate-100">
                        {petData.photo_url ? (
                            <Image
                                src={petData.photo_url}
                                alt={petData.name}
                                width={192}
                                height={192}
                                sizes="100vw"
                                style={{width: "100%", height: "auto"}}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                                Sin foto
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-1 items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {petData.name}
                        </h2>

                        <p className="text-sm text-slate-600">
                            {petData.species?.name ?? "—"}
                            {petData.breed?.name
                                ? ` · ${petData.breed.name}`
                                : ""}
                        </p>

                        <p className="text-sm text-slate-600">
                            Historia clínica: {petData.history_code ?? "—"}
                        </p>

                        <span
                            className={clsx(
                                "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                                status.color,
                            )}
                        >
                            {status.label}
                        </span>
                    </div>

                    {showWholePetEditButton && (
                        <GlobalButton
                            variant="ghost"
                            onClick={onEditWholePet}
                            className="shrink-0"
                        >
                            Editar ficha completa
                        </GlobalButton>
                    )}
                </div>
            </div>

            <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-100 p-6 shadow-sm">
                <Section title="Datos básicos">
                    <Row
                        label="Nombre"
                        value={petData.name}
                        onEdit={editName}
                    />

                    <Row
                        label="Sexo"
                        value={formatSex(petData.sex)}
                        onEdit={editSex}
                    />

                    <GroupedRow
                        title="Especie / Raza"
                        items={[
                            {
                                label: "Especie",
                                value: petData.species?.name ?? "—",
                            },
                            {
                                label: "Raza",
                                value: petData.breed?.name ?? "—",
                            },
                        ]}
                        onEdit={editSpeciesAndBreed}
                        colSpan={2}
                        gridColumns={2}
                    />

                    <BirthDateAgeRow
                        birthDate={formatDisplayDate(petData.birth_date)}
                        age={formatAge(petData.birth_date)}
                        onEdit={editBirthDate}
                    />

                    <Row
                        label="Esterilizado"
                        value={formatYesNo(petData.sterilized)}
                        onEdit={editSterilized}
                        centerValue
                    />

                    <Row
                        label="Tamaño"
                        value={formatSize(petData.size)}
                        onEdit={editSize}
                    />

                    <Row
                        label="Último peso"
                        value={
                            petData.last_weight != null
                                ? `${petData.last_weight} kg`
                                : "—"
                        }
                        onEdit={editLastWeight}
                    />

                    <Row
                        label="Referencia"
                        value={petData.reference ?? "—"}
                        onEdit={editReference}
                        colSpan={3}
                    />
                </Section>

                <Section title="Identificación">
                    <Row
                        label="Descripción corporal"
                        value={petData.body_description ?? "—"}
                        onEdit={editBodyDescription}
                        colSpan={2}
                    />

                    <Row
                        label="Placa, collar, etiqueta"
                        value={petData.visual_tag ?? "—"}
                        onEdit={editVisualTag}
                        colSpan={2}
                    />

                    <GroupedRow
                        title="Pedigrí / Registro de Pedigrí"
                        items={[
                            {
                                label: "Pedigrí",
                                value: petData.has_pedigree ? "Sí" : "No",
                                colSpan: 1,
                                centerValue: true,
                            },
                            {
                                label: "Registro de Pedigrí",
                                value: petData.pedigree_registry ?? "—",
                                colSpan: 3,
                            },
                        ]}
                        onEdit={editPedigree}
                        colSpan={4}
                        gridColumns={4}
                    />

                    <Row
                        label="Identificación visual o descripción de tatuaje"
                        value={
                            petData.visual_identification_or_tattoo_description ??
                            "—"
                        }
                        onEdit={editVisualIdentificationOrTattooDescription}
                        colSpan={4}
                    />
                </Section>

                <Section title="Identificación electrónica">
                    <GroupedRow
                        title="Microchip / Datos del Microchip"
                        items={[
                            {
                                label: "Microchip",
                                value: petData.has_microchip ? "Sí" : "No",
                                colSpan: 1,
                                centerValue: true,
                            },
                            {
                                label: "Código Microchip",
                                value: petData.microchip_code ?? "—",
                                colSpan: 1,
                            },
                            {
                                label: "Fecha Implantación",
                                value: formatDisplayDate(
                                    petData.microchip_date,
                                ),
                                colSpan: 1,
                            },
                            {
                                label: "Ubicación Corporal",
                                value: petData.microchip_body_region ?? "—",
                                colSpan: 1,
                            },
                        ]}
                        onEdit={editMicrochip}
                        colSpan={4}
                        gridColumns={4}
                    />
                </Section>

                <Section title="Observaciones">
                    <Row
                        label="Observaciones clínicas"
                        value={petData.clinical_observations ?? "—"}
                        onEdit={editClinicalObservations}
                        colSpan={4}
                    />

                    <Row
                        label="Notas internas"
                        value={petData.internal_notes ?? "—"}
                        onEdit={editInternalNotes}
                        colSpan={4}
                    />
                </Section>

                <Section title="Responsables y contactos">
                    <div className="md:col-span-4">
                        {!hasActivePrimaryContact && (
                            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                                <p className="font-semibold">
                                    Este paciente no tiene contacto principal.
                                </p>

                                <p className="mt-1 text-amber-800">
                                    Asigna uno para que el equipo sepa a quién
                                    contactar primero.
                                </p>
                            </div>
                        )}

                        {contactDeleteError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                                {contactDeleteError}
                            </div>
                        )}

                        <PetContactLinksPanel
                            centerId={centerId}
                            petId={petId}
                            pet={petData}
                            contacts={petContactLinks}
                            deletingPetContactId={deletingPetContactId}
                            onAddContact={
                                canAddContacts ? addPetContact : undefined
                            }
                            onEditContact={
                                canEditContacts
                                    ? (contact) => {
                                          console.log(
                                              "Editar vínculo",
                                              contact,
                                          );
                                      }
                                    : undefined
                            }
                            onRemoveContact={
                                canRemoveContacts
                                    ? handleRemovePetContact
                                    : undefined
                            }
                            onPetUpdated={handlePetContactUpdated}
                        />
                    </div>
                </Section>

                <Section title="Atención veterinaria">
                    <Row
                        label="Veterinario tratante anterior"
                        value={formatLastAttendingVet(petData)}
                        onEdit={editVet}
                        colSpan={2}
                    />

                    <Row
                        label="Centro veterinario"
                        value={petData.veterinary_center?.name ?? "—"}
                        colSpan={2}
                    />
                </Section>
            </div>

            {canDeleteDraftPet && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">
                                Eliminar paciente en borrador
                            </h3>

                            <p className="mt-1 text-sm text-red-700">
                                Esta acción elimina el paciente mientras todavía
                                está en borrador. Si el paciente tiene historia
                                clínica activa no podrá eliminarlo.
                            </p>

                            {deleteDraftPetError && (
                                <p className="mt-2 text-sm font-medium text-red-700">
                                    {deleteDraftPetError}
                                </p>
                            )}
                        </div>

                        <GlobalButton
                            variant="ghost"
                            onClick={handleDeletePetDraft}
                            disabled={deletingDraftPet}
                            className={clsx(
                                "shrink-0 border border-red-300 bg-white text-red-700",
                                "hover:border-red-400 hover:bg-red-100",
                                deletingDraftPet &&
                                    "cursor-not-allowed opacity-60",
                            )}
                        >
                            {deletingDraftPet
                                ? "Eliminando..."
                                : "Eliminar paciente"}
                        </GlobalButton>
                    </div>
                </div>
            )}

            <EditPetTextFieldDialog
                open={openNameDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenNameDialog(false)}
                title="Editar Nombre"
                sectionTitle="Nombre de la Mascota"
                fieldName="name"
                label="Nombre"
                description="Ingresa el Nombre de la Mascota"
                placeholder="Ej: Toby"
                maxLength={100}
                rows={1}
                multiline={false}
                emptyAsNull={false}
                showCounter={true}
                validateValue={null}
                showChangeReason={true}
                requireChangeReason={false}
                changeReasonPlaceholder="Ej: Corrección ortográfica del nombre registrado."
            />

            <EditPetSelectFieldDialog
                open={openSexDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenSexDialog(false)}
                title="Editar sexo"
                sectionTitle="Sexo de la Mascota"
                fieldName="sex"
                label="Sexo"
                description="Selecciona el Sexo de la Mascota."
                options={PET_SEX_OPTIONS}
                allowEmpty={false}
                emptyAsNull={false}
                showChangeReason={true}
                requireChangeReason={false}
                changeReasonPlaceholder="Ej: Corrección del sexo registrado inicialmente."
            />

            <EditPetDateFieldDialog
                open={openBirthDateDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenBirthDateDialog(false)}
                title="Editar Fecha de Nacimiento (Edad)"
                sectionTitle="Fecha de Nacimiento"
                fieldName="birth_date"
                label="Fecha de nacimiento"
                description="Ingresa la fecha de nacimiento del paciente. La edad se calculará automáticamente a partir de esta fecha."
                emptyAsNull={false}
                max={new Date().toISOString().slice(0, 10)}
                validateValue={validateBirthDate}
                showAgePreview
                showChangeReason={true}
                requireChangeReason={false}
                changeReasonPlaceholder="Ej: Corrección de la fecha de nacimiento registrada inicialmente."
            />

            <EditPetSpeciesAndBreedDialog
                open={openSpeciesDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenSpeciesDialog(false)}
            />

            <EditPetBooleanFieldDialog
                open={openSterilizedDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenSterilizedDialog(false)}
                title="Editar Esterilización"
                sectionTitle="Esterilización de la Mascota"
                fieldName="sterilized"
                label="Esterilizado"
                description="Indica si la Mascota ha sido Esterilizada."
                trueLabel="Sí"
                falseLabel="No"
            />

            <EditPetSelectFieldDialog
                open={openSizeDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenSizeDialog(false)}
                title="Editar tamaño"
                sectionTitle="Tamaño de la mascota"
                fieldName="size"
                label="Tamaño"
                description="Selecciona el tamaño corporal aproximado de la mascota."
                options={PET_SIZE_OPTIONS}
                allowEmpty={true}
                emptyOptionLabel="Sin especificar"
                emptyAsNull={true}
                showChangeReason={true}
                requireChangeReason={false}
                changeReasonPlaceholder="Ej: Corrección del tamaño registrado inicialmente."
            />

            <EditPetNumberFieldDialog
                open={openLastWeightDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenLastWeightDialog(false)}
                title="Editar Último Peso"
                sectionTitle="Último Peso de la Mascota"
                fieldName="last_weight"
                label="Último Peso"
                description="Ingresa el Último Peso Registrado de la Mascota."
                placeholder="Ej: 4.18"
                suffix="kg"
                step="0.01"
                min={0}
                max={999.99}
                emptyAsNull={true}
            />

            <EditPetTextFieldDialog
                open={openBodyDescriptionDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenBodyDescriptionDialog(false)}
                title="Editar Descripción Corporal de la Mascota"
                sectionTitle="Descripción Corporal de la Mascota"
                fieldName="body_description"
                label="Descripción corporal"
                description="Describe rasgos físicos visibles de la mascota, por ejemplo color, patrón, contextura o marcas distintivas."
                placeholder="Ej: Gata siamés, pelaje claro con extremidades oscuras, ojos azules."
                maxLength={300}
                rows={4}
                multiline={true}
                emptyAsNull={true}
                showCounter={true}
                validateValue={null}
            />

            <EditPetTextFieldDialog
                open={openReferenceDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenReferenceDialog(false)}
                title="Editar referencia"
                sectionTitle="Referencia de la mascota"
                fieldName="reference"
                label="Referencia"
                description="¿Cómo llegaste a nosotros?"
                placeholder="Ej: Por Instagram"
                maxLength={100}
                multiline={true}
                rows={3}
                emptyAsNull={false}
                showCounter={true}
                validateValue={null}
            />

            <EditPetTextFieldDialog
                open={openVisualTagDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenVisualTagDialog(false)}
                title="Editar Placa o Collar"
                sectionTitle="Placa o Collar de la Mascota"
                fieldName="visual_tag"
                label="Placa o Collar"
                description="Ingresa la Inscripción de la Placa o Collar de la Mascota."
                placeholder="Ej: Toby."
                maxLength={20}
                multiline={false}
                rows={1}
                emptyAsNull={false}
                showCounter={true}
                validateValue={null}
            />

            <EditPetPedigreeDialog
                open={openPedigreeDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenPedigreeDialog(false)}
                onSaved={(updatedPet) => {
                    setPetDataSlice(updatedPet);
                    setOpenPedigreeDialog(false);
                }}
            />

            <EditPetTextFieldDialog
                open={openVisualIdentificationOrTattooDescriptionDialog}
                centerId={centerId}
                pet={petData}
                onClose={() =>
                    setOpenVisualIdentificationOrTattooDescriptionDialog(false)
                }
                title="Editar Identificación visual o descripción de tatuaje (si tiene)"
                sectionTitle="Identificación visual o descripción de tatuaje"
                fieldName="visual_identification_or_tattoo_description"
                label="Identificación Visual o Descripción de Tatuaje"
                description="Ingresa Identificación Visual o Descripción de Tatuaje de la Mascota."
                placeholder="Ej: tatuaje de la granja propietaria"
                maxLength={100}
                multiline={true}
                rows={3}
                emptyAsNull={true}
                showCounter={true}
                validateValue={null}
            />

            <EditPetMicrochipDialog
                open={openMicrochipDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenMicrochipDialog(false)}
                onSaved={(updatedPet) => {
                    setPetDataSlice(updatedPet);
                    setOpenMicrochipDialog(false);
                }}
            />

            <EditPetTextFieldDialog
                open={openClinicalObservationsDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenClinicalObservationsDialog(false)}
                title="Editar Observaciones Clínicas"
                sectionTitle="Observaciones Clínicas"
                fieldName="clinical_observations"
                label="Observaciones Clínicas"
                description="Ingresa Observaciones Clínicas"
                placeholder="Ej: El paciente se vuelve agresivo durante examinación física."
                maxLength={150}
                multiline={true}
                rows={2}
                emptyAsNull={true}
                showCounter={false}
                validateValue={null}
            />

            <EditPetTextFieldDialog
                open={openInternalNotesDialog}
                centerId={centerId}
                pet={petData}
                onClose={() => setOpenInternalNotesDialog(false)}
                title="Editar Notas Internas"
                sectionTitle="Notas Internas"
                fieldName="internal_notes"
                label="Notas Internas"
                description="Ingresa Notas Internas"
                placeholder="Ej: El responsable prefiere el contacto por Whatsapp."
                maxLength={100}
                multiline={true}
                rows={2}
                emptyAsNull={true}
                showCounter={false}
                validateValue={null}
            />

            <AddCenterContactToPetContactLinksDialog
                open={openAddContactDialog}
                centerId={centerId}
                petId={petId}
                pet={petData}
                onClose={() => setOpenAddContactDialog(false)}
                onSaved={handlePetContactSaved}
            />

            <EditPetLastAttendingVeterinarianDialog
                open={openLastVeterinarianDialog}
                centerId={centerId}
                pet={petData}
                veterinarianOptions={centerVets}
                isLoadingVeterinarians={centerVetsLoading}
                veterinarianLoadError={centerVetsError}
                onClose={() => setOpenLastVeterinarianDialog(false)}
                onSaved={handleLastVeterinarianSaved}
            />
        </div>
    );
}

/* ======================================================
   UI Helpers
   ====================================================== */

function Section({title, children}: {title: string; children: ReactNode}) {
    return (
        <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {children}
            </div>
        </section>
    );
}

type BirthDateAgeRowProps = {
    birthDate: string;
    age: string;
    onEdit?: () => void;
};

function BirthDateAgeRow({birthDate, age, onEdit}: BirthDateAgeRowProps) {
    const isEditable = typeof onEdit === "function";
    const birthDateIsEmpty = birthDate.trim() === "—";
    const ageIsEmpty = age.trim() === "—";

    return (
        <div className="h-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-slate-300 md:col-span-2">
            <div className="flex h-full flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Fecha de nacimiento / Edad
                    </span>

                    {isEditable && (
                        <GlobalButton
                            variant="ghost"
                            size="xs"
                            onClick={onEdit}
                            className={clsx(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg p-0",
                                "bg-white shadow-sm ring-1 ring-slate-200",
                                "transition-all duration-150",
                            )}
                        >
                            ✏️
                        </GlobalButton>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Fecha de nacimiento
                        </p>

                        <p
                            className={clsx(
                                "whitespace-pre-wrap break-words text-[15px] leading-6",
                                birthDateIsEmpty
                                    ? "font-normal text-slate-400"
                                    : "font-medium text-slate-900",
                            )}
                        >
                            {birthDate}
                        </p>
                    </div>

                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Edad
                        </p>

                        <p
                            className={clsx(
                                "whitespace-pre-wrap break-words text-[15px] leading-6",
                                ageIsEmpty
                                    ? "font-normal text-slate-400"
                                    : "font-medium text-slate-900",
                            )}
                        >
                            {age}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

type RowProps = {
    label: string;
    value: string;
    colSpan?: 1 | 2 | 3 | 4;
    onEdit?: () => void;
    editDisabled?: boolean;
    editDisabledTitle?: string;
    className?: string;
    centerValue?: boolean;
};

function Row({
    label,
    value,
    colSpan = 1,
    onEdit,
    editDisabled = false,
    editDisabledTitle,
    className,
    centerValue = false,
}: RowProps) {
    const isEditable = typeof onEdit === "function";
    const showEditButton = isEditable || editDisabled;
    const isEmpty = value.trim() === "—";

    const containerClass = clsx(
        "h-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors",
        "hover:border-slate-300",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        colSpan === 4 && "md:col-span-4",
        className,
    );

    return (
        <div className={containerClass}>
            <div className="flex h-full flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {label}
                    </span>

                    {showEditButton && (
                        <GlobalButton
                            variant="ghost"
                            size="xs"
                            onClick={isEditable ? onEdit : undefined}
                            disabled={!isEditable}
                            title={!isEditable ? editDisabledTitle : undefined}
                            className={clsx(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg p-0",
                                "bg-white shadow-sm ring-1 ring-slate-200",
                                "transition-all duration-150",
                                !isEditable && "cursor-not-allowed opacity-40",
                            )}
                        >
                            ✏️
                        </GlobalButton>
                    )}
                </div>

                <div
                    className={clsx(
                        "whitespace-pre-wrap break-words text-[15px] leading-6",
                        centerValue &&
                            "flex min-h-10 items-center justify-center rounded-lg bg-slate-50 px-3 text-center",
                        isEmpty
                            ? "font-normal text-slate-400"
                            : "font-medium text-slate-900",
                    )}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

type GroupedRowItem = {
    label: string;
    value: string;
    colSpan?: 1 | 2 | 3 | 4;
    centerValue?: boolean;
};

type GroupedRowProps = {
    title: string;
    items: GroupedRowItem[];
    colSpan?: 1 | 2 | 3 | 4;
    gridColumns?: 2 | 4;
    onEdit?: () => void;
    editDisabled?: boolean;
    editDisabledTitle?: string;
    className?: string;
};

function GroupedRow({
    title,
    items,
    colSpan = 1,
    gridColumns = 2,
    onEdit,
    editDisabled = false,
    editDisabledTitle,
    className,
}: GroupedRowProps) {
    const isEditable = typeof onEdit === "function";
    const showEditButton = isEditable || editDisabled;

    const containerClass = clsx(
        "h-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors",
        "hover:border-slate-300",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        colSpan === 4 && "md:col-span-4",
        className,
    );

    const gridClass = clsx(
        "grid grid-cols-1 gap-3",
        gridColumns === 2 && "sm:grid-cols-2",
        gridColumns === 4 && "sm:grid-cols-4",
    );

    return (
        <div className={containerClass}>
            <div className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {title}
                    </span>

                    {showEditButton && (
                        <GlobalButton
                            variant="ghost"
                            size="xs"
                            onClick={isEditable ? onEdit : undefined}
                            disabled={!isEditable}
                            title={!isEditable ? editDisabledTitle : undefined}
                            className={clsx(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg p-0",
                                "bg-white shadow-sm ring-1 ring-slate-200",
                                "transition-all duration-150",
                                !isEditable && "cursor-not-allowed opacity-40",
                            )}
                        >
                            ✏️
                        </GlobalButton>
                    )}
                </div>

                <div className={gridClass}>
                    {items.map((item) => {
                        const isEmpty = item.value.trim() === "—";

                        return (
                            <div
                                key={item.label}
                                className={clsx(
                                    item.colSpan === 2 && "sm:col-span-2",
                                    item.colSpan === 3 && "sm:col-span-3",
                                    item.colSpan === 4 && "sm:col-span-4",
                                )}
                            >
                                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {item.label}
                                </div>

                                <div
                                    className={clsx(
                                        "mt-1 whitespace-pre-wrap break-words text-[15px] leading-6",
                                        item.centerValue &&
                                            "flex min-h-10 items-center justify-center rounded-lg bg-slate-50 px-3 text-center",
                                        isEmpty
                                            ? "font-normal text-slate-400"
                                            : "font-medium text-slate-900",
                                    )}
                                >
                                    {item.value}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
