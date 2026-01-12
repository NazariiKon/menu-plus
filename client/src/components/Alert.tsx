import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react";

export type VenueAlertProps = {
    open: boolean;
    venueId: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: (venueId: string) => void | Promise<void>
    title?: string;
    description?: string;
    submitLabel?: string;
};

export function Alert({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone. This will permanently delete your venue and remove your's venue data from our servers.",
    submitLabel = "Continue",
    venueId,
}: VenueAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="lg"
                    className="px-6 h-12 rounded-xl font-medium border border-gray-200 hover:border-gray-400 inline-flex items-center"
                >
                    <Trash className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(venueId)}>
                        {submitLabel ?? "Continue"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
