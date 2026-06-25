// src/shared/ui/dialogs/FormLayout.tsx

"use client";

import React from "react";

type FormLayoutProps = {
    children: React.ReactNode;
};

export default function FormLayout({children}: FormLayoutProps) {
    return <div className="space-y-5">{children}</div>;
}
