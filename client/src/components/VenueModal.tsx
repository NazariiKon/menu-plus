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
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const venueSchema = z.object({
    name: z.string().trim().min(1, "Venue name is required."),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

export type VenueModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: VenueFormValues) => void | Promise<void>;
    title?: string;
    description?: string;
    initialName?: string;
    submitLabel?: string;
};

export function VenueModal({
    open,
    onOpenChange,
    onSubmit,
    title = "Add venue",
    description = "Enter the venue name to continue.",
    initialName = "",
    submitLabel = "Save",
}: VenueModalProps) {
    const form = useForm<VenueFormValues>({
        resolver: zodResolver(venueSchema),
        defaultValues: { name: initialName },
        mode: "onSubmit",
    });

    React.useEffect(() => {
        if (open) {
            form.reset({ name: initialName });
            form.clearErrors();
        }
    }, [open, initialName, form]);

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
    });

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
                                    <FormLabel>Venue name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. The Green Bistro"
                                            autoComplete="organization"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all">
                                {submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
