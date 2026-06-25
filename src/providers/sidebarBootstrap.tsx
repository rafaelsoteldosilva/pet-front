// src/providers/sidebarBootstrap.tsx

"use client";

import {SidebarMenuProvider} from "@/shell/sidebar/sidebarContext";
import {sidebarMenus} from "../shell/sidebar/sidebarMenus";

export default function SidebarBootstrap({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarMenuProvider
            menus={sidebarMenus}
            initialMenuId={sidebarMenus[0].menuId}
        >
            {children}
        </SidebarMenuProvider>
    );
}
