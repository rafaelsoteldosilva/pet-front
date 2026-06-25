// src/state/redux/store.ts

import {configureStore} from "@reduxjs/toolkit";

import getAllPetsForCenterReducer from "./slices/allPetsForCenterSlice";
import petDataReducer from "./slices/petDataSlice";
import allowedSpeciesAndBreedsReducer from "./slices/allowedSpeciesAndBreedsSlice";
import centerContactsReducer from "./slices/centerContactsSlice";
import centerVetsReducer from "@/state/redux/slices/centerVetsSlice";

export const store = configureStore({
    reducer: {
        allPetsForCenter: getAllPetsForCenterReducer,
        petData: petDataReducer,
        allowedSpeciesAndBreeds: allowedSpeciesAndBreedsReducer,
        centerContacts: centerContactsReducer,
        centerVets: centerVetsReducer,
    },
});

export type reduxState = ReturnType<typeof store.getState>;
export type reduxDispatch = typeof store.dispatch;
