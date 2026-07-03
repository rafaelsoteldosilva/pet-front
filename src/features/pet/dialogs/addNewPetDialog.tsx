// src/features/pet/dialogs/addNewPetDialog.tsx

"use client";

import {useMemo} from "react";
import {useFormContext, useWatch} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import FormCard from "@/shared/ui/forms/formCard";
import FormDialog from "@/shared/ui/forms/formDialog";

/* ======================================================
   HELPERS USED BY SCHEMA
   ====================================================== */

function isValidDateOnly(value: string): boolean {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return true;
    }

    const parts = normalizedValue.split("-");

    if (parts.length !== 3) {
        return false;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return false;
    }

    if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function isFutureDateOnly(value: string): boolean {
    const normalizedValue = value.trim();

    if (!normalizedValue || !isValidDateOnly(normalizedValue)) {
        return false;
    }

    const [yearText, monthText, dayText] = normalizedValue.split("-");

    const selectedDate = new Date(
        Number(yearText),
        Number(monthText) - 1,
        Number(dayText),
    );

    const today = new Date();
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    return selectedDate > todayDateOnly;
}

/* ======================================================
   SINGLE SOURCE OF TRUTH
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
        breed_id: z.string().optional(),

        birth_date: z.string().optional(),

        sterilized: z.boolean(),

        size: z.string().optional(),
        last_weight: z.string().optional(),

        body_description: z.string().optional(),
        reference: z.string().optional(),

        visual_tag: z.string().optional(),
        has_visual_identification: z.boolean(),
        visual_identification_or_tattoo_description: z.string().optional(),

        has_pedigree: z.boolean(),
        pedigree_registry: z.string().optional(),

        has_microchip: z.boolean(),
        microchip_code: z.string().optional(),
        microchip_date: z.string().optional(),
        microchip_body_region: z.string().optional(),

        clinical_observations: z.string().optional(),
        internal_notes: z.string().optional(),

        last_attending_vet_id: z.string().optional(),

        photo_url: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const birthDate = data.birth_date?.trim() ?? "";

        if (birthDate && !isValidDateOnly(birthDate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["birth_date"],
                message: "La fecha de nacimiento no es válida.",
            });
        }

        if (birthDate && isFutureDateOnly(birthDate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["birth_date"],
                message: "La fecha de nacimiento no puede ser futura.",
            });
        }

        const lastWeight = data.last_weight?.trim();

        if (lastWeight && Number.isNaN(Number(lastWeight))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["last_weight"],
                message: "El peso debe ser un número válido.",
            });
        }

        const microchipCode = data.microchip_code?.trim();

        if (
            data.has_microchip &&
            microchipCode &&
            !/^\d{15}$/.test(microchipCode)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_code"],
                message: "El microchip debe tener 15 dígitos.",
            });
        }

        const microchipDate = data.microchip_date?.trim() ?? "";

        if (
            data.has_microchip &&
            microchipDate &&
            !isValidDateOnly(microchipDate)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_date"],
                message: "La fecha de implantación no es válida.",
            });
        }

        if (
            data.has_microchip &&
            microchipDate &&
            isFutureDateOnly(microchipDate)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_date"],
                message: "La fecha de implantación no puede ser futura.",
            });
        }

        const pedigreeRegistry = data.pedigree_registry?.trim();

        if (!data.has_pedigree && pedigreeRegistry) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pedigree_registry"],
                message: "Activa Pedigrí antes de ingresar un registro.",
            });
        }

        const hasAnyMicrochipData =
            Boolean(data.microchip_code?.trim()) ||
            Boolean(data.microchip_date?.trim()) ||
            Boolean(data.microchip_body_region?.trim());

        if (!data.has_microchip && hasAnyMicrochipData) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["has_microchip"],
                message:
                    "Activa Microchip antes de ingresar código, fecha o ubicación corporal.",
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

    birth_date: "",

    sterilized: false,

    size: "",
    last_weight: "",

    body_description: "",
    reference: "",

    visual_tag: "",
    has_visual_identification: false,
    visual_identification_or_tattoo_description: "",

    has_pedigree: false,
    pedigree_registry: "",

    has_microchip: false,
    microchip_code: "",
    microchip_date: "",
    microchip_body_region: "",

    clinical_observations: "",
    internal_notes: "",

    last_attending_vet_id: "",

    photo_url: "",
};

/* ======================================================
   NORMALIZATION HELPERS
   ====================================================== */

function emptyToNull(value: string | undefined): string | null {
    const normalized = value?.trim() ?? "";
    return normalized ? normalized : null;
}

function normalizeDateValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    const text = String(value).trim();

    if (!text) {
        return "";
    }

    return text.slice(0, 10);
}

function dateToNull(value: string | undefined): string | null {
    const normalized = normalizeDateValue(value);
    return normalized ? normalized : null;
}

function stringIdToNumberOrNull(value: string | undefined): number | null {
    if (!value) {
        return null;
    }

    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
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

    if (Number.isNaN(parsedValue)) {
        return null;
    }

    return parsedValue;
}

function parseDateOnly(value: string): Date | null {
    const normalizedValue = normalizeDateValue(value);

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

function formatPetAgeFromBirthDate(
    birthDateValue: string,
    emptyText: string,
): string {
    const birthDate = parseDateOnly(birthDateValue);

    if (!birthDate) {
        return emptyText;
    }

    const today = new Date();
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    if (birthDate > todayDateOnly) {
        return "La fecha está en el futuro.";
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
        return "La fecha está en el futuro.";
    }

    const yearsText = `${years} año${years === 1 ? "" : "s"}`;
    const monthsText = `${months} mes${months === 1 ? "" : "es"}`;

    return `${yearsText} y ${monthsText}`;
}

function normalizeBeforeSave(data: AddNewPetFormValues): AddNewPetPayload {
    const visualTag = emptyToNull(data.visual_tag);

    const visualIdentificationOrTattooDescription = emptyToNull(
        data.visual_identification_or_tattoo_description,
    );

    const hasVisualIdentification =
        data.has_visual_identification ||
        visualTag !== null ||
        visualIdentificationOrTattooDescription !== null;

    return {
        name: data.name.trim(),
        sex: data.sex,

        species_id: Number(data.species_id),
        breed_id: stringIdToNumberOrNull(data.breed_id),

        sterilized: data.sterilized,
        birth_date: dateToNull(data.birth_date),

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
            ? dateToNull(data.microchip_date)
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
   LOCAL FORM COMPONENTS
   ====================================================== */

function getErrorMessage(message: unknown): string | undefined {
    return typeof message === "string" ? message : undefined;
}

function FieldError({message}: {message?: string}) {
    if (!message) {
        return null;
    }

    return <p className="text-sm font-medium text-red-600">{message}</p>;
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-4">
                {children}
            </div>
        </section>
    );
}

function FieldSlot({
    colSpan = 1,
    children,
}: {
    colSpan?: 1 | 2 | 3 | 4;
    children: React.ReactNode;
}) {
    const colSpanClass =
        colSpan === 4
            ? "md:col-span-4"
            : colSpan === 3
              ? "md:col-span-3"
              : colSpan === 2
                ? "md:col-span-2"
                : "";

    return (
        <div className={colSpanClass}>
            <FormCard>{children}</FormCard>
        </div>
    );
}

type TextFieldName =
    | "name"
    | "body_description"
    | "size"
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

function TextInputSection({
    name,
    label,
    placeholder,
    type = "text",
    disabled = false,
}: {
    name: TextFieldName;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "url";
    disabled?: boolean;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
            />

            <FieldError message={getErrorMessage(errors[name]?.message)} />
        </div>
    );
}

function TextAreaSection({
    name,
    label,
    placeholder,
    disabled = false,
}: {
    name:
        | "body_description"
        | "visual_identification_or_tattoo_description"
        | "clinical_observations"
        | "internal_notes";
    label: string;
    placeholder?: string;
    disabled?: boolean;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <textarea
                {...register(name)}
                rows={3}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
            />

            <FieldError message={getErrorMessage(errors[name]?.message)} />
        </div>
    );
}

function DateInputSection({
    name,
    label,
    disabled = false,
}: {
    name: "microchip_date";
    label: string;
    disabled?: boolean;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                {...register(name)}
                type="date"
                disabled={disabled}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
            />

            <FieldError message={getErrorMessage(errors[name]?.message)} />
        </div>
    );
}

function BooleanSection({
    name,
    label,
}: {
    name:
        | "sterilized"
        | "has_pedigree"
        | "has_visual_identification"
        | "has_microchip";
    label: string;
}) {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                <input
                    {...register(name)}
                    type="checkbox"
                    className="h-4 w-4"
                />

                {label}
            </label>

            <FieldError message={getErrorMessage(errors[name]?.message)} />
        </div>
    );
}

function SexSection() {
    const {
        register,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                Sexo
            </label>

            <select
                {...register("sex")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
                <option value="u">Indefinido</option>
                <option value="m">Macho</option>
                <option value="f">Hembra</option>
            </select>

            <FieldError message={getErrorMessage(errors.sex?.message)} />
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
            <label className="block text-sm font-semibold text-slate-700">
                Tamaño
            </label>

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

            <FieldError message={getErrorMessage(errors.size?.message)} />
        </div>
    );
}

function SpeciesAndBreedSection({
    speciesOptions,
}: {
    speciesOptions: NewPetSpeciesOption[];
}) {
    const {
        register,
        control,
        setValue,
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                    Especie
                </label>

                <select
                    {...register("species_id", {
                        onChange: () => {
                            setValue("breed_id", "");
                        },
                    })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                    <option value="">Seleccione una especie</option>

                    {speciesOptions.map((species) => (
                        <option key={species.id} value={String(species.id)}>
                            {species.name}
                        </option>
                    ))}
                </select>

                <FieldError
                    message={getErrorMessage(errors.species_id?.message)}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                    Raza
                </label>

                <select
                    {...register("breed_id")}
                    disabled={!selectedSpeciesId || breedOptions.length === 0}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <option value="">Sin raza / No especificada</option>

                    {breedOptions.map((breed) => (
                        <option key={breed.id} value={String(breed.id)}>
                            {breed.name}
                        </option>
                    ))}
                </select>

                <FieldError
                    message={getErrorMessage(errors.breed_id?.message)}
                />
            </div>
        </div>
    );
}

function BirthDateWithAgePreviewSection() {
    const {
        register,
        control,
        formState: {errors},
    } = useFormContext<AddNewPetFormValues>();

    const watchedBirthDate = useWatch({
        control,
        name: "birth_date",
    });

    const normalizedBirthDate = normalizeDateValue(watchedBirthDate);

    return (
        <div className="space-y-4">
            <div className="max-w-md space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                    Fecha de nacimiento
                </label>

                <p className="text-xs leading-5 text-slate-500">
                    Ingresa la fecha de nacimiento del paciente. La edad se
                    calculará automáticamente a partir de esta fecha.
                </p>

                <input
                    {...register("birth_date")}
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

                <FieldError
                    message={getErrorMessage(errors.birth_date?.message)}
                />
            </div>

            <div className="max-w-md">
                <p className="text-sm font-semibold text-slate-700">Edad</p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    Vista previa calculada automáticamente a partir de la fecha
                    de nacimiento.
                </p>

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm">
                    {formatPetAgeFromBirthDate(
                        normalizedBirthDate,
                        "Selecciona una fecha para calcular la edad.",
                    )}
                </div>
            </div>
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
            <label className="block text-sm font-semibold text-slate-700">
                Veterinario tratante anterior
            </label>

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

            <FieldError
                message={getErrorMessage(errors.last_attending_vet_id?.message)}
            />
        </div>
    );
}

function NewPetPreviewPanel() {
    const {control} = useFormContext<AddNewPetFormValues>();

    const name = useWatch({
        control,
        name: "name",
    });

    const sex = useWatch({
        control,
        name: "sex",
    });

    const speciesId = useWatch({
        control,
        name: "species_id",
    });

    const birthDate = useWatch({
        control,
        name: "birth_date",
    });

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
                <div>
                    <p className="font-semibold text-slate-500">Nombre</p>
                    <p className="text-slate-800">
                        {name?.trim() || "Sin nombre todavía"}
                    </p>
                </div>

                <div>
                    <p className="font-semibold text-slate-500">Sexo</p>
                    <p className="text-slate-800">{sexLabel}</p>
                </div>

                <div>
                    <p className="font-semibold text-slate-500">Edad</p>
                    <p className="text-slate-800">
                        {formatPetAgeFromBirthDate(
                            birthDate ?? "",
                            "Sin fecha todavía",
                        )}
                    </p>
                </div>

                <div>
                    <p className="font-semibold text-slate-500">Especie</p>
                    <p className="text-slate-800">
                        {speciesId ? "Seleccionada" : "Sin especie todavía"}
                    </p>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
                    La carga real de foto se puede conectar después. Por ahora
                    se deja preparado el campo <strong>photo_url</strong>.
                </div>
            </div>
        </aside>
    );
}

function PedigreeSection() {
    const {control} = useFormContext<AddNewPetFormValues>();

    const hasPedigree = useWatch({
        control,
        name: "has_pedigree",
    });

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BooleanSection name="has_pedigree" label="Pedigrí" />

            <div className="md:col-span-2">
                <TextInputSection
                    name="pedigree_registry"
                    label="Registro de pedigrí"
                    placeholder="Ej: ABC-12345"
                    disabled={!hasPedigree}
                />

                {!hasPedigree && (
                    <p className="mt-2 text-xs text-slate-500">
                        Activa Pedigrí para registrar este dato.
                    </p>
                )}
            </div>
        </div>
    );
}

function MicrochipSection() {
    const {control} = useFormContext<AddNewPetFormValues>();

    const hasMicrochip = useWatch({
        control,
        name: "has_microchip",
    });

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <BooleanSection name="has_microchip" label="Microchip" />

            <TextInputSection
                name="microchip_code"
                label="Código microchip"
                placeholder="15 dígitos"
                disabled={!hasMicrochip}
            />

            <DateInputSection
                name="microchip_date"
                label="Fecha implantación"
                disabled={!hasMicrochip}
            />

            <TextInputSection
                name="microchip_body_region"
                label="Ubicación corporal"
                placeholder="Ej: cuello izquierdo"
                disabled={!hasMicrochip}
            />
        </div>
    );
}

function PhotoSection() {
    return (
        <div className="space-y-4">
            <TextInputSection
                name="photo_url"
                label="URL de foto"
                placeholder="Pendiente: se puede reemplazar luego por carga de imagen"
                type="url"
            />

            <button
                type="button"
                disabled
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-400"
            >
                Agregar foto — pendiente de implementación
            </button>
        </div>
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
        >
            <div className="max-h-[72vh] overflow-y-auto pr-2">
                <div className="flex items-start gap-6">
                    <NewPetPreviewPanel />

                    <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-sm">
                        <div className="mb-5">
                            <h3 className="text-lg font-semibold uppercase tracking-wide text-slate-700">
                                Datos del paciente
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <Section title="Datos básicos">
                                <FieldSlot>
                                    <TextInputSection
                                        name="name"
                                        label="Nombre"
                                        placeholder="Ej: Rocky"
                                    />
                                </FieldSlot>

                                <FieldSlot>
                                    <SexSection />
                                </FieldSlot>

                                <FieldSlot colSpan={2}>
                                    <BirthDateWithAgePreviewSection />
                                </FieldSlot>

                                <FieldSlot colSpan={2}>
                                    <SpeciesAndBreedSection
                                        speciesOptions={speciesOptions}
                                    />
                                </FieldSlot>

                                <FieldSlot>
                                    <BooleanSection
                                        name="sterilized"
                                        label="Esterilizado"
                                    />
                                </FieldSlot>

                                <FieldSlot>
                                    <SizeSection />
                                </FieldSlot>

                                <FieldSlot>
                                    <TextInputSection
                                        name="last_weight"
                                        label="Último peso"
                                        placeholder="Ej: 12.5"
                                        type="number"
                                    />
                                </FieldSlot>
                            </Section>

                            <Section title="Identificación">
                                <FieldSlot colSpan={2}>
                                    <TextAreaSection
                                        name="body_description"
                                        label="Descripción corporal"
                                        placeholder="Color, señas particulares, condición corporal, etc."
                                    />
                                </FieldSlot>

                                <FieldSlot>
                                    <TextInputSection
                                        name="reference"
                                        label="Referencia"
                                        placeholder="Referencia externa o interna"
                                    />
                                </FieldSlot>

                                <FieldSlot>
                                    <TextInputSection
                                        name="visual_tag"
                                        label="Placa, collar, etiqueta"
                                        placeholder="Ej: TAG-001"
                                    />
                                </FieldSlot>

                                <FieldSlot colSpan={3}>
                                    <PedigreeSection />
                                </FieldSlot>

                                <FieldSlot colSpan={4}>
                                    <TextAreaSection
                                        name="visual_identification_or_tattoo_description"
                                        label="Identificación visual o descripción de tatuaje (si tiene)"
                                        placeholder="Descripción visible, tatuaje, marca externa, etc."
                                    />
                                </FieldSlot>
                            </Section>

                            <Section title="Identificación electrónica">
                                <FieldSlot colSpan={4}>
                                    <MicrochipSection />
                                </FieldSlot>
                            </Section>

                            <Section title="Observaciones">
                                <FieldSlot colSpan={4}>
                                    <TextAreaSection
                                        name="clinical_observations"
                                        label="Observaciones clínicas"
                                        placeholder="Observaciones clínicas iniciales"
                                    />
                                </FieldSlot>

                                <FieldSlot colSpan={4}>
                                    <TextAreaSection
                                        name="internal_notes"
                                        label="Notas internas"
                                        placeholder="Notas visibles solo para el equipo interno"
                                    />
                                </FieldSlot>
                            </Section>

                            <Section title="Atención veterinaria">
                                <FieldSlot colSpan={2}>
                                    <LastAttendingVetSection
                                        veterinarianOptions={
                                            veterinarianOptions
                                        }
                                    />
                                </FieldSlot>
                            </Section>

                            <Section title="Foto">
                                <FieldSlot colSpan={2}>
                                    <PhotoSection />
                                </FieldSlot>
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </FormDialog>
    );
}
