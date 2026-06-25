// src/app/(drawer)/inicio/page.tsx

"use client";

import React, {useEffect} from "react";
import {
    HiOutlineExclamation,
    HiOutlineClipboardList,
    HiOutlineHeart,
} from "react-icons/hi";
import {FaSyringe} from "react-icons/fa";
import {useSidebarContext} from "@/hooks/shell/useSidebarContext";

export default function HomePage() {
    const {setMenuWithMenuId} = useSidebarContext();

    useEffect(() => {
        setMenuWithMenuId({
            MenuId: "inicio",
        });
    }, []);

    return (
        <div className="space-y-4">
            {/* KPI CARDS */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    variant="danger"
                    title="Casos críticos"
                    value="3"
                    icon={<HiOutlineHeart className="h-5 w-5" />}
                />
                <KpiCard
                    title="Alertas clínicas"
                    value="5"
                    icon={<HiOutlineExclamation className="h-5 w-5" />}
                />
                <KpiCard
                    title="Vacunas pendientes"
                    value="23"
                    icon={<FaSyringe className="h-5 w-5" />}
                />
                <KpiCard
                    title="Consultas hoy"
                    value="14"
                    icon={<HiOutlineClipboardList className="h-5 w-5" />}
                />
            </section>

            {/* MAIN GRID */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ACTIVIDAD */}
                <CompactCard title="Actividad reciente" action="Ver todo">
                    <ActivityRow
                        time="10:32"
                        title="Nueva consulta"
                        subtitle="Max (Canino)"
                    />
                    <ActivityRow
                        time="10:10"
                        title="Vacuna aplicada"
                        subtitle="Luna"
                    />
                    <ActivityRow
                        time="09:40"
                        title="Recordatorio generado"
                        subtitle="Rocky"
                    />
                </CompactCard>

                {/* CASOS CRÍTICOS */}
                <CompactCard title="Casos críticos" action="Ver todos">
                    <PatientRow
                        name="Max (Canino)"
                        description="Emergencia · trauma severo"
                        status="Hospitalizado"
                        statusVariant="danger"
                    />
                    <PatientRow
                        name="Luna (Felino)"
                        description="Insuficiencia renal"
                        status="Observación"
                        statusVariant="warning"
                    />
                    <PatientRow
                        name="Rocky (Canino)"
                        description="Convulsiones"
                        status="Seguimiento"
                        statusVariant="success"
                    />
                </CompactCard>
            </section>

            {/* TABLES */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CompactTable
                    title="Próximas tareas"
                    headers={["Paciente", "Tipo", "Fecha"]}
                    rows={[
                        ["Luna", "Desparasitación", "Mañana"],
                        ["Rocky", "Control", "26 Abr"],
                        ["Max", "Vacunación", "26 Abr"],
                    ]}
                />

                <CompactTable
                    title="Estado tareas"
                    headers={["Paciente", "Estado"]}
                    rows={[
                        ["Luna", <Badge key="luna" label="Pendiente" />],
                        [
                            "Rocky",
                            <Badge
                                key="rocky"
                                label="Atrasada"
                                variant="danger"
                            />,
                        ],
                        [
                            "Max",
                            <Badge
                                key="max"
                                label="Atrasada"
                                variant="danger"
                            />,
                        ],
                    ]}
                />
            </section>
        </div>
    );
}

/* =========================
   COMPACT UI COMPONENTS
   ========================= */

function KpiCard({
    title,
    value,
    icon,
    variant,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    variant?: "danger";
}) {
    const isDanger = variant === "danger";

    return (
        <div
            className={[
                "relative overflow-hidden rounded-xl p-4 ring-1",
                isDanger
                    ? "bg-gradient-to-br from-red-600 to-red-400 text-white ring-red-300 shadow-md"
                    : "bg-green-300 text-slate-900 ring-slate-200 shadow-sm",
            ].join(" ")}
        >
            {isDanger && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            )}

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    {/* SOLO CAMBIO VISUAL: color del título */}
                    <p
                        className={[
                            "text-sm font-medium",
                            isDanger ? "text-white/90" : "text-slate-600",
                        ].join(" ")}
                    >
                        {title}
                    </p>

                    <p className="text-2xl font-semibold">{value}</p>
                </div>

                <div className="rounded-lg bg-white/15 p-2">{icon}</div>
            </div>
        </div>
    );
}

function CompactCard({
    title,
    action,
    children,
}: {
    title: string;
    action?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b px-4 py-1.5">
                <h2 className="text-sm font-semibold text-slate-700">
                    {title}
                </h2>
                {action && (
                    <button className="text-xs text-indigo-600 hover:underline">
                        {action}
                    </button>
                )}
            </div>
            <div className="divide-y">{children}</div>
        </div>
    );
}

function ActivityRow({
    time,
    title,
    subtitle,
}: {
    time: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex gap-3 px-4 py-1.5 text-sm">
            <span className="w-12 text-slate-400">{time}</span>
            <div>
                <p className="font-medium text-slate-700">{title}</p>
                <p className="text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
}

function PatientRow({
    name,
    description,
    status,
    statusVariant,
}: {
    name: string;
    description: string;
    status: string;
    statusVariant: "danger" | "warning" | "success";
}) {
    return (
        <div className="flex items-center justify-between px-4 py-2 text-sm">
            <div>
                <p className="font-medium text-slate-700">{name}</p>
                <p className="text-slate-400">{description}</p>
            </div>
            <Badge label={status} variant={statusVariant} />
        </div>
    );
}

function Badge({
    label,
    variant = "default",
}: {
    label: string;
    variant?: "default" | "danger" | "warning" | "success";
}) {
    const map = {
        default: "bg-slate-100 text-slate-700",
        danger: "bg-red-100 text-red-700",
        warning: "bg-amber-100 text-amber-700",
        success: "bg-emerald-100 text-emerald-700",
    }[variant];

    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map}`}>
            {label}
        </span>
    );
}

function CompactTable({
    title,
    headers,
    rows,
}: {
    title: string;
    headers: string[];
    rows: React.ReactNode[][];
}) {
    return (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b px-4 py-2 text-sm font-semibold text-slate-700">
                {title}
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        {headers.map((h) => (
                            <th
                                key={h}
                                className="border-b px-4 py-1 text-left font-medium text-slate-400"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
