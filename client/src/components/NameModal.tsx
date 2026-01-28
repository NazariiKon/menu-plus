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
import { CropModal } from "./CropModal";

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
    defaultItem,
    dropDataLabel,
}: NameModalProps) {
    const [cropModalOpen, setCropModalOpen] = React.useState(false);
    const [previewKey, setPreviewKey] = React.useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);
    const [savedImagePreview] = React.useState(imagePreview);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialName || defaultItem?.name,
            image: null,
            menuId: currentId || "",
            category_id: currentId || "",
            desc: defaultItem?.desc || "",
            price: defaultItem?.price?.toString() || "",
            weight_g: defaultItem?.weight_g?.toString() || "",
        },
        mode: "onSubmit",
    });

    React.useEffect(() => {
        if (open) {
            form.reset({
                name: initialName || defaultItem?.name || "",
                image: null,
                menuId: currentId || "",
                category_id: currentId || "",
                desc: defaultItem?.desc || "",
                price: defaultItem?.price?.toString() || "",
                weight_g: defaultItem?.weight_g?.toString() || "",
            });
            form.clearErrors();
        }
    }, [open, initialName, currentId, form, defaultItem]);

    React.useEffect(() => {
        if (!open) {
            setPreviewUrl(null);
            setPreviewKey(null);
        }
    }, [open]);

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
    });

    const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert(`File too large. Max 10 MB`);
            e.target.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPreviewKey(Date.now());
        setCropImageSrc(url);
        setCropModalOpen(true);
    };

    const handleCropComplete = (croppedFile: File) => {
        form.setValue("image", croppedFile);
        onImageChange?.(croppedFile);
        setCropModalOpen(false);
        setCropImageSrc(null);
    };

    const handleCloseCropModal = () => {
        setCropModalOpen(false);

        if (cropImageSrc) {
            URL.revokeObjectURL(cropImageSrc);
        }
        setCropImageSrc(null);

        if (savedImagePreview) {
            setPreviewUrl(null);
            setPreviewKey(null);
        } else {
            setPreviewUrl(null);
            setPreviewKey(null);
        }
    };

    const getPreviewSrc = () => {
        if (previewUrl && previewKey) {
            return previewUrl;
        }
        if (imagePreview) {
            return supabase.storage.from("images/").getPublicUrl(imagePreview).data.publicUrl;
        }
        return undefined;
    };

    return (
        <>
            {cropModalOpen && cropImageSrc && (
                <CropModal
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCloseCropModal}
                    size={440 / 280}
                />
            )}

            <Dialog open={open && !cropModalOpen} onOpenChange={onOpenChange}>
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
                                                <div className="space-y-3">
                                                    {previewUrl || imagePreview ? (
                                                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={getPreviewSrc()}
                                                                alt="Preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    ) : null}

                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="file"
                                                            accept={accept}
                                                            onChange={handleImageInputChange}
                                                            className="flex-1"
                                                        />
                                                    </div>
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
                                    className="rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all"
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
        </>
    );
}
