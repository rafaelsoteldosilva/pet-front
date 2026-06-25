// src/features/pet/dialogs/addCenterContactToPetContactLinksDialog.tsx

"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {type DefaultValues, type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {
    petContactSchema,
    type PetContactFormValues,
} from "@/features/pet/forms/schemas/petContactSchema";

import type {PetDataInterface} from "@/features/pet/types/petTypes";
import {addPetContactLinkApi} from "@/api/pet/contactLinks/addPetContactLinkApi";
import {addCenterContactApi} from "@/api/center/centerContact/addCenterContactApi";

import FormDialog from "@/shared/ui/forms/formDialog";
import SimpleModalDialog from "@/shared/ui/simpleModalDialog";
import CenterContactsGrid from "@/features/center/centerContact/components/centerContactsGrid";
import PetContactLinkFormContent from "@/features/pet/dialogs/shared/petContactLinkFormContent";
import {getPrimaryContactInfoForAdding} from "@/features/pet/dialogs/shared/petContactLinkPrimaryContactUtils";

import AddCenterContactFormDialog, {
    type CenterContactPayload,
} from "@/features/center/centerContact/dialogs/addCenterContactFormDialog";

import {useReduxDispatch} from "@/state/redux/reduxHooks";
import {setPetData} from "@/state/redux/slices/petDataSlice";

import {useCenterContactsSlice} from "@/hooks/center/useCenterContactsSlice";

import type {CenterContactInterface} from "@/features/center/centerContact/types/centerContactTypes";
import {AddPetContactLinkRequest} from "../types/petContactFormTypes";

type Props = {
    open: boolean;
    centerId: number;
    petId: number;
    pet: PetDataInterface;
    defaultRole?: PetContactFormValues["role"];
    onClose: () => void;
    onSaved: (updatedPet: PetDataInterface) => void;
};

type BackendErrorResponse = {
    detail?: string | string[];

    center_contact_id?: string[];
    center_contact_type?: string[];

    contact_type?: string[];
    first_name?: string[];
    last_name?: string[];
    institution?: string[];
    institution_name?: string[];

    document_id?: string[];
    email?: string[];
    primary_phone?: string[];
    secondary_phone?: string[];
    tertiary_phone?: string[];

    role?: string[];
    specific_relationship?: string[];
    is_primary_contact?: string[];
    is_emergency_contact?: string[];
    can_authorize_treatment?: string[];
    can_receive_medical_updates?: string[];
    can_receive_billing?: string[];
    can_pickup_pet?: string[];
    notes?: string[];
    pet_contact_notes?: string[];
    pet_contact_link_notes?: string[];
    non_field_errors?: string[];
};

type UnknownRecord = Record<string, unknown>;

type ContactTypeValue = PetContactFormValues["contact_type"];

type ContactFormMode = "centerContact" | null;

type PendingContactSelectionAction = {
    type: "selectCenterContact";
    contact: CenterContactInterface;
};

type AddCenterContactToPetContactLinkPayload = {
    center_contact_id: number;

    role: PetContactFormValues["role"];
    specific_relationship: string | null;

    is_primary_contact: boolean;
    is_emergency_contact: boolean;

    can_authorize_treatment: boolean;
    can_receive_medical_updates: boolean;
    can_receive_billing: boolean;
    can_pickup_pet: boolean;

    notes: string | null;
};

type AddPetContactLinkApiPayload = Parameters<
    typeof addPetContactLinkApi
>[0]["payload"];

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

function getFirstStringValue(source: unknown, keys: readonly string[]): string {
    for (const key of keys) {
        const value = getStringValue(source, key);

        if (value) {
            return value;
        }
    }

    return "";
}

function toNullableString(value: string): string | null {
    const cleanValue = value.trim();

    return cleanValue || null;
}

function cleanNullableString(value: string | null | undefined): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const cleanValue = value.trim();

    return cleanValue || null;
}

function normalizeCountryCodeFromContact(
    contact: CenterContactInterface,
): string {
    const directCountryCode = getFirstStringValue(contact, [
        "country_code",
        "countryCode",
    ]);

    if (directCountryCode) {
        return directCountryCode.toUpperCase();
    }

    const country = getFirstStringValue(contact, ["country"]);

    if (!country) {
        return "CL";
    }

    const normalizedCountry = country.trim().toLowerCase();

    if (normalizedCountry === "cl" || normalizedCountry === "chile") {
        return "CL";
    }

    return country.toUpperCase();
}

function getContactTypeFromCenterContact(
    contact: CenterContactInterface,
): ContactTypeValue {
    const contactType = getFirstStringValue(contact, [
        "center_contact_type",
        "contact_type",
        "type",
    ]).toUpperCase();

    if (contactType === "INSTITUTION") {
        return "INSTITUTION";
    }

    return "PERSON";
}

function getRoleForContactType(
    contactType: ContactTypeValue,
    defaultRole: PetContactFormValues["role"],
): PetContactFormValues["role"] {
    if (contactType === "INSTITUTION") {
        return "RESPONSIBLE_INSTITUTION";
    }

    return defaultRole;
}

function getContactFirstName(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "first_name",
        "contact_first_name",
        "names",
        "given_name",
    ]);
}

function getContactLastName(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "last_name",
        "contact_last_name",
        "family_name",
        "paternal_last_name",
    ]);
}

function getContactInstitutionName(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "institution_name",
        "institution",
        "business_name",
        "center_name",
        "company_name",
        "legal_name",
        "display_name",
        "name",
    ]);
}

function getContactDocumentId(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "document_id",
        "contact_document_id",
        "national_dni",
        "rut",
        "dni",
    ]);
}

function getContactEmail(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "email",
        "primary_email",
        "contact_email",
    ]);
}

function getContactCellPhone(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "cell_phone",
        "primary_phone",
        "mobile_phone",
        "mobile",
        "phone",
    ]);
}

function getContactHomePhone(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "home_phone",
        "secondary_phone",
        "landline_phone",
    ]);
}

function getContactWorkPhone(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "work_phone",
        "tertiary_phone",
        "office_phone",
        "administrative_phone",
    ]);
}

function getContactAddress(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, ["address", "contact_address"]);
}

function getContactCity(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, ["city", "commune"]);
}

function getContactNotes(contact: CenterContactInterface): string {
    return getFirstStringValue(contact, [
        "contact_notes",
        "center_contact_notes",
        "notes",
    ]);
}

function getCenterContactId(contact: CenterContactInterface): number | null {
    const directId = getNumberValue(contact, "id");

    if (directId !== null) {
        return directId;
    }

    return getNumberValue(contact, "center_contact_id");
}

function isSameCenterContact(
    firstContact: CenterContactInterface | null,
    secondContact: CenterContactInterface | null,
): boolean {
    if (!firstContact || !secondContact) {
        return false;
    }

    const firstId = getCenterContactId(firstContact);
    const secondId = getCenterContactId(secondContact);

    if (firstId !== null && secondId !== null) {
        return firstId === secondId;
    }

    return firstContact === secondContact;
}

function getCenterContactIdFromPetContactLink(link: unknown): number | null {
    const directCenterContactId = getNumberValue(link, "center_contact_id");

    if (directCenterContactId !== null) {
        return directCenterContactId;
    }

    const centerContact = getRecordValue(link, "center_contact");

    if (isRecord(centerContact)) {
        const centerContactId = getNumberValue(centerContact, "id");

        if (centerContactId !== null) {
            return centerContactId;
        }
    }

    const oldContact = getRecordValue(link, "contact");

    if (isRecord(oldContact)) {
        const oldContactId = getNumberValue(oldContact, "id");

        if (oldContactId !== null) {
            return oldContactId;
        }
    }

    return null;
}

function getLinkedCenterContactIdsFromPet(pet: PetDataInterface): number[] {
    const petRecord = pet as unknown as UnknownRecord;

    const candidateArrays = [
        getRecordValue(petRecord, "contact_links"),
        getRecordValue(petRecord, "pet_contact_links"),
        getRecordValue(petRecord, "pet_contacts"),
        getRecordValue(petRecord, "contacts"),
    ];

    const linkedIds = new Set<number>();

    for (const candidateArray of candidateArrays) {
        if (!Array.isArray(candidateArray)) {
            continue;
        }

        for (const item of candidateArray) {
            const centerContactId = getCenterContactIdFromPetContactLink(item);

            if (centerContactId !== null) {
                linkedIds.add(centerContactId);
            }
        }
    }

    return Array.from(linkedIds);
}

function buildDefaultValues(
    defaultRole: PetContactFormValues["role"] = "OWNER_GUARDIAN",
): DefaultValues<PetContactFormValues> {
    return {
        contact_type: "PERSON",

        first_name: null,
        last_name: null,
        institution: null,

        country_code: "CL",
        document_id: "",

        email: null,
        cell_phone: null,
        home_phone: null,
        work_phone: null,

        address: null,
        city: null,

        contact_observations: null,
        contact_notes: null,

        role: defaultRole,
        specific_relationship: null,

        is_primary_contact: false,
        is_emergency_contact: false,

        can_authorize_treatment: false,
        can_receive_medical_updates: false,
        can_receive_billing: false,
        can_pickup_pet: false,

        pet_contact_notes: null,
    };
}

function buildDefaultValuesFromCenterContact(
    contact: CenterContactInterface,
    defaultRole: PetContactFormValues["role"],
): DefaultValues<PetContactFormValues> {
    const contactType = getContactTypeFromCenterContact(contact);
    const role = getRoleForContactType(contactType, defaultRole);

    const baseValues = buildDefaultValues(role);

    const firstName = getContactFirstName(contact);
    const lastName = getContactLastName(contact);
    const institutionName = getContactInstitutionName(contact);

    return {
        ...baseValues,

        // Hidden values kept only because the existing schema/form model still
        // includes center-contact fields. They are not rendered and are not sent.
        contact_type: contactType,

        first_name:
            contactType === "PERSON" ? toNullableString(firstName) : null,
        last_name: contactType === "PERSON" ? toNullableString(lastName) : null,
        institution:
            contactType === "INSTITUTION"
                ? toNullableString(institutionName)
                : null,

        country_code: normalizeCountryCodeFromContact(contact),
        document_id: getContactDocumentId(contact),

        email: toNullableString(getContactEmail(contact)),
        cell_phone: toNullableString(getContactCellPhone(contact)),
        home_phone: toNullableString(getContactHomePhone(contact)),
        work_phone: toNullableString(getContactWorkPhone(contact)),

        address: toNullableString(getContactAddress(contact)),
        city: toNullableString(getContactCity(contact)),

        contact_observations: null,
        contact_notes: toNullableString(getContactNotes(contact)),

        role,

        is_primary_contact: false,
    };
}

function buildPetContactLinkPayload({
    values,
    centerContactId,
}: {
    values: PetContactFormValues;
    centerContactId: number;
}): AddPetContactLinkRequest {
    const canReceiveBilling =
        values.role === "BILLING_RESPONSIBLE"
            ? true
            : values.can_receive_billing;

    return {
        center_contact_id: centerContactId,

        role: values.role,
        specific_relationship: cleanNullableString(
            values.specific_relationship,
        ),

        is_primary_contact: values.is_primary_contact,
        is_emergency_contact: values.is_emergency_contact,

        can_authorize_treatment: values.can_authorize_treatment,
        can_receive_medical_updates: values.can_receive_medical_updates,
        can_receive_billing: canReceiveBilling,
        can_pickup_pet: values.can_pickup_pet,

        pet_contact_notes: cleanNullableString(values.pet_contact_notes),
    };
}

function getBackendErrorMessage(error: unknown): string | null {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return null;
    }

    const axiosError = error as {
        response?: {
            data?: BackendErrorResponse;
            status?: number;
        };
    };

    const data = axiosError.response?.data;

    console.error("Backend status:", axiosError.response?.status);
    console.error("Backend data:", data);

    if (!data) {
        return null;
    }

    const firstMessage = (value?: string | string[]): string | null => {
        if (Array.isArray(value) && value.length > 0) {
            return value[0];
        }

        if (typeof value === "string" && value.trim() !== "") {
            return value;
        }

        return null;
    };

    return (
        firstMessage(data.center_contact_id) ||
        firstMessage(data.center_contact_type) ||
        firstMessage(data.contact_type) ||
        firstMessage(data.first_name) ||
        firstMessage(data.last_name) ||
        firstMessage(data.institution) ||
        firstMessage(data.institution_name) ||
        firstMessage(data.document_id) ||
        firstMessage(data.email) ||
        firstMessage(data.primary_phone) ||
        firstMessage(data.secondary_phone) ||
        firstMessage(data.tertiary_phone) ||
        firstMessage(data.role) ||
        firstMessage(data.specific_relationship) ||
        firstMessage(data.is_primary_contact) ||
        firstMessage(data.is_emergency_contact) ||
        firstMessage(data.can_authorize_treatment) ||
        firstMessage(data.can_receive_medical_updates) ||
        firstMessage(data.can_receive_billing) ||
        firstMessage(data.can_pickup_pet) ||
        firstMessage(data.notes) ||
        firstMessage(data.pet_contact_notes) ||
        firstMessage(data.pet_contact_link_notes) ||
        firstMessage(data.non_field_errors) ||
        firstMessage(data.detail)
    );
}

function normalizeSnapshotValue(value: unknown): unknown {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(normalizeSnapshotValue);
    }

    if (isRecord(value)) {
        return Object.keys(value)
            .sort()
            .reduce<UnknownRecord>((result, key) => {
                result[key] = normalizeSnapshotValue(value[key]);
                return result;
            }, {});
    }

    return value;
}

function buildFormSnapshot(values: unknown): string {
    return JSON.stringify(normalizeSnapshotValue(values));
}

function confirmDiscardUnsavedContactChanges(): boolean {
    return window.confirm(
        "¿Está seguro de abandonar los cambios?\n\nHay datos modificados sin guardar. Si continúas, se perderán los cambios actuales.",
    );
}

function getCenterContactDisplayName(contact: CenterContactInterface): string {
    const displayName = getFirstStringValue(contact, [
        "display_name",
        "name",
        "full_name",
    ]);

    if (displayName) {
        return displayName;
    }

    const contactType = getContactTypeFromCenterContact(contact);

    if (contactType === "INSTITUTION") {
        return getContactInstitutionName(contact) || "Sin nombre";
    }

    const firstName = getContactFirstName(contact);
    const lastName = getContactLastName(contact);

    const personName = [firstName, lastName]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");

    return personName || "Sin nombre";
}

export default function AddCenterContactToPetContactLinksDialog({
    open,
    centerId,
    petId,
    pet,
    defaultRole,
    onClose,
    onSaved,
}: Props) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedCenterContact, setSelectedCenterContact] =
        useState<CenterContactInterface | null>(null);

    const [contactFormMode, setContactFormMode] =
        useState<ContactFormMode>(null);

    const [formBodyKey, setFormBodyKey] = useState(0);
    const [contactPickerKey, setContactPickerKey] = useState(0);

    const [openLinkEditNoticeDialog, setOpenLinkEditNoticeDialog] =
        useState(false);

    const [centerContactDialogOpen, setCenterContactDialogOpen] =
        useState(false);

    const [centerContactSaving, setCenterContactSaving] = useState(false);

    const [centerContactSubmitError, setCenterContactSubmitError] = useState<
        string | null
    >(null);

    const cleanFormSnapshotRef = useRef<string>("");
    const isPreparingCleanSnapshotRef = useRef(false);

    const dispatch = useReduxDispatch();

    const {
        centerContacts,
        centerContactsLoading,
        centerContactsError,
        loadCenterContactsSlice,
    } = useCenterContactsSlice({centerId});

    const primaryContactInfo = useMemo(() => {
        return getPrimaryContactInfoForAdding(pet);
    }, [pet]);

    const hasActivePrimaryContact = primaryContactInfo.hasActivePrimaryContact;

    const primaryContactDisabledReason =
        primaryContactInfo.primaryContactDisabledReason;

    const effectiveDefaultRole: PetContactFormValues["role"] = useMemo(
        () => defaultRole ?? "OWNER_GUARDIAN",
        [defaultRole],
    );

    const defaultValues = useMemo<DefaultValues<PetContactFormValues>>(
        () => buildDefaultValues(effectiveDefaultRole),
        [effectiveDefaultRole],
    );

    const linkedContactIds = useMemo(() => {
        return getLinkedCenterContactIdsFromPet(pet);
    }, [pet]);

    const methods = useForm<PetContactFormValues>({
        resolver: zodResolver(petContactSchema),
        defaultValues,
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const {reset, setValue, getValues} = methods;

    const resetForm = useCallback(
        (values: DefaultValues<PetContactFormValues>) => {
            isPreparingCleanSnapshotRef.current = true;
            cleanFormSnapshotRef.current = buildFormSnapshot(values);

            reset(values, {
                keepDefaultValues: false,
                keepValues: false,
                keepDirty: false,
                keepDirtyValues: false,
                keepTouched: false,
                keepErrors: false,
                keepIsSubmitted: false,
                keepSubmitCount: false,
            });

            setFormBodyKey((currentKey) => currentKey + 1);
        },
        [reset],
    );

    useEffect(() => {
        if (!open || !isPreparingCleanSnapshotRef.current) {
            return;
        }

        let cancelled = false;
        let secondFrameId: number | null = null;

        const firstFrameId = window.requestAnimationFrame(() => {
            secondFrameId = window.requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }

                cleanFormSnapshotRef.current = buildFormSnapshot(getValues());
                isPreparingCleanSnapshotRef.current = false;
            });
        });

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(firstFrameId);

            if (secondFrameId !== null) {
                window.cancelAnimationFrame(secondFrameId);
            }
        };
    }, [open, formBodyKey, contactFormMode, getValues]);

    useEffect(() => {
        if (!open) {
            return;
        }

        setSubmitError(null);
        setSubmitting(false);
        setSelectedCenterContact(null);
        setContactFormMode(null);
        setContactPickerKey((currentKey) => currentKey + 1);
        setOpenLinkEditNoticeDialog(false);

        setCenterContactDialogOpen(false);
        setCenterContactSaving(false);
        setCenterContactSubmitError(null);

        resetForm({
            ...defaultValues,
            is_primary_contact: false,
        });
    }, [open, defaultValues, resetForm]);

    useEffect(() => {
        if (!open) {
            return;
        }

        loadCenterContactsSlice();
    }, [open, loadCenterContactsSlice]);

    useEffect(() => {
        if (!open || !hasActivePrimaryContact) {
            return;
        }

        setValue("is_primary_contact", false, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: true,
        });
    }, [open, hasActivePrimaryContact, setValue]);

    const applyCenterContactSelection = useCallback(
        (contact: CenterContactInterface) => {
            const selectedDefaults = buildDefaultValuesFromCenterContact(
                contact,
                effectiveDefaultRole,
            );

            setSelectedCenterContact(contact);
            setContactFormMode("centerContact");
            setSubmitError(null);

            resetForm({
                ...selectedDefaults,
                is_primary_contact: false,
            });

            setOpenLinkEditNoticeDialog(true);
        },
        [effectiveDefaultRole, resetForm],
    );

    const applyPendingContactSelectionAction = useCallback(
        (action: PendingContactSelectionAction) => {
            applyCenterContactSelection(action.contact);
        },
        [applyCenterContactSelection],
    );

    function reloadCenterContact() {
        loadCenterContactsSlice({
            forceRefresh: true,
        });
    }

    function hasUnsavedContactFormChanges(): boolean {
        if (contactFormMode === null) {
            return false;
        }

        if (isPreparingCleanSnapshotRef.current) {
            return false;
        }

        return buildFormSnapshot(getValues()) !== cleanFormSnapshotRef.current;
    }

    function requestContactSelectionAction(
        action: PendingContactSelectionAction,
    ): boolean {
        if (submitting || centerContactSaving) {
            return false;
        }

        const isSameContact = isSameCenterContact(
            selectedCenterContact,
            action.contact,
        );

        if (isSameContact) {
            return true;
        }

        if (hasUnsavedContactFormChanges()) {
            const confirmed = confirmDiscardUnsavedContactChanges();

            if (!confirmed) {
                return false;
            }
        }

        applyPendingContactSelectionAction(action);
        return true;
    }

    function handleSelectCenterContact(
        contact: CenterContactInterface,
    ): boolean {
        return requestContactSelectionAction({
            type: "selectCenterContact",
            contact,
        });
    }

    function handleClearSelectedContact(): boolean {
        if (submitting || centerContactSaving) {
            return false;
        }

        if (hasUnsavedContactFormChanges()) {
            const confirmed = confirmDiscardUnsavedContactChanges();

            if (!confirmed) {
                return false;
            }
        }

        setSubmitError(null);
        setSelectedCenterContact(null);
        setContactFormMode(null);
        setOpenLinkEditNoticeDialog(false);

        resetForm({
            ...defaultValues,
            is_primary_contact: false,
        });

        return true;
    }

    function handleCreateNewContact() {
        if (submitting || centerContactSaving) {
            return;
        }

        if (hasUnsavedContactFormChanges()) {
            const confirmed = confirmDiscardUnsavedContactChanges();

            if (!confirmed) {
                return;
            }
        }

        setCenterContactSubmitError(null);
        setCenterContactDialogOpen(true);
    }

    function handleCloseCenterContactDialog() {
        if (centerContactSaving) {
            return;
        }

        setCenterContactDialogOpen(false);
        setCenterContactSubmitError(null);
    }

    const handleSaveCenterContact = useCallback(
        async (payload: CenterContactPayload) => {
            if (centerContactSaving) {
                return;
            }

            setCenterContactSaving(true);
            setCenterContactSubmitError(null);

            try {
                const createdContact = await addCenterContactApi({
                    centerId,
                    payload,
                });

                setCenterContactDialogOpen(false);
                setCenterContactSubmitError(null);

                await loadCenterContactsSlice({
                    forceRefresh: true,
                });

                setContactPickerKey((currentKey) => currentKey + 1);
                applyCenterContactSelection(createdContact);
            } catch (error) {
                console.error(
                    "addCenterContactToPetContactLinksDialog::handleSaveCenterContact error:",
                    error,
                );

                const backendMessage = getBackendErrorMessage(error);

                setCenterContactSubmitError(
                    backendMessage ??
                        "No se pudo crear el contacto del centro. Revisa los datos e intenta nuevamente.",
                );
            } finally {
                setCenterContactSaving(false);
            }
        },
        [
            applyCenterContactSelection,
            centerId,
            loadCenterContactsSlice,
            centerContactSaving,
        ],
    );

    const handleSubmit: SubmitHandler<PetContactFormValues> = async (
        values,
    ) => {
        if (submitting) {
            return;
        }

        if (contactFormMode === null) {
            setSubmitError(
                "Selecciona un contacto del centro o crea uno nuevo antes de guardar.",
            );
            return;
        }

        const selectedCenterContactId = selectedCenterContact
            ? getCenterContactId(selectedCenterContact)
            : null;

        if (selectedCenterContactId === null) {
            setSubmitError(
                "El contacto seleccionado no tiene un identificador válido. Vuelve a seleccionarlo e intenta nuevamente.",
            );
            return;
        }

        setSubmitError(null);
        setSubmitting(true);

        try {
            const safeValues: PetContactFormValues = {
                ...values,
                is_primary_contact: hasActivePrimaryContact
                    ? false
                    : values.is_primary_contact,
                can_receive_billing:
                    values.role === "BILLING_RESPONSIBLE"
                        ? true
                        : values.can_receive_billing,
            };

            const payload = buildPetContactLinkPayload({
                values: safeValues,
                centerContactId: selectedCenterContactId,
            }) as AddPetContactLinkApiPayload;

            const updatedPet = await addPetContactLinkApi({
                centerId,
                petId,
                payload,
            });

            dispatch(setPetData(updatedPet));

            onSaved(updatedPet);
            onClose();
        } catch (error) {
            console.error(
                "addCenterContactToPetContactLinksDialog::handleSubmit error:",
                error,
            );

            const backendMessage = getBackendErrorMessage(error);

            setSubmitError(
                backendMessage ??
                    "No se pudo agregar el vínculo con el contacto. Revisa los datos e intenta nuevamente.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    function handleClose() {
        if (submitting || centerContactSaving) {
            return;
        }

        setSubmitError(null);
        setSelectedCenterContact(null);
        setContactFormMode(null);
        setOpenLinkEditNoticeDialog(false);

        setCenterContactDialogOpen(false);
        setCenterContactSaving(false);
        setCenterContactSubmitError(null);

        setContactPickerKey((currentKey) => currentKey + 1);
        cleanFormSnapshotRef.current = "";
        isPreparingCleanSnapshotRef.current = false;

        onClose();
    }

    function handleCloseLinkEditNoticeDialog() {
        setOpenLinkEditNoticeDialog(false);
    }

    const submitButtonDisabled =
        submitting || centerContactSaving || contactFormMode === null;

    return (
        <>
            <FormDialog<PetContactFormValues>
                open={open}
                title="Agregar Vínculo con Contacto del Centro"
                defaultValues={defaultValues}
                methods={methods}
                onSubmit={handleSubmit}
                onClose={handleClose}
                size="xl"
                submitLabel={
                    submitting
                        ? "Agregando..."
                        : "Agregar Vínculo con Contacto del Centro"
                }
                cancelLabel="Cancelar"
                submitDisabled={submitButtonDisabled}
                disableEscape
                closeOnOverlayClick={false}
            >
                <div className="space-y-5">
                    <CenterContactsGrid
                        key={contactPickerKey}
                        mode="picker"
                        contacts={centerContacts}
                        loading={centerContactsLoading}
                        error={centerContactsError}
                        linkedContactIds={linkedContactIds}
                        selectedContactId={
                            selectedCenterContact
                                ? getCenterContactId(selectedCenterContact)
                                : null
                        }
                        onSelectContact={handleSelectCenterContact}
                        onClearSelectedContact={handleClearSelectedContact}
                        onCreateNewContact={handleCreateNewContact}
                        onRetry={reloadCenterContact}
                    />

                    {submitError && contactFormMode === null && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-semibold text-red-700">
                                {submitError}
                            </p>
                        </div>
                    )}

                    {contactFormMode === "centerContact" &&
                        selectedCenterContact && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                                <p className="text-sm font-semibold text-blue-900">
                                    Contacto del centro seleccionado:{" "}
                                    <span className="font-bold">
                                        {getCenterContactDisplayName(
                                            selectedCenterContact,
                                        )}
                                    </span>
                                </p>

                                <p className="mt-1 text-xs leading-5 text-blue-800">
                                    Ahora completa solo el vínculo con el
                                    paciente: rol, vínculo específico, permisos,
                                    contacto principal y notas. Los datos del
                                    contacto del centro no se editan aquí.
                                </p>
                            </div>
                        )}

                    {contactFormMode !== null && (
                        <PetContactLinkFormContent
                            key={`${contactFormMode}-${formBodyKey}`}
                            pet={pet}
                            submitError={submitError}
                            hasActivePrimaryContact={hasActivePrimaryContact}
                            primaryContactDisabledReason={
                                primaryContactDisabledReason
                            }
                        />
                    )}
                </div>
            </FormDialog>

            <AddCenterContactFormDialog
                open={centerContactDialogOpen}
                mode="create"
                contact={null}
                saving={centerContactSaving}
                submitError={centerContactSubmitError}
                onClose={handleCloseCenterContactDialog}
                onSubmit={handleSaveCenterContact}
            />

            <SimpleModalDialog
                open={openLinkEditNoticeDialog}
                title="Edita el vínculo con el paciente"
                description={
                    <span>
                        No estás editando el contacto del centro. El contacto ya
                        fue seleccionado; ahora,{" "}
                        <strong className="font-semibold text-slate-900">
                            más abajo
                        </strong>
                        , puedes editar su vínculo con{" "}
                        <strong className="font-semibold text-slate-900">
                            {pet.name}
                        </strong>
                        : rol, vínculo específico, permisos, contacto principal
                        y notas antes de{" "}
                        <strong className="font-semibold text-slate-900">
                            Agregar Vínculo con Contacto del Centro
                        </strong>
                        .
                    </span>
                }
                variant="info"
                cancelLabel="Cerrar"
                showAcceptButton={false}
                onAccept={handleCloseLinkEditNoticeDialog}
                onCancel={handleCloseLinkEditNoticeDialog}
            />
        </>
    );
}
