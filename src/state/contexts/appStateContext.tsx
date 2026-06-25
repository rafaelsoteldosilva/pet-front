// src/state/contexts/appStateContext.tsx

"use client";

import React, {
    createContext,
    Dispatch,
    ReactNode,
    useContext,
    useMemo,
    useReducer,
} from "react";

import {produce} from "immer";

import * as global from "../../shared/constants/appConstants";

/* =========================================================
   TYPES
========================================================= */

export type AppMessageType = "info" | "success" | "warning" | "error";

export type AppMessage = {
    text: string;
    type: AppMessageType;
};

/* =========================================================
   STATE
========================================================= */

export interface AppState {
    AppMessage: AppMessage | null;
    nextPath: string | null;
}

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: AppState = {
    AppMessage: null,
    nextPath: null,
};

/* =========================================================
   ACTIONS
========================================================= */

export type AppStateAction =
    | {type: typeof global.SET_GLOBAL_MESSAGE; payload: AppMessage}
    | {type: typeof global.CLEAR_GLOBAL_MESSAGE}
    | {type: typeof global.SET_NEXT_PATH; payload: string}
    | {type: typeof global.CLEAR_NEXT_PATH};

/* =========================================================
   REDUCER
========================================================= */

function appStateReducer(state: AppState, action: AppStateAction): AppState {
    return produce(state, (draft: AppState) => {
        switch (action.type) {
            case global.SET_GLOBAL_MESSAGE:
                if (
                    !draft.AppMessage ||
                    draft.AppMessage.text !== action.payload.text ||
                    draft.AppMessage.type !== action.payload.type
                ) {
                    draft.AppMessage = action.payload;
                }
                break;

            case global.CLEAR_GLOBAL_MESSAGE:
                draft.AppMessage = null;
                break;

            case global.SET_NEXT_PATH:
                draft.nextPath = action.payload;
                break;

            case global.CLEAR_NEXT_PATH:
                draft.nextPath = null;
                break;

            default:
                return state;
        }
    });
}

/* =========================================================
   CONTEXT
========================================================= */

export interface AppStateContextValue {
    state: AppState;
    dispatch: Dispatch<AppStateAction>;
}

export const AppStateContext = createContext<AppStateContextValue | undefined>(
    undefined,
);

/* =========================================================
   PROVIDER
========================================================= */

interface AppStateProviderProps {
    children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(appStateReducer, initialState);

    const value = useMemo<AppStateContextValue>(
        () => ({
            state,
            dispatch,
        }),
        [state],
    );

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
};

/* =========================================================
   HOOK
========================================================= */

export function useAppStateContextFromProvider() {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error(
            "useAppStateContextFromProvider must be used inside AppStateProvider",
        );
    }

    return context;
}
