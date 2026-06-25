// src/state/redux/slices/centerContactsSlice.ts

import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

import {getAllCenterContactsApi} from "@/api/center/centerContact/getAllCenterContactsApi";
import type {CenterContactInterface} from "@/features/center/centerContact/types/centerContactTypes";

// =====================
// Types
// =====================

type FetchCenterContactsForCenterArgs = {
    centerId: number;
};

type FetchCenterContactsForCenterResult = {
    centerId: number;
    contacts: CenterContactInterface[];
};

type CenterContactsState = {
    contacts: CenterContactInterface[];
    loading: boolean;
    error: string | null;
    loadedCenterId: number | null;
};

// =====================
// Initial state
// =====================

const initialState: CenterContactsState = {
    contacts: [],
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

    return "Failed to load center contacts";
}

// =====================
// Thunks
// =====================

export const fetchCenterContactsForCenter = createAsyncThunk<
    FetchCenterContactsForCenterResult,
    FetchCenterContactsForCenterArgs,
    {rejectValue: string}
>(
    "centerContacts/fetchCenterContactsForCenter",
    async ({centerId}, {rejectWithValue}) => {
        try {
            const contacts = await getAllCenterContactsApi(centerId);

            return {
                centerId,
                contacts,
            };
        } catch (error: unknown) {
            console.error("fetchCenterContactsForCenter:: error:: ", error);

            return rejectWithValue(getErrorMessage(error));
        }
    },
);

// =====================
// Slice
// =====================

const centerContactsSlice = createSlice({
    name: "centerContacts",
    initialState,
    reducers: {
        clearCenterContacts(state) {
            state.contacts = [];
            state.loading = false;
            state.error = null;
            state.loadedCenterId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCenterContactsForCenter.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchCenterContactsForCenter.fulfilled,
                (
                    state,
                    action: PayloadAction<FetchCenterContactsForCenterResult>,
                ) => {
                    state.loading = false;
                    state.contacts = action.payload.contacts;
                    state.loadedCenterId = action.payload.centerId;
                },
            )
            .addCase(fetchCenterContactsForCenter.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ?? "Failed to load center contacts";
            });
    },
});

// =====================
// Exports
// =====================

export const {clearCenterContacts} = centerContactsSlice.actions;

export default centerContactsSlice.reducer;
