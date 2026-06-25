// src/hooks/pet/useAllowedSpeciesAndBreedsSlice

"use client";

import {useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import type {reduxDispatch, reduxState} from "@/state/redux/store";

import {
    clearAllowedSpeciesAndBreeds,
    fetchAllowedSpeciesAndBreeds,
} from "@/state/redux/slices/allowedSpeciesAndBreedsSlice";

export function useAllowedSpeciesAndBreedsSlice() {
    const dispatch = useDispatch<reduxDispatch>();

    const results = useSelector(
        (state: reduxState) => state.allowedSpeciesAndBreeds.results,
    );
    const loading = useSelector(
        (state: reduxState) => state.allowedSpeciesAndBreeds.loading,
    );
    const error = useSelector(
        (state: reduxState) => state.allowedSpeciesAndBreeds.error,
    );
    const loadedCenterId = useSelector(
        (state: reduxState) => state.allowedSpeciesAndBreeds.loadedCenterId,
    );

    const loadAllowedSpeciesAndBreedsSlice = useCallback(
        async (centerId: number): Promise<boolean> => {
            const action = await dispatch(
                fetchAllowedSpeciesAndBreeds({centerId}),
            );
            return fetchAllowedSpeciesAndBreeds.fulfilled.match(action);
        },
        [dispatch],
    );

    const clearAllowedSpeciesAndBreedsSlice = useCallback(() => {
        dispatch(clearAllowedSpeciesAndBreeds());
    }, [dispatch]);

    return {
        results,
        loading,
        error,
        loadedCenterId,
        loadAllowedSpeciesAndBreedsSlice,
        clearAllowedSpeciesAndBreedsSlice,
    };
}
