import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required."),
    image: z.instanceof(File).nullable().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export type NameModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: FormValues) => void | Promise<void>;
    title?: string;
    description?: string;
    initialName?: string;
    submitLabel?: string;
    placeholder?: string;
    showImage?: boolean;
    imagePreview?: string | null;
    onImageChange?: (file: File | null) => void;
    accept?: string;
    maxSizeMB?: number;
};

export function NameModal({
    open,
    onOpenChange,
    onSubmit,
    title = "Add venue",
    description = "Enter the venue name to continue.",
    initialName = "",
    submitLabel = "Save",
    placeholder = "e.g. The Green Bistro",
    showImage = false,
    imagePreview,
    onImageChange,
    accept = "image/*",
    maxSizeMB = 5,
}: NameModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: initialName, image: null },
        mode: "onSubmit",
    });

    React.useEffect(() => {
        if (open) {
            form.reset({ name: initialName, image: null });
            form.clearErrors();
        }
    }, [open, initialName, form]);

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size > maxSizeMB * 1024 * 1024) {
            alert(`File too large. Max ${maxSizeMB}MB`);
            return;
        }
        form.setValue("image", file || null);
        onImageChange?.(file || null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder={placeholder}
                                            autoComplete="organization"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {showImage && (
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="space-y-2">
                                                {imagePreview && (
                                                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept={accept}
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all"
                            >
                                {submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
