// src/shared/petSelector/showFilterInput.tsx

"use client";

import GlobalButton from "@/shared/ui/globalButton";
import {useState} from "react";

type Props = {
    label: string;
    placeholder?: string;
    onSearch: (query: string) => void;
    loading?: boolean;
};

export default function ShowFilterInput({
    label,
    placeholder,
    onSearch,
    loading = false,
}: Props) {
    const [value, setValue] = useState("");

    const trimmed = value.trim();
    const canSearch = trimmed.length >= 3;

    const handleSearch = () => {
        if (!canSearch) return;
        onSearch(trimmed);
    };

    return (
        <div className="flex flex-col gap-2 max-w-md">
            <label className="text-sm text-gray-600">{label}</label>

            <div className="flex gap-2">
                <input
                    value={value}
                    onChange={(e) => {
                        const next = e.target.value;
                        setValue(next);
                    }}
                    placeholder={placeholder}
                    className="flex-1 rounded border px-3 py-2 text-sm"
                />

                <GlobalButton
                    type="button"
                    disabled={!canSearch || loading}
                    onClick={handleSearch}
                >
                    OK
                </GlobalButton>
            </div>
        </div>
    );
}
