// src/features/pet/components/petPhoto.tsx

"use client";

type Props = {
    photoUrl: string | null | undefined;
    alt: string;
    size?: "sm" | "md" | "lg";
};

const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
};

export default function PetPhoto({photoUrl, alt, size = "md"}: Props) {
    const classes = sizeClasses[size];

    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={alt}
                className={`${classes} rounded-full object-cover shadow-sm`}
            />
        );
    }

    return (
        <div
            className={`${classes} rounded-full bg-slate-200 flex items-center justify-center text-sm text-slate-500`}
        >
            Sin foto
        </div>
    );
}
