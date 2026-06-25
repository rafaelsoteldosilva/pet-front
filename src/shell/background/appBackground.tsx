// src/shell/background/appBackground.ts

"use client";

type BackgroundVariant = "dashboard" | "patients" | "clinical" | "admin";

export default function AppBackground({
    variant = "dashboard",
}: {
    variant?: BackgroundVariant;
}) {
    if (variant === "patients") {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#e0e7ff]" />

                {/* MAIN FLOW CURVE */}
                <svg
                    className="absolute top-0 left-0 h-[620px] w-[1000px] -translate-x-24 -translate-y-20"
                    viewBox="0 0 1000 600"
                    fill="none"
                >
                    <path
                        d="
                        M0 120
                        C260 220 420 360 620 420
                        C760 460 880 480 1000 520
                        V0
                        H0
                        Z
                    "
                        fill="#bfdbfe"
                        fillOpacity="0.45"
                    />
                </svg>

                {/* SECONDARY DEPTH */}
                <svg
                    className="absolute bottom-0 right-0 h-[500px] w-[900px] translate-x-24 translate-y-24"
                    viewBox="0 0 900 600"
                    fill="none"
                >
                    <path
                        d="
                        M900 600
                        C640 520 520 420 380 300
                        C260 180 120 100 0 60
                        V600
                        H900
                        Z
                    "
                        fill="#93c5fd"
                        fillOpacity="0.28"
                    />
                </svg>
            </div>
        );
    }

    if (variant === "clinical") {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#eef2f7] to-[#e5e7eb]" />

                <svg
                    className="absolute top-0 right-0 h-[520px] w-[900px] translate-x-12 -translate-y-16"
                    viewBox="0 0 900 600"
                    fill="none"
                >
                    <path
                        d="M900 0 C600 140 520 260 420 340 C320 420 180 480 0 540 H900 V0 Z"
                        fill="#cbd5e1"
                        fillOpacity="0.35"
                    />
                </svg>
            </div>
        );
    }

    if (variant === "admin") {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f1f5f9] via-[#e5e7eb] to-[#e2e8f0]" />

                <svg
                    className="absolute bottom-0 right-0 h-[500px] w-[800px] translate-x-16 translate-y-16"
                    viewBox="0 0 900 600"
                    fill="none"
                >
                    <path
                        d="M900 600 L400 600 C520 420 620 280 900 120 V600 Z"
                        fill="#c7d2fe"
                        fillOpacity="0.25"
                    />
                </svg>
            </div>
        );
    }

    // DEFAULT: dashboard
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#dbeafe]" />

            <svg
                className="absolute top-0 right-0 h-[600px] w-[900px] translate-x-8 -translate-y-8"
                viewBox="0 0 900 600"
                fill="none"
            >
                <path
                    d="M900 0C700 120 620 260 520 360C420 460 300 520 0 600H900V0Z"
                    fill="#a5b4fc"
                    fillOpacity="0.55"
                />
            </svg>

            <svg
                className="absolute bottom-0 left-0 h-[600px] w-[900px] -translate-x-6 translate-y-6"
                viewBox="0 0 900 600"
                fill="none"
            >
                <path
                    d="M0 600C220 520 320 420 420 300C520 180 650 80 900 0H0V600Z"
                    fill="#93c5fd"
                    fillOpacity="0.45"
                />
            </svg>

            <div className="absolute inset-0  opacity-[0.05] mix-blend-overlay" />
        </div>
    );
}
