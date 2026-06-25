// src/shared/ui/dialogs/formCard.tsx

"use client";

import {ReactNode} from "react";
import clsx from "clsx";

type Props = {
    children: ReactNode;
    className?: string;
};

export default function FormCard({children, className}: Props) {
    return (
        <div
            className={clsx(
                "rounded-2xl border border-slate-300 bg-white p-4 shadow-sm",
                className,
            )}
        >
            {children}
        </div>
    );
}
