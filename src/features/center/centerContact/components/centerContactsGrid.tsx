// src/features/center/centerContact/components/centerContactsGrid.tsx

"use client";

import {useCallback, useEffect, useMemo, useRef} from "react";

import {AgGridReact} from "ag-grid-react";
import {
    AllCommunityModule,
    ColDef,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    ModuleRegistry,
    RowClassParams,
    RowClickedEvent,
    SelectionChangedEvent,
    ValueGetterParams,
    themeQuartz,
} from "ag-grid-community";

import {localeTextForGrids} from "@/shared/gridsConfig/agGridLocaleText";
import type {
    GridMode,
    CenterContactInterface,
} from "@/features/center/centerContact/types/centerContactTypes";

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
    mode: GridMode;

    contacts: CenterContactInterface[];
    loading: boolean;
    error?: string | null;

    selectedContactId: number | null;

    linkedContactIds?: readonly number[];

    onSelectedContactChange?: (contact: CenterContactInterface | null) => void;

    onSelectContact?: (contact: CenterContactInterface) => boolean;
    onClearSelectedContact?: () => boolean;

    onCreateNewContact?: () => void;
    onRetry?: () => void;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(source: unknown, key: string): string {
    if (!isRecord(source)) return "";

    const value = source[key];

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    return "";
}

function getNumberValue(source: unknown, key: string): number | null {
    if (!isRecord(source)) return null;

    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsedValue = Number(value);

        return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
}

function getBooleanValue(source: unknown, key: string): boolean {
    if (!isRecord(source)) return false;

    return source[key] === true;
}

function getFirstStringValue(source: unknown, keys: readonly string[]): string {
    for (const key of keys) {
        const value = getStringValue(source, key);

        if (value) return value;
    }

    return "";
}

function getContactId(
    contact: CenterContactInterface | null | undefined,
): number | null {
    if (!contact) return null;

    return getNumberValue(contact, "id");
}

function getContactTypeValue(
    contact: CenterContactInterface | null | undefined,
): string {
    if (!contact) return "";

    return getFirstStringValue(contact, [
        "center_contact_type",
        "contact_type",
        "type",
    ]).toUpperCase();
}

function getContactTypeLabel(
    contact: CenterContactInterface | null | undefined,
): string {
    const contactType = getContactTypeValue(contact);

    if (contactType === "INSTITUTION") return "Institución";
    if (contactType === "PERSON") return "Persona";

    return "—";
}

function getContactDisplayName(
    contact: CenterContactInterface | null | undefined,
): string {
    if (!contact) return "—";

    const directName = getFirstStringValue(contact, [
        "display_name",
        "name",
        "full_name",
        "contact_name",
    ]);

    if (directName) return directName;

    const contactType = getContactTypeValue(contact);

    if (contactType === "INSTITUTION") {
        const institutionName = getFirstStringValue(contact, [
            "institution_name",
            "institution",
            "legal_name",
            "business_name",
        ]);

        return institutionName || "Contacto sin nombre";
    }

    const firstName = getFirstStringValue(contact, [
        "first_name",
        "names",
        "given_name",
    ]);

    const lastName = getFirstStringValue(contact, [
        "last_name",
        "family_name",
        "paternal_last_name",
    ]);

    const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return composedName || "Contacto sin nombre";
}

function getContactDocument(
    contact: CenterContactInterface | null | undefined,
): string {
    if (!contact) return "—";

    return (
        getFirstStringValue(contact, [
            "document_id",
            "contact_document_id",
            "national_dni",
            "rut",
            "dni",
        ]) || "—"
    );
}

function getContactEmail(
    contact: CenterContactInterface | null | undefined,
): string {
    if (!contact) return "—";

    return getFirstStringValue(contact, ["email", "primary_email"]) || "—";
}

function getContactPhone(
    contact: CenterContactInterface | null | undefined,
): string {
    if (!contact) return "—";

    return (
        getFirstStringValue(contact, [
            "primary_phone",
            "cell_phone",
            "mobile_phone",
            "phone",
            "secondary_phone",
            "tertiary_phone",
        ]) || "—"
    );
}

function getContactNotes(
    contact: CenterContactInterface | null | undefined,
): string {
    if (!contact) return "—";

    return (
        getFirstStringValue(contact, [
            "notes",
            "contact_notes",
            "center_contact_notes",
        ]) || "—"
    );
}

function isInactiveContact(
    contact: CenterContactInterface | null | undefined,
): boolean {
    return contact?.is_active === false;
}

function getActiveLabel(
    contact: CenterContactInterface | null | undefined,
): "Activo" | "Inactivo" | "—" {
    if (!contact || !isRecord(contact) || !("is_active" in contact)) {
        return "—";
    }

    return getBooleanValue(contact, "is_active") ? "Activo" : "Inactivo";
}

function getText(value: unknown): string {
    if (value == null) return "—";

    if (typeof value === "string") {
        const cleanValue = value.trim();
        return cleanValue || "—";
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    return "—";
}

function TextCell(
    params: ICellRendererParams<CenterContactInterface, unknown>,
) {
    const text = getText(params.value);

    return <span title={text}>{text}</span>;
}

function ContactNameCell(
    params: ICellRendererParams<CenterContactInterface, string> & {
        disabledReason?: string | null;
        compact?: boolean;
    },
) {
    const contact = params.data;
    const displayName = params.value || "Contacto sin nombre";
    const disabledReason = params.disabledReason ?? null;

    if (!contact) {
        return <span title={displayName}>{displayName}</span>;
    }

    if (params.compact) {
        return <span title={displayName}>{displayName}</span>;
    }

    return (
        <div className="flex h-full flex-col justify-center">
            <span
                title={displayName}
                className={
                    disabledReason
                        ? "truncate font-semibold text-slate-500"
                        : "truncate font-semibold text-slate-900"
                }
            >
                {displayName}
            </span>

            <span className="truncate text-xs text-slate-500">
                {getContactTypeLabel(contact)}
            </span>

            {disabledReason ? (
                <span
                    title={disabledReason}
                    className="mt-0.5 truncate text-xs font-semibold text-amber-700"
                >
                    No seleccionable: {disabledReason}
                </span>
            ) : null}
        </div>
    );
}

function StatusCell(
    params: ICellRendererParams<CenterContactInterface, string>,
) {
    const value = params.value ?? "—";

    if (value === "Activo") {
        return (
            <span
                title="Activo"
                className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
            >
                Activo
            </span>
        );
    }

    if (value === "Inactivo") {
        return (
            <span
                title="Inactivo"
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200"
            >
                Inactivo
            </span>
        );
    }

    return <span title="Sin información">—</span>;
}

export default function CenterContactsGrid({
    mode,

    contacts,
    loading,
    error = null,

    selectedContactId,

    linkedContactIds = [],

    onSelectedContactChange,

    onSelectContact,
    onClearSelectedContact,

    onCreateNewContact,
    onRetry,
}: Props) {
    const gridApiRef = useRef<GridApi<CenterContactInterface> | null>(null);
    const isRestoringSelectionRef = useRef(false);

    const isPickerMode = mode === "picker";

    const visibleContacts = useMemo(() => {
        if (!isPickerMode) {
            return contacts;
        }

        return contacts.filter((contact) => !isInactiveContact(contact));
    }, [contacts, isPickerMode]);

    const linkedContactIdSet = useMemo(() => {
        return new Set(linkedContactIds);
    }, [linkedContactIds]);

    const getDisabledReason = useCallback(
        (contact: CenterContactInterface | null | undefined): string | null => {
            if (!contact) return null;

            if (isPickerMode && isInactiveContact(contact)) {
                return "El contacto está inactivo.";
            }

            const contactId = getContactId(contact);

            if (
                isPickerMode &&
                contactId !== null &&
                linkedContactIdSet.has(contactId)
            ) {
                return "Ya está vinculado a este paciente.";
            }

            return null;
        },
        [isPickerMode, linkedContactIdSet],
    );

    const isContactDisabled = useCallback(
        (contact: CenterContactInterface | null | undefined): boolean => {
            return getDisabledReason(contact) !== null;
        },
        [getDisabledReason],
    );

    const restoreSelectedContact = useCallback(
        (api: GridApi<CenterContactInterface>) => {
            isRestoringSelectionRef.current = true;

            api.deselectAll();

            if (selectedContactId !== null) {
                api.forEachNode((node) => {
                    if (!node.data) return;

                    const nodeContactId = getContactId(node.data);

                    if (nodeContactId === selectedContactId) {
                        node.setSelected(true, true);
                    }
                });
            }

            window.setTimeout(() => {
                isRestoringSelectionRef.current = false;
            }, 0);
        },
        [selectedContactId],
    );

    useEffect(() => {
        if (!gridApiRef.current) return;

        restoreSelectedContact(gridApiRef.current);
    }, [visibleContacts, restoreSelectedContact]);

    const handleGridReady = useCallback(
        (event: GridReadyEvent<CenterContactInterface>) => {
            gridApiRef.current = event.api;
            restoreSelectedContact(event.api);
        },
        [restoreSelectedContact],
    );

    const textFilterParams = useMemo(
        () => ({
            buttons: ["apply", "clear", "cancel"],
            closeOnApply: true,
            suppressFilterOptions: true,
            suppressAndOrCondition: true,
            textFormatter: (val: string | null) =>
                val
                    ? val
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                    : "",
        }),
        [],
    );

    const columnDefs: ColDef<CenterContactInterface>[] = useMemo(() => {
        const columns: ColDef<CenterContactInterface>[] = [
            {
                headerName: isPickerMode ? "Contacto" : "Nombre",
                colId: "display_name",
                flex: isPickerMode ? 0.55 : 0.45,
                minWidth: isPickerMode ? 260 : 160,
                valueGetter: (
                    params: ValueGetterParams<CenterContactInterface>,
                ) => getContactDisplayName(params.data),
                cellRenderer: (
                    params: ICellRendererParams<CenterContactInterface, string>,
                ) => (
                    <ContactNameCell
                        {...params}
                        compact={!isPickerMode}
                        disabledReason={getDisabledReason(params.data)}
                    />
                ),
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },
            {
                headerName: "Tipo",
                colId: "center_contact_type",
                width: isPickerMode ? 130 : 120,
                valueGetter: (
                    params: ValueGetterParams<CenterContactInterface>,
                ) => getContactTypeLabel(params.data),
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: {
                    filterOptions: ["contains", "equals"],
                    defaultOption: "contains",
                    buttons: ["apply", "clear", "cancel"],
                    closeOnApply: true,
                    suppressAndOrCondition: true,
                },
            },
            {
                headerName: "Documento",
                colId: "document_id",
                field: isPickerMode ? undefined : "document_id",
                flex: isPickerMode ? 0.25 : undefined,
                width: isPickerMode ? undefined : 130,
                minWidth: isPickerMode ? 140 : undefined,
                valueGetter: isPickerMode
                    ? (params: ValueGetterParams<CenterContactInterface>) =>
                          getContactDocument(params.data)
                    : undefined,
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },
            {
                headerName: "Teléfono",
                colId: "primary_phone",
                field: isPickerMode ? undefined : "primary_phone",
                flex: isPickerMode ? 0.25 : undefined,
                width: isPickerMode ? undefined : 130,
                minWidth: isPickerMode ? 140 : undefined,
                valueGetter: isPickerMode
                    ? (params: ValueGetterParams<CenterContactInterface>) =>
                          getContactPhone(params.data)
                    : undefined,
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },
            {
                headerName: "Email",
                colId: "email",
                field: isPickerMode ? undefined : "email",
                flex: isPickerMode ? 0.35 : 0.45,
                minWidth: 180,
                valueGetter: isPickerMode
                    ? (params: ValueGetterParams<CenterContactInterface>) =>
                          getContactEmail(params.data)
                    : undefined,
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },
        ];

        if (isPickerMode) {
            columns.push({
                headerName: "Notas",
                colId: "notes",
                flex: 0.35,
                minWidth: 180,
                valueGetter: (
                    params: ValueGetterParams<CenterContactInterface>,
                ) => getContactNotes(params.data),
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            });
        } else {
            columns.push(
                {
                    headerName: "Estado",
                    colId: "is_active",
                    width: 110,
                    valueGetter: (
                        params: ValueGetterParams<CenterContactInterface>,
                    ) => getActiveLabel(params.data),
                    cellRenderer: StatusCell,
                    filter: "agTextColumnFilter",
                    filterParams: {
                        filterOptions: ["equals", "notEqual"],
                        defaultOption: "equals",
                        buttons: ["apply", "clear", "cancel"],
                        closeOnApply: true,
                        suppressAndOrCondition: true,
                    },
                    cellStyle: {textAlign: "center"},
                },
                {
                    headerName: "Notas",
                    field: "notes",
                    flex: 0.55,
                    minWidth: 200,
                    cellRenderer: TextCell,
                    filter: "agTextColumnFilter",
                    filterParams: textFilterParams,
                },
            );
        }

        return columns;
    }, [getDisabledReason, isPickerMode, textFilterParams]);

    const defaultColDef: ColDef<CenterContactInterface> = useMemo(
        () => ({
            sortable: true,
            resizable: true,
            filter: "agTextColumnFilter",
            floatingFilter: false,
            suppressHeaderMenuButton: false,
            cellStyle: {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
            filterParams: {
                buttons: ["apply", "clear", "cancel"],
                closeOnApply: true,
            },
        }),
        [],
    );

    const handleManagementSelectionChanged = useCallback(
        (event: SelectionChangedEvent<CenterContactInterface>) => {
            const selectedRows = event.api.getSelectedRows();
            const selectedRow = selectedRows[0] ?? null;

            onSelectedContactChange?.(selectedRow);
        },
        [onSelectedContactChange],
    );

    const handlePickerSelectionChanged = useCallback(
        (event: SelectionChangedEvent<CenterContactInterface>) => {
            if (isRestoringSelectionRef.current) {
                return;
            }

            const selectedRows = event.api.getSelectedRows();

            if (selectedRows.length === 0) {
                if (selectedContactId === null) {
                    return;
                }

                const accepted = onClearSelectedContact?.() ?? true;

                if (!accepted) {
                    restoreSelectedContact(event.api);
                }

                return;
            }

            const contact = selectedRows[0];

            if (isContactDisabled(contact)) {
                restoreSelectedContact(event.api);
                return;
            }

            const accepted = onSelectContact?.(contact) ?? true;

            if (!accepted) {
                restoreSelectedContact(event.api);
            }
        },
        [
            isContactDisabled,
            onClearSelectedContact,
            onSelectContact,
            restoreSelectedContact,
            selectedContactId,
        ],
    );

    const handleSelectionChanged = useCallback(
        (event: SelectionChangedEvent<CenterContactInterface>) => {
            if (isRestoringSelectionRef.current) {
                return;
            }

            if (isPickerMode) {
                handlePickerSelectionChanged(event);
                return;
            }

            handleManagementSelectionChanged(event);
        },
        [
            handleManagementSelectionChanged,
            handlePickerSelectionChanged,
            isPickerMode,
        ],
    );

    const handleManagementRowClick = useCallback(
        (event: RowClickedEvent<CenterContactInterface>) => {
            const contact = event.data ?? null;

            if (!event.node) {
                return;
            }

            const isSelected = event.node.isSelected();

            if (isSelected) {
                event.node.setSelected(false);
                onSelectedContactChange?.(null);
                return;
            }

            event.node.setSelected(true, true);
            onSelectedContactChange?.(contact);
        },
        [onSelectedContactChange],
    );

    const handlePickerRowClick = useCallback(
        (event: RowClickedEvent<CenterContactInterface>) => {
            const contact = event.data ?? null;

            if (!contact || !event.node) {
                return;
            }

            if (isContactDisabled(contact)) {
                restoreSelectedContact(event.api);
                return;
            }

            event.node.setSelected(true, true);
        },
        [isContactDisabled, restoreSelectedContact],
    );

    const handleRowClick = useCallback(
        (event: RowClickedEvent<CenterContactInterface>) => {
            if (isPickerMode) {
                handlePickerRowClick(event);
                return;
            }

            handleManagementRowClick(event);
        },
        [handleManagementRowClick, handlePickerRowClick, isPickerMode],
    );

    const getRowClass = useCallback(
        (params: RowClassParams<CenterContactInterface>) => {
            if (!params.data) return "";

            return isContactDisabled(params.data)
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer";
        },
        [isContactDisabled],
    );

    const grid = (
        <div
            className="ag-theme-quartz w-full"
            style={{
                height: isPickerMode ? "50vh" : "65vh",
                minHeight: isPickerMode ? "360px" : "420px",
            }}
        >
            <AgGridReact<CenterContactInterface>
                theme={themeQuartz}
                suppressCellFocus={true}
                rowData={visibleContacts}
                loading={loading}
                rowSelection={{
                    mode: "singleRow",
                    enableClickSelection: false,
                }}
                isRowSelectable={(node) => !isContactDisabled(node.data)}
                getRowId={(params) => String(params.data.id)}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                selectionColumnDef={{
                    width: 40,
                    suppressSizeToFit: true,
                    cellClass: "ag-cell-center-no-padding",
                }}
                onGridReady={handleGridReady}
                onRowClicked={handleRowClick}
                onSelectionChanged={handleSelectionChanged}
                pagination={true}
                paginationPageSize={isPickerMode ? 10 : 12}
                paginationPageSizeSelector={
                    isPickerMode ? [10, 20, 50, 100] : [12, 20, 50, 100]
                }
                animateRows={true}
                domLayout="normal"
                localeText={localeTextForGrids}
                getRowHeight={() => (isPickerMode ? 88 : 54)}
                getRowClass={getRowClass}
            />
        </div>
    );

    if (!isPickerMode) {
        return grid;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Seleccionar contacto del centro
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Busca en el directorio del centro veterinario y
                            selecciona una fila para cargar sus datos. Si no
                            existe, crea uno nuevo.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onCreateNewContact}
                            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                        >
                            Crear contacto nuevo en el Centro
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Cargando contactos del directorio...
                </div>
            ) : null}

            {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                        No se pudo cargar el directorio de contactos.
                    </p>

                    <p className="mt-1 text-xs text-red-600">{error}</p>

                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100"
                    >
                        Reintentar
                    </button>
                </div>
            ) : null}

            {!loading && !error && visibleContacts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-700">
                        {contacts.length > 0
                            ? "No hay contactos activos disponibles."
                            : "No hay contactos registrados en el directorio."}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {contacts.length > 0
                            ? "Los contactos inactivos no se muestran al vincular un contacto con un paciente."
                            : "Puedes crear un contacto nuevo para vincularlo a este paciente."}
                    </p>
                </div>
            ) : null}

            {!error && visibleContacts.length > 0 ? grid : null}
        </div>
    );
}
