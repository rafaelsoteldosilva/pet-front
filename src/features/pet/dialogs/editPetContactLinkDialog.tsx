// src/features/pet/dialogs/editPetContactLinkDialog.tsx

"use client";

import {useEffect, useMemo, useState} from "react";
import {type DefaultValues, type SubmitHandler, useForm} from "react-hook-form";

import {getAxiosErrorMessage} from "@/api/shared/getAxiosErrorMessage";
import {updatePetContactLinkApi} from "@/api/pet/contactLinks/updatePetContactLinkApi";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import {
    PET_CONTACT_ROLE,
    type PetDataInterface,
    type PetContactLinkInterface,
} from "@/features/pet/types/petTypes";

import {type EditPetContactRequest} from "@/features/pet/types/petContactFormTypes";

import FormDialog from "@/shared/ui/forms/formDialog";

import {useReduxDispatch} from "@/state/redux/reduxHooks";
import {setPetData} from "@/state/redux/slices/petDataSlice";

type Props = {
    open: boolean;
    centerId: number;
    petId: number;
    pet: PetDataInterface | null;
    petContact: PetContactLinkInterface | null;
    hasAnotherPrimaryContact?: boolean;
    onClose: () => void;
    onSaved?: (updatedPet: PetDataInterface) => void;
};

type UnknownRecord = Record<string, unknown>;

type CenterContactType = "PERSON" | "INSTITUTION";

type PetContactRole = NonNullable<EditPetContactRequest["role"]>;

type EditPetLinkFormValues = {
    role: PetContactRole;
    specific_relationship: string;

    is_primary_contact: boolean;
    is_emergency_contact: boolean;

    can_authorize_treatment: boolean;
    can_receive_medical_updates: boolean;
    can_receive_billing: boolean;
    can_pickup_pet: boolean;

    pet_contact_link_notes: string;
};

const PET_CONTACT_ROLE_VALUE_SET = new Set<string>(
    Object.values(PET_CONTACT_ROLE),
);

const PET_CONTACT_ROLE_OPTIONS: {
    value: PetContactRole;
    label: string;
}[] = [
    {
        value: PET_CONTACT_ROLE.OWNER_GUARDIAN as PetContactRole,
        label: "Propietario / Tutor",
    },
    {
        value: PET_CONTACT_ROLE.CAREGIVER as PetContactRole,
        label: "Cuidador",
    },
    {
        value: PET_CONTACT_ROLE.BILLING_RESPONSIBLE as PetContactRole,
        label: "Responsable de pago",
    },
    {
        value: PET_CONTACT_ROLE.REFERRING_VET as PetContactRole,
        label: "Veterinario remitente",
    },
    {
        value: PET_CONTACT_ROLE.RESPONSIBLE_INSTITUTION as PetContactRole,
        label: "Institución responsable",
    },
    {
        value: PET_CONTACT_ROLE.REFERRING_INSTITUTION as PetContactRole,
        label: "Institución remitente",
    },
    {
        value: PET_CONTACT_ROLE.BREEDER as PetContactRole,
        label: "Criador / Criadero",
    },
    {
        value: PET_CONTACT_ROLE.SHELTER_OR_FOUNDATION as PetContactRole,
        label: "Refugio / Fundación",
    },
];

const PERSON_ROLE_VALUES = new Set<PetContactRole>([
    PET_CONTACT_ROLE.OWNER_GUARDIAN as PetContactRole,
    PET_CONTACT_ROLE.CAREGIVER as PetContactRole,
    PET_CONTACT_ROLE.BILLING_RESPONSIBLE as PetContactRole,
    PET_CONTACT_ROLE.REFERRING_VET as PetContactRole,
    PET_CONTACT_ROLE.BREEDER as PetContactRole,
]);

const INSTITUTION_ROLE_VALUES = new Set<PetContactRole>([
    PET_CONTACT_ROLE.BILLING_RESPONSIBLE as PetContactRole,
    PET_CONTACT_ROLE.RESPONSIBLE_INSTITUTION as PetContactRole,
    PET_CONTACT_ROLE.REFERRING_INSTITUTION as PetContactRole,
    PET_CONTACT_ROLE.BREEDER as PetContactRole,
    PET_CONTACT_ROLE.SHELTER_OR_FOUNDATION as PetContactRole,
]);

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordValue(source: unknown, key: string): unknown {
    if (!isRecord(source)) {
        return undefined;
    }

    return source[key];
}

function cleanString(value: unknown): string {
    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    return "";
}

function getStringValue(source: unknown, key: string): string {
    return cleanString(getRecordValue(source, key));
}

function getBooleanValue(source: unknown, key: string): boolean {
    return getRecordValue(source, key) === true;
}

function normalizeNullableString(value: string): string | null {
    const cleanedValue = value.trim();

    return cleanedValue.length > 0 ? cleanedValue : null;
}

function getCenterContactRecord(
    petContact: PetContactLinkInterface | null,
): UnknownRecord {
    if (!petContact) {
        return {};
    }

    const centerContact = getRecordValue(petContact, "center_contact");

    if (isRecord(centerContact)) {
        return centerContact;
    }

    return {};
}

function getCenterContactType(
    petContact: PetContactLinkInterface | null,
): CenterContactType | null {
    const centerContact = getCenterContactRecord(petContact);

    const rawType =
        getStringValue(centerContact, "center_contact_type") ||
        getStringValue(centerContact, "contact_type");

    const normalizedType = rawType.trim().toUpperCase();

    if (normalizedType === "PERSON") {
        return "PERSON";
    }

    if (normalizedType === "INSTITUTION") {
        return "INSTITUTION";
    }

    const institutionName = getStringValue(centerContact, "institution_name");

    if (institutionName) {
        return "INSTITUTION";
    }

    return null;
}

function getPetContactId(
    petContact: PetContactLinkInterface | null,
): number | null {
    if (!petContact) {
        return null;
    }

    const id = getRecordValue(petContact, "id");

    if (typeof id === "number" && Number.isFinite(id)) {
        return id;
    }

    if (typeof id === "string") {
        const parsedId = Number(id);

        if (Number.isFinite(parsedId)) {
            return parsedId;
        }
    }

    return null;
}

function isPetContactRole(value: unknown): value is PetContactRole {
    return typeof value === "string" && PET_CONTACT_ROLE_VALUE_SET.has(value);
}

function getPetContactRole(
    petContact: PetContactLinkInterface | null,
): PetContactRole {
    const role = getStringValue(petContact, "role");

    if (isPetContactRole(role)) {
        return role;
    }

    return PET_CONTACT_ROLE.OWNER_GUARDIAN as PetContactRole;
}

function roleIsAllowedForCenterContactType(
    role: PetContactRole,
    centerContactType: CenterContactType | null,
): boolean {
    if (centerContactType === "PERSON") {
        return PERSON_ROLE_VALUES.has(role);
    }

    if (centerContactType === "INSTITUTION") {
        return INSTITUTION_ROLE_VALUES.has(role);
    }

    return true;
}

function getAllowedRoleOptions(centerContactType: CenterContactType | null): {
    value: PetContactRole;
    label: string;
}[] {
    return PET_CONTACT_ROLE_OPTIONS.filter((option) =>
        roleIsAllowedForCenterContactType(option.value, centerContactType),
    );
}

function getRoleValidationMessage(
    role: PetContactRole,
    centerContactType: CenterContactType | null,
): string | null {
    if (roleIsAllowedForCenterContactType(role, centerContactType)) {
        return null;
    }

    if (centerContactType === "PERSON") {
        return "El rol seleccionado no es válido para un contacto de tipo persona.";
    }

    if (centerContactType === "INSTITUTION") {
        return "El rol seleccionado no es válido para un contacto de tipo institución.";
    }

    return null;
}

function getPetContactDisplayName(
    petContact: PetContactLinkInterface | null,
): string {
    if (!petContact) {
        return "contacto";
    }

    const centerContact = getCenterContactRecord(petContact);

    const displayName = getStringValue(centerContact, "display_name");

    if (displayName) {
        return displayName;
    }

    const institutionName = getStringValue(centerContact, "institution_name");

    if (institutionName) {
        return institutionName;
    }

    const firstName = getStringValue(centerContact, "first_name");
    const lastName = getStringValue(centerContact, "last_name");

    const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return composedName || "contacto";
}

function getCenterContactDescription(
    petContact: PetContactLinkInterface | null,
): string {
    const centerContactType = getCenterContactType(petContact);

    if (centerContactType === "PERSON") {
        return "Contacto del centro: persona";
    }

    if (centerContactType === "INSTITUTION") {
        return "Contacto del centro: institución";
    }

    return "Contacto del centro";
}

function buildDefaultValuesFromPetContact(
    petContact: PetContactLinkInterface | null,
): DefaultValues<EditPetLinkFormValues> {
    if (!petContact) {
        return {
            role: PET_CONTACT_ROLE.OWNER_GUARDIAN as PetContactRole,
            specific_relationship: "",

            is_primary_contact: false,
            is_emergency_contact: false,

            can_authorize_treatment: false,
            can_receive_medical_updates: false,
            can_receive_billing: false,
            can_pickup_pet: false,

            pet_contact_link_notes: "",
        };
    }

    const role = getPetContactRole(petContact);

    return {
        role,

        specific_relationship: getStringValue(
            petContact,
            "specific_relationship",
        ),

        is_primary_contact: getBooleanValue(petContact, "is_primary_contact"),

        is_emergency_contact: getBooleanValue(
            petContact,
            "is_emergency_contact",
        ),

        can_authorize_treatment: getBooleanValue(
            petContact,
            "can_authorize_treatment",
        ),

        can_receive_medical_updates: getBooleanValue(
            petContact,
            "can_receive_medical_updates",
        ),

        can_receive_billing:
            role === PET_CONTACT_ROLE.BILLING_RESPONSIBLE
                ? true
                : getBooleanValue(petContact, "can_receive_billing"),

        can_pickup_pet: getBooleanValue(petContact, "can_pickup_pet"),

        pet_contact_link_notes: getStringValue(petContact, "notes"),
    };
}

function petHasAnotherPrimaryContact(
    pet: PetDataInterface,
    petContact: PetContactLinkInterface,
): boolean {
    const currentPetContactId = getPetContactId(petContact);

    return pet.contact_links.some((contactLink) => {
        const contactLinkId = getPetContactId(contactLink);

        return (
            contactLinkId !== currentPetContactId &&
            getBooleanValue(contactLink, "is_primary_contact")
        );
    });
}

function toEditPetContactRequest(
    values: EditPetLinkFormValues,
): EditPetContactRequest {
    return {
        role: values.role,

        specific_relationship: normalizeNullableString(
            values.specific_relationship,
        ),

        is_primary_contact: values.is_primary_contact,
        is_emergency_contact: values.is_emergency_contact,

        can_authorize_treatment: values.can_authorize_treatment,
        can_receive_medical_updates: values.can_receive_medical_updates,

        can_receive_billing:
            values.role === PET_CONTACT_ROLE.BILLING_RESPONSIBLE
                ? true
                : values.can_receive_billing,

        can_pickup_pet: values.can_pickup_pet,

        pet_contact_link_notes: normalizeNullableString(
            values.pet_contact_link_notes,
        ),
    };
}

function CheckboxField({
    label,
    description,
    disabled,
    error,
    registration,
}: {
    label: string;
    description: string;
    disabled?: boolean;
    error?: string;
    registration: ReturnType<
        ReturnType<typeof useForm<EditPetLinkFormValues>>["register"]
    >;
}) {
    return (
        <label className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <input
                type="checkbox"
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                {...registration}
            />

            <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">
                    {label}
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                </span>

                {error ? (
                    <span className="mt-1 block text-xs font-semibold text-red-600">
                        {error}
                    </span>
                ) : null}
            </span>
        </label>
    );
}

export default function EditPetContactLinkDialog({
    open,
    centerId,
    petId,
    pet,
    petContact,
    hasAnotherPrimaryContact = false,
    onClose,
    onSaved,
}: Props) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const dispatch = useReduxDispatch();

    const contactName = useMemo(() => {
        return getPetContactDisplayName(petContact);
    }, [petContact]);

    const centerContactDescription = useMemo(() => {
        return getCenterContactDescription(petContact);
    }, [petContact]);

    const centerContactType = useMemo(() => {
        return getCenterContactType(petContact);
    }, [petContact]);

    const roleOptions = useMemo(() => {
        return getAllowedRoleOptions(centerContactType);
    }, [centerContactType]);

    const defaultValues = useMemo<DefaultValues<EditPetLinkFormValues>>(() => {
        return buildDefaultValuesFromPetContact(petContact);
    }, [petContact]);

    const methods = useForm<EditPetLinkFormValues>({
        defaultValues,
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const {
        register,
        reset,
        setValue,
        watch,
        formState: {errors},
    } = methods;

    const selectedRole = watch("role");
    const currentCanReceiveBilling = watch("can_receive_billing");

    const selectedRoleIsBillingResponsible =
        selectedRole === PET_CONTACT_ROLE.BILLING_RESPONSIBLE;

    const currentContactIsPrimary =
        getBooleanValue(petContact, "is_primary_contact") === true;

    const anotherPrimaryContactExists = useMemo(() => {
        if (!pet || !petContact) {
            return hasAnotherPrimaryContact;
        }

        return (
            hasAnotherPrimaryContact ||
            petHasAnotherPrimaryContact(pet, petContact)
        );
    }, [pet, petContact, hasAnotherPrimaryContact]);

    const primaryContactDisabled =
        anotherPrimaryContactExists && !currentContactIsPrimary;

    const primaryContactDisabledReason: string | undefined =
        primaryContactDisabled
            ? "Este paciente ya tiene otro contacto principal activo. Para marcar este contacto como principal, primero debes quitar esa marca del contacto principal actual."
            : undefined;

    useEffect(() => {
        if (!open) {
            return;
        }

        setSubmitError(null);
        setSubmitting(false);
        reset(defaultValues);
    }, [open, defaultValues, reset]);

    useEffect(() => {
        if (!open || !primaryContactDisabled) {
            return;
        }

        setValue("is_primary_contact", false, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [open, primaryContactDisabled, setValue]);

    useEffect(() => {
        if (
            !open ||
            !selectedRoleIsBillingResponsible ||
            currentCanReceiveBilling === true
        ) {
            return;
        }

        setValue("can_receive_billing", true, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [
        open,
        selectedRoleIsBillingResponsible,
        currentCanReceiveBilling,
        setValue,
    ]);

    const handleSubmit: SubmitHandler<EditPetLinkFormValues> = async (
        values,
    ) => {
        if (submitting || !petContact) {
            return;
        }

        const petContactId = getPetContactId(petContact);

        if (!petContactId) {
            setSubmitError(
                "No se pudo identificar el vínculo del contacto con el paciente.",
            );
            return;
        }

        const roleValidationMessage = getRoleValidationMessage(
            values.role,
            centerContactType,
        );

        if (roleValidationMessage) {
            setSubmitError(roleValidationMessage);
            return;
        }

        setSubmitError(null);
        setSubmitting(true);

        try {
            const safeValues: EditPetLinkFormValues = {
                ...values,

                is_primary_contact: primaryContactDisabled
                    ? false
                    : values.is_primary_contact,

                can_receive_billing:
                    values.role === PET_CONTACT_ROLE.BILLING_RESPONSIBLE
                        ? true
                        : values.can_receive_billing,
            };

            const payload = toEditPetContactRequest(safeValues);

            const updatedPet = await updatePetContactLinkApi(
                centerId,
                petId,
                petContactId,
                payload,
            );

            dispatch(setPetData(updatedPet));

            onSaved?.(updatedPet);
            onClose();
        } catch (error) {
            console.error("EditPetContactLinkDialog::handleSubmit error:", error);
            setSubmitError(getAxiosErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    function handleClose() {
        if (submitting) {
            return;
        }

        setSubmitError(null);
        onClose();
    }

    if (!pet || !petContact) {
        return null;
    }

    return (
        <FormDialog<EditPetLinkFormValues>
            open={open}
            title={`Actualizar vínculo con paciente. Contacto: ${contactName}`}
            defaultValues={defaultValues}
            methods={methods}
            onSubmit={handleSubmit}
            onClose={handleClose}
            size="xl"
            submitLabel={submitting ? "Guardando..." : "Guardar cambios"}
            cancelLabel="Cancelar"
            disableEscape={submitting}
            closeOnOverlayClick={false}
        >
            <div className="grid h-[72vh] min-h-0 grid-cols-1 overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="min-h-0 border-b border-slate-200 bg-slate-50 p-5 xl:border-b-0 xl:border-r">
                    <div className="xl:sticky xl:top-0">
                        <PetIdentityPanel pet={pet} />
                    </div>
                </aside>

                <section className="min-h-0 overflow-y-auto px-5 py-5 xl:px-6">
                    <div className="mx-auto max-w-3xl space-y-5">
                        {submitError ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {submitError}
                            </div>
                        ) : null}

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-bold text-slate-900">
                                Contacto vinculado
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {contactName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {centerContactDescription}
                            </p>

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Esta pantalla modifica solamente el vínculo del
                                contacto con este paciente. Los datos propios
                                del contacto del centro se editan desde
                                Contactos del Centro.
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Rol del contacto para este paciente
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Define qué función cumple este contacto
                                    respecto a este paciente.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                                    Rol
                                    <select
                                        disabled={submitting}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                        {...register("role", {
                                            required:
                                                "El rol del contacto es obligatorio.",
                                        })}
                                    >
                                        {roleOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role ? (
                                        <span className="text-xs font-semibold text-red-600">
                                            {errors.role.message}
                                        </span>
                                    ) : null}
                                </label>

                                <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                                    Vínculo específico
                                    <input
                                        type="text"
                                        disabled={submitting}
                                        placeholder="Ej: madre, padre, vecino, fundación..."
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                        {...register("specific_relationship", {
                                            maxLength: {
                                                value: 80,
                                                message:
                                                    "El vínculo específico no puede superar 80 caracteres.",
                                            },
                                        })}
                                    />
                                    {errors.specific_relationship ? (
                                        <span className="text-xs font-semibold text-red-600">
                                            {
                                                errors.specific_relationship
                                                    .message
                                            }
                                        </span>
                                    ) : null}
                                </label>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Permisos y responsabilidades
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Estos permisos pertenecen al vínculo con
                                    este paciente, no al contacto del centro.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <CheckboxField
                                    label="Contacto principal"
                                    description={
                                        primaryContactDisabledReason ??
                                        "Contacto principal para comunicaciones generales sobre este paciente."
                                    }
                                    disabled={
                                        submitting || primaryContactDisabled
                                    }
                                    error={errors.is_primary_contact?.message}
                                    registration={register(
                                        "is_primary_contact",
                                    )}
                                />

                                <CheckboxField
                                    label="Contacto de emergencia"
                                    description="Puede ser contactado en situaciones urgentes relacionadas con el paciente."
                                    disabled={submitting}
                                    error={errors.is_emergency_contact?.message}
                                    registration={register(
                                        "is_emergency_contact",
                                    )}
                                />

                                <CheckboxField
                                    label="Puede autorizar tratamientos"
                                    description="Puede aprobar procedimientos, tratamientos o decisiones clínicas cuando corresponda."
                                    disabled={submitting}
                                    error={
                                        errors.can_authorize_treatment?.message
                                    }
                                    registration={register(
                                        "can_authorize_treatment",
                                    )}
                                />

                                <CheckboxField
                                    label="Puede recibir información médica"
                                    description="Puede recibir actualizaciones clínicas, resultados e información médica del paciente."
                                    disabled={submitting}
                                    error={
                                        errors.can_receive_medical_updates
                                            ?.message
                                    }
                                    registration={register(
                                        "can_receive_medical_updates",
                                    )}
                                />

                                <CheckboxField
                                    label="Puede recibir información de pago"
                                    description={
                                        selectedRoleIsBillingResponsible
                                            ? "Obligatorio para el rol Responsable de pago."
                                            : "Puede recibir presupuestos, facturas, boletas o información relacionada con pagos."
                                    }
                                    disabled={submitting}
                                    error={errors.can_receive_billing?.message}
                                    registration={register(
                                        "can_receive_billing",
                                    )}
                                />

                                <CheckboxField
                                    label="Puede retirar al paciente"
                                    description="Puede retirar al paciente del centro veterinario cuando sea necesario."
                                    disabled={submitting}
                                    error={errors.can_pickup_pet?.message}
                                    registration={register("can_pickup_pet")}
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                                Notas sobre este vínculo
                                <textarea
                                    disabled={submitting}
                                    rows={5}
                                    placeholder="Notas internas sobre esta relación específica con el paciente."
                                    className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                    {...register("pet_contact_link_notes", {
                                        maxLength: {
                                            value: 500,
                                            message:
                                                "Las notas del vínculo no pueden superar 500 caracteres.",
                                        },
                                    })}
                                />
                                {errors.pet_contact_link_notes ? (
                                    <span className="text-xs font-semibold text-red-600">
                                        {errors.pet_contact_link_notes.message}
                                    </span>
                                ) : null}
                            </label>
                        </section>
                    </div>
                </section>
            </div>
        </FormDialog>
    );
}
