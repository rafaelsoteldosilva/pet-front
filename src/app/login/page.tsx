// src/app/login/page.tsx

"use client";

import {FormEvent, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {FiEye, FiEyeOff} from "react-icons/fi";

import {
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    InputAdornment,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import {login} from "@/shared/auth/authService";
import GlobalButton from "@/shared/ui/globalButton";

type UserCenterOption = {
    id: number;
    name: string;
    role?: string | null;
};

type GetRegisteredCentersForLoginRequest = {
    email: string;
    password: string;
};

async function getRegisteredCentersForLogin({
    email,
    password,
}: GetRegisteredCentersForLoginRequest): Promise<UserCenterOption[]> {
    void email;
    void password;

    return [
        {
            id: 1,
            name: "Clínica Veterinaria San Rafael",
            role: "VETERINARIAN",
        },
    ];
}

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [isCheckingUserCenters, setIsCheckingUserCenters] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [openCenterDialog, setOpenCenterDialog] = useState(false);
    const [registeredCenters, setRegisteredCenters] = useState<
        UserCenterOption[]
    >([]);
    const [selectedCenterId, setSelectedCenterId] = useState("");
    const [centerDialogErrorMessage, setCenterDialogErrorMessage] = useState<
        string | null
    >(null);

    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerShowPassword, setRegisterShowPassword] = useState(false);
    const [registerMessage, setRegisterMessage] = useState<string | null>(null);
    const [registerErrorMessage, setRegisterErrorMessage] = useState<
        string | null
    >(null);
    const [isRegisterValidated, setIsRegisterValidated] = useState(false);

    const trimmedEmail = email.trim();
    const hasLoginValues = trimmedEmail !== "" && password.trim() !== "";

    const isMainActionDisabled =
        !hasLoginValues || isCheckingUserCenters || isLoggingIn;

    const isRegisterDialogActionDisabled =
        registerEmail.trim() === "" || registerPassword.trim() === "";

    const blurredDialogBackdropSlotProps = {
        backdrop: {
            sx: {
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                backgroundColor: "rgba(15, 23, 42, 0.42)",
            },
        },
    };

    const selectedCenter = useMemo(() => {
        const parsedSelectedCenterId = Number(selectedCenterId);

        if (!Number.isInteger(parsedSelectedCenterId)) {
            return null;
        }

        return (
            registeredCenters.find(
                (center) => center.id === parsedSelectedCenterId,
            ) ?? null
        );
    }, [registeredCenters, selectedCenterId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await handleCheckUserAndOpenCenterDialog();
    }

    async function handleCheckUserAndOpenCenterDialog() {
        if (isMainActionDisabled) {
            return;
        }

        setErrorMessage(null);
        setCenterDialogErrorMessage(null);
        setIsCheckingUserCenters(true);

        try {
            const centers = await getRegisteredCentersForLogin({
                email: trimmedEmail,
                password,
            });

            if (centers.length === 0) {
                setErrorMessage(
                    "El usuario no está registrado en ningún centro veterinario.",
                );
                return;
            }

            setRegisteredCenters(centers);
            setSelectedCenterId(String(centers[0].id));
            setOpenCenterDialog(true);
        } catch {
            setErrorMessage(
                "No se pudo verificar el usuario. Intenta nuevamente.",
            );
        } finally {
            setIsCheckingUserCenters(false);
        }
    }

    async function handleLoginWithSelectedCenter() {
        if (!selectedCenter) {
            setCenterDialogErrorMessage(
                "Debes seleccionar un centro veterinario.",
            );
            return;
        }

        setCenterDialogErrorMessage(null);
        setIsLoggingIn(true);

        try {
            await login({
                email: trimmedEmail,
                password,
                veterinary_center_id: selectedCenter.id,
            });

            router.replace("/inicio");
        } catch {
            setCenterDialogErrorMessage(
                "Usuario, contraseña o centro veterinario inválido.",
            );
        } finally {
            setIsLoggingIn(false);
        }
    }

    function handleCenterDialogCloseRequest(
        _event: object,
        reason: "backdropClick" | "escapeKeyDown",
    ) {
        if (reason === "backdropClick") {
            return;
        }

        handleCloseCenterDialog();
    }

    function handleRegisterDialogCloseRequest(
        _event: object,
        reason: "backdropClick" | "escapeKeyDown",
    ) {
        if (reason === "backdropClick") {
            return;
        }

        handleCloseRegisterDialog();
    }

    function handleOpenRegisterDialog() {
        if (isMainActionDisabled) {
            return;
        }

        setRegisterEmail(trimmedEmail);
        setRegisterPassword(password);
        setRegisterShowPassword(false);
        setRegisterMessage(null);
        setRegisterErrorMessage(null);
        setIsRegisterValidated(false);
        setOpenRegisterDialog(true);
    }

    function handleValidateRegisterUser() {
        if (isRegisterDialogActionDisabled) {
            setRegisterErrorMessage(
                "Debes indicar correo electrónico y contraseña.",
            );
            return;
        }

        setRegisterErrorMessage(null);

        if (isRegisterValidated) {
            setRegisterMessage("El usuario ya fue validado.");
            return;
        }

        setIsRegisterValidated(true);
        setRegisterMessage("Usuario validado correctamente.");
    }

    function handleRegisterInCenter() {
        return;
    }

    function handleCloseCenterDialog() {
        if (isLoggingIn) {
            return;
        }

        setOpenCenterDialog(false);
        setCenterDialogErrorMessage(null);
    }

    function handleCloseRegisterDialog() {
        setOpenRegisterDialog(false);
        setRegisterMessage(null);
        setRegisterErrorMessage(null);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.28),transparent_35%)]" />

            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[24px] border border-white/20 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.45)]"
            >
                <header className="bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-5">
                    <h1 className="text-2xl font-bold text-white">
                        Iniciar sesión
                    </h1>

                    <p className="mt-1 text-sm font-medium text-sky-50">
                        Ingresa a Pet Control con tu correo y contraseña.
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-6 bg-white p-6 md:grid-cols-[240px_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                        <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-3xl font-black text-white shadow-md">
                                PC
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-slate-900">
                                Pet Control
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Gestión clínica veterinaria para centros,
                                pacientes y contactos.
                            </p>

                            <div className="mt-5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                Acceso seguro
                            </div>
                        </div>
                    </aside>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="mb-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                                Credenciales de acceso
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Usa tu correo electrónico y contraseña.
                                Seleccionarás el centro después.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-slate-700">
                                    Correo electrónico
                                </span>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    autoComplete="email"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-slate-700">
                                    Contraseña
                                </span>

                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        autoComplete="current-password"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-14 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (currentValue) => !currentValue,
                                            )
                                        }
                                        onMouseDown={(event) =>
                                            event.preventDefault()
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        title={
                                            showPassword
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff
                                                aria-hidden="true"
                                                className="h-5 w-5"
                                            />
                                        ) : (
                                            <FiEye
                                                aria-hidden="true"
                                                className="h-5 w-5"
                                            />
                                        )}
                                    </button>
                                </div>
                            </label>

                            {errorMessage ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                                    {errorMessage}
                                </div>
                            ) : null}
                        </div>
                    </section>
                </section>

                <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                    <GlobalButton
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={handleOpenRegisterDialog}
                        disabled={isMainActionDisabled}
                    >
                        Registrarse
                    </GlobalButton>

                    <GlobalButton
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isCheckingUserCenters}
                        loadingText="Verificando..."
                        disabled={isMainActionDisabled}
                    >
                        Entrar
                    </GlobalButton>
                </footer>
            </form>

            <Dialog
                open={openCenterDialog}
                onClose={handleCenterDialogCloseRequest}
                fullWidth={false}
                maxWidth={false}
                slotProps={blurredDialogBackdropSlotProps}
                PaperProps={{
                    sx: {
                        width: "min(520px, calc(100vw - 32px))",
                        borderRadius: "24px",
                        overflow: "hidden",
                    },
                }}
            >
                <header className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">
                        Seleccionar Centro
                    </h2>
                </header>

                <DialogContent className="bg-white p-0">
                    <section className="min-h-[140px] px-6 py-6">
                        <div className="max-w-xl">
                            <p className="mb-2 text-sm font-semibold text-slate-600">
                                Centro veterinario
                            </p>

                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={selectedCenterId}
                                onChange={(event) =>
                                    setSelectedCenterId(event.target.value)
                                }
                                disabled={isLoggingIn}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "white",
                                    },
                                }}
                            >
                                {registeredCenters.map((center) => (
                                    <MenuItem
                                        key={center.id}
                                        value={String(center.id)}
                                    >
                                        {center.name}
                                        {center.role ? ` · ${center.role}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {centerDialogErrorMessage ? (
                                <div className="mt-4">
                                    <Alert severity="error">
                                        {centerDialogErrorMessage}
                                    </Alert>
                                </div>
                            ) : null}
                        </div>
                    </section>
                </DialogContent>

                <DialogActions
                    className="border-t border-slate-200 bg-white"
                    sx={{
                        px: 3,
                        py: 2.5,
                        gap: 1.5,
                        justifyContent: "flex-end",
                    }}
                >
                    <GlobalButton
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleLoginWithSelectedCenter}
                        isLoading={isLoggingIn}
                        loadingText="Ingresando..."
                        disabled={isLoggingIn || !selectedCenter}
                    >
                        OK
                    </GlobalButton>

                    <GlobalButton
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleCloseCenterDialog}
                        disabled={isLoggingIn}
                        className="!bg-red-600 hover:!bg-red-700"
                    >
                        Cancelar
                    </GlobalButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openCenterDialog}
                onClose={handleCenterDialogCloseRequest}
                fullWidth={false}
                maxWidth={false}
                slotProps={blurredDialogBackdropSlotProps}
                PaperProps={{
                    sx: {
                        width: "min(560px, calc(100vw - 32px))",
                        borderRadius: "24px",
                        overflow: "hidden",
                    },
                }}
            >
                <header className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">
                        Seleccionar Centro
                    </h2>
                </header>

                <DialogContent className="bg-white p-0">
                    <section className="px-6 py-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Centro veterinario
                                    </p>

                                    <p className="mt-3 text-sm font-semibold text-slate-800">
                                        Centro activo
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Selecciona el centro veterinario donde
                                        quieres trabajar.
                                    </p>
                                </div>

                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={selectedCenterId}
                                    onChange={(event) =>
                                        setSelectedCenterId(event.target.value)
                                    }
                                    disabled={isLoggingIn}
                                    sx={{
                                        maxWidth: "430px",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: "white",
                                            boxShadow:
                                                "0 1px 3px rgba(15, 23, 42, 0.08)",
                                        },
                                    }}
                                >
                                    {registeredCenters.map((center) => (
                                        <MenuItem
                                            key={center.id}
                                            value={String(center.id)}
                                        >
                                            {center.name}
                                            {center.role
                                                ? ` · ${center.role}`
                                                : ""}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                {centerDialogErrorMessage ? (
                                    <Alert severity="error">
                                        {centerDialogErrorMessage}
                                    </Alert>
                                ) : null}
                            </div>
                        </div>
                    </section>
                </DialogContent>

                <DialogActions
                    className="border-t border-slate-200 bg-white"
                    sx={{
                        px: 3,
                        py: 2.5,
                        gap: 1.5,
                        justifyContent: "flex-end",
                    }}
                >
                    <GlobalButton
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleLoginWithSelectedCenter}
                        isLoading={isLoggingIn}
                        loadingText="Ingresando..."
                        disabled={isLoggingIn || !selectedCenter}
                    >
                        OK
                    </GlobalButton>

                    <GlobalButton
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleCloseCenterDialog}
                        disabled={isLoggingIn}
                        className="!bg-red-600 hover:!bg-red-700"
                    >
                        Cancelar
                    </GlobalButton>
                </DialogActions>
            </Dialog>
        </main>
    );
}
