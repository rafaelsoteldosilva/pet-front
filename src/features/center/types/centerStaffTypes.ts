// src/features/center/types/centerStaffTypes.ts

export type CenterVeterinarianOption = {
    id: number; // Center_Staff_Membership id
    user_id: number; // Pet_Control_User id

    display_name: string;

    email: string | null;
    work_email: string | null;

    job_title: string | null;
    professional_license_number: string | null;
};
