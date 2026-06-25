// src/hooks/pet/usePetDataSlice.ts

"use client";

import {useDispatch, useSelector} from "react-redux";
import type {reduxDispatch, reduxState} from "@/state/redux/store";

import {
    clearPetData,
    requestPetData,
    setPetData,
    updatePetFields,
} from "@/state/redux/slices/petDataSlice";

import {PetDataInterface} from "@/features/pet/types/petTypes";

export function usePetDataSlice() {
    const dispatch = useDispatch<reduxDispatch>();

    const pet = useSelector((state: reduxState) => state.petData.pet);
    const petLoading = useSelector(
        (state: reduxState) => state.petData.loading,
    );
    const petError = useSelector((state: reduxState) => state.petData.error);

    const loadPetDataSlice = async (
        petId: number,
        centerId: number,
    ): Promise<boolean> => {
        const action = await dispatch(
            requestPetData({
                petId,
                centerId,
            }),
        );

        return requestPetData.fulfilled.match(action);
    };

    const clearPetDataSlice = () => {
        dispatch(clearPetData());
    };

    // updatePetFieldsSlice updates only part of the current pet.
    const updatePetFieldsSlice = (fields: Partial<PetDataInterface>) => {
        dispatch(updatePetFields(fields));
    };

    // setPetDataSlice replaces the whole pet object.
    const setPetDataSlice = (petData: PetDataInterface | null) => {
        dispatch(setPetData(petData));
    };

    return {
        pet,
        petLoading,
        petError,
        loadPetDataSlice,
        clearPetDataSlice,
        updatePetFieldsSlice,
        setPetDataSlice,
    };
}
