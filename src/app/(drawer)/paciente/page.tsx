// src/app/(drawer)/inicio/page.tsx

"use client";

import React, {useEffect} from "react";

import GlobalButton from "@/shared/ui/globalButton";
import {useSideBarNavigation} from "@/hooks/shell/useSidebarNavigation";
import {useSidebarContext} from "@/hooks/shell/useSidebarContext";
import KpiCard from "@/shared/components/kpiCard";

export default function PatientPage() {
    const {setMenuWithMenuId, items, getItemProperties} = useSidebarContext();
    const {executeAction} = useSideBarNavigation();

    useEffect(() => {
        setMenuWithMenuId({
            MenuId: "paciente",
        });
    }, []);

    return (
        <div className="space-y-4">
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items
                    .filter(
                        (item) =>
                            item.itemLabel !== "Cerrar" &&
                            item.itemLabel !== "Configuración",
                    )
                    .map((item) => {
                        const props = getItemProperties({
                            itemId: item.itemId,
                        });

                        if (!props) return null;

                        const Icon = props.itemIcon;

                        return (
                            <GlobalButton
                                key={props.itemId}
                                disabled={props.itemDisabled}
                                onClick={() => {
                                    if (props.itemDisabled) return;
                                    executeAction(item.itemAction); // ✅ navegación real
                                }}
                                className="w-full flex p-0 bg-transparent border-none"
                            >
                                <KpiCard
                                    title={props.itemLabel}
                                    icon={<Icon className="h-5 w-5" />}
                                    disabled={props.itemDisabled}
                                />
                            </GlobalButton>
                        );
                    })}
            </section>
        </div>
    );
}
