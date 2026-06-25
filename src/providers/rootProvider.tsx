// src/providers/appProvider.tsx

"use client";

import {ReactNode} from "react";
import {Provider as ReduxProvider} from "react-redux";
import {store} from "../state/redux/store";
import {AppStateProvider} from "../state/contexts/appStateContext";

export function RootProvider({children}: {children: ReactNode}) {
    return (
        <ReduxProvider store={store}>
            <AppStateProvider>{children}</AppStateProvider>
        </ReduxProvider>
    );
}
