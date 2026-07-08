// src/features/pet/dialogs/addNewPetDialog.tsx

"use client";

import {useEffect, type ReactNode, useMemo} from "react";
import {useFormContext, useWatch} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import FormCard from "@/shared/ui/forms/formCard";
import FormDialog from "@/shared/ui/forms/formDialog";

/* ======================================================
   SCHEMA
   ====================================================== */

const addNewPetSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "El nombre debe tener al menos 2 caracteres."),

        sex: z.enum(["m", "f", "u"], {
            message: "El sexo es obligatorio.",
        }),

        species_id: z.string().min(1, "La especie es obligatoria."),
        breed_id: z.string(),

        sterilized: z.boolean(),

        birth_date: z.string(),

        body_description: z.string(),
        size: z.string(),
        last_weight: z.string(),

        last_attending_vet_id: z.string(),

        reference: z.string(),

        has_pedigree: z.boolean(),
        pedigree_registry: z.string(),

        has_visual_identification: z.boolean(),
        visual_tag: z.string(),
        visual_identification_or_tattoo_description: z.string(),

        has_microchip: z.boolean(),
        microchip_code: z.string(),
        microchip_date: z.string(),
        microchip_body_region: z.string(),

        clinical_observations: z.string(),
        internal_notes: z.string(),

        photo_url: z.string(),
    })
    .superRefine((data, ctx) => {
        const birthDateError = validateDateNotFuture(
            data.birth_date,
            "La fecha de nacimiento",
        );

        if (birthDateError) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["birth_date"],
                message: birthDateError,
            });
        }

        const lastWeight = data.last_weight.trim();

        if (lastWeight && Number.isNaN(Number(lastWeight))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["last_weight"],
                message: "El peso debe ser un número válido.",
            });
        }

        if (lastWeight && Number(lastWeight) < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["last_weight"],
                message: "El peso no puede ser negativo.",
            });
        }

        if (data.has_pedigree && data.pedigree_registry.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pedigree_registry"],
                message: "Indica el registro de pedigrí.",
            });
        }

        if (!data.has_microchip) {
            return;
        }

        const microchipCode = data.microchip_code.trim();

        if (microchipCode === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_code"],
                message: "Indica el código de microchip.",
            });
        }

        if (microchipCode && !/^\d{15}$/.test(microchipCode)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_code"],
                message: "El microchip debe tener 15 dígitos.",
            });
        }

        const microchipDateError = validateDateNotFuture(
            data.microchip_date,
            "La fecha de implantación",
        );

        if (microchipDateError) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_date"],
                message: microchipDateError,
            });
        }
    });

/* ======================================================
   TYPES
   ====================================================== */

export type AddNewPetFormValues = z.infer<typeof addNewPetSchema>;

export type AddNewPetPayload = {
    name: string;
    sex: "m" | "f" | "u";

    species_id: number;
    breed_id: number | null;

    sterilized: boolean;
    birth_date: string | null;

    body_description: string | null;
    size: string | null;
    last_weight: number | null;

    last_attending_vet_id: number | null;

    reference: string | null;

    has_pedigree: boolean;
    pedigree_registry: string | null;

    has_visual_identification: boolean;
    visual_tag: string | null;
    visual_identification_or_tattoo_description: string | null;

    has_microchip: boolean;
    microchip_code: string | null;
    microchip_date: string | null;
    microchip_body_region: string | null;

    clinical_observations: string | null;
    internal_notes: string | null;

    photo_url: string | null;
};

export type NewPetBreedOption = {
    id: number;
    name: string;
};

export type NewPetSpeciesOption = {
    id: number;
    name: string;
    breeds: NewPetBreedOption[];
};

export type NewPetVeterinarianOption = {
    id: number;
    full_name: string;
};

type Props = {
    open: boolean;
    speciesOptions: NewPetSpeciesOption[];
    veterinarianOptions: NewPetVeterinarianOption[];
    saving?: boolean;
    onClose: () => void;
    onSave: (payload: AddNewPetPayload) => void | Promise<void>;
};

/* ======================================================
   DEFAULTS
   ====================================================== */

const defaultValues: AddNewPetFormValues = {
    name: "",
    sex: "u",

    species_id: "",
    breed_id: "",

    sterilized: false,

    birth_date: "",

    body_description: "",
    size: "",
    last_weight: "",

    last_attending_vet_id: "",

    reference: "",

    has_pedigree: false,
    pedigree_registry: "",

    has_visual_identification: false,
    visual_tag: "",
    visual_identification_or_tattoo_description: "",

    has_microchip: false,
    microchip_code: "",
    microchip_date: "",
    microchip_body_region: "",

    clinical_observations: "",
    internal_notes: "",

    photo_url: "",
};

/* ======================================================
   HELPERS
   ====================================================== */

function emptyToNull(value: string | undefined): string | null {
    const normalized = value?.trim() ?? "";
    return normalized ? normalized : null;
}

function stringIdToNumberOrNull(value: string | undefined): number | null {
    const normalized = value?.trim() ?? "";

    if (!normalized) {
        return null;
    }

    const parsedValue = Number(normalized);

    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    return parsedValue;
}

function stringNumberToNumberOrNull(value: string | undefined): number | null {
    const normalized = value?.trim() ?? "";

    if (!normalized) {
        return null;
    }

    const parsedValue = Number(normalized);

    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    return parsedValue;
}

function parseDateOnly(value: string): Date | null {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return null;
    }

    const parts = normalizedValue.split("-");

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return null;
    }

    if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function validateDateNotFuture(value: string, label: string): string | null {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return null;
    }

    const date = parseDateOnly(normalizedValue);

    if (!date) {
        return `${label} no es válida.`;
    }

    const today = new Date();
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    if (date > todayDateOnly) {
        return `${label} no puede ser futura.`;
    }

    return null;
}

function formatPetAgeFromBirthDate(birthDateValue: string): string {
    const birthDate = parseDateOnly(birthDateValue);

    if (!birthDate) {
        return "—";
    }

    const today = new Date();
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    if (birthDate > todayDateOnly) {
        return "—";
    }

    let years = todayDateOnly.getFullYear() - birthDate.getFullYear();
    let months = todayDateOnly.getMonth() - birthDate.getMonth();

    if (todayDateOnly.getDate() < birthDate.getDate()) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (years < 0) {
        return "—";
    }

    const yearsText = years > 0 ? `${years} año${years === 1 ? "" : "s"}` : "";
    const monthsText = `${months} mes${months === 1 ? "" : "es"}`;

    return yearsText ? `${yearsText} y ${monthsText}` : monthsText;
}

function normalizeBeforeSave(data: AddNewPetFormValues): AddNewPetPayload {
    const visualTag = emptyToNull(data.visual_tag);
    const visualIdentificationOrTattooDescription = emptyToNull(
        data.visual_identification_or_tattoo_description,
    );

    const hasVisualIdentification = Boolean(
        visualTag || visualIdentificationOrTattooDescription,
    );

    return {
        name: data.name.trim(),
        sex: data.sex,

        species_id: Number(data.species_id),
        breed_id: stringIdToNumberOrNull(data.breed_id),

        sterilized: data.sterilized,
        birth_date: emptyToNull(data.birth_date),

        body_description: emptyToNull(data.body_description),
        size: emptyToNull(data.size),
        last_weight: stringNumberToNumberOrNull(data.last_weight),

        last_attending_vet_id: stringIdToNumberOrNull(
            data.last_attending_vet_id,
        ),

        reference: emptyToNull(data.reference),

        has_pedigree: data.has_pedigree,
        pedigree_registry: data.has_pedigree
            ? emptyToNull(data.pedigree_registry)
            : null,

        has_visual_identification: hasVisualIdentification,
        visual_tag: visualTag,
        visual_identification_or_tattoo_description:
            visualIdentificationOrTattooDescription,

        has_microchip: data.has_microchip,
        microchip_code: data.has_microchip
            ? emptyToNull(data.microchip_code)
            : null,
        microchip_date: data.has_microchip
            ? emptyToNull(data.microchip_date)
            : null,
        microchip_body_region: data.has_microchip
            ? emptyToNull(data.microchip_body_region)
            : null,

        clinical_observations: emptyToNull(data.clinical_observations),
        internal_notes: emptyToNull(data.internal_notes),

        photo_url: emptyToNull(data.photo_url),
    };
}

/* ======================================================
   LOCAL FIELD COMPONENTS
   ====================================================== */

function FieldError({message}: {message?: string}) {
    if (!message) return null;

    return <p className="text-xs font-medium text-red-600">{message}</p>;
}

function FieldLabel({children}: {children: ReactNode}) {
    return (
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </label>
    );
}

type TextFieldName =
    | "name"
    | "body_description"
    | "last_weight"
    | "reference"
    | "pedigree_registry"
    | "visual_tag"
    | "visual_identification_or_tattoo_description"
    | "microchip_code"
    | "microchip_body_region"
    | "clinical_observations"
    | "internal_notes"
    | "photo_url";

type DateFieldName = "birth_date" | "microchip_date";

function TextInputSection({
    name,
    label,
    placeholder,
    type = "text",
    disabled = false,
    maxLength,
    step,
    min,
}: {
    name: TextFieldName;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "url";
    disabled?: boolean;
    maxLength?: number;
    step?: string;
    min?: number;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>{label}</FieldLabel>

            <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                step={step}
                min={min}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />

            <FieldError message={errors[name]?.message} />
        </div>
    );
}

function TextAreaSection({
    name,
    label,
    placeholder,
    rows = 3,
    disabled = false,
    maxLength,
}: {
    name: TextFieldName;
    label: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    maxLength?: number;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>{label}</FieldLabel>

            <textarea
                {...register(name)}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />

            <FieldError message={errors[name]?.message} />
        </div>
    );
}

function DateSection({
    name,
    label,
    disabled = false,
}: {
    name: DateFieldName;
    label: string;
    disabled?: boolean;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>{label}</FieldLabel>

            <input
                {...register(name)}
                type="date"
                disabled={disabled}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />

            <FieldError message={errors[name]?.message} />
        </div>
    );
}

function BooleanSection({
    name,
    label,
}: {
    name: "sterilized" | "has_pedigree" | "has_microchip";
    label: string;
}) {
    const {register} = useFormContext<AddNewPetFormValues>();

    return (
        <label className="flex h-full min-h-[42px] w-full cursor-pointer items-center justify-center gap-3">
            <input
                {...register(name)}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />

            <span className="text-sm font-semibold text-slate-700">
                {label}
            </span>
        </label>
    );
}

function SexSection() {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>Sexo</FieldLabel>

            <select
                {...register("sex")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
                <option value="u">Indefinido</option>
                <option value="m">Macho</option>
                <option value="f">Hembra</option>
            </select>

            <FieldError message={errors.sex?.message} />
        </div>
    );
}

function SizeSection() {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>Tamaño</FieldLabel>

            <select
                {...register("size")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
                <option value="">Sin especificar</option>
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
                <option value="xlarge">Gigante</option>
            </select>

            <FieldError message={errors.size?.message} />
        </div>
    );
}

function AgePreviewSection() {
    const {control} = useFormContext<AddNewPetFormValues>();

    const birthDate = useWatch({
        control,
        name: "birth_date",
    });

    return (
        <div className="space-y-2">
            <FieldLabel>Edad</FieldLabel>

            <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {formatPetAgeFromBirthDate(birthDate)}
            </div>
        </div>
    );
}

function SpeciesSection({
    speciesOptions,
}: {
    speciesOptions: NewPetSpeciesOption[];
}) {
    const {
        register,
        setValue,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>Especie</FieldLabel>

            <select
                {...register("species_id", {
                    onChange: () => {
                        setValue("breed_id", "", {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                        });
                    },
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
                <option value="">Seleccione especie</option>

                {speciesOptions.map((species) => (
                    <option key={species.id} value={String(species.id)}>
                        {species.name}
                    </option>
                ))}
            </select>

            <FieldError message={errors.species_id?.message} />
        </div>
    );
}

function BreedSection({
    speciesOptions,
}: {
    speciesOptions: NewPetSpeciesOption[];
}) {
    const {
        register,
        control,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    const selectedSpeciesId = useWatch({
        control,
        name: "species_id",
    });

    const breedOptions = useMemo(() => {
        const selectedSpecies = speciesOptions.find(
            (species) => String(species.id) === selectedSpeciesId,
        );

        return selectedSpecies?.breeds ?? [];
    }, [selectedSpeciesId, speciesOptions]);

    return (
        <div className="space-y-2">
            <FieldLabel>Raza</FieldLabel>

            <select
                {...register("breed_id")}
                disabled={!selectedSpeciesId || breedOptions.length === 0}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
                <option value="">Seleccione</option>

                {breedOptions.map((breed) => (
                    <option key={breed.id} value={String(breed.id)}>
                        {breed.name}
                    </option>
                ))}
            </select>

            <FieldError message={errors.breed_id?.message} />
        </div>
    );
}

function LastAttendingVetSection({
    veterinarianOptions,
}: {
    veterinarianOptions: NewPetVeterinarianOption[];
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <FieldLabel>Veterinario tratante anterior</FieldLabel>

            <select
                {...register("last_attending_vet_id")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
                <option value="">Sin veterinario asignado</option>

                {veterinarianOptions.map((veterinarian) => (
                    <option
                        key={veterinarian.id}
                        value={String(veterinarian.id)}
                    >
                        {veterinarian.full_name}
                    </option>
                ))}
            </select>

            <FieldError message={errors.last_attending_vet_id?.message} />
        </div>
    );
}

function NewPetPreviewPanel({
    speciesOptions,
}: {
    speciesOptions: NewPetSpeciesOption[];
}) {
    const {control} = useFormContext<AddNewPetFormValues>();

    const name = useWatch({
        control,
        name: "name",
    });

    const sex = useWatch({
        control,
        name: "sex",
    });

    const birthDate = useWatch({
        control,
        name: "birth_date",
    });

    const speciesId = useWatch({
        control,
        name: "species_id",
    });

    const selectedSpecies = speciesOptions.find(
        (species) => String(species.id) === speciesId,
    );

    const sexLabel =
        sex === "m" ? "Macho" : sex === "f" ? "Hembra" : "Indefinido";

    return (
        <aside className="w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-500">
                +
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
                Nuevo paciente
            </h3>

            <div className="mt-4 space-y-3 text-sm">
                <PreviewItem
                    label="Nombre"
                    value={name.trim() || "Sin nombre todavía"}
                />

                <PreviewItem label="Sexo" value={sexLabel} />

                <PreviewItem
                    label="Edad"
                    value={
                        birthDate
                            ? formatPetAgeFromBirthDate(birthDate)
                            : "Sin fecha todavía"
                    }
                />

                <PreviewItem
                    label="Especie"
                    value={selectedSpecies?.name ?? "Sin especie todavía"}
                />

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                    La carga real de foto se puede conectar después. Por ahora
                    se deja preparado el campo <strong>photo_url</strong>.
                </div>
            </div>
        </aside>
    );
}

function PreviewItem({label, value}: {label: string; value: string}) {
    return (
        <div>
            <p className="font-semibold text-slate-500">{label}</p>
            <p className="text-slate-800">{value}</p>
        </div>
    );
}

function PedigreeRegistrySection() {
    const {control, setValue, clearErrors} =
        useFormContext<AddNewPetFormValues>();

    const hasPedigree = useWatch({
        control,
        name: "has_pedigree",
    });

    useEffect(() => {
        if (hasPedigree) {
            return;
        }

        setValue("pedigree_registry", "", {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: true,
        });

        clearErrors("pedigree_registry");
    }, [hasPedigree, setValue, clearErrors]);

    return (
        <TextInputSection
            name="pedigree_registry"
            label="Registro de pedigrí"
            placeholder="Ej: ABC-12345"
            disabled={!hasPedigree}
            maxLength={50}
        />
    );
}

function MicrochipDataSection() {
    const {control, setValue, clearErrors} =
        useFormContext<AddNewPetFormValues>();

    const hasMicrochip = useWatch({
        control,
        name: "has_microchip",
    });

    useEffect(() => {
        if (hasMicrochip) {
            return;
        }

        setValue("microchip_code", "", {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: true,
        });

        setValue("microchip_date", "", {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: true,
        });

        setValue("microchip_body_region", "", {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: true,
        });

        clearErrors([
            "microchip_code",
            "microchip_date",
            "microchip_body_region",
        ]);
    }, [hasMicrochip, setValue, clearErrors]);

    return (
        <div className="md:col-span-2 xl:col-span-4">
            <FormCard>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <BooleanSection name="has_microchip" label="Microchip" />

                    <TextInputSection
                        name="microchip_code"
                        label="Código microchip"
                        placeholder="Ej: 123456789012345"
                        disabled={!hasMicrochip}
                        maxLength={15}
                    />

                    <DateSection
                        name="microchip_date"
                        label="Fecha implantación"
                        disabled={!hasMicrochip}
                    />

                    <TextInputSection
                        name="microchip_body_region"
                        label="Ubicación corporal"
                        placeholder="Ej: cuello izquierdo"
                        disabled={!hasMicrochip}
                        maxLength={80}
                    />
                </div>
            </FormCard>
        </div>
    );
}

function Section({title, children}: {title: string; children: ReactNode}) {
    return (
        <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {children}
            </div>
        </section>
    );
}

/* ======================================================
   COMPONENT
   ====================================================== */

export default function AddNewPetDialog({
    open,
    speciesOptions,
    veterinarianOptions,
    saving = false,
    onClose,
    onSave,
}: Props) {
    async function handleSubmit(data: AddNewPetFormValues) {
        if (saving) {
            return;
        }

        const payload = normalizeBeforeSave(data);
        await onSave(payload);
    }

    return (
        <FormDialog<AddNewPetFormValues>
            open={open}
            title="Registrar nuevo paciente"
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onClose={onClose}
            size="xl"
            submitLabel={saving ? "Registrando..." : "Registrar paciente"}
            cancelLabel="Cancelar"
            resolver={zodResolver(addNewPetSchema)}
            closeOnOverlayClick={false}
        >
            <div className="max-h-[72vh] overflow-y-auto pr-2">
                <div className="flex items-start gap-6">
                    <NewPetPreviewPanel speciesOptions={speciesOptions} />

                    <div className="flex-1 space-y-6 rounded-3xl border border-slate-200 bg-slate-100 p-5 shadow-sm">
                        <Section title="Datos básicos">
                            <FormCard>
                                <TextInputSection
                                    name="name"
                                    label="Nombre"
                                    placeholder="Ej: Rocky"
                                    maxLength={100}
                                />
                            </FormCard>

                            <FormCard>
                                <SexSection />
                            </FormCard>

                            <div className="md:col-span-2">
                                <FormCard>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <DateSection
                                            name="birth_date"
                                            label="Fecha de nacimiento"
                                        />

                                        <AgePreviewSection />
                                    </div>
                                </FormCard>
                            </div>

                            <div className="md:col-span-2">
                                <FormCard>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <SpeciesSection
                                            speciesOptions={speciesOptions}
                                        />

                                        <BreedSection
                                            speciesOptions={speciesOptions}
                                        />
                                    </div>
                                </FormCard>
                            </div>

                            <FormCard>
                                <BooleanSection
                                    name="sterilized"
                                    label="Esterilizado"
                                />
                            </FormCard>

                            <FormCard>
                                <SizeSection />
                            </FormCard>

                            <FormCard>
                                <TextInputSection
                                    name="last_weight"
                                    label="Último peso"
                                    placeholder="Ej: 4.18"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                />
                            </FormCard>

                            <div className="xl:col-span-3">
                                <FormCard>
                                    <TextInputSection
                                        name="reference"
                                        label="Referencia"
                                        placeholder="Ej: Por Instagram"
                                        maxLength={100}
                                    />
                                </FormCard>
                            </div>
                        </Section>

                        <Section title="Identificación">
                            <div className="md:col-span-2">
                                <FormCard>
                                    <TextAreaSection
                                        name="body_description"
                                        label="Descripción corporal"
                                        placeholder="Color, marcas, señales particulares"
                                        rows={3}
                                        maxLength={300}
                                    />
                                </FormCard>
                            </div>

                            <FormCard>
                                <TextInputSection
                                    name="visual_tag"
                                    label="Inscripción en Placa, collar, etiqueta"
                                    placeholder="Ej: Toby"
                                    maxLength={20}
                                />
                            </FormCard>

                            <div className="md:col-span-2 xl:col-span-4">
                                <FormCard>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div className="md:col-span-1">
                                            <BooleanSection
                                                name="has_pedigree"
                                                label="Pedigrí"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <PedigreeRegistrySection />
                                        </div>
                                    </div>
                                </FormCard>
                            </div>

                            <div className="md:col-span-2 xl:col-span-4">
                                <FormCard>
                                    <TextAreaSection
                                        name="visual_identification_or_tattoo_description"
                                        label="Identificación visual o descripción de tatuaje (si tiene)"
                                        placeholder="Ej: tatuaje de la granja propietaria"
                                        rows={3}
                                        maxLength={100}
                                    />
                                </FormCard>
                            </div>
                        </Section>

                        <Section title="Identificación electrónica">
                            <MicrochipDataSection />
                        </Section>

                        <Section title="Observaciones">
                            <div className="md:col-span-2 xl:col-span-4">
                                <FormCard>
                                    <TextAreaSection
                                        name="clinical_observations"
                                        label="Observaciones clínicas"
                                        placeholder="Ej: El paciente se vuelve agresivo durante examinación física."
                                        rows={3}
                                        maxLength={150}
                                    />
                                </FormCard>
                            </div>

                            <div className="md:col-span-2 xl:col-span-4">
                                <FormCard>
                                    <TextAreaSection
                                        name="internal_notes"
                                        label="Notas internas"
                                        placeholder="Ej: El responsable prefiere contacto por WhatsApp."
                                        rows={3}
                                        maxLength={100}
                                    />
                                </FormCard>
                            </div>
                        </Section>

                        <Section title="Atención veterinaria">
                            <div className="md:col-span-2">
                                <FormCard>
                                    <LastAttendingVetSection
                                        veterinarianOptions={
                                            veterinarianOptions
                                        }
                                    />
                                </FormCard>
                            </div>
                        </Section>

                        <Section title="Foto">
                            <div className="md:col-span-2 xl:col-span-4">
                                <FormCard>
                                    <TextInputSection
                                        name="photo_url"
                                        label="URL de foto"
                                        placeholder="Pendiente: se puede reemplazar luego por carga de imagen"
                                        type="url"
                                    />
                                </FormCard>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </FormDialog>
    );
}
