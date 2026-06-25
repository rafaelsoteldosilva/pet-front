// src/shell/sidebar/sidebarController.ts

"use client";

import {usePathname} from "next/navigation";
import clsx from "clsx";
import {SidebarItemsConfig} from "./sidebarContext";
import {useSideBarNavigation} from "@/hooks/shell/useSidebarNavigation";
import {useSidebarContext} from "@/hooks/shell/useSidebarContext";

type SidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
};

export default function SidebarController({collapsed, onToggle}: SidebarProps) {
    const {currentMenu, items} = useSidebarContext();

    const menuLabel = currentMenu?.label;

    const mainItems = items.filter((item) => item.itemId !== "settings");
    const footerItems = items.filter((item) => item.itemId === "settings");

    return (
        <div
            className={clsx(
                "h-full flex flex-col",
                collapsed ? "px-2" : "pl-3 pr-4",
            )}
        >
            {/* ================= HEADER (TITLE / TOGGLE SLOT) ================= */}
            <div className="h-10 flex items-center px-2 mb-2">
                {collapsed ? (
                    <button
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                        className="ml-2 text-slate-400 hover:text-slate-200 transition"
                    >
                        ☰
                    </button>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {menuLabel}
                        </span>

                        <button
                            onClick={onToggle}
                            aria-label="Toggle sidebar"
                            className="text-slate-400 hover:text-slate-200 transition"
                        >
                            ☰
                        </button>
                    </div>
                )}
            </div>

            {/* ================= CONTEXT DIVIDER ================= */}
            <div className="mx-2 mb-2">
                <div className="h-[2px] bg-slate-600/80" />
            </div>

            {/* ================= NAVIGATION ================= */}
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {mainItems.map((item) => (
                    <NavItem
                        key={item.itemId}
                        item={item}
                        collapsed={collapsed}
                    />
                ))}

                <div className="mt-auto">
                    {footerItems.map((item) => (
                        <NavItem
                            key={item.itemId}
                            item={item}
                            collapsed={collapsed}
                        />
                    ))}
                </div>
            </nav>
        </div>
    );
}

/* =========================================================
   NAV ITEM
   ========================================================= */

type NavItemProps = {
    item: SidebarItemsConfig;
    collapsed: boolean;
};

function NavItem({item, collapsed}: NavItemProps) {
    const {executeAction} = useSideBarNavigation();
    const pathname = usePathname();

    const isActive = item.itemPath && pathname === item.itemPath;

    const handleClick = () => {
        if (item.itemDisabled) return;

        executeAction(item.itemAction);
    };

    return (
        <div
            className={clsx(
                item.itemTopBorder && "mt-0.5 pt-0.5 border-t border-slate-700",
                item.itemBottomBorder &&
                    "pb-0.5 mb-0.5 border-b border-slate-700",
            )}
        >
            <button
                onClick={handleClick}
                title={collapsed ? item.itemTooltip || undefined : undefined}
                className={clsx(
                    "w-full flex items-center gap-3 p-2 rounded transition text-left",

                    // hover normal
                    !item.itemDisabled && !isActive && "hover:bg-slate-800",

                    // ACTIVE highlight
                    isActive && [
                        "bg-slate-700",
                        "text-white",
                        "font-semibold",
                        "shadow-inner",
                    ],

                    item.itemDisabled && "opacity-50 cursor-not-allowed",
                    collapsed && "justify-center",
                )}
            >
                <item.itemIcon className="w-5 h-5 flex-shrink-0" />

                {!collapsed && (
                    <span
                        className={clsx(
                            "text-sm whitespace-nowrap",
                            isActive ? "text-white" : item.itemTextColor,
                            item.itemBold && "font-semibold",
                            item.itemUnderline && "underline",
                        )}
                    >
                        {item.itemLabel}
                    </span>
                )}
            </button>
        </div>
    );
}
