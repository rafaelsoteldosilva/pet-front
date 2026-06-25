// src/shared/petSelector/petsGridForSearching.tsx

"use client";

import React, {useCallback, useMemo} from "react";
import Image from "next/image";
import {FaMars, FaVenus} from "react-icons/fa";

import {AgGridReact} from "ag-grid-react";
import {
    AllCommunityModule,
    ColDef,
    ICellRendererParams,
    ModuleRegistry,
    ValueGetterParams,
    themeQuartz,
} from "ag-grid-community";
import type {
    GridReadyEvent,
    RowClickedEvent,
    SelectionChangedEvent,
} from "ag-grid-community";

import {GetAllPetsForCenterResult} from "@/features/pet/types/petTypes";
import {localeTextForGrids} from "@/shared/gridsConfig/agGridLocaleText";

ModuleRegistry.registerModules([AllCommunityModule]);

/* ======================================================
   Types
   ====================================================== */

type Props = {
    pets: GetAllPetsForCenterResult[];
    onPetSelected: (pet: GetAllPetsForCenterResult | null) => void;
};

type NamedObject = {
    id?: number | string | null;
    name?: string | null;
};

/* ======================================================
   Display helpers
   ====================================================== */

function getNamedObjectText(value: unknown): string {
    if (value == null) return "—";

    if (typeof value === "string") {
        const cleanValue = value.trim();
        return cleanValue || "—";
    }

    if (typeof value === "object" && "name" in value) {
        const name = (value as NamedObject).name;
        return typeof name === "string" && name.trim() !== ""
            ? name.trim()
            : "—";
    }

    return "—";
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

    if (typeof value === "object" && "name" in value) {
        return getNamedObjectText(value);
    }

    return "—";
}

function formatAge(totalYears: number | null): string {
    if (totalYears == null) return "—";

    const years = Math.floor(totalYears);
    const months = Math.round((totalYears - years) * 12);

    if (years <= 0 && months <= 0) return "Recién nacido";
    if (years === 0) return `${months} meses`;
    if (months === 0) return `${years} año${years > 1 ? "s" : ""}`;
    if (years < 2) return `${years} año y ${months} meses`;

    return `${years} años y ${months} meses`;
}

function getAgeInYearsFromBirthDate(birthDateStr: string | null | undefined) {
    if (!birthDateStr) return null;

    const birthDate = new Date(birthDateStr);

    if (Number.isNaN(birthDate.getTime())) {
        return null;
    }

    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (years < 0) return null;

    return years + months / 12;
}

function getSexLabel(
    value: string | null | undefined,
): "Hembra" | "Macho" | "—" {
    const normalizedValue = String(value ?? "")
        .trim()
        .toLowerCase();

    if (normalizedValue === "f" || normalizedValue === "hembra")
        return "Hembra";
    if (normalizedValue === "m" || normalizedValue === "macho") return "Macho";

    return "—";
}

function getBooleanLabel(value: boolean | null | undefined): "Sí" | "No" | "—" {
    if (value === true) return "Sí";
    if (value === false) return "No";

    return "—";
}

function TextCell(
    params: ICellRendererParams<GetAllPetsForCenterResult, unknown>,
) {
    const text = getText(params.value);
    return <span title={text}>{text}</span>;
}

/* ======================================================
   Component
   ====================================================== */

export default function PetsGridForSearching({pets, onPetSelected}: Props) {
    const gridApiRef = React.useRef<GridReadyEvent["api"] | null>(null);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridApiRef.current = params.api;
    }, []);

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

    /* -----------------------------------------
       Column definitions
       ----------------------------------------- */

    const columnDefs: ColDef<GetAllPetsForCenterResult>[] = useMemo(
        () => [
            {
                field: "photo_url",
                headerName: "Foto",
                width: 110,
                sortable: false,
                filter: false,
                cellRenderer: (
                    params: ICellRendererParams<
                        GetAllPetsForCenterResult,
                        string | null
                    >,
                ) => {
                    const url = params.value;

                    return (
                        <div className="flex h-full w-full items-center justify-center">
                            {url ? (
                                <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-300 shadow-sm">
                                    <Image
                                        src={url}
                                        alt=""
                                        width={80}
                                        height={80}
                                        sizes="80px"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                                    No Img
                                </div>
                            )}
                        </div>
                    );
                },
            },

            {
                field: "name",
                headerName: "Nombre",
                flex: 0.35,
                minWidth: 130,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
                cellRenderer: TextCell,
            },

            {
                headerName: "Especie",
                colId: "species",
                flex: 0.3,
                minWidth: 110,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getNamedObjectText(params.data?.species),
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },

            {
                headerName: "Raza",
                colId: "breed",
                flex: 0.3,
                minWidth: 110,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getNamedObjectText(params.data?.breed),
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },

            {
                headerName: "Edad",
                colId: "age",
                width: 140,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getAgeInYearsFromBirthDate(params.data?.birth_date),
                valueFormatter: (params) => formatAge(params.value ?? null),
                cellRenderer: (
                    params: ICellRendererParams<
                        GetAllPetsForCenterResult,
                        number | null
                    >,
                ) => {
                    const text = formatAge(params.value ?? null);
                    return <span title={text}>{text}</span>;
                },
                filter: "agNumberColumnFilter",
                filterParams: {
                    filterOptions: [
                        "lessThanOrEqual",
                        "greaterThanOrEqual",
                        "inRange",
                    ],
                    buttons: ["apply", "clear", "cancel"],
                    closeOnApply: true,
                },
                cellStyle: {textAlign: "center"},
            },

            {
                headerName: "Sexo",
                colId: "sex",
                width: 110,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getSexLabel(params.data?.sex),
                cellRenderer: (
                    params: ICellRendererParams<
                        GetAllPetsForCenterResult,
                        "Hembra" | "Macho" | "—"
                    >,
                ) => {
                    if (params.value === "Hembra") {
                        return (
                            <span
                                title="Hembra"
                                className="flex items-center justify-center gap-2"
                            >
                                <FaVenus className="-mt-1 text-xl text-pink-600" />
                                <span>Hembra</span>
                            </span>
                        );
                    }

                    if (params.value === "Macho") {
                        return (
                            <span
                                title="Macho"
                                className="flex items-center justify-center gap-2"
                            >
                                <FaMars className="-mt-1 text-xl text-blue-600" />
                                <span>Macho</span>
                            </span>
                        );
                    }

                    return <span title="Sin información">—</span>;
                },
                filter: "agTextColumnFilter",
                filterParams: {
                    filterOptions: ["contains", "equals"],
                    defaultOption: "contains",
                    buttons: ["apply", "clear", "cancel"],
                    closeOnApply: true,
                },
                floatingFilter: false,
                cellStyle: {textAlign: "center"},
            },

            {
                headerName: "Esterilizado",
                colId: "sterilized",
                width: 120,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getBooleanLabel(params.data?.sterilized),
                cellRenderer: (
                    params: ICellRendererParams<
                        GetAllPetsForCenterResult,
                        "Sí" | "No" | "—"
                    >,
                ) => {
                    if (params.value === "Sí") {
                        return <span title="Esterilizado: Sí">✅ Sí</span>;
                    }

                    if (params.value === "No") {
                        return <span title="Esterilizado: No">❌ No</span>;
                    }

                    return <span title="Sin información">—</span>;
                },
                filter: "agTextColumnFilter",
                filterParams: {
                    filterOptions: ["equals", "notEqual"],
                    defaultOption: "equals",
                    buttons: ["apply", "clear", "cancel"],
                    closeOnApply: true,
                    suppressAndOrCondition: true,
                },
                floatingFilter: false,
                cellStyle: {textAlign: "center"},
            },

            {
                headerName: "Microchip",
                colId: "has_microchip",
                width: 120,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getBooleanLabel(params.data?.has_microchip),
                cellRenderer: (
                    params: ICellRendererParams<
                        GetAllPetsForCenterResult,
                        "Sí" | "No" | "—"
                    >,
                ) => {
                    if (params.value === "Sí") {
                        return <span title="Tiene microchip">✅ Sí</span>;
                    }

                    if (params.value === "No") {
                        return <span title="No tiene microchip">❌ No</span>;
                    }

                    return <span title="Sin información">—</span>;
                },
                filter: "agTextColumnFilter",
                filterParams: {
                    filterOptions: ["equals", "notEqual"],
                    defaultOption: "equals",
                    buttons: ["apply", "clear", "cancel"],
                    closeOnApply: true,
                    suppressAndOrCondition: true,
                },
                floatingFilter: false,
                cellStyle: {textAlign: "center"},
            },

            {
                headerName: "Descripción",
                colId: "body_description",
                flex: 0.6,
                minWidth: 180,
                valueGetter: (
                    params: ValueGetterParams<GetAllPetsForCenterResult>,
                ) => getText(params.data?.body_description),
                cellRenderer: TextCell,
                filter: "agTextColumnFilter",
                filterParams: textFilterParams,
            },
        ],
        [textFilterParams],
    );

    const defaultColDef: ColDef<GetAllPetsForCenterResult> = useMemo(
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
            tooltipValueGetter: undefined,
            tooltipField: undefined,
        }),
        [],
    );

    const onSelectionChanged = useCallback(
        (event: SelectionChangedEvent<GetAllPetsForCenterResult>) => {
            const selected = event.api.getSelectedRows();

            if (selected.length === 0) {
                onPetSelected(null);
                return;
            }

            onPetSelected(selected[0]);
        },
        [onPetSelected],
    );

    const handleRowClick = useCallback(
        (event: RowClickedEvent<GetAllPetsForCenterResult>) => {
            if (!event.node) return;

            const isSelected = event.node.isSelected();

            if (isSelected) {
                event.node.setSelected(false);
                onPetSelected(null);
                return;
            }

            event.node.setSelected(true, true);
            onPetSelected(event.data ?? null);
        },
        [onPetSelected],
    );

    return (
        <div
            className="ag-theme-quartz w-full"
            style={{height: "50vh", minHeight: "350px"}}
        >
            <AgGridReact<GetAllPetsForCenterResult>
                onGridReady={onGridReady}
                theme={themeQuartz}
                suppressCellFocus={true}
                rowData={pets}
                rowSelection={{
                    mode: "singleRow",
                    enableClickSelection: false,
                }}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                selectionColumnDef={{
                    width: 40,
                    suppressSizeToFit: true,
                    cellClass: "ag-cell-center-no-padding",
                }}
                onRowClicked={handleRowClick}
                onSelectionChanged={onSelectionChanged}
                pagination={true}
                paginationPageSize={12}
                paginationPageSizeSelector={[12, 20, 50, 100]}
                animateRows={true}
                domLayout="normal"
                localeText={localeTextForGrids}
                getRowHeight={() => 90}
            />
        </div>
    );
}
