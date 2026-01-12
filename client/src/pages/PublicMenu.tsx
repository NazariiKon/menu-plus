import * as React from "react"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { get_menu_by_slug } from "@/api/venue"
import type { VenueRead } from "@/types/types"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

const gradientBtn =
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 hover:bg-primary/90 font-semibold"

function formatPrice(price: number, currency?: string | null) {
    const cur = currency ?? "USD"
    return `${price.toFixed(2)} ${cur}`
}

export default function PublicMenu() {
    const { slug } = useParams<{ slug: string }>()

    const [venue, setVenue] = React.useState<VenueRead | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | undefined>(undefined)

    const load = async () => {
        setLoading(true);
        if (!slug) return;
        const result = await get_menu_by_slug(slug);
        console.log(result);

        if (result.success && result.data) {
            setVenue(result.data);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    useEffect(() => {
        load()
    }, [slug])

    const menu = venue?.menus?.[0] ?? null
    const categories = menu?.categories ?? []
    const defaultTab = categories[0]?.id
    const bgPath = venue?.background ?? "logos/defaultBG.png"
    const logoPath = venue?.logo ?? "logos/default.png"

    const { data: bgData } = supabase.storage.from("images").getPublicUrl(bgPath)
    const { data: logoData } = supabase.storage.from("images").getPublicUrl(logoPath)

    const bgUrl = bgData.publicUrl
    const logoUrl = logoData.publicUrl


    return (
        <div className="min-h-dvh w-full bg-background text-foreground">
            <div className="mx-auto w-full max-w-[400px]">
                <header className="relative overflow-hidden rounded-b-3xl">


                    <div
                        className="h-56 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgUrl})` }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="flex items-end justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                    <img
                                        src={logoUrl ?? "/logos/default.png"}
                                        alt={venue?.name ?? "Logo"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>


                                <div className="min-w-0">
                                    <div className="text-xs font-medium text-white/80">
                                        Online menu
                                    </div>
                                    <div className="truncate text-lg font-semibold text-white">
                                        {venue?.name ?? "Restaurant name"}
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="shrink-0 bg-white/85 text-black hover:bg-white"
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                </header>
            </div>
        </div>
    )

}
