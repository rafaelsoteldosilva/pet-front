// src/features/pet/dialogs/addNewPetDialog.tsx

"use client";

import {useMemo} from "react";
import {useFormContext, useWatch} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import FormCard from "@/shared/ui/forms/formCard";
import FormDialog from "@/shared/ui/forms/formDialog";

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

        sterilized: z.boolean(),

        birth_date: z.string().optional(),

        body_description: z.string().optional(),
        size: z.string().optional(),
        last_weight: z.string().optional(),

        last_attending_vet_id: z.string().optional(),

        reference: z.string().optional(),

        has_pedigree: z.boolean(),
        pedigree_registry: z.string().optional(),

        has_visual_identification: z.boolean(),
        visual_tag: z.string().optional(),
        visual_identification_or_tattoo_description: z.string().optional(),

        has_microchip: z.boolean(),
        microchip_code: z.string().optional(),
        microchip_date: z.string().optional(),
        microchip_body_region: z.string().optional(),

        clinical_observations: z.string().optional(),
        internal_notes: z.string().optional(),

        photo_url: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const microchipCode = data.microchip_code?.trim();

        if (microchipCode && !/^\d{15}$/.test(microchipCode)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["microchip_code"],
                message: "El microchip debe tener 15 dígitos.",
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
    if (!value) return null;

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

function normalizeBeforeSave(data: AddNewPetFormValues): AddNewPetPayload {
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
        pedigree_registry: emptyToNull(data.pedigree_registry),

        has_visual_identification: data.has_visual_identification,
        visual_tag: emptyToNull(data.visual_tag),
        visual_identification_or_tattoo_description: emptyToNull(
            data.visual_identification_or_tattoo_description,
        ),

        has_microchip: data.has_microchip,
        microchip_code: emptyToNull(data.microchip_code),
        microchip_date: emptyToNull(data.microchip_date),
        microchip_body_region: emptyToNull(data.microchip_body_region),

        clinical_observations: emptyToNull(data.clinical_observations),
        internal_notes: emptyToNull(data.internal_notes),

        photo_url: emptyToNull(data.photo_url),
    };
}

/* ======================================================
   LOCAL FORM COMPONENTS
   ====================================================== */

function FieldError({message}: {message?: string}) {
    if (!message) return null;

    return <p className="text-sm font-medium text-red-600">{message}</p>;
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
}: {
    name: TextFieldName;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "url";
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

            <FieldError message={errors[name]?.message} />
        </div>
    );
}

function TextAreaSection({
    name,
    label,
    placeholder,
}: {
    name:
        | "body_description"
        | "visual_identification_or_tattoo_description"
        | "clinical_observations"
        | "internal_notes";
    label: string;
    placeholder?: string;
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
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

            <FieldError message={errors[name]?.message} />
        </div>
    );
}

function DateSection({
    name,
    label,
}: {
    name: "birth_date" | "microchip_date";
    label: string;
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

            <FieldError message={errors[name]?.message} />
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
    const {register} = useFormContext<AddNewPetFormValues>();

    return (
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
            <input {...register(name)} type="checkbox" className="h-4 w-4" />

            {label}
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
            <label className="block text-sm font-semibold text-slate-700">
                Sexo
            </label>

            <select
                {...register("sex")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
                <option value="u">No especificado</option>
                <option value="m">Macho</option>
                <option value="f">Hembra</option>
            </select>

            <FieldError message={errors.sex?.message} />
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
        <div className="space-y-4">
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

                <FieldError message={errors.species_id?.message} />
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

                <FieldError message={errors.breed_id?.message} />
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
                Último veterinario tratante
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

            <FieldError message={errors.last_attending_vet_id?.message} />
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

    const sexLabel =
        sex === "m" ? "Macho" : sex === "f" ? "Hembra" : "No especificado";

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
        <div className="space-y-4">
            <BooleanSection name="has_pedigree" label="Tiene pedigree" />

            {hasPedigree && (
                <TextInputSection
                    name="pedigree_registry"
                    label="Registro de pedigree"
                    placeholder="Ej: Registro / número / entidad"
                />
            )}
        </div>
    );
}

function VisualIdentificationSection() {
    const {control} = useFormContext<AddNewPetFormValues>();

    const hasVisualIdentification = useWatch({
        control,
        name: "has_visual_identification",
    });

    return (
        <div className="space-y-4">
            <BooleanSection
                name="has_visual_identification"
                label="Tiene identificación visual"
            />

            {hasVisualIdentification && (
                <>
                    <TextInputSection
                        name="visual_tag"
                        label="Placa / código visual"
                        placeholder="Ej: TAG-001"
                    />

                    <TextAreaSection
                        name="visual_identification_or_tattoo_description"
                        label="Descripción de identificación o tatuaje"
                        placeholder="Descripción visible, tatuaje, marca externa, etc."
                    />
                </>
            )}
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
        <div className="space-y-4">
            <BooleanSection name="has_microchip" label="Tiene microchip" />

            {hasMicrochip && (
                <>
                    <TextInputSection
                        name="microchip_code"
                        label="Código de microchip"
                        placeholder="15 dígitos"
                    />

                    <DateSection
                        name="microchip_date"
                        label="Fecha de implantación"
                    />

                    <TextInputSection
                        name="microchip_body_region"
                        label="Región corporal del microchip"
                        placeholder="Ej: cuello izquierdo"
                    />
                </>
            )}
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

                    <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 px-1">
                            <h3 className="text-lg font-semibold uppercase tracking-wide text-slate-700">
                                Datos del paciente
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
                            <FormCard>
                                <TextInputSection
                                    name="name"
                                    label="Nombre"
                                    placeholder="Ej: Rocky"
                                />
                            </FormCard>

                            <FormCard>
                                <SexSection />
                            </FormCard>

                            <FormCard>
                                <SpeciesAndBreedSection
                                    speciesOptions={speciesOptions}
                                />
                            </FormCard>

                            <FormCard>
                                <div className="space-y-4">
                                    <BooleanSection
                                        name="sterilized"
                                        label="Esterilizado"
                                    />

                                    <DateSection
                                        name="birth_date"
                                        label="Fecha de nacimiento"
                                    />
                                </div>
                            </FormCard>

                            <FormCard>
                                <TextAreaSection
                                    name="body_description"
                                    label="Descripción corporal"
                                    placeholder="Color, señas particulares, condición corporal, etc."
                                />
                            </FormCard>

                            <FormCard>
                                <div className="space-y-4">
                                    <TextInputSection
                                        name="size"
                                        label="Tamaño"
                                        placeholder="Ej: Pequeño, Mediano, Grande"
                                    />

                                    <TextInputSection
                                        name="last_weight"
                                        label="Último peso"
                                        placeholder="Ej: 12.5"
                                        type="number"
                                    />
                                </div>
                            </FormCard>

                            <FormCard>
                                <LastAttendingVetSection
                                    veterinarianOptions={veterinarianOptions}
                                />
                            </FormCard>

                            <FormCard>
                                <TextInputSection
                                    name="reference"
                                    label="Referencia"
                                    placeholder="Referencia externa o interna"
                                />
                            </FormCard>

                            <FormCard>
                                <PedigreeSection />
                            </FormCard>

                            <FormCard>
                                <VisualIdentificationSection />
                            </FormCard>

                            <FormCard>
                                <MicrochipSection />
                            </FormCard>

                            <FormCard>
                                <PhotoSection />
                            </FormCard>

                            <FormCard>
                                <TextAreaSection
                                    name="clinical_observations"
                                    label="Observaciones clínicas"
                                    placeholder="Observaciones clínicas iniciales"
                                />
                            </FormCard>

                            <FormCard>
                                <TextAreaSection
                                    name="internal_notes"
                                    label="Notas internas"
                                    placeholder="Notas visibles solo para el equipo interno"
                                />
                            </FormCard>
                        </div>
                    </div>
                </div>
            </div>
        </FormDialog>
    );
}
