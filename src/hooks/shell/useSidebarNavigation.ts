// src/hooks/shell/useSideBarNavigation.ts

"use client";

import {useRouter} from "next/navigation";
import {useCallback, useMemo} from "react";

import {sidebarMenus} from "../../shell/sidebar/sidebarMenus";
import type {SidebarItemAction} from "@/shell/sidebar/sidebarContext";
import {useSidebarContext} from "./useSidebarContext";

type SidebarMenu = (typeof sidebarMenus)[number];

type useSideBarNavigationResult = {
    goToSection: (menuId: string) => void;
    goToComponent: (path: string) => void;
    executeAction: (action: SidebarItemAction) => void;
    getMenuById: (menuId: string) => SidebarMenu | undefined; // ✅
};

export function useSideBarNavigation(): useSideBarNavigationResult {
    const router = useRouter();
    const {setMenuWithMenuId} = useSidebarContext();

    const menusMap = useMemo(() => {
        const map = new Map<string, SidebarMenu>();
        sidebarMenus.forEach((menu) => map.set(menu.menuId, menu));
        return map;
    }, []);

    function getMenuById(menuId: string) {
        return menusMap.get(menuId);
    }

    const goToSection = useCallback(
        (menuId: string) => {
            const menu = menusMap.get(menuId);
            if (!menu) return;

            setMenuWithMenuId({MenuId: menuId});

            if (menu.defaultPath) {
                router.push(menu.defaultPath);
            }
        },
        [menusMap, setMenuWithMenuId, router],
    );

    const goToComponent = useCallback(
        (path: string) => {
            router.push(path);
        },
        [router],
    );

    const executeAction = useCallback(
        (action: SidebarItemAction) => {
            switch (action.type) {
                case "go_to_component":
                    goToComponent(action.path);
                    break;
                case "go_to_section":
                    goToSection(action.menuId);
                    break;
                case "execute-function":
                    action.func();
                    break;
                case "close-section":
                    goToSection("inicio");
                    break;
                case "none":
                default:
                    break;
            }
        },
        [goToSection, goToComponent],
    );

    return {goToSection, goToComponent, executeAction, getMenuById};
}
