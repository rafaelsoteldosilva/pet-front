// src/state/redux/slices/allowedSpeciesAndBreedsSlice.ts

import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";

import type {reduxState} from "@/state/redux/store";
import {getAllowedSpeciesAndBreedsApi} from "@/api/catalog/getAllowedSpeciesAndBreedsApi";
import {AllowedSpeciesAndBreedsResult} from "@/features/pet/types/petTypes";

type AllowedSpeciesAndBreedsArgs = {
    centerId: number;
};

type AllowedSpeciesAndBreedsState = {
    results: AllowedSpeciesAndBreedsResult;
    loading: boolean;
    error: string | null;
    loadedCenterId: number | null;
};

const initialState: AllowedSpeciesAndBreedsState = {
    results: [],
    loading: false,
    error: null,
    loadedCenterId: null,
};

export const fetchAllowedSpeciesAndBreeds = createAsyncThunk<
    AllowedSpeciesAndBreedsResult,
    AllowedSpeciesAndBreedsArgs,
    {state: reduxState; rejectValue: string}
>(
    "allowedSpeciesAndBreeds/fetchAllowedSpeciesAndBreeds",
    async ({centerId}, {rejectWithValue}) => {
        try {
            const result = await getAllowedSpeciesAndBreedsApi(centerId);
            return result;
        } catch (error: unknown) {
            console.error("fetchAllowedSpeciesAndBreeds:: error:: ", error);

            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : "Failed to load allowed species and breeds",
            );
        }
    },
    {
        condition: ({centerId}, {getState}) => {
            const state = getState();
            const slice = state.allowedSpeciesAndBreeds;

            if (slice.loading) {
                return false;
            }

            if (slice.loadedCenterId === centerId) {
                return false;
            }

            return true;
        },
    },
);

const allowedSpeciesAndBreedsSlice = createSlice({
    name: "allowedSpeciesAndBreeds",
    initialState,
    reducers: {
        clearAllowedSpeciesAndBreeds(state) {
            state.results = [];
            state.loading = false;
            state.error = null;
            state.loadedCenterId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllowedSpeciesAndBreeds.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchAllowedSpeciesAndBreeds.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.results = action.payload;
                    state.loadedCenterId = action.meta.arg.centerId;
                    state.error = null;
                },
            )
            .addCase(fetchAllowedSpeciesAndBreeds.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ??
                    "Failed to load allowed species and breeds";
            });
    },
});

export const {clearAllowedSpeciesAndBreeds} =
    allowedSpeciesAndBreedsSlice.actions;

export default allowedSpeciesAndBreedsSlice.reducer;
