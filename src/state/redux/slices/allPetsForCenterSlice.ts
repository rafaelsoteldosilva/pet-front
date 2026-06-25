// src/state/redux/slices/allPetsForCenterSlice.ts

import {createSlice, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";

import {
    GetAllPetsForCenterResult,
    GetAllPetsForCenterTypeValue,
} from "@/features/pet/types/petTypes";
import {getAllPetsForCenterApi} from "@/api/pet/getAllPetsForCenterApi";

// =====================
// Types
// =====================

type AllPetsForCenterArgs = {
    centerId: number;
    query: string;
    mode: GetAllPetsForCenterTypeValue;
};

type AllPetsForCenterState = {
    results: GetAllPetsForCenterResult[];
    loading: boolean;
    error: string | null;
    lastQuery: string | null;
    lastMode: GetAllPetsForCenterTypeValue | null;
};

// =====================
// Initial state
// =====================

const initialState: AllPetsForCenterState = {
    results: [],
    loading: false,
    error: null,
    lastQuery: null,
    lastMode: null,
};

// =====================
// Thunks
// =====================

export const fetchAllPetsForCenter = createAsyncThunk<
    GetAllPetsForCenterResult[],
    AllPetsForCenterArgs,
    {rejectValue: string}
>(
    "allPetsForCenter/fetchAllPetsForCenter",
    async ({centerId, query, mode}, {rejectWithValue}) => {
        try {
            const result = await getAllPetsForCenterApi(centerId, mode, query);
            return result;
        } catch (error: any) {
            console.error("fetchAllPetsForCenter:: error:: ", error);
            return rejectWithValue(
                error?.message ?? "Failed to load pets for center",
            );
        }
    },
);

// =====================
// Slice
// =====================

const allPetsForCenterSlice = createSlice({
    name: "allPetsForCenter",
    initialState,
    reducers: {
        clearAllPetsForCenterResults(state) {
            state.results = [];
            state.loading = false;
            state.error = null;
            state.lastQuery = null;
            state.lastMode = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPetsForCenter.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.lastQuery = action.meta.arg.query;
                state.lastMode = action.meta.arg.mode;
            })
            .addCase(
                fetchAllPetsForCenter.fulfilled,
                (state, action: PayloadAction<GetAllPetsForCenterResult[]>) => {
                    state.loading = false;
                    state.results = action.payload;
                },
            )
            .addCase(fetchAllPetsForCenter.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ?? "Failed to load pets for center";
            });
    },
});

// =====================
// Exports
// =====================

export const {clearAllPetsForCenterResults} = allPetsForCenterSlice.actions;
export default allPetsForCenterSlice.reducer;
