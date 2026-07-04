// src/shared/ui/entityDialogs/editSingleEntityFieldDialog.tsx

"use client";

import {type ReactNode, useEffect, useState} from "react";
import {DefaultValues, FieldValues, SubmitHandler} from "react-hook-form";

import FormDialog from "@/shared/ui/forms/formDialog";

type DialogSize = "sm" | "md" | "lg" | "xl";

type Props<TEntity, TFormValues extends FieldValues, TPayload> = {
    open: boolean;
    title: string;
    sectionTitle: string;

    entity: TEntity;

    defaultValues: DefaultValues<TFormValues>;

    children: ReactNode;
    sidePanel?: ReactNode;

    /**
     * Use dialogSize in the single-field dialog API.
     * It is forwarded to FormDialog as `size`.
     */
    dialogSize?: DialogSize;

    /**
     * Kept only so older/newer callers using `size` also work.
     * Prefer `dialogSize` when using EditSingleEntityFieldDialog.
     */
    size?: DialogSize;

    onClose: () => void;

    buildPayload: (
        values: TFormValues,
        entity: TEntity,
    ) => TPayload | Promise<TPayload>;

    updateEntity: (payload: TPayload) => Promise<TEntity>;

    onSaved?: (updatedEntity: TEntity) => void;

    submitLabel?: string;
    cancelLabel?: string;

    getErrorMessage?: (error: unknown) => string;
};

export default function EditSingleEntityFieldDialog<
    TEntity,
    TFormValues extends FieldValues,
    TPayload,
>({
    open,
    title,
    sectionTitle,
    entity,
    defaultValues,
    children,
    sidePanel,
    dialogSize,
    size,
    onClose,
    buildPayload,
    updateEntity,
    onSaved,
    submitLabel = "Guardar",
    cancelLabel = "Cancelar",
    getErrorMessage,
}: Props<TEntity, TFormValues, TPayload>) {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const resolvedDialogSize = dialogSize ?? size ?? "lg";

    useEffect(() => {
        if (open) {
            setSubmitError(null);
        }
    }, [open, entity]);

    const handleSubmit: SubmitHandler<TFormValues> = async (values) => {
        try {
            setSubmitError(null);

            const payload = await buildPayload(values, entity);
            const updatedEntity = await updateEntity(payload);

            onSaved?.(updatedEntity);
            onClose();
        } catch (error) {
            console.error(
                "EditSingleEntityFieldDialog:: update failed:: ",
                error,
            );

            const message =
                getErrorMessage?.(error) ?? "No se pudo actualizar el campo.";

            setSubmitError(message);
        }
    };

    const formContent = (
        <section className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-800">
                    {sectionTitle}
                </h3>
            </div>

            {children}

            {submitError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitError}
                </div>
            ) : null}
        </section>
    );

    return (
        <FormDialog<TFormValues>
            open={open}
            title={title}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onClose={onClose}
            size={resolvedDialogSize}
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            closeOnOverlayClick={false}
        >
            {sidePanel ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[188px_minmax(0,1fr)]">
                    <aside className="min-w-0">{sidePanel}</aside>

                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        {formContent}
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {formContent}
                </div>
            )}
        </FormDialog>
    );
}
