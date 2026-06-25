// src/features/pet/constants/optionsForSelectBasedFields.ts

export type PetBasicSelectOption = {
    value: string;
    label: string;
};

export const PET_SEX_OPTIONS: PetBasicSelectOption[] = [
    {value: "m", label: "Macho"},
    {value: "f", label: "Hembra"},
    {value: "u", label: "Indefinido"},
];

export const PET_SIZE_OPTIONS: PetBasicSelectOption[] = [
    {value: "small", label: "Pequeño"},
    {value: "medium", label: "Mediano"},
    {value: "large", label: "Grande"},
    {value: "xlarge", label: "Gigante"},
];
