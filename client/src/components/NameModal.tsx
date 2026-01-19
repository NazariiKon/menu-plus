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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import type { MenuRead } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required."),
    image: z.instanceof(File).nullable().optional(),
    menuId: z.string().optional(),
    desc: z.string().optional(),
    price: z.number().min(0, "Price must be positive.").optional(),
    weight_g: z.number().min(10, "Wight must be positive").optional(),
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
    isItem?: boolean
    currentMenu?: string;
    showDropList?: boolean;
    dropListData?: MenuRead[] | null;
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
    isItem = false,
    showDropList = false,
    dropListData = [],
    currentMenu,
    imagePreview,
    onImageChange,
    accept = "image/*",
    maxSizeMB = 5,
}: NameModalProps) {
    const [localPreview, setLocalPreview] = React.useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: initialName, image: null, menuId: currentMenu || "" },
        mode: "onSubmit",
    });


    React.useEffect(() => {
        if (open) {
            form.reset({
                name: initialName,
                image: null,
                menuId: currentMenu || ""
            });
            form.clearErrors();
            setLocalPreview(null);
        }
    }, [open, initialName, currentMenu, form]);


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
                                        <FormLabel>Menu:</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={currentMenu || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dropListData.map((menu) => (
                                                    <SelectItem
                                                        key={menu.id}
                                                        value={menu.id}
                                                    >
                                                        {menu.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Change which menu this category belongs to.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
