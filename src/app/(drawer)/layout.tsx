// src/app/(drawer)/layout.tsx

"use client";

import {ReactNode, useEffect, useState} from "react";

import AuthGuard from "@/shared/auth/authGuard";
import LogoutButton from "@/shared/auth/logoutButton";
import Sidebar from "@/shell/sidebar/sidebarController";
import AppBackground from "@/shell/background/appBackground";
import {Breadcrumb} from "@/shell/breadcrumb/breadcrumb";
import {useBreadcrumb} from "@/hooks/shell/useBreadcrumb";
import {useSidebarContext} from "@/hooks/shell/useSidebarContext";

type DrawerLayoutProps = {
    children: ReactNode;
};

export default function DrawerLayout({children}: DrawerLayoutProps) {
    return (
        <AuthGuard>
            <AuthenticatedDrawerLayout>{children}</AuthenticatedDrawerLayout>
        </AuthGuard>
    );
}

function AuthenticatedDrawerLayout({children}: DrawerLayoutProps) {
    const breadcrumb = useBreadcrumb();
    const [collapsed, setCollapsed] = useState(false);

    const {setMenuWithMenuId, state} = useSidebarContext();

    useEffect(() => {
        if (!state.currentMenuId) {
            setMenuWithMenuId({MenuId: "globalSidebar"});
        }
    }, [state.currentMenuId, setMenuWithMenuId]);

    return (
        <div className="flex h-screen overflow-hidden">
            <aside
                className={`flex flex-col bg-slate-900 text-white transition-all duration-300
                border-r border-black/40
                shadow-[4px_0_10px_rgba(0,0,0,0.5)]
                z-50
                ${collapsed ? "w-16" : "w-64"}`}
            >
                <div className="flex-1 overflow-y-auto">
                    <Sidebar
                        collapsed={collapsed}
                        onToggle={() => setCollapsed((c) => !c)}
                    />
                </div>
            </aside>

            <main className="relative flex-1 min-w-0 overflow-y-auto">
                <AppBackground variant="dashboard" />

                <div className="relative z-10 px-6 py-6 space-y-4 w-full min-w-0">
                    <header className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold text-slate-800">
                                In this space I'll show the user name and photo,
                                the user's role, the Veterinary Center logo,
                                etc..
                            </h1>

                            <div className="mt-2">
                                <Breadcrumb items={breadcrumb} />
                            </div>
                        </div>

                        <div className="shrink-0 pt-1">
                            <LogoutButton />
                        </div>
                    </header>

                    <div className="h-px bg-slate-400/70" />

                    {children}
                </div>
            </main>
        </div>
    );
}
