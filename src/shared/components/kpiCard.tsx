// src/shared/components/kpiCardCard.tsx

"use client";

import React from "react";

/* =========================================================
   Types
   ========================================================= */

export type KpiCardVariant = "default" | "danger";

export interface KpiCardProps {
    title: string;
    icon: React.ReactNode;
    variant?: KpiCardVariant;
    disabled?: boolean;
}

/* =========================================================
   Component
   ========================================================= */

function KpiCard({
    title,
    icon,
    variant = "default",
    disabled = false,
}: KpiCardProps) {
    const isDanger = variant === "danger";

    return (
        <div
            className={[
                "relative overflow-hidden rounded-xl p-4 ring-1 w-full transition-all",

                disabled
                    ? "bg-gray-200 text-gray-400 ring-gray-200 shadow-none"
                    : isDanger
                      ? "bg-gradient-to-br from-red-600 to-red-400 text-white ring-red-300 shadow-md"
                      : "bg-green-300 text-slate-900 ring-slate-200 shadow-sm",
            ].join(" ")}
        >
            {!disabled && isDanger && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            )}

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p
                        className={[
                            "text-sm font-medium transition-colors",

                            disabled
                                ? "text-gray-400"
                                : isDanger
                                  ? "text-white/90"
                                  : "text-slate-600",
                        ].join(" ")}
                    >
                        {title}
                    </p>
                </div>

                <div
                    className={[
                        "rounded-lg p-2",
                        disabled ? "bg-gray-300 text-gray-400" : "bg-white/15",
                    ].join(" ")}
                >
                    {icon}
                </div>
            </div>

            {disabled && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
            )}
        </div>
    );
}

export default KpiCard;
