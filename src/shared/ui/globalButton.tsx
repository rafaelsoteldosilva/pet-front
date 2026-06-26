// src/shared/ui/globalButton.tsx

"use client";

import type {ButtonHTMLAttributes, MouseEventHandler, ReactNode} from "react";

import clsx from "clsx";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "danger"
    | "softDanger"
    | "ghost"
    | "outline";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

interface GlobalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isIcon?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export default function GlobalButton({
    children,
    variant = "primary",
    size = "md",
    isIcon = false,
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    className,
    disabled = false,
    type = "button",
    onClick,
    ...props
}: GlobalButtonProps) {
    const isDisabled = Boolean(disabled || isLoading);

    /* ======================================================
       Effects
    ====================================================== */

    const hoverEffect =
        "hover:brightness-125 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]";

    const activeEffect =
        "active:brightness-95 active:translate-y-[1px] active:scale-[0.98] active:shadow-inner";

    const focusEffect =
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2";

    /* ======================================================
       Variants
    ====================================================== */

    const variantClasses =
        variant === "primary"
            ? clsx("bg-blue-600 text-white", hoverEffect, activeEffect)
            : variant === "secondary"
              ? clsx(
                    "border border-slate-300 bg-green-400 text-slate-800",
                    hoverEffect,
                    activeEffect,
                )
              : variant === "danger"
                ? clsx("bg-red-600 text-white", hoverEffect, activeEffect)
                : variant === "softDanger"
                  ? clsx(
                        "border border-red-200 bg-red-50 text-red-700",
                        "hover:bg-red-100 hover:text-red-800",
                        hoverEffect,
                        activeEffect,
                    )
                  : variant === "outline"
                    ? clsx(
                          "border border-slate-300 bg-white text-slate-700",
                          hoverEffect,
                          activeEffect,
                      )
                    : clsx(
                          "bg-transparent text-slate-600 hover:bg-slate-100",
                          hoverEffect,
                          activeEffect,
                      );

    /* ======================================================
       Disabled
    ====================================================== */

    const disabledClasses =
        "cursor-not-allowed bg-gray-300 text-gray-500 shadow-none hover:translate-y-0 hover:brightness-100 hover:shadow-none active:translate-y-0 active:scale-100 active:shadow-none";

    /* ======================================================
       Sizes
    ====================================================== */

    const sizeClasses =
        size === "xs"
            ? "px-2 py-1 text-xs"
            : size === "sm"
              ? "px-3 py-1 text-sm"
              : size === "lg"
                ? "px-6 py-3 text-lg"
                : size === "icon"
                  ? "h-8 w-8 p-0"
                  : "px-5 py-2 text-base";

    /* ======================================================
       Base
    ====================================================== */

    const baseClasses =
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 ease-out shadow-[0_4px_12px_rgba(0,0,0,0.15)]";

    const iconSizeClasses = "h-8 w-8 p-0";

    const finalClasses = clsx(
        baseClasses,
        focusEffect,
        isIcon ? iconSizeClasses : sizeClasses,
        isDisabled ? disabledClasses : variantClasses,
        className,
    );

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        if (isDisabled) {
            event.preventDefault();
            return;
        }

        onClick?.(event);
    };

    return (
        <button
            {...props}
            type={type}
            disabled={isDisabled}
            aria-busy={isLoading || undefined}
            onClick={handleClick}
            className={finalClasses}
        >
            {isLoading ? (
                <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
            ) : (
                leftIcon
            )}

            {!isIcon ? (
                <span>{isLoading && loadingText ? loadingText : children}</span>
            ) : null}

            {!isLoading ? rightIcon : null}
        </button>
    );
}
