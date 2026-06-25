// src/hooks/shell/useSidebarContext.ts

"use client";

import {
    SidebarItemAction,
    SidebarItemsConfig,
    SidebarMenuConfig,
    SidebarMenuContext,
    SidebarState,
} from "@/shell/sidebar/sidebarContext";
import {ElementType, useCallback, useContext} from "react";

/* =========================================================
   TYPES
   ========================================================= */

type SidebarItemProperties = {
    itemId: string;
    itemLabel: string;
    itemIcon: ElementType;
    itemPath?: string;
    itemDisabled: boolean;
};

/* ================= PARAM TYPES ================= */

type setMenuWithMenuIdParams = {
    MenuId: string;
};

type ExecuteItemActionParams = {
    action: SidebarItemAction;
};

type UpdateItemParams<K extends keyof SidebarItemsConfig> = {
    id: string;
    key: K;
    value: SidebarItemsConfig[K];
};

type BatchUpdateItemParams = {
    id: string;
    updates: Partial<SidebarItemsConfig>;
};

type SetItemsPropertyByIdParams<K extends keyof SidebarItemsConfig> = {
    ids: string[];
    key: K;
    value: SidebarItemsConfig[K];
};

type GetCurrentMenuItemIdsExcludingSystemParams = {
    excludeItemIds?: string[];
};

type GetItemPropertiesParams = {
    itemId: string;
};

/* =========================================================
   RETURN TYPE
   ========================================================= */

type UseSidebarContextResult = {
    state: SidebarState;
    currentMenu: SidebarMenuConfig | undefined;
    items: SidebarItemsConfig[];

    setMenuWithMenuId: (params: setMenuWithMenuIdParams) => void;

    updateItem: <K extends keyof SidebarItemsConfig>(
        params: UpdateItemParams<K>,
    ) => void;

    batchUpdateItem: (params: BatchUpdateItemParams) => void;

    setItemsPropertyById: <K extends keyof SidebarItemsConfig>(
        params: SetItemsPropertyByIdParams<K>,
    ) => void;

    getCurrentMenuItemIdsExcludingSystem: (
        params?: GetCurrentMenuItemIdsExcludingSystemParams,
    ) => string[];

    getItemProperties: (
        params: GetItemPropertiesParams,
    ) => SidebarItemProperties | undefined;
};

/* =========================================================
   HOOK
   ========================================================= */

export function useSidebarContext(): UseSidebarContextResult {
    const context = useContext(SidebarMenuContext);
    // const {executeAction} = useSideBarNavigation();

    if (!context) {
        throw new Error(
            "useSidebarContext must be used within SidebarMenuProvider",
        );
    }

    const {state, dispatch} = context;

    /* =====================================================
       SELECTORS
       ===================================================== */

    function getCurrentMenuItemIdsExcludingSystem(
        params: GetCurrentMenuItemIdsExcludingSystemParams = {},
    ): string[] {
        const {excludeItemIds = []} = params;

        const currentMenu = state.menus[state.currentMenuId];

        if (!currentMenu) return [];

        const excluded = new Set(excludeItemIds);

        return currentMenu.items
            .filter(
                (item) =>
                    item.itemLabel !== "Cerrar" &&
                    item.itemLabel !== "Configuración" &&
                    !excluded.has(item.itemId),
            )
            .map((item) => item.itemId);
    }

    function getItemProperties(
        params: GetItemPropertiesParams,
    ): SidebarItemProperties | undefined {
        const {itemId} = params;

        const currentMenu = state.menus[state.currentMenuId];
        if (!currentMenu) return undefined;

        const item = currentMenu.items.find((item) => item.itemId === itemId);

        if (!item) return undefined;

        return {
            itemId: item.itemId,
            itemLabel: item.itemLabel,
            itemIcon: item.itemIcon,
            itemPath: item.itemPath,
            itemDisabled: item.itemDisabled,
        };
    }

    /* =====================================================
       ACTIONS
       ===================================================== */

    const setMenuWithMenuId = useCallback(
        ({MenuId}: setMenuWithMenuIdParams) => {
            dispatch({
                type: "SET_MENU",
                payload: {MenuId},
            });
        },
        [dispatch],
    );

    function updateItem<K extends keyof SidebarItemsConfig>({
        id,
        key,
        value,
    }: UpdateItemParams<K>) {
        dispatch({
            type: "UPDATE_ITEM",
            payload: {id, key, value},
        });
    }

    function batchUpdateItem({id, updates}: BatchUpdateItemParams) {
        dispatch({
            type: "BATCH_UPDATE_ITEM",
            payload: {id, updates},
        });
    }

    function setItemsPropertyById<K extends keyof SidebarItemsConfig>({
        ids,
        key,
        value,
    }: SetItemsPropertyByIdParams<K>) {
        const currentMenu = state.menus[state.currentMenuId];
        if (!currentMenu) return;

        const validIds = new Set(currentMenu.items.map((item) => item.itemId));

        ids.forEach((id) => {
            if (!validIds.has(id)) return;

            dispatch({
                type: "UPDATE_ITEM",
                payload: {id, key, value},
            });
        });
    }

    /* =====================================================
       DERIVED
       ===================================================== */

    const currentMenu = state.menus[state.currentMenuId];
    const items = currentMenu?.items ?? [];

    /* =====================================================
       PUBLIC API
       ===================================================== */

    return {
        state,
        currentMenu,
        items,
        setMenuWithMenuId,
        updateItem,
        batchUpdateItem,
        setItemsPropertyById,
        getCurrentMenuItemIdsExcludingSystem,
        getItemProperties,
    };
}
