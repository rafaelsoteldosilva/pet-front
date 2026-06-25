// src/features/center/centerContact/types/centerContactTypes.ts

export const CONTACT_TYPE_VALUES = ["PERSON", "INSTITUTION"] as const;

export type ContactType = (typeof CONTACT_TYPE_VALUES)[number];

export type GridMode = "management" | "picker";

export interface CenterContactInterface {
    id: number;
    center_contact_type: ContactType;

    display_name: string | null;

    first_name: string | null;
    last_name: string | null;
    institution_name: string | null;

    document_id: string | null;
    email: string | null;

    primary_phone: string | null;
    secondary_phone: string | null;
    tertiary_phone: string | null;

    address: string | null;
    city: string | null;
    region: string | null;
    country: string | null;

    notes: string | null;
    is_active: boolean;
}
