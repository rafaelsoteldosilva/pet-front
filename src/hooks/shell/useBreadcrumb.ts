// src/hooks/shell/useBreadcrumb.ts

"use client";

import {useMemo} from "react";
import {usePathname} from "next/navigation";

import {useSidebarContext} from "./useSidebarContext";
import {BreadcrumbItem} from "@/shell/breadcrumb/types/breadcrumbTypes";

export function useBreadcrumb(): BreadcrumbItem[] {
    const pathname = usePathname();
    const {state} = useSidebarContext();

    return useMemo(() => {
        const items: BreadcrumbItem[] = [];

        if (pathname === "/inicio") {
            return [{label: "Inicio"}];
        }

        items.push({label: "Inicio"});

        const activeMenu = state.menus[state.currentMenuId];
        if (!activeMenu) return items;

        items.push({label: activeMenu.label});

        const activeItem = activeMenu.items.find(
            (item) => item.itemPath === pathname,
        );

        if (activeItem) {
            items.push({label: activeItem.itemLabel});
        }

        return items;
    }, [pathname, state.currentMenuId, state.menus]);
}
