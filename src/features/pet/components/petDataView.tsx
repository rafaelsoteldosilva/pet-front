// src/features/pet/components/petDataView.tsx

"use client";

import {useState, type ReactNode} from "react";
import Image from "next/image";
import clsx from "clsx";

import {usePetDataSlice} from "@/hooks/pet/usePetDataSlice";
import {
    PET_STATUS,
    type PetDataInterface,
    type PetContactLinkInterface,
    type PetStatus,
} from "../types/petTypes";
import {canEditPetDataByDraftStatusOnly} from "@/features/pet/rules/canEditPetDataByDraftStatusOnly";
import GlobalButton from "@/shared/ui/globalButton";

import {deletePetContactLinkApi} from "@/api/pet/contactLinks/deletePetContactLinkApi";
import {getAxiosErrorMessage} from "@/api/shared/getAxiosErrorMessage";

import EditPetSpeciesAndBreedDialog from "../dialogs/editPetSpeciesAndBreedDialog";

import {
    PET_SEX_OPTIONS,
    PET_SIZE_OPTIONS,
} from "@/features/pet/constants/optionsForSelectBasedFields";

import {
    normalizePetRecordStatus,
    validateMicrochipCode,
    validateMicrochipDate,
} from "@/shared/utils/utilityFunctions";

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

function formatBirthDate(birthDate: string | null) {
    if (!birthDate) return "—";

    const dateOnly = birthDate.slice(0, 10);
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

function formatVetName(vet: any) {
    if (!vet) return "—";
    if (typeof vet.name === "string" && vet.name.trim()) return vet.name.trim();

    const full =
        vet.full_name ??
        `${vet.first_name ?? ""} ${vet.last_name ?? ""}`.trim();

    return full || "—";
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
};

export default function PetDataView({
    enableEdition = false,
    onEditWholePet,
}: Props) {
    const centerId = 1;

    const {pet, petLoading, petError, setPetDataSlice} = usePetDataSlice();

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
    const [openHasPedigreeDialog, setOpenHasPedigreeDialog] = useState(false);
    const [openHasMicrochipDialog, setOpenHasMicrochipDialog] = useState(false);

    const [openLastWeightDialog, setOpenLastWeightDialog] = useState(false);
    const [openVisualTagDialog, setOpenVisualTagDialog] = useState(false);
    const [openPedigreeRegistryDialog, setOpenPedigreeRegistryDialog] =
        useState(false);
    const [
        openVisualIdentificationOrTatooDescriptionDialog,
        setOpenVisualIdentificationOrTatooDescriptionDialog,
    ] = useState(false);

    const [openMicrochipCodeDialog, setOpenMicrochipCodeDialog] =
        useState(false);
    const [openMicrochipDateDialog, setOpenMicrochipDateDialog] =
        useState(false);
    const [openMicrochipRegionDialog, setOpenMicrochipRegionDialog] =
        useState(false);

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

    const [deletingPetContactId, setDeletingPetContactId] = useState<
        number | null
    >(null);

    if (petLoading) {
        return <div className="text-slate-500">Cargando paciente…</div>;
    }

    if (petError) {
        return <div className="text-red-600">{petError}</div>;
    }

    if (!pet) return null;

    const petId = pet.id;

    const petContactLinks: PetContactLinkInterface[] = Array.isArray(
        pet.contact_links,
    )
        ? pet.contact_links
        : [];

    const hasActivePrimaryContact = hasActivePrimaryPetContact(petContactLinks);

    const hasPedigreeRegistryValue =
        typeof pet.pedigree_registry === "string" &&
        pet.pedigree_registry.trim() !== "";

    const hasMicrochipCodeValue =
        typeof pet.microchip_code === "string" &&
        pet.microchip_code.trim() !== "";

    const hasMicrochipDateValue =
        typeof pet.microchip_date === "string" &&
        pet.microchip_date.trim() !== "";

    const hasMicrochipRegionValue =
        typeof pet.microchip_body_region === "string" &&
        pet.microchip_body_region.trim() !== "";

    const hasAnyMicrochipValue =
        hasMicrochipCodeValue ||
        hasMicrochipDateValue ||
        hasMicrochipRegionValue;

    const clinicalRecordStatus = normalizePetRecordStatus(
        pet.clinical_record_status,
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

    const status = formatStatus(pet.status);

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

    const canEditPedigreeRegistry = canEditPetData && pet.has_pedigree;
    const disablePedigreeRegistryEdit = canEditPetData && !pet.has_pedigree;

    const canEditMicrochipCode = canEditPetData && pet.has_microchip;
    const disableMicrochipCodeEdit = canEditPetData && !pet.has_microchip;

    const canEditMicrochipDate = canEditPetData && pet.has_microchip;
    const disableMicrochipDateEdit = canEditPetData && !pet.has_microchip;

    const canEditMicrochipRegion = canEditPetData && pet.has_microchip;
    const disableMicrochipRegionEdit = canEditPetData && !pet.has_microchip;

    const editPedigreeRegistry = canEditPedigreeRegistry
        ? () => setOpenPedigreeRegistryDialog(true)
        : undefined;

    const editVisualIdentificationOrTatooDescription = canEditPetData
        ? () => setOpenVisualIdentificationOrTatooDescriptionDialog(true)
        : undefined;

    const editHasMicrochip = canEditPetData
        ? () => setOpenHasMicrochipDialog(true)
        : undefined;

    const editMicrochipCode = canEditMicrochipCode
        ? () => setOpenMicrochipCodeDialog(true)
        : undefined;

    const editMicrochipDate = canEditMicrochipDate
        ? () => setOpenMicrochipDateDialog(true)
        : undefined;

    const editMicrochipRegion = canEditMicrochipRegion
        ? () => setOpenMicrochipRegionDialog(true)
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

    const editHasPedigree = canEditPetData
        ? () => setOpenHasPedigreeDialog(true)
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
                            {pet.photo_url ? (
                                <Image
                                    src={pet.photo_url}
                                    alt={pet.name}
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
                        {pet.photo_url ? (
                            <Image
                                src={pet.photo_url}
                                alt={pet.name}
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

                <div className="flex flex-1 items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {pet.name}
                        </h2>

                        <p className="text-sm text-slate-600">
                            {pet.species?.name ?? "—"}
                            {pet.breed?.name ? ` · ${pet.breed.name}` : ""}
                        </p>

                        <p className="text-sm text-slate-600">
                            Historia clínica: {pet.history_code ?? "—"}
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
                </div>
            </div>

            <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-100 p-6 shadow-sm">
                <Section title="Datos básicos">
                    <Row label="Nombre" value={pet.name} onEdit={editName} />

                    <Row
                        label="Sexo"
                        value={formatSex(pet.sex)}
                        onEdit={editSex}
                    />

                    <GroupedRow
                        title="Especie / Raza"
                        items={[
                            {
                                label: "Especie",
                                value: pet.species?.name ?? "—",
                            },
                            {
                                label: "Raza",
                                value: pet.breed?.name ?? "—",
                            },
                        ]}
                        onEdit={editSpeciesAndBreed}
                        colSpan={2}
                    />

                    <BirthDateAgeRow
                        birthDate={formatBirthDate(pet.birth_date)}
                        age={formatAge(pet.birth_date)}
                        onEdit={editBirthDate}
                    />

                    <Row
                        label="Esterilizado"
                        value={formatYesNo(pet.sterilized)}
                        onEdit={editSterilized}
                    />

                    <Row
                        label="Tamaño"
                        value={formatSize(pet.size)}
                        onEdit={editSize}
                    />

                    <Row
                        label="Último peso"
                        value={
                            pet.last_weight != null
                                ? `${pet.last_weight} kg`
                                : "—"
                        }
                        onEdit={editLastWeight}
                    />

                    <Row
                        label="Referencia"
                        value={pet.reference ?? "—"}
                        onEdit={editReference}
                        colSpan={4}
                    />
                </Section>

                <Section title="Identificación">
                    <Row
                        label="Descripción corporal"
                        value={pet.body_description ?? "—"}
                        onEdit={editBodyDescription}
                        colSpan={2}
                    />

                    <Row
                        label="Placa, collar, etiqueta"
                        value={pet.visual_tag ?? "—"}
                        onEdit={editVisualTag}
                        colSpan={2}
                    />

                    <Row
                        label="Pedigrí"
                        value={pet.has_pedigree ? "Sí" : "No"}
                        onEdit={editHasPedigree}
                        className="md:row-start-2 md:col-start-1"
                    />

                    <Row
                        label="Registro de pedigrí"
                        value={pet.pedigree_registry ?? "—"}
                        onEdit={editPedigreeRegistry}
                        editDisabled={disablePedigreeRegistryEdit}
                        editDisabledTitle="Primero activa 'Pedigrí' para editar este campo."
                        colSpan={2}
                        className="md:row-start-2 md:col-start-2"
                    />

                    <Row
                        label="Identificación visual o descripción de tatuaje (si tiene)"
                        value={
                            pet.visual_identification_or_tattoo_description ??
                            "—"
                        }
                        onEdit={editVisualIdentificationOrTatooDescription}
                        colSpan={4}
                        className="md:row-start-3 md:col-start-1"
                    />
                </Section>

                <Section title="Identificación electrónica">
                    <Row
                        label="Microchip"
                        value={pet.has_microchip ? "Sí" : "No"}
                        onEdit={editHasMicrochip}
                    />

                    <Row
                        label="Código microchip"
                        value={pet.microchip_code ?? "—"}
                        onEdit={editMicrochipCode}
                        editDisabled={disableMicrochipCodeEdit}
                        editDisabledTitle="Primero activa 'Microchip' para editar este campo."
                    />

                    <Row
                        label="Fecha implantación"
                        value={pet.microchip_date ?? "—"}
                        onEdit={editMicrochipDate}
                        editDisabled={disableMicrochipDateEdit}
                        editDisabledTitle="Primero activa 'Microchip' para editar este campo."
                    />

                    <Row
                        label="Ubicación corporal"
                        value={pet.microchip_body_region ?? "—"}
                        onEdit={editMicrochipRegion}
                        editDisabled={disableMicrochipRegionEdit}
                        editDisabledTitle="Primero activa 'Microchip' para editar este campo."
                    />
                </Section>

                <Section title="Observaciones">
                    <Row
                        label="Observaciones clínicas"
                        value={pet.clinical_observations ?? "—"}
                        onEdit={editClinicalObservations}
                        colSpan={4}
                    />

                    <Row
                        label="Notas internas"
                        value={pet.internal_notes ?? "—"}
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
                            pet={pet}
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
                        value={formatVetName(pet.last_attending_vet)}
                        onEdit={editVet}
                    />

                    <Row
                        label="Centro veterinario"
                        value={pet.veterinary_center?.name ?? "—"}
                    />
                </Section>
            </div>

            {pet && (
                <EditPetTextFieldDialog
                    open={openNameDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetSelectFieldDialog
                    open={openSexDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetDateFieldDialog
                    open={openBirthDateDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetSpeciesAndBreedDialog
                    open={openSpeciesDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenSpeciesDialog(false)}
                />
            )}

            {pet && (
                <EditPetBooleanFieldDialog
                    open={openSterilizedDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenSterilizedDialog(false)}
                    title="Editar Esterilización"
                    sectionTitle="Esterilización de la Mascota"
                    fieldName="sterilized"
                    label="Esterilizado"
                    description="Indica si la Mascota ha sido Esterilizada."
                    trueLabel="Sí"
                    falseLabel="No"
                />
            )}

            {pet && (
                <EditPetSelectFieldDialog
                    open={openSizeDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetNumberFieldDialog
                    open={openLastWeightDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openBodyDescriptionDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openReferenceDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openVisualTagDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetBooleanFieldDialog
                    open={openHasPedigreeDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenHasPedigreeDialog(false)}
                    title="Editar pedigrí"
                    sectionTitle="Pedigrí de la mascota"
                    fieldName="has_pedigree"
                    label="¿Tiene pedigrí?"
                    description="Indica si la mascota posee pedigrí."
                    trueLabel="Sí"
                    falseLabel="No"
                    disableFalse={hasPedigreeRegistryValue}
                    disableFalseReason="No puedes desactivar el pedigrí mientras exista un registro de pedigrí. Borra primero ese valor."
                />
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openPedigreeRegistryDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenPedigreeRegistryDialog(false)}
                    title="Editar Registro de Pedigrí"
                    sectionTitle="Registro de Pedigrí de la Mascota"
                    fieldName="pedigree_registry"
                    label="Registro de Pedigrí"
                    description="Ingresa el registro de Pedigrí de la Mascota."
                    placeholder="Ej: ABC-12345"
                    maxLength={50}
                    multiline={false}
                    rows={1}
                    emptyAsNull={true}
                    showCounter={true}
                    validateValue={null}
                />
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openVisualIdentificationOrTatooDescriptionDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() =>
                        setOpenVisualIdentificationOrTatooDescriptionDialog(
                            false,
                        )
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
            )}

            {pet && (
                <EditPetBooleanFieldDialog
                    open={openHasMicrochipDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenHasMicrochipDialog(false)}
                    title="Editar Tiene Microchip"
                    sectionTitle="Tiene Microchip"
                    fieldName="has_microchip"
                    label="Tiene microchip"
                    description="Indica si la mascota tiene microchip o no."
                    trueLabel="Sí"
                    falseLabel="No"
                    disableFalse={hasAnyMicrochipValue}
                    disableFalseReason="No puedes establecer que no tiene microchip mientras exista código de microchip, fecha de implantación o región de implantación. Borra primero esos valores."
                />
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openMicrochipCodeDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenMicrochipCodeDialog(false)}
                    title="Editar Código Microchip"
                    sectionTitle="Código Microchip"
                    fieldName="microchip_code"
                    label="Código Microchip"
                    description="Ingresa Código Microchip de la Mascota."
                    placeholder="Ej: 123456789012345"
                    maxLength={30}
                    multiline={false}
                    rows={1}
                    emptyAsNull={true}
                    showCounter={false}
                    validateValue={validateMicrochipCode}
                />
            )}

            {pet && (
                <EditPetDateFieldDialog
                    open={openMicrochipDateDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenMicrochipDateDialog(false)}
                    title="Editar Fecha de Implantación"
                    sectionTitle="Fecha de Implantación del Microchip"
                    fieldName="microchip_date"
                    label="Fecha de implantación"
                    description="Selecciona la fecha de implantación del microchip."
                    emptyAsNull={true}
                    max={new Date().toISOString().slice(0, 10)}
                    validateValue={validateMicrochipDate}
                    showChangeReason={true}
                    requireChangeReason={false}
                    changeReasonPlaceholder="Ej: Corrección de la fecha de implantación del microchip."
                />
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openMicrochipRegionDialog}
                    centerId={centerId}
                    pet={pet}
                    onClose={() => setOpenMicrochipRegionDialog(false)}
                    title="Editar Ubicación Corporal de la Implantación"
                    sectionTitle="Ubicación Corporal de la Implantación"
                    fieldName="microchip_body_region"
                    label="Ubicación Corporal de la Implantación"
                    description="Indica en qué parte del cuerpo fue implantado el microchip."
                    placeholder="Ej: Del lado izquierdo del cuello"
                    maxLength={80}
                    multiline={false}
                    rows={1}
                    emptyAsNull={true}
                    showCounter={false}
                    validateValue={null}
                />
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openClinicalObservationsDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <EditPetTextFieldDialog
                    open={openInternalNotesDialog}
                    centerId={centerId}
                    pet={pet}
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
            )}

            {pet && (
                <AddCenterContactToPetContactLinksDialog
                    open={openAddContactDialog}
                    centerId={centerId}
                    petId={petId}
                    pet={pet}
                    onClose={() => setOpenAddContactDialog(false)}
                    onSaved={handlePetContactSaved}
                />
            )}

            {pet && (
                <EditPetLastAttendingVeterinarianDialog
                    open={openLastVeterinarianDialog}
                    centerId={centerId}
                    pet={pet}
                    veterinarianOptions={centerVets}
                    isLoadingVeterinarians={centerVetsLoading}
                    veterinarianLoadError={centerVetsError}
                    onClose={() => setOpenLastVeterinarianDialog(false)}
                    onSaved={handleLastVeterinarianSaved}
                />
            )}
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
                                "group-hover:shadow-md group-hover:ring-slate-300",
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
};

function Row({
    label,
    value,
    colSpan = 1,
    onEdit,
    editDisabled = false,
    editDisabledTitle,
    className,
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
                                "group-hover:shadow-md group-hover:ring-slate-300",
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
};

type GroupedRowProps = {
    title: string;
    items: GroupedRowItem[];
    colSpan?: 1 | 2 | 3 | 4;
    onEdit?: () => void;
    editDisabled?: boolean;
    editDisabledTitle?: string;
    className?: string;
};

function GroupedRow({
    title,
    items,
    colSpan = 1,
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
                                "group-hover:shadow-md group-hover:ring-slate-300",
                                !isEditable && "cursor-not-allowed opacity-40",
                            )}
                        >
                            ✏️
                        </GlobalButton>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((item) => {
                        const isEmpty = item.value.trim() === "—";

                        return (
                            <div key={item.label}>
                                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {item.label}
                                </div>

                                <div
                                    className={clsx(
                                        "mt-1 whitespace-pre-wrap break-words text-[15px] leading-6",
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
