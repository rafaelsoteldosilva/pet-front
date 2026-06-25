// src/features/pet/components/petContactLinksPanel.tsx

"use client";

import {useMemo, useState} from "react";

import GlobalButton from "@/shared/ui/globalButton";
import PetContactCard from "@/features/pet/components/petContactLinkCard";
import EditPetContactLinkDialog from "@/features/pet/dialogs/editPetContactLinkDialog";

import type {
    PetDataInterface,
    PetContactLinkInterface,
} from "@/features/pet/types/petTypes";

function getPetContactKey(
    contact: PetContactLinkInterface,
    index: number,
): string {
    if (contact.id !== undefined && contact.id !== null) {
        return `pet-contact-${contact.id}`;
    }

    return `pet-contact-index-${index}`;
}

type Props = {
    centerId: number;
    petId: number;
    pet: PetDataInterface | null;
    contacts: PetContactLinkInterface[];
    deletingPetContactId?: number | null;
    onAddContact?: () => void;
    onEditContact?: (contact: PetContactLinkInterface) => void;
    onRemoveContact?: (
        contact: PetContactLinkInterface,
    ) => void | Promise<void>;
    onPetUpdated?: (updatedPet: PetDataInterface) => void;
};

export default function PetContactLinksPanel({
    centerId,
    petId,
    pet,
    contacts,
    deletingPetContactId = null,
    onAddContact,
    onEditContact,
    onRemoveContact,
    onPetUpdated,
}: Props) {
    const [contactToEdit, setContactToEdit] =
        useState<PetContactLinkInterface | null>(null);

    const hasContacts = contacts.length > 0;

    const hasAnotherPrimaryContact = useMemo(() => {
        if (!contactToEdit) return false;

        return contacts.some((contact) => {
            if (contact.is_active === false) {
                return false;
            }

            return (
                contact.id !== contactToEdit.id &&
                contact.is_primary_contact === true
            );
        });
    }, [contacts, contactToEdit]);

    function handleEditContact(contact: PetContactLinkInterface) {
        setContactToEdit(contact);
        onEditContact?.(contact);
    }

    function handleCloseEditDialog() {
        setContactToEdit(null);
    }

    function handlePetUpdated(updatedPet: PetDataInterface) {
        onPetUpdated?.(updatedPet);
        setContactToEdit(null);
    }

    return (
        <>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">
                            Contactos del Centro vinculados al Paciente
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Propietarios/tutores, cuidadores, responsables de
                            pago, instituciones u otros contactos vinculados al
                            paciente.
                        </p>
                    </div>

                    {onAddContact && (
                        <GlobalButton
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={onAddContact}
                            className="shrink-0"
                        >
                            Agregar Vínculo con Contacto del Centro
                        </GlobalButton>
                    )}
                </div>

                {hasContacts ? (
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                        {contacts.map((contact, index) => {
                            const contactId = Number(contact.id);

                            const isDeleting =
                                Number.isFinite(contactId) &&
                                deletingPetContactId === contactId;

                            return (
                                <PetContactCard
                                    key={getPetContactKey(contact, index)}
                                    item={contact}
                                    onEdit={
                                        onEditContact && !isDeleting
                                            ? () => handleEditContact(contact)
                                            : undefined
                                    }
                                    onRemove={
                                        onRemoveContact && !isDeleting
                                            ? () => onRemoveContact(contact)
                                            : undefined
                                    }
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                        <p className="text-sm font-semibold text-slate-700">
                            Este paciente todavía no tiene contactos asociados.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Agrega propietarios, cuidadores, responsables de
                            pago o instituciones relacionadas con el paciente.
                        </p>

                        {onAddContact && (
                            <div className="mt-4">
                                <GlobalButton
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={onAddContact}
                                >
                                    Agregar primer contacto
                                </GlobalButton>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <EditPetContactLinkDialog
                open={contactToEdit !== null}
                centerId={centerId}
                petId={petId}
                pet={pet}
                petContact={contactToEdit}
                hasAnotherPrimaryContact={hasAnotherPrimaryContact}
                onClose={handleCloseEditDialog}
                onSaved={handlePetUpdated}
            />
        </>
    );
}
