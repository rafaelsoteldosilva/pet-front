// src/state/redux/slices/petDataSlice.ts

import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

import {petDataApi} from "@/api/pet/petDataApi";
import {PetDataInterface} from "@/features/pet/types/petTypes";

type RequestPetDataArgs = {
    petId: number;
    centerId: number;
};

type PetDataState = {
    pet: PetDataInterface | null;
    loading: boolean;
    error: string | null;
};

const initialState: PetDataState = {
    pet: null,
    loading: false,
    error: null,
};

export const requestPetData = createAsyncThunk<
    PetDataInterface,
    RequestPetDataArgs,
    {rejectValue: string}
>("petData/requestPetData", async ({petId, centerId}, {rejectWithValue}) => {
    try {
        return await petDataApi(centerId, petId);
    } catch (error) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Failed to load patient",
        );
    }
});

const petDataSlice = createSlice({
    name: "petData",
    initialState,
    reducers: {
        clearPetData(state) {
            state.pet = null;
            state.loading = false;
            state.error = null;
        },

        updatePetFields(
            state,
            action: PayloadAction<Partial<PetDataInterface>>,
        ) {
            if (!state.pet) return;

            state.pet = {
                ...state.pet,
                ...action.payload,
            };
        },

        setPetData(state, action: PayloadAction<PetDataInterface | null>) {
            state.pet = action.payload;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(requestPetData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                requestPetData.fulfilled,
                (state, action: PayloadAction<PetDataInterface>) => {
                    state.loading = false;
                    state.pet = action.payload;
                    state.error = null;
                },
            )
            .addCase(requestPetData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to load patient";
            });
    },
});

export const {clearPetData, updatePetFields, setPetData} = petDataSlice.actions;

export default petDataSlice.reducer;
