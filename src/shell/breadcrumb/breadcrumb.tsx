// src/shell/breadcrumb/breadcrumb.ts

import {BreadcrumbItem} from "./types/breadcrumbTypes";

export function Breadcrumb({items}: {items: BreadcrumbItem[]}) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-800"
        >
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="text-slate-500">&gt;</span>}
                    <span>{item.label}</span>
                </span>
            ))}
        </nav>
    );
}
