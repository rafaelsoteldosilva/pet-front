// src/shared/ui/simpleModalDialog.tsx

"use client";

import {useEffect, ReactNode} from "react";
import {createPortal} from "react-dom";
import Image from "next/image";

import {
    HiOutlineInformationCircle,
    HiOutlineExclamationTriangle,
    HiOutlineShieldExclamation,
} from "react-icons/hi2";

import GlobalButton from "@/shared/ui/globalButton";

export type VariantTypes = "info" | "warning" | "danger" | "success";

type ModalDialogProps = {
    open: boolean;

    title: string;
    description: React.ReactNode;

    acceptLabel?: string;
    cancelLabel?: string;

    showAcceptButton?: boolean;
    showCancelButton?: boolean;

    variant?: VariantTypes;
    icon?: ReactNode;

    photoUrl?: string | null;

    disableEscape?: boolean;

    onAccept: () => void;
    onCancel: () => void;
};

export default function SimpleModalDialog({
    open,
    title,
    description,
    acceptLabel = "Aceptar",
    cancelLabel = "Cancelar",
    showAcceptButton = true,
    showCancelButton = true,
    variant = "info",
    icon,
    photoUrl = null,
    disableEscape = false,
    onAccept,
    onCancel,
}: ModalDialogProps) {
    useEffect(() => {
        if (!open || disableEscape) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onCancel, disableEscape]);

    if (!open) return null;

    const variantConfig: Record<
        VariantTypes,
        {
            icon: ReactNode;
            bg: string;
            text: string;
            gradient: string;
        }
    > = {
        info: {
            icon: <HiOutlineInformationCircle />,
            bg: "bg-blue-100",
            text: "text-blue-600",
            gradient:
                "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.45)_0%,rgba(59,130,246,0.25)_35%,transparent_70%)]",
        },
        warning: {
            icon: <HiOutlineExclamationTriangle />,
            bg: "bg-amber-100",
            text: "text-amber-600",
            gradient:
                "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.45)_0%,rgba(245,158,11,0.25)_35%,transparent_70%)]",
        },
        danger: {
            icon: <HiOutlineShieldExclamation />,
            bg: "bg-red-100",
            text: "text-red-600",
            gradient:
                "bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.45)_0%,rgba(239,68,68,0.25)_35%,transparent_70%)]",
        },
        success: {
            icon: <HiOutlineInformationCircle />,
            bg: "bg-blue-100",
            text: "text-blue-600",
            gradient:
                "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.45)_0%,rgba(59,130,246,0.25)_35%,transparent_70%)]",
        },
    };

    const selectedVariant = variantConfig[variant];
    const resolvedIcon = icon ?? selectedVariant.icon;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

            <div className="relative z-10 w-[420px] max-w-[95%] animate-scaleIn overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
                <div
                    className={`pointer-events-none absolute inset-0 ${selectedVariant.gradient}`}
                />

                <div className="relative p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full 
                            ${selectedVariant.bg} ${selectedVariant.text}
                            [&>svg]:h-8 [&>svg]:w-8`}
                        >
                            {photoUrl ? (
                                <div className="h-full w-full">
                                    <Image
                                        src={photoUrl}
                                        alt="pet"
                                        width={56}
                                        height={56}
                                        sizes="56px"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                resolvedIcon
                            )}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {title}
                            </h2>

                            {description && (
                                <div className="mt-1 text-sm text-slate-600">
                                    {description}
                                </div>
                            )}
                        </div>
                    </div>

                    {(showCancelButton || showAcceptButton) && (
                        <div className="mt-6 flex justify-end gap-3">
                            {showCancelButton && (
                                <GlobalButton
                                    variant="danger"
                                    size="md"
                                    onClick={onCancel}
                                >
                                    {cancelLabel}
                                </GlobalButton>
                            )}

                            {showAcceptButton && (
                                <GlobalButton
                                    variant="primary"
                                    size="md"
                                    onClick={onAccept}
                                >
                                    {acceptLabel}
                                </GlobalButton>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
