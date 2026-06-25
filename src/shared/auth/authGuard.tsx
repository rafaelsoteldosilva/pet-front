// src/shared/auth/authGuard.tsx

"use client";

import {ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";

import {getMeApi} from "@/api/authApi";
import {
    clearAuthStorage,
    getAccessToken,
    getRefreshToken,
} from "@/shared/auth/authStorage";

type AuthGuardProps = {
    children: ReactNode;
};

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export default function AuthGuard({children}: AuthGuardProps) {
    const router = useRouter();
    const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

    useEffect(() => {
        let isMounted = true;

        async function checkAuthentication(): Promise<void> {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            if (!accessToken && !refreshToken) {
                clearAuthStorage();

                if (isMounted) {
                    setAuthStatus("unauthenticated");
                    router.replace("/login");
                }

                return;
            }

            try {
                await getMeApi();

                if (isMounted) {
                    setAuthStatus("authenticated");
                }
            } catch {
                clearAuthStorage();

                if (isMounted) {
                    setAuthStatus("unauthenticated");
                    router.replace("/login");
                }
            }
        }

        void checkAuthentication();

        return () => {
            isMounted = false;
        };
    }, [router]);

    if (authStatus === "checking") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Verificando sesión...</p>
            </div>
        );
    }

    if (authStatus === "unauthenticated") {
        return null;
    }

    return <>{children}</>;
}
