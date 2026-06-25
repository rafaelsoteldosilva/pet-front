// src/app/layout.tsx

import type {Metadata} from "next";
import "./globals.css";
import {ReactNode} from "react";

import SidebarBootstrap from "@/providers/sidebarBootstrap";
import {Toaster} from "sonner";
import {RootProvider} from "@/providers/rootProvider";

export const metadata: Metadata = {
    title: "Pet Control",
    icons: {icon: "/favicon.ico"},
    description: "Veterinary management system",
};

export default function RootLayout({children}: {children: ReactNode}) {
    return (
        <html lang="es">
            <body>
                <SidebarBootstrap>
                    <RootProvider>{children}</RootProvider>
                </SidebarBootstrap>

                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    );
}
