// src/hooks/pet/useAllPetsForCenterSlice.ts

"use client";

import {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import type {reduxDispatch, reduxState} from "@/state/redux/store";

import {
    fetchAllPetsForCenter,
    clearAllPetsForCenterResults,
    removePetFromAllPetsForCenterResults,
} from "@/state/redux/slices/allPetsForCenterSlice";

import type {GetAllPetsForCenterTypeValue} from "@/features/pet/types/petTypes";

type Params = {
    centerId: number;
    mode?: GetAllPetsForCenterTypeValue;
    minLength?: number;
};

export function useAllPetsForCenterSlice({
    centerId,
    mode,
    minLength = 3,
}: Params) {
    const dispatch = useDispatch<reduxDispatch>();
    const lastKeyRef = useRef<string | null>(null);

    // --------------------
    // Redux selectors
    // --------------------

    const allPetsForCenterResults = useSelector(
        (state: reduxState) => state.allPetsForCenter.results,
    );

    const allPetsForCenterLoading = useSelector(
        (state: reduxState) => state.allPetsForCenter.loading,
    );

    const allPetsForCenterError = useSelector(
        (state: reduxState) => state.allPetsForCenter.error,
    );

    // --------------------
    // Local input state
    // --------------------

    const [allPetsForCenterPetSearchText, allPetsForCenterSetPetSearchText] =
        useState("");

    // --------------------
    // Actions
    // --------------------

    const loadSearchPetsSlice = () => {
        if (!mode) {
            console.warn(
                "useAllPetsForCenterSlice:: mode is required to search pets.",
            );
            return;
        }

        const query = allPetsForCenterPetSearchText.trim();

        if (query.length < minLength) {
            return;
        }

        const key = `${centerId}:${mode}:${query}`;

        if (lastKeyRef.current === key) {
            return;
        }

        lastKeyRef.current = key;

        dispatch(
            fetchAllPetsForCenter({
                centerId,
                query,
                mode,
            }),
        );
    };

    const clearSearchPetsSlice = () => {
        lastKeyRef.current = null;
        allPetsForCenterSetPetSearchText("");
        dispatch(clearAllPetsForCenterResults());
    };

    const removePetFromAllPetsForCenterSlice = (petId: number) => {
        dispatch(removePetFromAllPetsForCenterResults(petId));
    };

    // --------------------
    // Public API
    // --------------------

    return {
        // input
        allPetsForCenterPetSearchText,
        allPetsForCenterSetPetSearchText,

        // data
        allPetsForCenterResults,
        allPetsForCenterLoading,
        allPetsForCenterError,

        // actions
        loadSearchPetsSlice,
        clearSearchPetsSlice,
        removePetFromAllPetsForCenterSlice,
    };
}
