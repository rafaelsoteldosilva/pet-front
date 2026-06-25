// src/shared/ui/modalDialog.tsx

"use client";

import {ReactNode, useEffect} from "react";
import {createPortal} from "react-dom";
import clsx from "clsx";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

type Props = {
    open: boolean;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    onClose?: () => void;
    size?: ModalSize;
    disableEscape?: boolean;
    closeOnOverlayClick?: boolean;
    bodyClassName?: string;

    /**
     * true  = the whole modal body scrolls
     * false = children decide what scrolls
     */
    scrollBody?: boolean;
};

const sizeClasses: Record<ModalSize, string> = {
    sm: "w-full max-w-md",
    md: "w-full max-w-2xl",
    lg: "w-full max-w-4xl",
    xl: "w-full max-w-6xl",
    full: "w-[96vw] max-w-[96vw]",
};

export default function ModalDialog({
    open,
    title,
    children,
    footer,
    onClose,
    size = "lg",
    disableEscape = true,
    closeOnOverlayClick = false,
    bodyClassName,
    scrollBody = true,
}: Props) {
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open || disableEscape) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose?.();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, disableEscape, onClose]);

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-slate-900/45 backdrop-blur-[2px]"
            onMouseDown={() => {
                if (closeOnOverlayClick) {
                    onClose?.();
                }
            }}
        >
            <div className="flex h-full w-full items-center justify-center p-3 sm:p-5">
                <div
                    className={clsx(
                        "flex max-h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200 sm:max-h-[calc(100dvh-40px)]",
                        sizeClasses[size],
                    )}
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <div className="shrink-0 bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 px-6 py-5 text-white">
                        <h2 className="text-2xl font-bold leading-tight">
                            {title}
                        </h2>
                    </div>

                    <div
                        className={clsx(
                            "min-h-0 flex-1 px-6 py-5",
                            scrollBody ? "overflow-y-auto" : "overflow-hidden",
                            bodyClassName,
                        )}
                    >
                        {children}
                    </div>

                    {footer ? (
                        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body,
    );
}
