// src/hooks/center/useCenterContactsSlice.ts

"use client";

import {useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";

import type {reduxDispatch, reduxState} from "@/state/redux/store";

import {
    fetchCenterContactsForCenter,
    clearCenterContacts,
} from "@/state/redux/slices/centerContactsSlice";

type Params = {
    centerId: number | null;
};

type LoadOptions = {
    forceRefresh?: boolean;
};

export function useCenterContactsSlice({centerId}: Params) {
    const dispatch = useDispatch<reduxDispatch>();

    // --------------------
    // Redux selectors
    // --------------------

    const centerContacts = useSelector(
        (state: reduxState) => state.centerContacts.contacts,
    );

    const centerContactsLoading = useSelector(
        (state: reduxState) => state.centerContacts.loading,
    );

    const centerContactsError = useSelector(
        (state: reduxState) => state.centerContacts.error,
    );

    const loadedCenterId = useSelector(
        (state: reduxState) => state.centerContacts.loadedCenterId,
    );

    // --------------------
    // Actions
    // --------------------

    const loadCenterContactsSlice = useCallback(
        ({forceRefresh = false}: LoadOptions = {}) => {
            if (centerId === null) {
                return;
            }

            const alreadyLoadedForCenter = loadedCenterId === centerId;

            if (!forceRefresh && alreadyLoadedForCenter) {
                return;
            }

            dispatch(
                fetchCenterContactsForCenter({
                    centerId,
                }),
            );
        },
        [centerId, dispatch, loadedCenterId],
    );

    const clearCenterContactsSlice = useCallback(() => {
        dispatch(clearCenterContacts());
    }, [dispatch]);

    // --------------------
    // Public API
    // --------------------

    return {
        // data
        centerContacts,
        centerContactsLoading,
        centerContactsError,
        loadedCenterId,

        // actions
        loadCenterContactsSlice,
        clearCenterContactsSlice,
    };
}
