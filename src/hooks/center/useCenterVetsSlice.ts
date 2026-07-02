// src/hooks/center/useCenterVetsSlice.ts

"use client";

import {useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";

import type {reduxDispatch, reduxState} from "@/state/redux/store";

import {
    clearCenterVets,
    fetchCenterVetsForCenter,
} from "@/state/redux/slices/centerVetsSlice";

type Params = {
    centerId: number | null;
};

type LoadCenterVetsOptions = {
    forceRefresh?: boolean;
};

export function useCenterVetsSlice({centerId}: Params) {
    const dispatch = useDispatch<reduxDispatch>();

    const centerVets = useSelector(
        (state: reduxState) => state.centerVets.vets,
    );

    const centerVetsLoading = useSelector(
        (state: reduxState) => state.centerVets.loading,
    );

    const centerVetsError = useSelector(
        (state: reduxState) => state.centerVets.error,
    );

    const loadedCenterId = useSelector(
        (state: reduxState) => state.centerVets.loadedCenterId,
    );

    const loadCenterVetsSlice = useCallback(
        (options?: LoadCenterVetsOptions) => {
            if (centerId === null) {
                return;
            }

            const forceRefresh = options?.forceRefresh ?? false;

            if (!forceRefresh && loadedCenterId === centerId) {
                return;
            }

            dispatch(
                fetchCenterVetsForCenter({
                    centerId,
                }),
            );
        },
        [centerId, dispatch, loadedCenterId],
    );

    const clearCenterVetsSlice = useCallback(() => {
        dispatch(clearCenterVets());
    }, [dispatch]);

    return {
        centerVets,
        centerVetsLoading,
        centerVetsError,
        loadedCenterId,
        loadCenterVetsSlice,
        clearCenterVetsSlice,
    };
}
