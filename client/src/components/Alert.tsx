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

export type VenueAlertProps = {
    open: boolean
    id: string
    onOpenChange: (open: boolean) => void
    onConfirm: (id: string) => void | Promise<void>
    title?: string
    description?: string
    submitLabel?: string

    children: React.ReactNode
}

export function Alert({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone...",
    submitLabel = "Continue",
    id,
    children,
}: VenueAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(id)}>
                        {submitLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
