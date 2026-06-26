// src/shared/auth/logoutButton.tsx

"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {FiPower} from "react-icons/fi";

import GlobalButton from "@/shared/ui/globalButton";
import {logout} from "@/shared/auth/authService";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            await Promise.resolve(logout());

            router.replace("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <GlobalButton
            type="button"
            variant="softDanger"
            size="sm"
            isLoading={isLoggingOut}
            loadingText="Cerrando..."
            leftIcon={<FiPower className="h-4 w-4" aria-hidden="true" />}
            onClick={handleLogout}
            className="whitespace-nowrap"
            title="Cerrar Sesión"
            aria-label="Cerrar Sesión"
        >
            Cerrar Sesión
        </GlobalButton>
    );
}
