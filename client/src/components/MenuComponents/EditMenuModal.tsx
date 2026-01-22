import { Textarea } from "@/components/ui/textarea"
import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { supabase } from "@/lib/supabase"
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

const schema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    desc: z.string().trim().optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    wifiPassword: z.string().trim().optional().or(z.literal("")),
    address: z.string().trim().optional().or(z.literal("")),
    google_maps_link: z.string().trim().optional().or(z.literal("")),
    inst_link: z.string().trim().optional().or(z.literal("")),
    facebook_link: z.string().trim().optional().or(z.literal("")),
    tiktok_link: z.string().trim().optional().or(z.literal("")),
    logoFile: z.instanceof(File).optional(),
    backgroundFile: z.instanceof(File).optional(),
})

type FormValues = z.infer<typeof schema>

export type EditVenueModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    venue: VenueRead
    onSave: (patch: Partial<VenueUpdate>) => void | Promise<void>
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
function extFromFile(file: File) {
    const parts = file.name.split(".")
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin"
}

async function uploadToImagesBucket(file: File, folder: string) {
    const ext = extFromFile(file)
    const path = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from("images").upload(path, file, { upsert: true })
    if (error) throw error
    return path
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
            logoFile: undefined,
            backgroundFile: undefined,
        },
        mode: "onSubmit",
    })

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
            logoFile: undefined,
            backgroundFile: undefined,
        })
        form.clearErrors()
    }, [open, venue, form])

    const handleSubmit = form.handleSubmit(async (values) => {
        let logoPath: string | undefined
        let backgroundPath: string | undefined

        if (values.logoFile) logoPath = await uploadToImagesBucket(values.logoFile, "logos")
        if (values.backgroundFile) backgroundPath = await uploadToImagesBucket(values.backgroundFile, "backgrounds")

        const patch: Partial<VenueUpdate> = {
            name: values.name.trim(),
            desc: emptyToNull(values.desc),
            wifiPassword: emptyToNull(values.wifiPassword),
            phone: emptyToNull(values.phone),
            address: emptyToNull(values.address),
            google_maps_link: emptyToNull(values.google_maps_link),
            inst_link: emptyToNull(values.inst_link),
            facebook_link: emptyToNull(values.facebook_link),
            tiktok_link: emptyToNull(values.tiktok_link),
            ...(logoPath ? { logo: logoPath } : {}),
            ...(backgroundPath ? { background: backgroundPath } : {}),
        }

        await onSave(patch)
        onOpenChange(false)
    })

    const selectedLogo = form.watch("logoFile");
    const selectedBG = form.watch("backgroundFile");

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (form.formState.isSubmitting) return
                onOpenChange(next)
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
                                        render={({ field: { onChange, value, ref } }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="text-sm">Logo</FormLabel>
                                                <FormControl>
                                                    <label className="group relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/20 hover:bg-muted/40 transition">
                                                        <input
                                                            ref={ref}
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) onChange(file);
                                                            }}
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
                                        render={({ field: { onChange, value, ref } }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="text-sm">Background</FormLabel>
                                                <FormControl>
                                                    <label className="group relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/20 hover:bg-muted/40 transition">
                                                        <input
                                                            ref={ref}
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) onChange(file);
                                                            }}
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
                                        name="wifiPassword"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="text-sm">Wi‑Fi password</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-11 w-full rounded-xl" placeholder="••••••••" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="text-sm">Phone</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-11 w-full rounded-xl" type="tel" placeholder="+__________" />
                                                </FormControl>
                                                <FormMessage />
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
    )
}
