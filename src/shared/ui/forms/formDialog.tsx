// src/shared/ui/forms/formDialog.tsx

"use client";

import {ReactNode, useEffect, useId, useRef} from "react";
import {
    DefaultValues,
    FieldValues,
    FormProvider,
    Resolver,
    SubmitHandler,
    useForm,
    UseFormReturn,
} from "react-hook-form";

import ModalDialog from "@/shared/ui/modalDialog";
import GlobalButton from "@/shared/ui/globalButton";

type Props<TFormValues extends FieldValues> = {
    open: boolean;
    title: string;
    defaultValues: DefaultValues<TFormValues>;
    onSubmit: SubmitHandler<TFormValues>;
    onClose: () => void;
    children: ReactNode;
    methods?: UseFormReturn<TFormValues>;
    resolver?: Resolver<TFormValues>;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    submitLabel?: string;
    cancelLabel?: string;
    submitDisabled?: boolean;
    cancelDisabled?: boolean;
    disableEscape?: boolean;
    closeOnOverlayClick?: boolean;
};

export default function FormDialog<TFormValues extends FieldValues>({
    open,
    title,
    defaultValues,
    onSubmit,
    onClose,
    children,
    methods,
    resolver,
    size = "lg",
    submitLabel = "Guardar cambios",
    cancelLabel = "Cancelar",
    submitDisabled = false,
    cancelDisabled = false,
    disableEscape = true,
    closeOnOverlayClick = false,
}: Props<TFormValues>) {
    const internalMethods = useForm<TFormValues>({
        defaultValues,
        resolver,
    });

    const formMethods = methods ?? internalMethods;
    const formId = useId();

    const hasResetAfterOpenRef = useRef(false);

    useEffect(() => {
        if (!open) {
            hasResetAfterOpenRef.current = false;
            return;
        }

        if (hasResetAfterOpenRef.current) return;

        formMethods.reset(defaultValues);
        hasResetAfterOpenRef.current = true;
    }, [open, defaultValues, formMethods]);

    return (
        <FormProvider {...formMethods}>
            <ModalDialog
                open={open}
                title={title}
                onClose={onClose}
                size={size}
                disableEscape={disableEscape}
                closeOnOverlayClick={closeOnOverlayClick}
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <GlobalButton
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={cancelDisabled}
                        >
                            {cancelLabel}
                        </GlobalButton>

                        <GlobalButton
                            type="submit"
                            form={formId}
                            variant="primary"
                            disabled={submitDisabled}
                        >
                            {submitLabel}
                        </GlobalButton>
                    </div>
                }
            >
                <form
                    id={formId}
                    onSubmit={(event) => {
                        if (submitDisabled) {
                            event.preventDefault();
                            return;
                        }

                        void formMethods.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-6"
                >
                    {children}
                </form>
            </ModalDialog>
        </FormProvider>
    );
}
