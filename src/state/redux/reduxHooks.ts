// src/state/redux/reduxHooks.ts

import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import type {reduxState, reduxDispatch} from "./store";

export const useReduxDispatch = () => useDispatch<reduxDispatch>();
export const useReduxSelector: TypedUseSelectorHook<reduxState> = useSelector;
