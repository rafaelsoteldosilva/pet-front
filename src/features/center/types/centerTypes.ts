// src/shared/center/types/centerTypes.tsx

export interface VeterinaryCenterInterface {
    id: number;
    name: string;
    country_code: string;
    email: string;
    address: string;
    phone: string;
    diagnostic_code_system: "internal" | "venom";
}

export interface CenterStaffMembershipInterface {
    id: number;

    first_name: string;
    last_name: string;
    full_name?: string;
    email: string;

    country_code: string;
    document_id: string;
    cell_phone: string | null;
    complete_address: string | null;
    role: string;
    veterinary_center: VeterinaryCenterInterface | null;
}

export interface ImageInterface {
    id: number;
    image_name: string;
    image_original_name: string;
    image_public_id: string;
    image_resource_type: string;
    image_url: string;
    finished_setting_image: boolean;
    image_creation_date: string;
    veterinary_center: VeterinaryCenterInterface;
}
