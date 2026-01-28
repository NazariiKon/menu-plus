import { Textarea } from "@/components/ui/textarea"
import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import type { VenueRead, VenueUpdate } from "@/types/types"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Switch } from "../ui/switch"
import { CropModal } from "../CropModal"
import { useImageCropping } from "@/hooks/useImageCropping"

const schema = z.object({
    name: z.string().trim().min(1, "Name is required").max(80, "Name is too long (max 80)"),
    desc: z.string().trim().max(250, "Description is too long (max 250)").optional().or(z.literal("")),
    phone: z.string().trim().max(20, "Phone is too long (max 20)").optional().or(z.literal("")),
    wifiPassword: z.string().trim().max(20, "Password is too long (max 20)").optional().or(z.literal("")),
    address: z.string().trim().max(30, "Address is too long (max 30)").optional().or(z.literal("")),
    google_maps_link: z.string().trim().max(255, "Link is too long").optional().or(z.literal("")),
    inst_link: z.string().trim().max(255, "Link is too long").optional().or(z.literal("")),
    facebook_link: z.string().trim().max(255, "Link is too long").optional().or(z.literal("")),
    tiktok_link: z.string().trim().max(255, "Link is too long").optional().or(z.literal("")),
    show_cart: z.boolean(),
    make_order: z.boolean(),
    logoFile: z.instanceof(File).optional(),
    backgroundFile: z.instanceof(File).optional(),
})

type FormValues = z.infer<typeof schema>

export type EditVenueModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    venue: VenueRead
    onSave: (patch: VenueUpdate) => void | Promise<void>
}

const SAVE_BTN =
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 hover:bg-primary/90 font-semibold"

function strOrEmpty(v: string | null | undefined) {
    return v ?? ""
}
function emptyToNull(v: string | undefined) {
    const s = (v ?? "").trim()
    return s === "" ? null : s
}

export default function EditVenueModal({
    open,
    onOpenChange,
    venue,
    onSave,
}: EditVenueModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: venue.name ?? "",
            desc: strOrEmpty((venue as any).desc),
            wifiPassword: venue.wifiPassword ?? "",
            phone: venue.phone ?? "",
            address: venue.address ?? "",
            google_maps_link: strOrEmpty(venue.google_maps_link),
            inst_link: strOrEmpty(venue.inst_link),
            facebook_link: strOrEmpty(venue.facebook_link),
            tiktok_link: strOrEmpty(venue.tiktok_link),
            show_cart: venue.show_cart ?? true,
            make_order: venue.make_order ?? true,
            logoFile: undefined,
            backgroundFile: undefined,
        },
        mode: "onSubmit",
    })

    const [cropModalOpen, setCropModalOpen] = React.useState(false);
    const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);
    const [size, setSize] = React.useState<number>(1);
    const [currentField, setCurrentField] = React.useState<"logo" | "bg" | null>(null);

    const logoCropper = useImageCropping({
        maxSizeMB: 10,
        onCropped: (file) => {
            form.setValue("logoFile", file);
        },
        setIsOpen: setCropModalOpen,
    });

    const bgCropper = useImageCropping({
        maxSizeMB: 10,
        onCropped: (file) => {
            form.setValue("backgroundFile", file);
        },
        setIsOpen: () => {
            setSize(500 / 220);
            setCropModalOpen(true);
        }
    });

    React.useEffect(() => {
        if (!open) return
        form.reset({
            name: venue.name ?? "",
            desc: strOrEmpty((venue as any).desc),
            wifiPassword: venue.wifiPassword ?? "",
            phone: venue.phone ?? "",
            address: venue.address ?? "",
            google_maps_link: strOrEmpty(venue.google_maps_link),
            inst_link: strOrEmpty(venue.inst_link),
            facebook_link: strOrEmpty(venue.facebook_link),
            tiktok_link: strOrEmpty(venue.tiktok_link),
            show_cart: !!venue.show_cart,
            make_order: !!venue.make_order,
            logoFile: undefined,
            backgroundFile: undefined,
        })
        form.clearErrors()
    }, [open, venue, form])

    async function _getBytes(image: File | undefined) {
        let imageBytes: string | null = null;

        if (image) {
            imageBytes = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = () => reject(new Error('Something wrong with your file'));
                reader.readAsDataURL(image!);
            });
        }
        return imageBytes
    }

    const handleSubmit = form.handleSubmit(async (values) => {
        const logoBytes = await _getBytes(values.logoFile)
        const backgroundBytes = await _getBytes(values.backgroundFile)

        const patch: VenueUpdate = {
            name: values.name.trim(),
            desc: emptyToNull(values.desc),
            wifiPassword: emptyToNull(values.wifiPassword),
            phone: emptyToNull(values.phone),
            address: emptyToNull(values.address),
            google_maps_link: emptyToNull(values.google_maps_link),
            inst_link: emptyToNull(values.inst_link),
            facebook_link: emptyToNull(values.facebook_link),
            tiktok_link: emptyToNull(values.tiktok_link),
            show_cart: values.show_cart,
            make_order: values.make_order,
            ...(logoBytes && { logo: logoBytes }),
            ...(backgroundBytes && { background: backgroundBytes }),
        }

        await onSave(patch)
        onOpenChange(false)
    })

    const handleCropComplete = (croppedFile: File) => {
        if (currentField === "logo") {
            logoCropper.handleCropComplete(croppedFile);
        } else if (currentField === "bg") {
            bgCropper.handleCropComplete(croppedFile);
        }
        setCropModalOpen(false);
    };

    const handleCropCancel = () => {
        if (currentField === "logo") {
            logoCropper.handleCropCancel();
        } else if (currentField === "bg") {
            bgCropper.handleCropCancel();
        }
        setCropModalOpen(false);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setCropImageSrc(url);
        setCurrentField("logo");
        logoCropper.handleFileInputChange(e);
    };

    const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setCropImageSrc(url);
        setCurrentField("bg");
        bgCropper.handleFileInputChange(e);
    };

    return (
        <>
            {cropModalOpen && cropImageSrc && (
                <CropModal
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    size={size}
                />
            )}

            <Dialog
                open={open && !cropModalOpen}
                onOpenChange={(next) => {
                    if (form.formState.isSubmitting) return;
                    onOpenChange(next);
                }}
            >
                <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[520px] h-[92dvh] p-0 overflow-hidden bg-white text-black shadow-2xl rounded-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Edit venue</DialogTitle>
                        <DialogDescription>Edit venue</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col" noValidate>
                            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
                                <div className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-11 w-full rounded-xl" placeholder="Amazon Bar" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />



                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="logoFile"
                                            render={({ field: { value } }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel className="text-sm">Logo</FormLabel>
                                                    <FormControl>
                                                        <label className="group relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/20 hover:bg-muted/40 transition">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={handleLogoChange}
                                                            />

                                                            {value ? (
                                                                <div className="relative h-full w-full">
                                                                    <img
                                                                        src={URL.createObjectURL(value as File)}
                                                                        alt="Preview"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <span className="text-xs font-medium text-white">Change logo</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative z-10 rounded-xl bg-white/85 px-3 py-2 text-xs font-semibold text-black shadow">
                                                                    Upload logo
                                                                </div>
                                                            )}
                                                        </label>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="backgroundFile"
                                            render={({ field: { value } }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel className="text-sm">Background</FormLabel>
                                                    <FormControl>
                                                        <label className="group relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/20 hover:bg-muted/40 transition">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={handleBgChange}
                                                            />

                                                            {value ? (
                                                                <div className="relative h-full w-full">
                                                                    <img
                                                                        src={URL.createObjectURL(value as File)}
                                                                        alt="Background Preview"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <span className="text-xs font-medium text-white">Change BG</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative z-10 rounded-xl bg-white/85 px-3 py-2 text-xs font-semibold text-black shadow">
                                                                    Upload BG
                                                                </div>
                                                            )}
                                                        </label>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>


                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="show_cart"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-xl border px-3 py-2">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-sm">
                                                            Show cart
                                                        </FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            className="cursor-pointer"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="make_order"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-xl border px-3 py-2">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-sm">
                                                            WhatsApp order
                                                        </FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            className="cursor-pointer"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>


                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Address</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-11 w-full rounded-xl" placeholder="70A Hillcreast Park" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="google_maps_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Google Maps link</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-11 w-full rounded-xl" placeholder="https://maps.google.com/..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="inst_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Instagram</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-11 w-full rounded-xl" placeholder="https://instagram.com/..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="tiktok_link"
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel className="text-sm">TikTok</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-11 w-full rounded-xl" placeholder="https://tiktok.com/@..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="facebook_link"
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel className="text-sm">Facebook</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-11 w-full rounded-xl" placeholder="https://facebook.com/..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="desc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        className="min-h-[110px] w-full rounded-xl"
                                                        placeholder="Here you can add any additional information about your QR code menu"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t bg-white shrink-0">
                                <div className="mx-auto w-full max-w-[520px] overflow-x-hidden">
                                    <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full rounded-xl sm:w-auto sm:min-w-[160px]"
                                            onClick={() => onOpenChange(false)}
                                            disabled={form.formState.isSubmitting}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            className={`w-full rounded-xl sm:w-auto sm:min-w-[160px] ${SAVE_BTN}`}
                                            disabled={form.formState.isSubmitting}
                                        >
                                            {form.formState.isSubmitting ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}
