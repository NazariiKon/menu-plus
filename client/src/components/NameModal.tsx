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
import { Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import type { ItemRead } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required."),
    image: z.instanceof(File).nullable().optional(),
    menuId: z.string().optional(),
    category_id: z.string().optional(),
    desc: z.string().optional(),
    price: z.string().optional(),
    weight_g: z.string().optional(),
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
    isItem?: boolean;
    currentId?: string;
    showDropList?: boolean;
    dropListData?: any[] | null;
    imagePreview?: string | null;
    onImageChange?: (file: File | null) => void;
    accept?: string;
    dropDataLabel?: string;
    maxSizeMB?: number;
    defaultItem?: ItemRead;
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
    isItem = false,
    showDropList = false,
    dropListData = [],
    currentId,
    imagePreview,
    onImageChange,
    accept = "image/*",
    maxSizeMB = 5,
    defaultItem,
    dropDataLabel,
}: NameModalProps) {
    const [localPreview, setLocalPreview] = React.useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialName || defaultItem?.name,
            image: null,
            menuId: currentId || "",
            category_id: currentId || "",
            desc: defaultItem?.desc || "",
            price: defaultItem?.price?.toString() || undefined,
            weight_g: defaultItem?.weight_g?.toString() || undefined
        },
        mode: "onSubmit",
    });

    React.useEffect(() => {
        if (!open) {
            setLocalPreview(null);
        }
    }, [open]);

    React.useEffect(() => {
        if (open) {
            form.reset({
                name: initialName || defaultItem?.name,
                image: null,
                menuId: currentId || "",
                category_id: currentId || "",
                desc: defaultItem?.desc || "",
                price: defaultItem?.price?.toString() || undefined,
                weight_g: defaultItem?.weight_g?.toString() || undefined
            });
            form.clearErrors();
            setLocalPreview(null);
        }
    }, [open, initialName, currentId, form]);

    React.useEffect(() => {
        return () => {
            if (localPreview) {
                URL.revokeObjectURL(localPreview);
            }
        };
    }, [localPreview]);

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size > maxSizeMB * 1024 * 1024) {
            alert(`File too large. Max ${maxSizeMB}MB`);
            e.target.value = '';
            setLocalPreview(null);
            return;
        }
        form.setValue("image", file || null);
        onImageChange?.(file || null);

        if (file) {
            const url = URL.createObjectURL(file);
            setLocalPreview(url);
        } else {
            setLocalPreview(null);
        }
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
                        {showDropList && dropListData && dropListData.length > 0 && (
                            <FormField
                                control={form.control}
                                name="menuId"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>{dropDataLabel}:</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={currentId || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dropListData.map((obj) => (
                                                    <SelectItem
                                                        key={obj.id}
                                                        value={obj.id}
                                                    >
                                                        {obj.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {isItem && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="desc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter item description" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="0.00" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weight_g"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (g)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                        {showImage && (
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="space-y-2">
                                                {(localPreview || imagePreview) && (
                                                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={localPreview || supabase.storage.from("images/").getPublicUrl(imagePreview!).data.publicUrl}
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
                                disabled={form.formState.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    submitLabel
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
