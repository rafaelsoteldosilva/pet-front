// src/app/(drawer)/paciente/layout.tsx

"use client";

export default function PacienteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-auto">
                {children}
            </div>
        </div>
    );
}
