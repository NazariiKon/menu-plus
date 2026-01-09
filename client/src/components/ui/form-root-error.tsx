// components/ui/form-root-error.tsx (замените ваш)
'use client'; // если Next.js app router

import * as React from 'react';
import { useFormState } from 'react-hook-form';
import { cn } from '@/lib/utils';

export function FormRootError({ className, ...props }: React.ComponentProps<"p">) {
    const { errors } = useFormState();
    const rootError = errors.root;

    if (!rootError) return null;

    return (
        <p
            className={cn(
                "text-destructive text-sm font-medium px-4 py-3 bg-destructive/10 border rounded-md border-destructive/30",
                className
            )}
            {...props}
        >
            {rootError.message}
        </p>
    );
}
