// src/shared/auth/logoutButton.tsx

"use client";

import {useState} from "react";

import {logout} from "@/shared/auth/authService";

export default function LogoutButton() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        await logout();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
    );
}
