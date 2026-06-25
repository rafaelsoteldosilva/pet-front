// src/features/pet/forms/schemas/petContactSchema.ts

import {z} from "zod";

import {
    CONTACT_TYPE_VALUES,
    type ContactType,
} from "@/features/center/centerContact/types/centerContactTypes";
import {getChileanRutValidationMessage} from "@/shared/utils/chileanRutUtils";

export const PET_CONTACT_TYPE_VALUES = CONTACT_TYPE_VALUES;

export type PetContactTypeValue = ContactType;

export const PET_CONTACT_ROLE_VALUES = [
    "OWNER_GUARDIAN",
    "CAREGIVER",
    "BILLING_RESPONSIBLE",
    "REFERRING_VET",
    "RESPONSIBLE_INSTITUTION",
    "REFERRING_INSTITUTION",
    "BREEDER",
    "SHELTER_OR_FOUNDATION",
] as const;

export type PetContactRoleValue = (typeof PET_CONTACT_ROLE_VALUES)[number];

export const PERSON_PET_CONTACT_ROLE_VALUES = [
    "OWNER_GUARDIAN",
    "CAREGIVER",
    "BILLING_RESPONSIBLE",
    "REFERRING_VET",
    "BREEDER",
] as const satisfies readonly PetContactRoleValue[];

export const INSTITUTION_PET_CONTACT_ROLE_VALUES = [
    "BILLING_RESPONSIBLE",
    "RESPONSIBLE_INSTITUTION",
    "REFERRING_INSTITUTION",
    "BREEDER",
    "SHELTER_OR_FOUNDATION",
] as const satisfies readonly PetContactRoleValue[];

export const PET_CONTACT_TYPE_OPTIONS: {
    value: PetContactTypeValue;
    label: string;
    description: string;
}[] = [
    {
        value: "PERSON",
        label: "Persona",
        description:
            "Propietario, tutor, cuidador, responsable de pago u otro contacto individual.",
    },
    {
        value: "INSTITUTION",
        label: "Institución",
        description:
            "Fundación, refugio, clínica, criadero u otra organización vinculada al paciente.",
    },
];

export const PET_CONTACT_ROLE_OPTIONS: {
    value: PetContactRoleValue;
    label: string;
}[] = [
    {
        value: "OWNER_GUARDIAN",
        label: "Propietario / Tutor",
    },
    {
        value: "CAREGIVER",
        label: "Cuidador",
    },
    {
        value: "BILLING_RESPONSIBLE",
        label: "Responsable de pago",
    },
    {
        value: "REFERRING_VET",
        label: "Veterinario remitente",
    },
    {
        value: "RESPONSIBLE_INSTITUTION",
        label: "Institución responsable",
    },
    {
        value: "REFERRING_INSTITUTION",
        label: "Institución remitente",
    },
    {
        value: "BREEDER",
        label: "Criador / Criadero",
    },
    {
        value: "SHELTER_OR_FOUNDATION",
        label: "Refugio / Fundación",
    },
];

export const PET_CONTACT_PERMISSION_OPTIONS = [
    {
        name: "is_primary_contact",
        label: "Contacto principal",
        description:
            "Contacto principal para comunicaciones generales sobre este paciente.",
    },
    {
        name: "is_emergency_contact",
        label: "Contacto de emergencia",
        description:
            "Puede ser contactado en situaciones urgentes relacionadas con el paciente.",
    },
    {
        name: "can_authorize_treatment",
        label: "Puede autorizar tratamientos",
        description:
            "Puede aprobar procedimientos, tratamientos o decisiones clínicas cuando corresponda.",
    },
    {
        name: "can_receive_medical_updates",
        label: "Puede recibir información médica",
        description:
            "Puede recibir actualizaciones clínicas, resultados e información médica del paciente.",
    },
    {
        name: "can_receive_billing",
        label: "Puede recibir información de pago",
        description:
            "Puede recibir presupuestos, facturas, boletas o información relacionada con pagos.",
    },
    {
        name: "can_pickup_pet",
        label: "Puede retirar al paciente",
        description:
            "Puede retirar al paciente del centro veterinario cuando sea necesario.",
    },
] as const satisfies readonly {
    name:
        | "is_primary_contact"
        | "is_emergency_contact"
        | "can_authorize_treatment"
        | "can_receive_medical_updates"
        | "can_receive_billing"
        | "can_pickup_pet";
    label: string;
    description: string;
}[];

function nullableText(maxLength: number, fieldLabel: string) {
    return z
        .string()
        .nullable()
        .refine(
            (value) => value === null || value.trim().length <= maxLength,
            `${fieldLabel} no puede superar ${maxLength} caracteres.`,
        );
}

function requiredText(maxLength: number, fieldLabel: string) {
    return z
        .string({
            error: `${fieldLabel} es obligatorio.`,
        })
        .refine(
            (value) => value.trim().length > 0,
            `${fieldLabel} es obligatorio.`,
        )
        .refine(
            (value) => value.trim().length <= maxLength,
            `${fieldLabel} no puede superar ${maxLength} caracteres.`,
        );
}

const nullableEmail = z
    .string()
    .nullable()
    .refine(
        (value) =>
            value === null ||
            value.trim() === "" ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        "Ingresa un email válido.",
    );

const chileanRutRequiredSchema = requiredText(50, "El documento").superRefine(
    (value, ctx) => {
        const message = getChileanRutValidationMessage(value);

        if (message) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message,
            });
        }
    },
);

function isPersonRole(role: PetContactRoleValue): boolean {
    return PERSON_PET_CONTACT_ROLE_VALUES.some(
        (personRole) => personRole === role,
    );
}

function isInstitutionRole(role: PetContactRoleValue): boolean {
    return INSTITUTION_PET_CONTACT_ROLE_VALUES.some(
        (institutionRole) => institutionRole === role,
    );
}

const petContactBaseSchema = z.object({
    contact_type: z.enum(PET_CONTACT_TYPE_VALUES, {
        error: "Selecciona el tipo de contacto.",
    }),

    first_name: nullableText(100, "El nombre"),
    last_name: nullableText(100, "El apellido"),
    institution: nullableText(150, "La institución"),

    country_code: requiredText(10, "El código de país"),
    document_id: chileanRutRequiredSchema,

    email: nullableEmail,

    cell_phone: nullableText(30, "El celular"),
    home_phone: nullableText(30, "El teléfono de casa"),
    work_phone: nullableText(30, "El teléfono de trabajo"),

    address: nullableText(255, "La dirección"),
    city: nullableText(100, "La ciudad"),

    contact_observations: nullableText(500, "Las observaciones del contacto"),
    contact_notes: nullableText(500, "Las notas generales del contacto"),

    role: z.enum(PET_CONTACT_ROLE_VALUES, {
        error: "Selecciona una función válida para este contacto.",
    }),

    specific_relationship: nullableText(80, "El vínculo específico"),

    is_primary_contact: z.boolean(),
    is_emergency_contact: z.boolean(),

    can_authorize_treatment: z.boolean(),
    can_receive_medical_updates: z.boolean(),
    can_receive_billing: z.boolean(),
    can_pickup_pet: z.boolean(),

    pet_contact_notes: nullableText(
        500,
        "Las notas de la relación con esta mascota",
    ),
});

export const petContactSchema = petContactBaseSchema.superRefine(
    (values, ctx) => {
        if (values.contact_type === "PERSON") {
            if (!values.first_name || values.first_name.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["first_name"],
                    message:
                        "El nombre es obligatorio para un contacto persona.",
                });
            }

            if (!values.last_name || values.last_name.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["last_name"],
                    message:
                        "El apellido es obligatorio para un contacto persona.",
                });
            }

            if (!isPersonRole(values.role)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["role"],
                    message:
                        "Selecciona un rol válido para un contacto persona.",
                });
            }
        }

        if (values.contact_type === "INSTITUTION") {
            if (!values.institution || values.institution.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["institution"],
                    message:
                        "El nombre de la institución es obligatorio para un contacto institución.",
                });
            }

            if (!isInstitutionRole(values.role)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["role"],
                    message:
                        "Selecciona un rol válido para un contacto institución.",
                });
            }
        }
    },
);

export const addPetContactSchema = petContactSchema;
export const editPetContactSchema = petContactSchema;

export const PetContactSchema = petContactSchema;
export const AddPetContactSchema = addPetContactSchema;
export const EditPetContactSchema = editPetContactSchema;

export type PetContactFormValues = z.infer<typeof petContactSchema>;
