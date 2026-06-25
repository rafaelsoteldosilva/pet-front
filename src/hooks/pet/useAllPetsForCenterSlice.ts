// src/hooks/pet/useAllPetsForCenterSlice.ts

"use client";

import {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import type {reduxDispatch, reduxState} from "@/state/redux/store";

import {
    fetchAllPetsForCenter,
    clearAllPetsForCenterResults,
} from "@/state/redux/slices/allPetsForCenterSlice";

import type {GetAllPetsForCenterTypeValue} from "@/features/pet/types/petTypes";

type Params = {
    centerId: number;
    mode: GetAllPetsForCenterTypeValue;
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

    const results = useSelector(
        (state: reduxState) => state.allPetsForCenter.results,
    );

    const loading = useSelector(
        (state: reduxState) => state.allPetsForCenter.loading,
    );

    const error = useSelector(
        (state: reduxState) => state.allPetsForCenter.error,
    );

    // --------------------
    // Local input state
    // --------------------

    const [value, setValue] = useState("");

    // --------------------
    // Actions
    // --------------------

    const loadSearchPetsSlice = () => {
        const query = value.trim();

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
        setValue("");
        dispatch(clearAllPetsForCenterResults());
    };

    // --------------------
    // Public API
    // --------------------

    return {
        // input
        value,
        setValue,

        // data
        results,
        loading,
        error,

        // actions
        loadSearchPetsSlice,
        clearSearchPetsSlice,
    };
}
