// src/shared/ui/entityDialogs/editSingleEntityFieldDialog.tsx

"use client";

import {ReactNode, useEffect, useState} from "react";
import {
    DefaultValues,
    FieldValues,
    Resolver,
    SubmitHandler,
    UseFormReturn,
} from "react-hook-form";

import FormDialog from "@/shared/ui/forms/formDialog";
import SingleFieldSectionLayout from "../forms/fields/singleFieldSectionLayout";

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

type Props<TEntity, TFormValues extends FieldValues, TPayload> = {
    open: boolean;
    title: string;
    sectionTitle: string;

    entity: TEntity;

    defaultValues: DefaultValues<TFormValues>;

    children: ReactNode;

    sidePanel?: ReactNode;

    onClose: () => void;

    buildPayload: (
        values: TFormValues,
        entity: TEntity,
    ) => TPayload | Promise<TPayload>;

    updateEntity: (payload: TPayload) => Promise<TEntity>;

    onSaved?: (updatedEntity: TEntity) => void;

    submitLabel?: string;
    cancelLabel?: string;
    size?: DialogSize;

    methods?: UseFormReturn<TFormValues>;
    resolver?: Resolver<TFormValues>;

    closeOnOverlayClick?: boolean;
    disableEscape?: boolean;

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
    onClose,
    buildPayload,
    updateEntity,
    onSaved,
    submitLabel = "Guardar",
    cancelLabel = "Cancelar",
    size = "xl",
    methods,
    resolver,
    closeOnOverlayClick = false,
    disableEscape = false,
    getErrorMessage,
}: Props<TEntity, TFormValues, TPayload>) {
    const [submitError, setSubmitError] = useState<string | null>(null);

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

    return (
        <FormDialog<TFormValues>
            open={open}
            title={title}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onClose={onClose}
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            size={size}
            methods={methods}
            resolver={resolver}
            closeOnOverlayClick={closeOnOverlayClick}
            disableEscape={disableEscape}
        >
            <SingleFieldSectionLayout
                sectionTitle={sectionTitle}
                submitError={submitError}
                sidePanel={sidePanel}
            >
                {children}
            </SingleFieldSectionLayout>
        </FormDialog>
    );
}
