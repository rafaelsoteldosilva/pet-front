// src/features/pet/forms/sections/petContactLinkFields.tsx

"use client";

import {useEffect, useMemo, useRef, type ReactNode} from "react";
import {
    type FieldErrors,
    type FieldPath,
    useController,
    useFormContext,
    useWatch,
} from "react-hook-form";

import {
    type PetContactFormValues,
    INSTITUTION_PET_CONTACT_ROLE_VALUES,
    PERSON_PET_CONTACT_ROLE_VALUES,
    PET_CONTACT_PERMISSION_OPTIONS,
    PET_CONTACT_ROLE_OPTIONS,
    type PetContactRoleValue,
} from "@/features/pet/forms/schemas/petContactSchema";

type Props = {
    hasActivePrimaryContact?: boolean;
    primaryContactDisabledReason?: string;
};

type FormFieldName = FieldPath<PetContactFormValues>;
type ContactTypeValue = PetContactFormValues["contact_type"];

type RoleDefaultPermissionValues = {
    is_emergency_contact: boolean;
    can_authorize_treatment: boolean;
    can_receive_medical_updates: boolean;
    can_receive_billing: boolean;
    can_pickup_pet: boolean;
};

const BILLING_RESPONSIBLE_ROLE = "BILLING_RESPONSIBLE";
const BILLING_PERMISSION_NAME = "can_receive_billing";

const BILLING_RESPONSIBLE_PERMISSION_MESSAGE =
    "Un responsable de pago siempre puede recibir facturas, presupuestos e información de pago.";

const ROLE_DEFAULTS_APPLIED_MESSAGE =
    "Se aplicaron los permisos sugeridos para el rol seleccionado. El contacto principal no se modifica automáticamente.";

const SPECIFIC_RELATIONSHIP_RESET_MESSAGE =
    "Se limpió el vínculo específico porque cambiaste el rol del contacto.";

const PRIMARY_CONTACT_DISABLED_FALLBACK_MESSAGE =
    "Ya existe un contacto principal. Para cambiarlo, edita el contacto principal actual.";

const PERSON_ROLE_VALUE_SET: ReadonlySet<string> = new Set(
    PERSON_PET_CONTACT_ROLE_VALUES,
);

const INSTITUTION_ROLE_VALUE_SET: ReadonlySet<string> = new Set(
    INSTITUTION_PET_CONTACT_ROLE_VALUES,
);

const ROLE_DESCRIPTION_BY_VALUE: Record<PetContactRoleValue, string> = {
    OWNER_GUARDIAN:
        "Persona principal responsable del paciente. Puede ser propietario, tutor o representante del paciente.",
    CAREGIVER: "Persona que cuida al paciente en el día a día.",
    BILLING_RESPONSIBLE:
        "Persona o institución responsable de pagos, presupuestos o facturas.",
    REFERRING_VET: "Veterinario externo que deriva o recomienda la atención.",
    RESPONSIBLE_INSTITUTION:
        "Institución responsable del paciente, como fundación, refugio, clínica o criadero.",
    REFERRING_INSTITUTION:
        "Institución que deriva o remite al paciente al centro veterinario.",
    BREEDER: "Criador o criadero relacionado con el paciente.",
    SHELTER_OR_FOUNDATION:
        "Refugio, fundación u organización protectora relacionada con el paciente.",
};

const ROLE_PERMISSION_DEFAULTS: Record<
    PetContactRoleValue,
    RoleDefaultPermissionValues
> = {
    OWNER_GUARDIAN: {
        is_emergency_contact: false,
        can_authorize_treatment: true,
        can_receive_medical_updates: true,
        can_receive_billing: true,
        can_pickup_pet: true,
    },

    CAREGIVER: {
        is_emergency_contact: false,
        can_authorize_treatment: false,
        can_receive_medical_updates: true,
        can_receive_billing: false,
        can_pickup_pet: true,
    },

    BILLING_RESPONSIBLE: {
        is_emergency_contact: false,
        can_authorize_treatment: false,
        can_receive_medical_updates: false,
        can_receive_billing: true,
        can_pickup_pet: false,
    },

    REFERRING_VET: {
        is_emergency_contact: false,
        can_authorize_treatment: false,
        can_receive_medical_updates: true,
        can_receive_billing: false,
        can_pickup_pet: false,
    },

    RESPONSIBLE_INSTITUTION: {
        is_emergency_contact: false,
        can_authorize_treatment: true,
        can_receive_medical_updates: true,
        can_receive_billing: false,
        can_pickup_pet: false,
    },

    REFERRING_INSTITUTION: {
        is_emergency_contact: false,
        can_authorize_treatment: false,
        can_receive_medical_updates: true,
        can_receive_billing: false,
        can_pickup_pet: false,
    },

    BREEDER: {
        is_emergency_contact: false,
        can_authorize_treatment: false,
        can_receive_medical_updates: false,
        can_receive_billing: false,
        can_pickup_pet: false,
    },

    SHELTER_OR_FOUNDATION: {
        is_emergency_contact: false,
        can_authorize_treatment: true,
        can_receive_medical_updates: true,
        can_receive_billing: false,
        can_pickup_pet: false,
    },
};

function getErrorMessage(
    errors: FieldErrors<PetContactFormValues>,
    name: FormFieldName,
): string | undefined {
    const error = errors[name as keyof PetContactFormValues];

    if (!error) {
        return undefined;
    }

    const message = error.message;

    return typeof message === "string" ? message : undefined;
}

function isInstitutionContact(contactType: ContactTypeValue | undefined) {
    return contactType === "INSTITUTION";
}

function getRoleSectionDescription(contactType: ContactTypeValue | undefined) {
    return isInstitutionContact(contactType)
        ? "Define qué función cumple esta institución en relación con el paciente."
        : "Define qué relación o función tiene esta persona en relación con el paciente.";
}

function getSpecificLinkDescription(contactType: ContactTypeValue | undefined) {
    return isInstitutionContact(contactType)
        ? "Opcional. Útil para indicar una función más concreta, por ejemplo: refugio responsable, clínica remitente o criadero de origen."
        : "Opcional. Útil para indicar algo más concreto, por ejemplo: madre del tutor, vecino, cuidador temporal o responsable administrativo.";
}

function getSpecificLinkPlaceholder(contactType: ContactTypeValue | undefined) {
    return isInstitutionContact(contactType)
        ? "Ej: Refugio responsable"
        : "Ej: Madre del propietario";
}

function getPermissionsDescription(contactType: ContactTypeValue | undefined) {
    return isInstitutionContact(contactType)
        ? "Estas opciones aclaran qué puede hacer o recibir esta institución respecto al paciente."
        : "Estas opciones aclaran qué puede hacer o recibir esta persona respecto al paciente.";
}

function getNotesDescription(contactType: ContactTypeValue | undefined) {
    return isInstitutionContact(contactType)
        ? "Notas internas sobre el vínculo entre esta institución y este paciente. No modifican las notas del contacto del centro."
        : "Notas internas sobre el vínculo entre esta persona y este paciente. No modifican las notas del contacto del centro.";
}

function getRoleLabel(role: unknown): string {
    const option = PET_CONTACT_ROLE_OPTIONS.find(
        (roleOption) => roleOption.value === role,
    );

    return option?.label ?? "el rol seleccionado";
}

function getRolePermissionDefaults(
    role: unknown,
): RoleDefaultPermissionValues | null {
    if (typeof role !== "string") {
        return null;
    }

    return ROLE_PERMISSION_DEFAULTS[role as PetContactRoleValue] ?? null;
}

function getAllowedRoleOptions(contactType: ContactTypeValue | undefined) {
    if (contactType === "INSTITUTION") {
        return PET_CONTACT_ROLE_OPTIONS.filter((roleOption) =>
            INSTITUTION_ROLE_VALUE_SET.has(roleOption.value),
        );
    }

    return PET_CONTACT_ROLE_OPTIONS.filter((roleOption) =>
        PERSON_ROLE_VALUE_SET.has(roleOption.value),
    );
}

function FieldBlock({
    label,
    description,
    error,
    children,
}: {
    label: string;
    description?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-800">
                    {label}
                </label>

                {description ? (
                    <p className="text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                ) : null}
            </div>

            {children}

            {error ? (
                <p className="text-xs font-medium text-red-600">{error}</p>
            ) : null}
        </div>
    );
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
            <div className="mb-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>

                {description ? (
                    <p className="text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                ) : null}
            </div>

            {children}
        </section>
    );
}

function TextInput({
    name,
    label,
    description,
    placeholder,
}: {
    name: FormFieldName;
    label: string;
    description?: string;
    placeholder?: string;
}) {
    const {
        control,
        formState: {errors},
    } = useFormContext<PetContactFormValues>();

    const {field} = useController({
        control,
        name,
    });

    const value = typeof field.value === "string" ? field.value : "";

    return (
        <FieldBlock
            label={label}
            description={description}
            error={getErrorMessage(errors, name)}
        >
            <input
                name={field.name}
                ref={field.ref}
                value={value}
                type="text"
                placeholder={placeholder}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </FieldBlock>
    );
}

function TextAreaInput({
    name,
    label,
    description,
    placeholder,
    maxLength,
    rows = 3,
}: {
    name: FormFieldName;
    label: string;
    description?: string;
    placeholder?: string;
    maxLength?: number;
    rows?: number;
}) {
    const {
        control,
        formState: {errors},
    } = useFormContext<PetContactFormValues>();

    const {field} = useController({
        control,
        name,
    });

    const value = typeof field.value === "string" ? field.value : "";
    const currentLength = value.length;

    return (
        <FieldBlock
            label={label}
            description={description}
            error={getErrorMessage(errors, name)}
        >
            <textarea
                name={field.name}
                ref={field.ref}
                value={value}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {maxLength ? (
                <div className="flex justify-end">
                    <p className="text-xs text-slate-400">
                        {currentLength}/{maxLength}
                    </p>
                </div>
            ) : null}
        </FieldBlock>
    );
}

function RoleSelect() {
    const {
        control,
        setValue,
        formState: {errors},
    } = useFormContext<PetContactFormValues>();

    const selectedContactType = useWatch({
        control,
        name: "contact_type",
    });

    const selectedRole = useWatch({
        control,
        name: "role",
    });

    const allowedRoleOptions = useMemo(() => {
        return getAllowedRoleOptions(selectedContactType);
    }, [selectedContactType]);

    const {field} = useController({
        control,
        name: "role",
    });

    const previousRoleRef = useRef<PetContactFormValues["role"] | null>(null);

    useEffect(() => {
        if (!selectedRole) {
            return;
        }

        const roleIsAllowed = allowedRoleOptions.some(
            (roleOption) => roleOption.value === selectedRole,
        );

        if (roleIsAllowed) {
            return;
        }

        const fallbackRole = allowedRoleOptions[0]?.value;

        if (!fallbackRole) {
            return;
        }

        setValue("role", fallbackRole, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [allowedRoleOptions, selectedRole, setValue]);

    useEffect(() => {
        if (!selectedRole) {
            return;
        }

        if (previousRoleRef.current === selectedRole) {
            return;
        }

        const previousRole = previousRoleRef.current;
        previousRoleRef.current = selectedRole;

        const defaultPermissions = getRolePermissionDefaults(selectedRole);

        if (defaultPermissions) {
            setValue(
                "is_emergency_contact",
                defaultPermissions.is_emergency_contact,
                {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                },
            );

            setValue(
                "can_authorize_treatment",
                defaultPermissions.can_authorize_treatment,
                {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                },
            );

            setValue(
                "can_receive_medical_updates",
                defaultPermissions.can_receive_medical_updates,
                {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                },
            );

            setValue(
                "can_receive_billing",
                defaultPermissions.can_receive_billing,
                {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                },
            );

            setValue("can_pickup_pet", defaultPermissions.can_pickup_pet, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }

        if (selectedRole === BILLING_RESPONSIBLE_ROLE) {
            setValue(BILLING_PERMISSION_NAME, true, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }

        if (previousRole !== null) {
            const currentSpecificRelationship =
                typeof control._formValues.specific_relationship === "string"
                    ? control._formValues.specific_relationship.trim()
                    : "";

            if (currentSpecificRelationship) {
                setValue("specific_relationship", null, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                });
            }
        }
    }, [control._formValues.specific_relationship, selectedRole, setValue]);

    const selectedRoleDescription =
        typeof selectedRole === "string"
            ? ROLE_DESCRIPTION_BY_VALUE[selectedRole as PetContactRoleValue]
            : undefined;

    return (
        <div className="space-y-3">
            <FieldBlock
                label="Rol del contacto"
                description={getRoleSectionDescription(selectedContactType)}
                error={getErrorMessage(errors, "role")}
            >
                <select
                    name={field.name}
                    ref={field.ref}
                    value={typeof field.value === "string" ? field.value : ""}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    {allowedRoleOptions.map((roleOption) => (
                        <option key={roleOption.value} value={roleOption.value}>
                            {roleOption.label}
                        </option>
                    ))}
                </select>
            </FieldBlock>

            {selectedRoleDescription ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs leading-5 text-blue-800">
                        <span className="font-semibold">
                            {getRoleLabel(selectedRole)}:
                        </span>{" "}
                        {selectedRoleDescription}
                    </p>
                </div>
            ) : null}

            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs leading-5 text-amber-800">
                    {ROLE_DEFAULTS_APPLIED_MESSAGE}
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs leading-5 text-slate-500">
                    {SPECIFIC_RELATIONSHIP_RESET_MESSAGE}
                </p>
            </div>
        </div>
    );
}

function PermissionCheckbox({
    name,
    label,
    description,
    disabled,
    disabledReason,
}: {
    name: FormFieldName;
    label: string;
    description: string;
    disabled?: boolean;
    disabledReason?: string;
}) {
    const {
        control,
        formState: {errors},
    } = useFormContext<PetContactFormValues>();

    const {field} = useController({
        control,
        name,
    });

    const checked = field.value === true;

    return (
        <label
            className={[
                "flex gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm transition",
                disabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-75"
                    : "cursor-pointer border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40",
            ].join(" ")}
        >
            <input
                name={field.name}
                ref={field.ref}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.checked)}
                className="mt-1"
            />

            <span className="min-w-0">
                <span className="block font-semibold text-slate-800">
                    {label}
                </span>

                <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    {description}
                </span>

                {disabled && disabledReason ? (
                    <span className="mt-1 block text-xs font-medium text-amber-700">
                        {disabledReason}
                    </span>
                ) : null}

                {getErrorMessage(errors, name) ? (
                    <span className="mt-1 block text-xs font-medium text-red-600">
                        {getErrorMessage(errors, name)}
                    </span>
                ) : null}
            </span>
        </label>
    );
}

function PetContactPermissionsGrid({
    hasActivePrimaryContact,
    primaryContactDisabledReason,
}: {
    hasActivePrimaryContact: boolean;
    primaryContactDisabledReason?: string;
}) {
    const {control, setValue} = useFormContext<PetContactFormValues>();

    const selectedRole = useWatch({
        control,
        name: "role",
    });

    const isBillingResponsible = selectedRole === BILLING_RESPONSIBLE_ROLE;

    useEffect(() => {
        if (!isBillingResponsible) {
            return;
        }

        setValue(BILLING_PERMISSION_NAME, true, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [isBillingResponsible, setValue]);

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PET_CONTACT_PERMISSION_OPTIONS.map((permissionOption) => {
                const permissionName = permissionOption.name;

                const isPrimaryContactPermission =
                    permissionName === "is_primary_contact";

                const isBillingPermission =
                    permissionName === BILLING_PERMISSION_NAME;

                const disabled =
                    (isPrimaryContactPermission && hasActivePrimaryContact) ||
                    (isBillingPermission && isBillingResponsible);

                const disabledReason = isPrimaryContactPermission
                    ? (primaryContactDisabledReason ??
                      PRIMARY_CONTACT_DISABLED_FALLBACK_MESSAGE)
                    : isBillingPermission
                      ? BILLING_RESPONSIBLE_PERMISSION_MESSAGE
                      : undefined;

                return (
                    <PermissionCheckbox
                        key={permissionName}
                        name={permissionName}
                        label={permissionOption.label}
                        description={permissionOption.description}
                        disabled={disabled}
                        disabledReason={disabled ? disabledReason : undefined}
                    />
                );
            })}
        </div>
    );
}

export default function PetContactLinkFields({
    hasActivePrimaryContact = false,
    primaryContactDisabledReason,
}: Props) {
    const {control} = useFormContext<PetContactFormValues>();

    const selectedContactType = useWatch({
        control,
        name: "contact_type",
    });

    return (
        <div className="space-y-5">
            <Section
                title="Vínculo con el paciente"
                description="Estos datos pertenecen solo a la relación entre el contacto seleccionado y este paciente. No modifican los datos del contacto del centro."
            >
                <div className="space-y-4">
                    <RoleSelect />

                    <TextInput
                        name="specific_relationship"
                        label="Vínculo específico"
                        description={getSpecificLinkDescription(
                            selectedContactType,
                        )}
                        placeholder={getSpecificLinkPlaceholder(
                            selectedContactType,
                        )}
                    />
                </div>
            </Section>

            <Section
                title="Permisos y responsabilidades"
                description={getPermissionsDescription(selectedContactType)}
            >
                <PetContactPermissionsGrid
                    hasActivePrimaryContact={hasActivePrimaryContact}
                    primaryContactDisabledReason={primaryContactDisabledReason}
                />
            </Section>

            <Section
                title="Notas del vínculo"
                description={getNotesDescription(selectedContactType)}
            >
                <TextAreaInput
                    name="pet_contact_notes"
                    label="Notas internas"
                    placeholder="Ej: Solo llamar por urgencias, prefiere WhatsApp, retirar con autorización previa..."
                    maxLength={500}
                    rows={4}
                />
            </Section>
        </div>
    );
}
