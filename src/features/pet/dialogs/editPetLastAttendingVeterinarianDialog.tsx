// src/features/pet/dialogs/editPetLastAttendingVeterinarianDialog.tsx

"use client";

import {useEffect, useMemo, useState} from "react";

import {
    Alert,
    Autocomplete,
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {updatePetDataApi} from "@/api/pet/updatePetDataApi";
import {getAxiosErrorMessage} from "@/api/shared/getAxiosErrorMessage";

import PetIdentityPanel from "@/features/pet/components/petIdentityPanel";

import GlobalButton from "@/shared/ui/globalButton";

import type {PetDataInterface} from "@/features/pet/types/petTypes";

type VeterinarianOption = {
    id: number;
    name?: string | null;
    display_name?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
};

type EditPetLastAttendingVeterinarianDialogProps = {
    open: boolean;
    centerId: number;
    pet: PetDataInterface;
    veterinarianOptions: VeterinarianOption[];
    isLoadingVeterinarians?: boolean;
    veterinarianLoadError?: string | null;
    onClose: () => void;
    onSaved: (updatedPet: PetDataInterface) => void;
};

function getVeterinarianLabel(veterinarian: VeterinarianOption): string {
    const name = veterinarian.name?.trim();

    if (name) {
        return name;
    }

    const displayName = veterinarian.display_name?.trim();

    if (displayName) {
        return displayName;
    }

    const fullName = veterinarian.full_name?.trim();

    if (fullName) {
        return fullName;
    }

    const firstName = veterinarian.first_name?.trim() ?? "";
    const lastName = veterinarian.last_name?.trim() ?? "";
    const composedName = `${firstName} ${lastName}`.trim();

    if (composedName) {
        return composedName;
    }

    const email = veterinarian.email?.trim();

    if (email) {
        return email;
    }

    return `Veterinario #${veterinarian.id}`;
}

export default function EditPetLastAttendingVeterinarianDialog({
    open,
    centerId,
    pet,
    veterinarianOptions,
    isLoadingVeterinarians = false,
    veterinarianLoadError = null,
    onClose,
    onSaved,
}: EditPetLastAttendingVeterinarianDialogProps) {
    const currentVeterinarian: VeterinarianOption | null =
        pet.last_attending_vet ?? null;

    const options = useMemo<VeterinarianOption[]>(() => {
        if (!currentVeterinarian) {
            return veterinarianOptions;
        }

        const currentVeterinarianAlreadyExists = veterinarianOptions.some(
            (option) => option.id === currentVeterinarian.id,
        );

        if (currentVeterinarianAlreadyExists) {
            return veterinarianOptions;
        }

        return [currentVeterinarian, ...veterinarianOptions];
    }, [currentVeterinarian, veterinarianOptions]);

    const [selectedVeterinarian, setSelectedVeterinarian] =
        useState<VeterinarianOption | null>(currentVeterinarian);

    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const currentVeterinarianId = currentVeterinarian?.id ?? null;
    const selectedVeterinarianId = selectedVeterinarian?.id ?? null;

    const hasVeterinarianChanged =
        currentVeterinarianId !== selectedVeterinarianId;

    const isSaveDisabled = isSaving || !hasVeterinarianChanged;

    useEffect(() => {
        if (!open) {
            return;
        }

        setSelectedVeterinarian(currentVeterinarian);
        setIsSaving(false);
        setErrorMessage(null);
    }, [open, currentVeterinarian]);

    function handleClose() {
        if (isSaving) {
            return;
        }

        setErrorMessage(null);
        onClose();
    }

    async function handleSave() {
        if (isSaving || !hasVeterinarianChanged) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const updatedPet = await updatePetDataApi({
                centerId,
                petId: pet.id,
                data: {
                    last_attending_vet_id: selectedVeterinarianId,
                },
            });

            onSaved(updatedPet);
            onClose();
        } catch (error) {
            setErrorMessage(getAxiosErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: "24px",
                    overflow: "hidden",
                },
            }}
        >
            <Box className="bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-5">
                <Typography
                    component="h2"
                    className="text-2xl font-bold text-white"
                >
                    Editar veterinario tratante
                </Typography>
            </Box>

            <DialogContent className="bg-white p-0">
                <Box className="grid min-h-[315px] grid-cols-1 gap-6 p-6 md:grid-cols-[240px_minmax(0,1fr)]">
                    <aside>
                        <PetIdentityPanel pet={pet} />
                    </aside>

                    <section>
                        <Box className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography className="text-sm font-bold uppercase tracking-wide text-slate-600">
                                        Veterinario tratante
                                    </Typography>

                                    <Typography className="mt-3 text-sm font-semibold text-slate-800">
                                        Veterinario tratante anterior
                                    </Typography>

                                    <Typography className="mt-1 text-sm text-slate-500">
                                        Selecciona el veterinario responsable o
                                        deja la mascota sin veterinario
                                        asignado.
                                    </Typography>
                                </Box>

                                {veterinarianLoadError ? (
                                    <Alert severity="warning">
                                        {veterinarianLoadError}
                                    </Alert>
                                ) : null}

                                {errorMessage ? (
                                    <Alert severity="error">
                                        {errorMessage}
                                    </Alert>
                                ) : null}

                                <Autocomplete<
                                    VeterinarianOption,
                                    false,
                                    false,
                                    false
                                >
                                    value={selectedVeterinarian}
                                    options={options}
                                    loading={isLoadingVeterinarians}
                                    disabled={isSaving}
                                    openOnFocus
                                    onChange={(_, value) => {
                                        setSelectedVeterinarian(value);
                                    }}
                                    getOptionLabel={getVeterinarianLabel}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    noOptionsText="No hay veterinarios disponibles"
                                    loadingText="Cargando veterinarios..."
                                    clearText="Quitar selección"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Veterinario tratante"
                                            placeholder="Selecciona un veterinario"
                                        />
                                    )}
                                />
                            </Stack>
                        </Box>
                    </section>
                </Box>
            </DialogContent>

            <DialogActions
                className="border-t border-slate-200 bg-white"
                sx={{
                    px: 3,
                    py: 2,
                    gap: 1.5,
                    justifyContent: "flex-end",
                }}
            >
                <GlobalButton
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleClose}
                    disabled={isSaving}
                >
                    Cancelar
                </GlobalButton>

                <GlobalButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className="gap-2"
                >
                    {isSaving ? (
                        <CircularProgress size={18} color="inherit" />
                    ) : null}
                    Guardar
                </GlobalButton>
            </DialogActions>
        </Dialog>
    );
}
