// src/app/(drawer)/gestion_datos/contactos_del_centro/page.tsx

"use client";

import React, {useCallback, useEffect, useState} from "react";

import {addCenterContactApi} from "@/api/center/centerContact/addCenterContactApi";
import {deleteCenterContactApi} from "@/api/center/centerContact/deleteCenterContactApi";
import {updateCenterContactApi} from "@/api/center/centerContact/updateCenterContactApi";
import {useCenterContactsSlice} from "@/hooks/center/useCenterContactsSlice";
import SimpleModalDialog from "@/shared/ui/simpleModalDialog";
import GlobalButton from "@/shared/ui/globalButton";
import CenterContactsGrid from "@/features/center/centerContact/components/centerContactsGrid";
import AddCenterContactFormDialog, {
    CenterContactFormDialogMode,
    CenterContactPayload,
} from "@/features/center/centerContact/dialogs/addCenterContactFormDialog";

import type {CenterContactInterface} from "@/features/center/centerContact/types/centerContactTypes";

import {
    getContactId,
    getCenterContactDisplayName,
    isDeletedContact,
} from "@/features/center/centerContact/utils/centerContactDisplayUtils";

/* ======================================================
   Types
   ====================================================== */

type ErrorWithResponse = {
    message?: string;
    response?: {
        status?: number;
        data?: unknown;
    };
};

type ErrorDataRecord = {
    detail?: unknown;
    message?: unknown;
    error?: unknown;
    non_field_errors?: unknown;
    pet_names?: unknown;
    total_linked_pets?: unknown;
};

/* ======================================================
   Constants
   ====================================================== */

const CENTER_ID = 1;

/* ======================================================
   Error helpers
   ====================================================== */

function getResponseStatus(error: unknown): number | null {
    const errorWithResponse = error as ErrorWithResponse;

    return typeof errorWithResponse.response?.status === "number"
        ? errorWithResponse.response.status
        : null;
}

function getResponseDataRecord(error: unknown): ErrorDataRecord | null {
    const errorWithResponse = error as ErrorWithResponse;
    const responseData = errorWithResponse.response?.data;

    if (!responseData || typeof responseData !== "object") {
        return null;
    }

    if (Array.isArray(responseData)) {
        return null;
    }

    return responseData as ErrorDataRecord;
}

function getResponseMessage(error: unknown): string | null {
    const errorWithResponse = error as ErrorWithResponse;
    const responseData = errorWithResponse.response?.data;

    if (typeof responseData === "string") {
        const cleanValue = responseData.trim();

        return cleanValue || null;
    }

    const data = getResponseDataRecord(error);

    if (!data) return null;

    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    if (Array.isArray(data.non_field_errors)) {
        return data.non_field_errors
            .filter((item): item is string => typeof item === "string")
            .join(" ");
    }

    return null;
}

function getErrorMessage(error: unknown): string {
    const responseMessage = getResponseMessage(error);

    if (responseMessage) return responseMessage;

    if (error instanceof Error) {
        return error.message;
    }

    return "Ocurrió un error inesperado.";
}

function isDeleteBlockedByPetLinks(error: unknown): boolean {
    const status = getResponseStatus(error);

    return status === 409;
}

function getLinkedPetNamesFromError(error: unknown): string[] {
    const data = getResponseDataRecord(error);

    if (!data || !Array.isArray(data.pet_names)) {
        return [];
    }

    return data.pet_names
        .filter((item): item is string => typeof item === "string")
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 3);
}

function getTotalLinkedPetsFromError(error: unknown): number | null {
    const data = getResponseDataRecord(error);

    if (!data) return null;

    const value = data.total_linked_pets;

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsedValue = Number(value);

        return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
}

function renderBoldPetNames(petNames: string[]): React.ReactNode {
    return petNames.map((petName, index) => {
        const separator =
            index === 0 ? "" : index === petNames.length - 1 ? " y " : ", ";

        return (
            <React.Fragment key={`${petName}-${index}`}>
                {separator}
                <strong className="font-semibold text-slate-900">
                    {petName}
                </strong>
            </React.Fragment>
        );
    });
}

function getBlockedDeleteDescription(
    contactName: string,
    error: unknown,
): React.ReactNode {
    const petNames = getLinkedPetNamesFromError(error);
    const totalLinkedPets = getTotalLinkedPetsFromError(error);

    if (petNames.length === 0) {
        return (
            getResponseMessage(error) ??
            `No puedes eliminar el contacto "${contactName}" porque está vinculado a una o más mascotas. Primero debes quitar esos vínculos desde la ficha de las mascotas correspondientes.`
        );
    }

    const remainingPetCount = Math.max(
        0,
        (totalLinkedPets ?? petNames.length) - petNames.length,
    );

    return (
        <>
            No puedes eliminar el contacto{" "}
            <strong className="font-semibold text-slate-900">
                {contactName}
            </strong>{" "}
            porque está vinculado a {renderBoldPetNames(petNames)}.
            {remainingPetCount === 1 && (
                <> Además, tiene 1 mascota más vinculada.</>
            )}
            {remainingPetCount > 1 && (
                <> Además, tiene {remainingPetCount} mascotas más vinculadas.</>
            )}{" "}
            Primero debes quitar esos vínculos desde la ficha de las mascotas
            correspondientes.
        </>
    );
}

/* ======================================================
   Page
   ====================================================== */

export default function CenterContactsPage() {
    const {
        centerContacts,
        centerContactsLoading,
        centerContactsError,
        loadCenterContactsSlice,
    } = useCenterContactsSlice({
        centerId: CENTER_ID,
    });

    const [localContacts, setLocalContacts] = useState<
        CenterContactInterface[]
    >([]);

    const [selectedContact, setSelectedContact] =
        useState<CenterContactInterface | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] =
        useState<CenterContactFormDialogMode>("create");
    const [dialogContact, setDialogContact] =
        useState<CenterContactInterface | null>(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTargetContact, setDeleteTargetContact] =
        useState<CenterContactInterface | null>(null);

    const [deleteBlockedOpen, setDeleteBlockedOpen] = useState(false);
    const [deleteBlockedDescription, setDeleteBlockedDescription] =
        useState<React.ReactNode>("");

    useEffect(() => {
        loadCenterContactsSlice();
    }, [loadCenterContactsSlice]);

    useEffect(() => {
        setLocalContacts(centerContacts);
    }, [centerContacts]);

    const openCreateDialog = useCallback(() => {
        setDialogMode("create");
        setDialogContact(null);
        setSubmitError(null);
        setDialogOpen(true);
    }, []);

    const openEditDialog = useCallback(
        (contact: CenterContactInterface | null) => {
            if (!contact || isDeletedContact(contact)) return;

            setDialogMode("edit");
            setDialogContact(contact);
            setSubmitError(null);
            setDialogOpen(true);
        },
        [],
    );

    const closeDialog = useCallback(() => {
        if (saving) return;

        setDialogOpen(false);
        setDialogContact(null);
        setSubmitError(null);
    }, [saving]);

    const closeDeleteConfirmDialog = useCallback(() => {
        if (deleting) return;

        setDeleteConfirmOpen(false);
        setDeleteTargetContact(null);
    }, [deleting]);

    const closeDeleteBlockedDialog = useCallback(() => {
        setDeleteBlockedOpen(false);
        setDeleteBlockedDescription("");
    }, []);

    const handleDeleteSelectedContact = useCallback(() => {
        if (!selectedContact || isDeletedContact(selectedContact)) return;

        setSubmitError(null);
        setDeleteTargetContact(selectedContact);
        setDeleteConfirmOpen(true);
    }, [selectedContact]);

    const handleConfirmDeleteContact = useCallback(async () => {
        if (deleting) return;

        const contactId = getContactId(deleteTargetContact);

        if (
            contactId === null ||
            !deleteTargetContact ||
            isDeletedContact(deleteTargetContact)
        ) {
            closeDeleteConfirmDialog();
            return;
        }

        const contactName = getCenterContactDisplayName(deleteTargetContact);

        setDeleting(true);
        setSubmitError(null);

        try {
            await deleteCenterContactApi({
                centerId: CENTER_ID,
                centerContactId: contactId,
            });

            setLocalContacts((currentContacts) =>
                currentContacts.map((contact) =>
                    contact.id === contactId
                        ? {
                              ...contact,
                              is_active: false,
                          }
                        : contact,
                ),
            );

            setSelectedContact(null);

            setDeleteConfirmOpen(false);
            setDeleteTargetContact(null);

            await loadCenterContactsSlice({forceRefresh: true});
        } catch (deleteError: unknown) {
            setDeleteConfirmOpen(false);
            setDeleteTargetContact(null);

            if (isDeleteBlockedByPetLinks(deleteError)) {
                setDeleteBlockedDescription(
                    getBlockedDeleteDescription(contactName, deleteError),
                );
                setDeleteBlockedOpen(true);
                return;
            }

            setSubmitError(getErrorMessage(deleteError));
        } finally {
            setDeleting(false);
        }
    }, [
        closeDeleteConfirmDialog,
        deleteTargetContact,
        deleting,
        loadCenterContactsSlice,
    ]);

    const handleSaveContact = useCallback(
        async (payload: CenterContactPayload) => {
            setSaving(true);
            setSubmitError(null);

            try {
                if (dialogMode === "create") {
                    await addCenterContactApi({
                        centerId: CENTER_ID,
                        payload,
                    });
                } else {
                    const contactId = getContactId(dialogContact);

                    if (
                        contactId === null ||
                        !dialogContact ||
                        isDeletedContact(dialogContact)
                    ) {
                        throw new Error(
                            "No hay un contacto activo seleccionado para editar.",
                        );
                    }

                    await updateCenterContactApi({
                        centerId: CENTER_ID,
                        centerContactId: contactId,
                        payload,
                    });
                }

                setDialogOpen(false);
                setDialogContact(null);

                await loadCenterContactsSlice({forceRefresh: true});
            } catch (saveError: unknown) {
                setSubmitError(getErrorMessage(saveError));
            } finally {
                setSaving(false);
            }
        },
        [dialogContact, dialogMode, loadCenterContactsSlice],
    );

    const selectedContactId = getContactId(selectedContact);
    const selectedContactName = getCenterContactDisplayName(selectedContact);
    const selectedContactIsActive =
        selectedContact !== null && !isDeletedContact(selectedContact);

    const deleteTargetContactName =
        getCenterContactDisplayName(deleteTargetContact);

    return (
        <main className="flex h-full w-full flex-col gap-4 p-4">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Contactos del centro
                        </h1>

                        <p className="mt-1 text-sm text-gray-600">
                            Administra los contactos globales disponibles para
                            las mascotas del centro.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <GlobalButton
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={openCreateDialog}
                            disabled={saving || deleting}
                        >
                            Agregar Contacto al Centro
                        </GlobalButton>

                        <GlobalButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(selectedContact)}
                            disabled={
                                !selectedContactIsActive || saving || deleting
                            }
                        >
                            Modificar
                        </GlobalButton>

                        <GlobalButton
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={handleDeleteSelectedContact}
                            disabled={
                                !selectedContactIsActive || saving || deleting
                            }
                        >
                            {deleting ? "Eliminando..." : "Eliminar"}
                        </GlobalButton>
                    </div>
                </div>

                {selectedContactId !== null && selectedContactIsActive && (
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                        Contacto seleccionado:{" "}
                        <span className="font-semibold">
                            {selectedContactName}
                        </span>
                    </div>
                )}

                {centerContactsError && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {centerContactsError}
                    </div>
                )}

                {submitError && !dialogOpen && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {submitError}
                    </div>
                )}
            </section>

            <section className="min-h-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <CenterContactsGrid
                    mode="management"
                    contacts={localContacts}
                    loading={centerContactsLoading}
                    selectedContactId={selectedContactId}
                    onSelectedContactChange={setSelectedContact}
                />
            </section>

            <AddCenterContactFormDialog
                open={dialogOpen}
                mode={dialogMode}
                contact={dialogContact}
                saving={saving}
                submitError={submitError}
                onClose={closeDialog}
                onSubmit={handleSaveContact}
            />

            <SimpleModalDialog
                open={deleteConfirmOpen}
                title="Eliminar contacto del centro"
                description={`¿Seguro que deseas eliminar el contacto "${deleteTargetContactName}"? Esta acción solo será permitida si el contacto no está vinculado a ninguna mascota.`}
                variant="danger"
                acceptLabel={deleting ? "Eliminando..." : "Eliminar"}
                cancelLabel="Cancelar"
                disableEscape={deleting}
                onAccept={handleConfirmDeleteContact}
                onCancel={closeDeleteConfirmDialog}
            />

            <SimpleModalDialog
                open={deleteBlockedOpen}
                title="No se puede eliminar el contacto"
                description={deleteBlockedDescription}
                variant="warning"
                showAcceptButton={false}
                cancelLabel="Cerrar"
                onAccept={closeDeleteBlockedDialog}
                onCancel={closeDeleteBlockedDialog}
            />
        </main>
    );
}
