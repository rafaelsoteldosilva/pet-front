// src/features/pet/types/petTypes.ts

import {
    type CenterStaffMembershipInterface,
    type VeterinaryCenterInterface,
} from "@/features/center/types/centerTypes";

import {type CenterContactInterface} from "@/features/center/centerContact/types/centerContactTypes";

export const SEX_VALUES = ["m", "f", "u"] as const;

export type SexType = (typeof SEX_VALUES)[number];

export const PET_STATUS = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DECEASED: "Deceased",
    ARCHIVED: "Archived",
} as const;

export type PetStatus = (typeof PET_STATUS)[keyof typeof PET_STATUS];

export const PET_STATUS_VALUES = [
    PET_STATUS.ACTIVE,
    PET_STATUS.INACTIVE,
    PET_STATUS.DECEASED,
    PET_STATUS.ARCHIVED,
] as const satisfies readonly PetStatus[];

export const PET_RECORD_STATUS = {
    DRAFT: "Draft",
    CLINICAL: "Clinical",
    ARCHIVED: "Archived",
} as const;

export type PetRecordStatus =
    (typeof PET_RECORD_STATUS)[keyof typeof PET_RECORD_STATUS];

export const PET_RECORD_STATUS_VALUES = [
    PET_RECORD_STATUS.DRAFT,
    PET_RECORD_STATUS.CLINICAL,
    PET_RECORD_STATUS.ARCHIVED,
] as const satisfies readonly PetRecordStatus[];

export const PET_CONTACT_ROLE = {
    OWNER_GUARDIAN: "OWNER_GUARDIAN",
    CAREGIVER: "CAREGIVER",
    BILLING_RESPONSIBLE: "BILLING_RESPONSIBLE",
    REFERRING_VET: "REFERRING_VET",
    RESPONSIBLE_INSTITUTION: "RESPONSIBLE_INSTITUTION",
    REFERRING_INSTITUTION: "REFERRING_INSTITUTION",
    BREEDER: "BREEDER",
    SHELTER_OR_FOUNDATION: "SHELTER_OR_FOUNDATION",
} as const;

export type PetContactRole =
    (typeof PET_CONTACT_ROLE)[keyof typeof PET_CONTACT_ROLE];

export const PET_CONTACT_ROLE_VALUES = [
    PET_CONTACT_ROLE.OWNER_GUARDIAN,
    PET_CONTACT_ROLE.CAREGIVER,
    PET_CONTACT_ROLE.BILLING_RESPONSIBLE,
    PET_CONTACT_ROLE.REFERRING_VET,
    PET_CONTACT_ROLE.RESPONSIBLE_INSTITUTION,
    PET_CONTACT_ROLE.REFERRING_INSTITUTION,
    PET_CONTACT_ROLE.BREEDER,
    PET_CONTACT_ROLE.SHELTER_OR_FOUNDATION,
] as const satisfies readonly PetContactRole[];

export type CenterContactSummaryInterface = CenterContactInterface;

export interface PetContactLinkInterface {
    id: number; // Pet_Contact_Link id, not center_Contact id.

    role: PetContactRole;
    role_label: string;

    specific_relationship: string | null;

    is_primary_contact: boolean;
    is_emergency_contact: boolean;

    can_authorize_treatment: boolean;
    can_receive_medical_updates: boolean;
    can_receive_billing: boolean;
    can_pickup_pet: boolean;

    notes: string | null;
    is_active: boolean;

    center_contact: CenterContactSummaryInterface;
}

export interface SpeciesInterface {
    id: number;
    name: string;
    veterinary_center?: VeterinaryCenterInterface | null;
}

export interface BreedInterface {
    id: number;
    name: string;
    species?: SpeciesInterface | null;
}

export interface PetDataInterface {
    id: number;

    history_code: string;
    name: string;

    sex: SexType;
    sex_label: string;

    species: SpeciesInterface;
    breed: BreedInterface | null;

    sterilized: boolean;
    birth_date: string | null;

    body_description: string | null;
    size: string | null;
    last_weight: number | null;

    last_attending_vet: CenterStaffMembershipInterface | null;
    last_attending_vet_id: number | null;
    reference: string | null;

    has_pedigree: boolean;
    pedigree_registry: string | null;

    visual_tag: string | null;
    visual_identification_or_tattoo_description: string | null;

    has_microchip: boolean;
    microchip_code: string | null;
    microchip_date: string | null;
    microchip_body_region: string | null;

    clinical_observations: string | null;
    internal_notes: string | null;

    photo_url: string | null;

    veterinary_center: VeterinaryCenterInterface | null;

    status: PetStatus | null;

    inactive_at: string | null;
    deceased_at: string | null;
    archived_at: string | null;

    clinical_record_status: PetRecordStatus | null;

    contact_links: PetContactLinkInterface[];

    owner_guardians: PetContactLinkInterface[];
    caregivers: PetContactLinkInterface[];
    billing_responsibles: PetContactLinkInterface[];
    referring_vets: PetContactLinkInterface[];
    responsible_institution: PetContactLinkInterface[];
    referring_institutions: PetContactLinkInterface[];
    breeders: PetContactLinkInterface[];
    shelters_or_foundations: PetContactLinkInterface[];

    emergency_contacts: PetContactLinkInterface[];
    pickup_authorized_contacts: PetContactLinkInterface[];
    treatment_authorization_contacts: PetContactLinkInterface[];
    medical_update_contacts: PetContactLinkInterface[];
    billing_update_contacts: PetContactLinkInterface[];
}

export const GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE = {
    PRIMARY_CONTACT: "primary_contact",
    OWNER_GUARDIAN: "owner_guardian",
    CONTACT: "contact",
    NAME: "name",
    MICROCHIP: "microchip",
    HISTORY_CODE: "history_code",
} as const;

export type GetAllPetsForCenterTypeValue =
    (typeof GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE)[keyof typeof GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE];

export const GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE_VALUES = [
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.PRIMARY_CONTACT,
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.OWNER_GUARDIAN,
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.CONTACT,
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.NAME,
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.MICROCHIP,
    GET_ALL_PETS_FOR_CENTER_SEARCH_TYPE.HISTORY_CODE,
] as const satisfies readonly GetAllPetsForCenterTypeValue[];

export type GetAllPetsForCenterResult = PetDataInterface;

export interface PetSearchResponse {
    pets: GetAllPetsForCenterResult[];
}

export interface AllowedSpeciesItemInterface {
    id: number;
    name: string;
}

export interface AllowedBreedItemInterface {
    id: number;
    name: string;
}

export interface AllowedSpeciesAndBreedsItemInterface {
    species: AllowedSpeciesItemInterface;
    breeds: AllowedBreedItemInterface[];
}

export type AllowedSpeciesAndBreedsResult =
    AllowedSpeciesAndBreedsItemInterface[];
