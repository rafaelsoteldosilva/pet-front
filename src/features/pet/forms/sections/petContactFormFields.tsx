// src/features/pet/forms/sections/petContactFormFields.tsx

"use client";

import {useEffect, useMemo, useRef, useState, type ReactNode} from "react";
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

import {
    formatChileanRut,
    getChileanRutValidationMessage,
} from "@/shared/utils/chileanRutUtils";

type Props = {
    hasActivePrimaryContact?: boolean;
    primaryContactDisabledReason?: string;
};

type FormFieldName = FieldPath<PetContactFormValues>;
type ContactTypeValue = PetContactFormValues["contact_type"];

const SPECIFIC_RELATIONSHIP_RESET_MESSAGE =
    "Se limpió el vínculo específico porque cambiaste el rol del contacto.";

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

const PRIMARY_CONTACT_DISABLED_FALLBACK_MESSAGE =
    "Ya existe un contacto principal. Para cambiarlo, edita el contacto principal actual.";

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

function getPrimaryDataSectionTitle(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Datos de la institución"
        : "Datos de la persona";
}

function getPrimaryDataSectionDescription(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Registra los datos principales de la institución vinculada al paciente."
        : "Registra los datos principales de la persona vinculada al paciente.";
}

function getContactDataDescription(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Estos datos permiten contactar rápidamente a la institución cuando sea necesario."
        : "Estos datos permiten contactar rápidamente a la persona cuando sea necesario.";
}

function getRoleSectionDescription(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Define qué función cumple esta institución en relación con el paciente."
        : "Define qué relación o función tiene esta persona con el paciente.";
}

function getSpecificLinkDescription(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Opcional. Útil para indicar una función más concreta, por ejemplo: refugio responsable, clínica remitente o criadero de origen."
        : "Opcional. Útil para indicar algo más concreto, por ejemplo: madre del tutor, vecino, cuidador temporal o responsable administrativo.";
}

function getSpecificLinkPlaceholder(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Ej: Refugio responsable"
        : "Ej: Madre del propietario";
}

function getPermissionsDescription(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Estas opciones aclaran qué puede hacer o recibir esta institución respecto al paciente."
        : "Estas opciones aclaran qué puede hacer o recibir esta persona respecto al paciente.";
}

function getObservationsDescription(contactType: ContactTypeValue) {
    return isInstitutionContact(contactType)
        ? "Agrega información interna útil sobre esta institución para el equipo del centro veterinario."
        : "Agrega información interna útil sobre esta persona para el equipo del centro veterinario.";
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

function TextInput({
    name,
    label,
    description,
    placeholder,
    type = "text",
}: {
    name: FormFieldName;
    label: string;
    description?: string;
    placeholder?: string;
    type?: "text" | "email" | "tel";
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
                type={type}
                placeholder={placeholder}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </FieldBlock>
    );
}

function RutInput({
    label,
    description,
    placeholder,
}: {
    label: string;
    description?: string;
    placeholder?: string;
}) {
    const {
        control,
        setValue,
        setError,
        clearErrors,
        formState: {errors},
    } = useFormContext<PetContactFormValues>();

    const {field} = useController({
        control,
        name: "document_id",
    });

    const value = typeof field.value === "string" ? field.value : "";

    useEffect(() => {
        const formattedRut = formatChileanRut(value);

        if (formattedRut === value) {
            return;
        }

        setValue("document_id", formattedRut, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
        });
    }, [value, setValue]);

    function validateAndSetRutError(valueToValidate: string) {
        const errorMessage = getChileanRutValidationMessage(valueToValidate);

        if (errorMessage) {
            setError("document_id", {
                type: "validate",
                message: errorMessage,
            });

            return;
        }

        clearErrors("document_id");
    }

    return (
        <FieldBlock
            label={label}
            description={description}
            error={getErrorMessage(errors, "document_id")}
        >
            <input
                name={field.name}
                ref={field.ref}
                value={value}
                type="text"
                inputMode="text"
                placeholder={placeholder}
                onBlur={(event) => {
                    const formattedRut = formatChileanRut(event.target.value);

                    field.onBlur();

                    setValue("document_id", formattedRut, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                    });

                    validateAndSetRutError(formattedRut);
                }}
                onChange={(event) => {
                    const formattedRut = formatChileanRut(event.target.value);

                    field.onChange(formattedRut);
                    validateAndSetRutError(formattedRut);
                }}
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

function PetContactPermissionsGrid({
    hasActivePrimaryContact,
    primaryContactDisabledReason,
}: {
    hasActivePrimaryContact: boolean;
    primaryContactDisabledReason?: string;
}) {
    const {
        register,
        control,
        setValue,
        getValues,
        formState: {errors},
    } = useFormContext<PetContactFormValues>();

    const watchedValues = useWatch({
        control,
    }) as Partial<PetContactFormValues> | undefined;

    useEffect(() => {
        if (!hasActivePrimaryContact) {
            return;
        }

        if (getValues("is_primary_contact") === true) {
            setValue("is_primary_contact", false, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: true,
            });
        }
    }, [hasActivePrimaryContact, getValues, setValue]);

    return (
        <div className="space-y-3">
            {hasActivePrimaryContact ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-semibold">
                        Contacto principal no disponible
                    </p>

                    <p className="mt-1 text-xs leading-5">
                        {primaryContactDisabledReason ??
                            PRIMARY_CONTACT_DISABLED_FALLBACK_MESSAGE}
                    </p>
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {PET_CONTACT_PERMISSION_OPTIONS.map((option) => {
                    const registeredField = register(option.name);

                    const isPrimaryContactOption =
                        option.name === "is_primary_contact";

                    const isDisabledByPrimaryContact =
                        isPrimaryContactOption && hasActivePrimaryContact;

                    const isChecked = watchedValues?.[option.name] === true;

                    const error = getErrorMessage(errors, option.name);

                    const disabledTitle = isDisabledByPrimaryContact
                        ? (primaryContactDisabledReason ??
                          PRIMARY_CONTACT_DISABLED_FALLBACK_MESSAGE)
                        : undefined;

                    const description = isDisabledByPrimaryContact
                        ? (primaryContactDisabledReason ??
                          PRIMARY_CONTACT_DISABLED_FALLBACK_MESSAGE)
                        : option.description;

                    const disabledStyle = isDisabledByPrimaryContact
                        ? "cursor-not-allowed border-amber-200 bg-amber-50/70 opacity-90"
                        : "";

                    const enabledCheckedStyle =
                        !isDisabledByPrimaryContact && isChecked
                            ? "border-blue-500 bg-blue-50"
                            : "";

                    const enabledUncheckedStyle =
                        !isDisabledByPrimaryContact && !isChecked
                            ? "border-slate-200 bg-white"
                            : "";

                    const labelTextStyle = isDisabledByPrimaryContact
                        ? "block text-sm font-semibold text-amber-800"
                        : "block text-sm font-semibold text-slate-800";

                    const descriptionTextStyle = isDisabledByPrimaryContact
                        ? "block text-xs leading-5 text-amber-700"
                        : "block text-xs leading-5 text-slate-500";

                    return (
                        <label
                            key={option.name}
                            title={disabledTitle}
                            className={[
                                "flex gap-3 rounded-xl border px-4 py-3 shadow-sm transition",
                                isDisabledByPrimaryContact
                                    ? disabledStyle
                                    : "cursor-pointer hover:border-blue-300 hover:bg-blue-50/40",
                                enabledCheckedStyle,
                                enabledUncheckedStyle,
                            ].join(" ")}
                        >
                            <input
                                type="checkbox"
                                name={registeredField.name}
                                ref={registeredField.ref}
                                onBlur={registeredField.onBlur}
                                checked={isChecked}
                                disabled={isDisabledByPrimaryContact}
                                onChange={registeredField.onChange}
                                className="mt-1 h-4 w-4 accent-blue-600 disabled:cursor-not-allowed"
                            />

                            <span className="space-y-1">
                                <span className={labelTextStyle}>
                                    {option.label}
                                </span>

                                <span className={descriptionTextStyle}>
                                    {description}
                                </span>

                                {error ? (
                                    <span className="block text-xs font-medium text-red-600">
                                        {error}
                                    </span>
                                ) : null}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

function PersonIdentityFields() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
                name="first_name"
                label="Nombres"
                placeholder="Ej: Catalina"
            />

            <TextInput
                name="last_name"
                label="Apellidos"
                placeholder="Ej: Pérez"
            />

            <TextInput
                name="country_code"
                label="Código de país"
                placeholder="Ej: CL"
            />

            <RutInput
                label="RUT / Identificación"
                placeholder="Ej: 12.345.678-9"
            />
        </div>
    );
}

function InstitutionIdentityFields() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
                <TextInput
                    name="institution"
                    label="Nombre de la institución"
                    placeholder="Ej: Fundación Patitas Seguras"
                />
            </div>

            <TextInput
                name="country_code"
                label="Código de país"
                placeholder="Ej: CL"
            />

            <RutInput
                label="RUT / Identificación"
                placeholder="Ej: 76.123.456-7"
            />
        </div>
    );
}

export default function PetContactFormFields({
    hasActivePrimaryContact = false,
    primaryContactDisabledReason,
}: Props) {
    const {register, control, setValue} =
        useFormContext<PetContactFormValues>();

    const contactType = useWatch({
        control,
        name: "contact_type",
    });

    const selectedRole = useWatch({
        control,
        name: "role",
    });

    const [
        specificRelationshipResetNotice,
        setSpecificRelationshipResetNotice,
    ] = useState<string | null>(null);

    const effectiveContactType: ContactTypeValue = contactType ?? "PERSON";
    const isInstitution = isInstitutionContact(effectiveContactType);

    const visibleRoleOptions = useMemo(() => {
        return PET_CONTACT_ROLE_OPTIONS.filter((option) => {
            if (effectiveContactType === "PERSON") {
                return PERSON_ROLE_VALUE_SET.has(option.value);
            }

            return INSTITUTION_ROLE_VALUE_SET.has(option.value);
        });
    }, [effectiveContactType]);

    const previousContactTypeRef = useRef<ContactTypeValue | null>(null);
    const hasInitializedContactTypeRef = useRef(false);

    useEffect(() => {
        if (contactType !== "PERSON" && contactType !== "INSTITUTION") {
            return;
        }

        if (!hasInitializedContactTypeRef.current) {
            hasInitializedContactTypeRef.current = true;
            previousContactTypeRef.current = contactType;
            return;
        }

        if (previousContactTypeRef.current === contactType) {
            return;
        }

        previousContactTypeRef.current = contactType;

        if (contactType === "PERSON") {
            setValue("institution", null, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });

            return;
        }

        setValue("first_name", null, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });

        setValue("last_name", null, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [contactType, setValue]);

    useEffect(() => {
        const selectedRoleIsVisible = visibleRoleOptions.some(
            (option) => option.value === selectedRole,
        );

        if (selectedRoleIsVisible) {
            return;
        }

        setValue(
            "role",
            effectiveContactType === "PERSON"
                ? "OWNER_GUARDIAN"
                : "RESPONSIBLE_INSTITUTION",
            {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: true,
            },
        );
    }, [effectiveContactType, selectedRole, setValue, visibleRoleOptions]);

    return (
        <div className="space-y-5">
            <input type="hidden" {...register("contact_type")} />

            <Section
                title={getPrimaryDataSectionTitle(effectiveContactType)}
                description={getPrimaryDataSectionDescription(
                    effectiveContactType,
                )}
            >
                {isInstitution ? (
                    <InstitutionIdentityFields />
                ) : (
                    <PersonIdentityFields />
                )}
            </Section>

            <Section
                title="Datos de contacto"
                description={getContactDataDescription(effectiveContactType)}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput
                        name="email"
                        label="Email"
                        type="email"
                        placeholder={
                            isInstitution
                                ? "Ej: contacto@fundacion.cl"
                                : "Ej: persona@email.com"
                        }
                    />

                    <TextInput
                        name="cell_phone"
                        label={
                            isInstitution
                                ? "Teléfono principal"
                                : "Teléfono celular"
                        }
                        type="tel"
                        placeholder="Ej: +56 9 1234 5678"
                    />

                    <TextInput
                        name="home_phone"
                        label={
                            isInstitution
                                ? "Teléfono alternativo"
                                : "Teléfono de casa"
                        }
                        type="tel"
                        placeholder="Opcional"
                    />

                    <TextInput
                        name="work_phone"
                        label={
                            isInstitution
                                ? "Teléfono administrativo"
                                : "Teléfono de trabajo"
                        }
                        type="tel"
                        placeholder="Opcional"
                    />

                    <TextInput
                        name="city"
                        label="Ciudad"
                        placeholder="Ej: Santiago"
                    />

                    <TextInput
                        name="address"
                        label="Dirección"
                        placeholder="Ej: Av. Principal 123"
                    />
                </div>
            </Section>

            <Section
                title="Rol del contacto"
                description={getRoleSectionDescription(effectiveContactType)}
            >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {visibleRoleOptions.map((option) => {
                        const checked = selectedRole === option.value;
                        const registeredRoleField = register("role");

                        return (
                            <label
                                key={option.value}
                                className={
                                    checked
                                        ? "cursor-pointer rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 shadow-sm"
                                        : "cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300"
                                }
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name={registeredRoleField.name}
                                        ref={registeredRoleField.ref}
                                        onBlur={registeredRoleField.onBlur}
                                        value={option.value}
                                        checked={checked}
                                        onChange={(event) => {
                                            registeredRoleField.onChange(event);

                                            if (
                                                !selectedRole ||
                                                selectedRole === option.value
                                            ) {
                                                return;
                                            }

                                            setValue(
                                                "specific_relationship",
                                                null,
                                                {
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                    shouldValidate: true,
                                                },
                                            );

                                            setSpecificRelationshipResetNotice(
                                                SPECIFIC_RELATIONSHIP_RESET_MESSAGE,
                                            );
                                        }}
                                        className="mt-1 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <div className="space-y-1">
                                        <p
                                            className={
                                                checked
                                                    ? "text-sm font-bold text-blue-900"
                                                    : "text-sm font-semibold text-slate-800"
                                            }
                                        >
                                            {option.label}
                                        </p>

                                        <p className="text-xs leading-5 text-slate-500">
                                            {
                                                ROLE_DESCRIPTION_BY_VALUE[
                                                    option.value
                                                ]
                                            }
                                        </p>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="mt-4 space-y-3">
                    {specificRelationshipResetNotice ? (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
                            {specificRelationshipResetNotice}
                        </div>
                    ) : null}

                    <TextInput
                        name="specific_relationship"
                        label="Vínculo específico"
                        description={getSpecificLinkDescription(
                            effectiveContactType,
                        )}
                        placeholder={getSpecificLinkPlaceholder(
                            effectiveContactType,
                        )}
                    />
                </div>
            </Section>

            <Section
                title="Permisos y responsabilidades"
                description={getPermissionsDescription(effectiveContactType)}
            >
                <PetContactPermissionsGrid
                    hasActivePrimaryContact={hasActivePrimaryContact}
                    primaryContactDisabledReason={primaryContactDisabledReason}
                />
            </Section>

            <Section
                title="Observaciones"
                description={getObservationsDescription(effectiveContactType)}
            >
                <div className="grid grid-cols-1 gap-4">
                    <TextAreaInput
                        name="contact_observations"
                        label={
                            isInstitution
                                ? "Observaciones de la institución"
                                : "Observaciones del contacto"
                        }
                        description={
                            isInstitution
                                ? "Información general sobre la institución. Visible para el equipo administrativo o clínico."
                                : "Información general del contacto. Visible para el equipo administrativo o clínico."
                        }
                        placeholder={
                            isInstitution
                                ? "Ej: Prefiere contacto por correo institucional."
                                : "Ej: Prefiere ser contactado por WhatsApp."
                        }
                        maxLength={500}
                    />

                    <TextAreaInput
                        name="contact_notes"
                        label={
                            isInstitution
                                ? "Notas internas de la institución"
                                : "Notas internas del contacto"
                        }
                        description={
                            isInstitution
                                ? "Notas internas sobre la institución."
                                : "Notas internas sobre la persona."
                        }
                        placeholder={
                            isInstitution
                                ? "Ej: Contactar solo en horario administrativo."
                                : "Ej: Contactar solo en horario laboral."
                        }
                        maxLength={500}
                    />

                    <TextAreaInput
                        name="pet_contact_notes"
                        label="Notas sobre la relación con este paciente"
                        description={
                            isInstitution
                                ? "Notas específicas de esta institución respecto a este paciente."
                                : "Notas específicas de este contacto respecto a este paciente."
                        }
                        placeholder={
                            isInstitution
                                ? "Ej: Institución responsable del rescate inicial."
                                : "Ej: Retira al paciente los viernes por la tarde."
                        }
                        maxLength={500}
                    />
                </div>
            </Section>
        </div>
    );
}
