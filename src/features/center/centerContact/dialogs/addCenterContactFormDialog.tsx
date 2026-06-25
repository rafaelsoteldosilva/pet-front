// src/features/center/centerContact/dialogs/AddCenterContactFormDialog.tsx

"use client";

import {useCallback, useEffect, useState} from "react";
import type {DefaultValues, SubmitHandler} from "react-hook-form";

import FormDialog from "@/shared/ui/forms/formDialog";

import type {
    ContactType,
    CenterContactInterface,
} from "@/features/center/centerContact/types/centerContactTypes";

import {
    CONTACT_TYPE_INSTITUTION,
    CONTACT_TYPE_PERSON,
    isInstitutionContact,
    isPersonContact,
} from "@/features/center/centerContact/utils/centerContactDisplayUtils";

export type CenterContactFormDialogMode = "create" | "edit";

export type CenterContactPayload = {
    center_contact_type: ContactType;

    first_name?: string | null;
    last_name?: string | null;
    institution_name?: string | null;

    document_id?: string | null;
    email?: string | null;

    primary_phone?: string | null;
    secondary_phone?: string | null;
    tertiary_phone?: string | null;

    address?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;

    notes?: string | null;
    is_active: boolean;
};

type CenterContactFormState = {
    center_contact_type: ContactType;

    first_name: string;
    last_name: string;
    institution_name: string;

    document_id: string;
    email: string;

    primary_phone: string;
    secondary_phone: string;
    tertiary_phone: string;

    address: string;
    city: string;
    region: string;
    country: string;

    notes: string;
    is_active: boolean;
};

type Props = {
    open: boolean;
    mode: CenterContactFormDialogMode;
    contact: CenterContactInterface | null;
    saving: boolean;
    submitError: string | null;
    onClose: () => void;
    onSubmit: (payload: CenterContactPayload) => Promise<void>;
};

const EMPTY_FORM: CenterContactFormState = {
    center_contact_type: CONTACT_TYPE_PERSON,

    first_name: "",
    last_name: "",
    institution_name: "",

    document_id: "",
    email: "",

    primary_phone: "",
    secondary_phone: "",
    tertiary_phone: "",

    address: "",
    city: "",
    region: "",
    country: "Chile",

    notes: "",
    is_active: true,
};

const FORM_DIALOG_DEFAULT_VALUES: DefaultValues<CenterContactFormState> =
    EMPTY_FORM;

function nullableText(value: string): string | null {
    const cleanValue = value.trim();

    return cleanValue === "" ? null : cleanValue;
}

function getFormStateFromContact(
    contact: CenterContactInterface,
): CenterContactFormState {
    return {
        center_contact_type: contact.center_contact_type || CONTACT_TYPE_PERSON,

        first_name: contact.first_name ?? "",
        last_name: contact.last_name ?? "",
        institution_name: contact.institution_name ?? "",

        document_id: contact.document_id ?? "",
        email: contact.email ?? "",

        primary_phone: contact.primary_phone ?? "",
        secondary_phone: contact.secondary_phone ?? "",
        tertiary_phone: contact.tertiary_phone ?? "",

        address: contact.address ?? "",
        city: contact.city ?? "",
        region: contact.region ?? "",
        country: contact.country ?? "Chile",

        notes: contact.notes ?? "",
        is_active: contact.is_active !== false,
    };
}

function getPayloadFromForm(
    formState: CenterContactFormState,
): CenterContactPayload {
    const isPerson = isPersonContact(formState.center_contact_type);

    return {
        center_contact_type: formState.center_contact_type,

        first_name: isPerson ? nullableText(formState.first_name) : null,
        last_name: isPerson ? nullableText(formState.last_name) : null,
        institution_name: isPerson
            ? null
            : nullableText(formState.institution_name),

        document_id: nullableText(formState.document_id),
        email: nullableText(formState.email),

        primary_phone: nullableText(formState.primary_phone),
        secondary_phone: nullableText(formState.secondary_phone),
        tertiary_phone: nullableText(formState.tertiary_phone),

        address: nullableText(formState.address),
        city: nullableText(formState.city),
        region: nullableText(formState.region),
        country: nullableText(formState.country),

        notes: nullableText(formState.notes),
        is_active: formState.is_active,
    };
}

function validateForm(formState: CenterContactFormState): string | null {
    if (isPersonContact(formState.center_contact_type)) {
        if (formState.first_name.trim() === "") {
            return "El nombre es obligatorio para contactos de tipo persona.";
        }

        if (formState.last_name.trim() === "") {
            return "El apellido es obligatorio para contactos de tipo persona.";
        }

        return null;
    }

    if (isInstitutionContact(formState.center_contact_type)) {
        if (formState.institution_name.trim() === "") {
            return "El nombre de la institución es obligatorio.";
        }

        return null;
    }

    return "Selecciona un tipo de contacto válido.";
}

export default function AddCenterContactFormDialog({
    open,
    mode,
    contact,
    saving,
    submitError,
    onClose,
    onSubmit,
}: Props) {
    const [formState, setFormState] =
        useState<CenterContactFormState>(EMPTY_FORM);

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setLocalError(null);

        if (mode === "edit" && contact) {
            setFormState(getFormStateFromContact(contact));
            return;
        }

        setFormState({...EMPTY_FORM});
    }, [open, mode, contact]);

    const updateFormField = useCallback(
        <K extends keyof CenterContactFormState>(
            field: K,
            value: CenterContactFormState[K],
        ) => {
            setFormState((currentValue) => ({
                ...currentValue,
                [field]: value,
            }));

            setLocalError(null);
        },
        [],
    );

    const handleSubmit: SubmitHandler<CenterContactFormState> =
        useCallback(async () => {
            const validationError = validateForm(formState);

            if (validationError) {
                setLocalError(validationError);
                return;
            }

            await onSubmit(getPayloadFromForm(formState));
        }, [formState, onSubmit]);

    const visibleError = localError ?? submitError;

    return (
        <FormDialog<CenterContactFormState>
            open={open}
            title={
                mode === "create"
                    ? "Agregar Contacto al Centro"
                    : "Modificar Contacto del Centro"
            }
            defaultValues={FORM_DIALOG_DEFAULT_VALUES}
            onSubmit={handleSubmit}
            onClose={onClose}
            size="xl"
            submitLabel={saving ? "Guardando..." : "Guardar"}
            cancelLabel="Cancelar"
            submitDisabled={saving}
            disableEscape={saving}
            closeOnOverlayClick={false}
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Estos contactos pertenecen al centro y luego pueden
                    vincularse a mascotas.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Tipo de contacto
                        <select
                            value={formState.center_contact_type}
                            onChange={(event) =>
                                updateFormField(
                                    "center_contact_type",
                                    event.target.value as ContactType,
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        >
                            <option value={CONTACT_TYPE_PERSON}>Persona</option>
                            <option value={CONTACT_TYPE_INSTITUTION}>
                                Institución
                            </option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Estado
                        <select
                            value={formState.is_active ? "active" : "deleted"}
                            onChange={(event) =>
                                updateFormField(
                                    "is_active",
                                    event.target.value === "active",
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        >
                            <option value="active">Activo</option>
                            <option value="deleted">Eliminado</option>
                        </select>
                    </label>

                    {isPersonContact(formState.center_contact_type) ? (
                        <>
                            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                Nombre
                                <input
                                    type="text"
                                    value={formState.first_name}
                                    onChange={(event) =>
                                        updateFormField(
                                            "first_name",
                                            event.target.value,
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    disabled={saving}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                Apellido
                                <input
                                    type="text"
                                    value={formState.last_name}
                                    onChange={(event) =>
                                        updateFormField(
                                            "last_name",
                                            event.target.value,
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    disabled={saving}
                                />
                            </label>
                        </>
                    ) : (
                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
                            Nombre de la institución
                            <input
                                type="text"
                                value={formState.institution_name}
                                onChange={(event) =>
                                    updateFormField(
                                        "institution_name",
                                        event.target.value,
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                disabled={saving}
                            />
                        </label>
                    )}

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Documento / RUT
                        <input
                            type="text"
                            value={formState.document_id}
                            onChange={(event) =>
                                updateFormField(
                                    "document_id",
                                    event.target.value,
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Email
                        <input
                            type="email"
                            value={formState.email}
                            onChange={(event) =>
                                updateFormField("email", event.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Teléfono principal
                        <input
                            type="text"
                            value={formState.primary_phone}
                            onChange={(event) =>
                                updateFormField(
                                    "primary_phone",
                                    event.target.value,
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Teléfono secundario
                        <input
                            type="text"
                            value={formState.secondary_phone}
                            onChange={(event) =>
                                updateFormField(
                                    "secondary_phone",
                                    event.target.value,
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Teléfono terciario
                        <input
                            type="text"
                            value={formState.tertiary_phone}
                            onChange={(event) =>
                                updateFormField(
                                    "tertiary_phone",
                                    event.target.value,
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
                        Dirección
                        <input
                            type="text"
                            value={formState.address}
                            onChange={(event) =>
                                updateFormField("address", event.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Ciudad
                        <input
                            type="text"
                            value={formState.city}
                            onChange={(event) =>
                                updateFormField("city", event.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        Región
                        <input
                            type="text"
                            value={formState.region}
                            onChange={(event) =>
                                updateFormField("region", event.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                        País
                        <input
                            type="text"
                            value={formState.country}
                            onChange={(event) =>
                                updateFormField("country", event.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
                        Notas
                        <textarea
                            value={formState.notes}
                            onChange={(event) =>
                                updateFormField("notes", event.target.value)
                            }
                            rows={4}
                            className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={saving}
                        />
                    </label>
                </div>

                {visibleError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {visibleError}
                    </div>
                )}
            </div>
        </FormDialog>
    );
}
