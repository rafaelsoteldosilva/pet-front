// src/state/redux/slices/centerVetsSlice.ts

import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

import {getVeterinariansForCenterApi} from "@/api/center/centerStaff/getVeterinariansForCenterApi";
import type {CenterVeterinarianOption} from "@/features/center/types/centerStaffTypes";

// =====================
// Types
// =====================

type FetchCenterVetsForCenterArgs = {
    centerId: number;
};

type FetchCenterVetsForCenterResult = {
    centerId: number;
    vets: CenterVeterinarianOption[];
};

type CenterVetsState = {
    vets: CenterVeterinarianOption[];
    loading: boolean;
    error: string | null;
    loadedCenterId: number | null;
};

// =====================
// Initial state
// =====================

const initialState: CenterVetsState = {
    vets: [],
    loading: false,
    error: null,
    loadedCenterId: null,
};

// =====================
// Helpers
// =====================

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Failed to load center veterinarians";
}

// =====================
// Thunks
// =====================

export const fetchCenterVetsForCenter = createAsyncThunk<
    FetchCenterVetsForCenterResult,
    FetchCenterVetsForCenterArgs,
    {rejectValue: string}
>(
    "centerVets/fetchCenterVetsForCenter",
    async ({centerId}, {rejectWithValue}) => {
        try {
            const vets = await getVeterinariansForCenterApi(centerId);

            return {
                centerId,
                vets,
            };
        } catch (error: unknown) {
            console.error("fetchCenterVetsForCenter:: error:: ", error);

            return rejectWithValue(getErrorMessage(error));
        }
    },
);

// =====================
// Slice
// =====================

const centerVetsSlice = createSlice({
    name: "centerVets",
    initialState,
    reducers: {
        clearCenterVets(state) {
            state.vets = [];
            state.loading = false;
            state.error = null;
            state.loadedCenterId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCenterVetsForCenter.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchCenterVetsForCenter.fulfilled,
                (
                    state,
                    action: PayloadAction<FetchCenterVetsForCenterResult>,
                ) => {
                    state.loading = false;
                    state.vets = action.payload.vets;
                    state.loadedCenterId = action.payload.centerId;
                },
            )
            .addCase(fetchCenterVetsForCenter.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ?? "Failed to load center veterinarians";
            });
    },
});

// =====================
// Exports
// =====================

export const {clearCenterVets} = centerVetsSlice.actions;

export default centerVetsSlice.reducer;
