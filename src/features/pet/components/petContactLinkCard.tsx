// src/features/pet/components/petContactLinkCard.tsx

"use client";

import {ContactType} from "@/features/center/centerContact/types/centerContactTypes";
import type {PetContactLinkInterface} from "@/features/pet/types/petTypes";
import GlobalButton from "@/shared/ui/globalButton";
import {FiTrash2} from "react-icons/fi";

type Props = {
    item: PetContactLinkInterface;
    onEdit?: (item: PetContactLinkInterface) => void;
    onRemove?: (item: PetContactLinkInterface) => void;
};

type PetContactRoleValue =
    | "OWNER_GUARDIAN"
    | "CAREGIVER"
    | "BILLING_RESPONSIBLE"
    | "REFERRING_VET"
    | "RESPONSIBLE_INSTITUTION"
    | "REFERRING_INSTITUTION"
    | "BREEDER"
    | "SHELTER_OR_FOUNDATION";

type UnknownRecord = Record<string, unknown>;

const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
    PERSON: "Persona",
    INSTITUTION: "Institución",
};

const ROLE_LABELS: Record<PetContactRoleValue, string> = {
    OWNER_GUARDIAN: "Propietario / Tutor",
    CAREGIVER: "Cuidador",
    BILLING_RESPONSIBLE: "Responsable de pago",
    REFERRING_VET: "Veterinario remitente",
    RESPONSIBLE_INSTITUTION: "Institución responsable",
    REFERRING_INSTITUTION: "Institución remitente",
    BREEDER: "Criador / Criadero",
    SHELTER_OR_FOUNDATION: "Refugio o fundación",
};

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
    return isRecord(value) ? value : {};
}

function getRecordValue(source: unknown, key: string): unknown {
    if (!isRecord(source)) return undefined;

    return source[key];
}

function getStringValue(source: unknown, key: string): string | null {
    const value = getRecordValue(source, key);

    if (typeof value === "string") {
        const cleanValue = value.trim();
        return cleanValue || null;
    }

    if (typeof value === "number") {
        return String(value);
    }

    return null;
}

function getBooleanValue(source: unknown, key: string): boolean {
    return getRecordValue(source, key) === true;
}

function getFirstStringValue(
    sources: readonly unknown[],
    keys: readonly string[],
): string | null {
    for (const source of sources) {
        for (const key of keys) {
            const value = getStringValue(source, key);

            if (value) {
                return value;
            }
        }
    }

    return null;
}

function formatChileanDocumentId(value: string | null): string | null {
    if (!value) return null;

    const cleanValue = value.trim();

    if (!cleanValue) return null;

    const normalizedValue = cleanValue.replace(/[.\-\s]/g, "").toUpperCase();

    const looksLikeChileanRut = /^\d{1,9}[0-9K]$/.test(normalizedValue);

    if (!looksLikeChileanRut) {
        return cleanValue;
    }

    const body = normalizedValue.slice(0, -1);
    const verifierDigit = normalizedValue.slice(-1);

    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedBody}-${verifierDigit}`;
}

function getCenterContactRecord(item: PetContactLinkInterface): UnknownRecord {
    const itemRecord = asRecord(item);

    const centerContact = getRecordValue(itemRecord, "center_contact");

    if (isRecord(centerContact)) {
        return centerContact;
    }

    // Compatibility fallback only.
    const oldContact = getRecordValue(itemRecord, "contact");

    if (isRecord(oldContact)) {
        return oldContact;
    }

    return {};
}

function normalizeContactType(
    value: string | null | undefined,
): ContactType | null {
    const normalizedValue = String(value ?? "")
        .trim()
        .toUpperCase();

    if (normalizedValue === "PERSON" || normalizedValue === "INSTITUTION") {
        return normalizedValue;
    }

    return null;
}

function normalizeRole(
    value: string | null | undefined,
): PetContactRoleValue | null {
    const normalizedValue = String(value ?? "")
        .trim()
        .toUpperCase();

    if (
        normalizedValue === "OWNER_GUARDIAN" ||
        normalizedValue === "CAREGIVER" ||
        normalizedValue === "BILLING_RESPONSIBLE" ||
        normalizedValue === "REFERRING_VET" ||
        normalizedValue === "RESPONSIBLE_INSTITUTION" ||
        normalizedValue === "REFERRING_INSTITUTION" ||
        normalizedValue === "BREEDER" ||
        normalizedValue === "SHELTER_OR_FOUNDATION"
    ) {
        return normalizedValue;
    }

    return null;
}

function getContactTypeLabel(item: PetContactLinkInterface): string {
    const itemRecord = asRecord(item);
    const centerContact = getCenterContactRecord(item);

    const backendLabel = getFirstStringValue(
        [itemRecord, centerContact],
        ["contact_type_label", "center_contact_type_label", "type_label"],
    );

    if (backendLabel) {
        return backendLabel;
    }

    const normalizedType = normalizeContactType(
        getFirstStringValue(
            [centerContact, itemRecord],
            ["center_contact_type", "contact_type", "type"],
        ),
    );

    if (normalizedType) {
        return CONTACT_TYPE_LABELS[normalizedType];
    }

    const institutionName = getFirstStringValue(
        [centerContact, itemRecord],
        ["institution_name", "institution", "legal_name", "business_name"],
    );

    return institutionName ? "Institución" : "Persona";
}

function getRoleLabel(item: PetContactLinkInterface): string {
    const itemRecord = asRecord(item);

    const backendLabel = getFirstStringValue(
        [itemRecord],
        ["role_label", "pet_contact_role_label"],
    );

    if (backendLabel) {
        return backendLabel;
    }

    const normalizedRole = normalizeRole(getStringValue(itemRecord, "role"));

    if (!normalizedRole) {
        return "Rol no definido";
    }

    return ROLE_LABELS[normalizedRole];
}

function getContactDisplayName(item: PetContactLinkInterface): string {
    const itemRecord = asRecord(item);
    const centerContact = getCenterContactRecord(item);

    const directName = getFirstStringValue(
        [centerContact, itemRecord],
        [
            "display_name",
            "name",
            "full_name",
            "contact_display_name",
            "contact_name",
            "institution_name",
            "institution",
            "legal_name",
            "business_name",
        ],
    );

    if (directName) {
        return directName;
    }

    const firstName = getFirstStringValue(
        [centerContact, itemRecord],
        ["first_name", "contact_first_name", "names", "given_name"],
    );

    const lastName = getFirstStringValue(
        [centerContact, itemRecord],
        ["last_name", "contact_last_name", "family_name", "paternal_last_name"],
    );

    const maternalLastName = getFirstStringValue(
        [centerContact, itemRecord],
        ["maternal_last_name", "contact_maternal_last_name"],
    );

    const composedName = [firstName, lastName, maternalLastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return composedName || "Contacto sin nombre";
}

function getPetContactRelationship(
    item: PetContactLinkInterface,
): string | null {
    const itemRecord = asRecord(item);

    return getFirstStringValue(
        [itemRecord],
        [
            "specific_relationship",
            "relationship_label",
            "relationship",
            "link_label",
        ],
    );
}

function getPrimaryPhone(item: PetContactLinkInterface): string | null {
    const itemRecord = asRecord(item);
    const centerContact = getCenterContactRecord(item);

    return getFirstStringValue(
        [centerContact, itemRecord],
        [
            "primary_phone",
            "phone",
            "cell_phone",
            "mobile_phone",
            "mobile",
            "cellphone",
            "contact_phone",
            "contact_phone_number",
            "contact_primary_phone",
        ],
    );
}

function getContactEmail(item: PetContactLinkInterface): string | null {
    const itemRecord = asRecord(item);
    const centerContact = getCenterContactRecord(item);

    return getFirstStringValue(
        [centerContact, itemRecord],
        ["email", "primary_email", "contact_email"],
    );
}

function getContactDocument(item: PetContactLinkInterface): string | null {
    const itemRecord = asRecord(item);
    const centerContact = getCenterContactRecord(item);

    const documentId = getFirstStringValue(
        [centerContact, itemRecord],
        [
            "document_id",
            "contact_document_id",
            "national_dni",
            "contact_dni",
            "dni",
            "rut",
        ],
    );

    return formatChileanDocumentId(documentId);
}

function getContactLocation(item: PetContactLinkInterface): string | null {
    const itemRecord = asRecord(item);
    const centerContact = getCenterContactRecord(item);

    return getFirstStringValue(
        [centerContact, itemRecord],
        [
            "city",
            "contact_city",
            "commune",
            "municipality",
            "address",
            "contact_address",
            "region",
            "country",
        ],
    );
}

function getPetContactBadges(item: PetContactLinkInterface): string[] {
    const itemRecord = asRecord(item);
    const badges: string[] = [];

    if (getBooleanValue(itemRecord, "is_primary_contact")) {
        badges.push("Contacto principal");
    }

    if (getBooleanValue(itemRecord, "is_emergency_contact")) {
        badges.push("Contacto de emergencia");
    }

    if (getBooleanValue(itemRecord, "can_authorize_treatment")) {
        badges.push("Autoriza tratamiento");
    }

    if (getBooleanValue(itemRecord, "can_receive_medical_updates")) {
        badges.push("Recibe actualizaciones médicas");
    }

    if (getBooleanValue(itemRecord, "can_receive_billing")) {
        badges.push("Recibe información de pago");
    }

    if (getBooleanValue(itemRecord, "can_pickup_pet")) {
        badges.push("Puede retirar la mascota");
    }

    return badges;
}

function ContactField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    const displayValue =
        typeof value === "string" && value.trim() !== "" ? value.trim() : "—";

    const isEmpty = displayValue === "—";

    return (
        <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p
                className={
                    isEmpty
                        ? "truncate text-sm text-slate-400"
                        : "truncate text-sm font-medium text-slate-700"
                }
                title={displayValue}
            >
                {displayValue}
            </p>
        </div>
    );
}

function InfoPill({label, value}: {label: string; value: string}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-700">
                {value}
            </p>
        </div>
    );
}

export default function PetContactCard({item, onEdit, onRemove}: Props) {
    const displayName = getContactDisplayName(item);
    const specificRelationship = getPetContactRelationship(item);
    const phone = getPrimaryPhone(item);
    const email = getContactEmail(item);
    const documentId = getContactDocument(item);
    const location = getContactLocation(item);
    const badges = getPetContactBadges(item);

    const contactTypeLabel = getContactTypeLabel(item);
    const roleLabel = getRoleLabel(item);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h4
                        className="truncate text-sm font-bold text-slate-900"
                        title={displayName}
                    >
                        {displayName}
                    </h4>

                    {specificRelationship ? (
                        <p
                            className="mt-1 truncate text-xs text-slate-500"
                            title={specificRelationship}
                        >
                            Vínculo específico:{" "}
                            <span className="font-semibold text-slate-700">
                                {specificRelationship}
                            </span>
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-slate-400">
                            Vínculo específico no indicado
                        </p>
                    )}
                </div>

                {(onEdit || onRemove) && (
                    <div className="flex shrink-0 items-center gap-2">
                        {onEdit && (
                            <GlobalButton
                                type="button"
                                variant="ghost"
                                isIcon
                                leftIcon={
                                    <span
                                        aria-hidden="true"
                                        className="text-sm leading-none"
                                    >
                                        ✏️
                                    </span>
                                }
                                onClick={() => onEdit(item)}
                                aria-label="Editar vínculo"
                                title="Editar vínculo"
                                className="h-8 w-8 rounded-lg bg-white p-0 text-amber-600 shadow-sm ring-1 ring-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-300"
                            >
                                <span className="sr-only">Editar vínculo</span>
                            </GlobalButton>
                        )}

                        {onRemove && (
                            <GlobalButton
                                type="button"
                                variant="ghost"
                                isIcon
                                leftIcon={
                                    <FiTrash2
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                }
                                onClick={() => onRemove(item)}
                                aria-label="Quitar vínculo"
                                title="Quitar vínculo"
                                className="h-8 w-8 rounded-lg bg-white p-0 text-red-600 shadow-sm ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-300"
                            >
                                <span className="sr-only">Quitar vínculo</span>
                            </GlobalButton>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoPill label="Tipo de contacto" value={contactTypeLabel} />
                <InfoPill label="Rol del contacto" value={roleLabel} />
            </div>

            {badges.length > 0 ? (
                <div className="mb-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Funciones, permisos y responsabilidades
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {badges.map((badge) => (
                            <span
                                key={badge}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">
                        Sin permisos o funciones específicas registradas.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ContactField label="Teléfono" value={phone} />
                <ContactField label="Email" value={email} />
                <ContactField label="Documento" value={documentId} />
                <ContactField label="Ciudad / dirección" value={location} />
            </div>
        </article>
    );
}
