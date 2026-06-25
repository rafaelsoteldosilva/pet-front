// src/state/contexts/sidebarContext.tsx

"use client";

import {createContext, Dispatch, ReactNode, useReducer, useRef} from "react";

import type {ElementType} from "react";

/* =========================================================
   ACTION TYPES
   ========================================================= */

export type SidebarItemAction =
    | {type: "go_to_component"; path: string}
    | {type: "go_to_section"; menuId: string}
    | {type: "execute-function"; func: () => void}
    | {type: "close-section"}
    | {type: "none"};

/* =========================================================
   ITEM CONFIG
   ========================================================= */

export type SidebarItemsConfig = {
    itemId: string;
    itemLabel: string;
    itemIcon: ElementType;

    itemAction: SidebarItemAction;

    itemPath?: string;

    itemDisabled: boolean;

    itemTextColor: string;
    itemBold: boolean;
    itemUnderline: boolean;

    itemTopBorder: boolean;
    itemBottomBorder: boolean;

    itemTooltip: string;

    open?: boolean;
};

/* =========================================================
   MENU CONFIG
   ========================================================= */

export type SidebarMenuConfig = {
    menuId: string;
    label: string;
    items: SidebarItemsConfig[];
    defaultPath: string;
};

/* =========================================================
   STATE
   ========================================================= */

export type SidebarState = {
    currentMenuId: string;
    menus: Record<string, SidebarMenuConfig>;
};

/* =========================================================
   ACTIONS
   ========================================================= */

export type SidebarAction =
    | {
          type: "SET_MENU";
          payload: {MenuId: string};
      }
    | {
          type: "UPDATE_ITEM";
          payload: {
              MenuId?: string;
              id: string;
              key: keyof SidebarItemsConfig;
              value: SidebarItemsConfig[keyof SidebarItemsConfig];
          };
      }
    | {
          type: "BATCH_UPDATE_ITEM";
          payload: {
              MenuId?: string;
              id: string;
              updates: Partial<SidebarItemsConfig>;
          };
      };

/* =========================================================
   REDUCER
   ========================================================= */

function sidebarReducer(
    state: SidebarState,
    action: SidebarAction,
): SidebarState {
    switch (action.type) {
        case "SET_MENU": {
            if (!state.menus[action.payload.MenuId]) {
                return state;
            }

            return {
                ...state,
                currentMenuId: action.payload.MenuId,
            };
        }

        case "UPDATE_ITEM": {
            const MenuId = action.payload.MenuId ?? state.currentMenuId;

            const menu = state.menus[MenuId];
            if (!menu) return state;

            return {
                ...state,
                menus: {
                    ...state.menus,
                    [MenuId]: {
                        ...menu,
                        items: menu.items.map((item) =>
                            item.itemId === action.payload.id
                                ? {
                                      ...item,
                                      [action.payload.key]:
                                          action.payload.value,
                                  }
                                : item,
                        ),
                    },
                },
            };
        }

        case "BATCH_UPDATE_ITEM": {
            const MenuId = action.payload.MenuId ?? state.currentMenuId;

            const menu = state.menus[MenuId];
            if (!menu) return state;

            return {
                ...state,
                menus: {
                    ...state.menus,
                    [MenuId]: {
                        ...menu,
                        items: menu.items.map((item) =>
                            item.itemId === action.payload.id
                                ? {
                                      ...item,
                                      ...action.payload.updates,
                                  }
                                : item,
                        ),
                    },
                },
            };
        }

        default:
            return state;
    }
}

/* =========================================================
   CONTEXT
   ========================================================= */

export type SidebarContextValue = {
    state: SidebarState;
    dispatch: Dispatch<SidebarAction>;
};

export const SidebarMenuContext = createContext<SidebarContextValue | null>(
    null,
);

/* =========================================================
   PROVIDER PROPS
   ========================================================= */

type SidebarMenuProviderProps = {
    menus: SidebarMenuConfig[];
    initialMenuId: string;
    children: ReactNode;
};

/* =========================================================
   PROVIDER
   ========================================================= */

export function SidebarMenuProvider({
    menus,
    initialMenuId,
    children,
}: SidebarMenuProviderProps) {
    /**
     * CRITICAL FIX:
     * useRef prevents state reset during hydration
     */
    const initialStateRef = useRef<SidebarState>({
        menus: Object.fromEntries(menus.map((menu) => [menu.menuId, menu])),
        currentMenuId: initialMenuId,
    });

    const [state, dispatch] = useReducer(
        sidebarReducer,
        initialStateRef.current,
    );

    return (
        <SidebarMenuContext.Provider value={{state, dispatch}}>
            {children}
        </SidebarMenuContext.Provider>
    );
}
