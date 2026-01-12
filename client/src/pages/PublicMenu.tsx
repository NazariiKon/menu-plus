import * as React from "react"
import { useParams } from "react-router-dom"

import { edit_venue, get_menu_by_slug } from "@/api/venue"
import type { VenueRead, VenueUpdate } from "@/types/types"
import { useEffect, useState } from "react"
import Header from "@/components/MenuComponents/Header"
import EditVenueModal from "@/components/MenuComponents/EditMenuModal"

const gradientBtn =
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 hover:bg-primary/90 font-semibold"

function formatPrice(price: number, currency?: string | null) {
    const cur = currency ?? "USD"
    return `${price.toFixed(2)} ${cur}`
}

export default function PublicMenu() {
    const { slug } = useParams<{ slug: string }>()

    const [venue, setVenue] = React.useState<VenueRead | null>(null)
    const [open, setOpen] = useState(false);
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

    const handleSubmit = async (updatedData: Partial<VenueUpdate>) => {
        if (!venue) return;
        const updatedVenue = await edit_venue(updatedData, venue?.id);
        if (!updatedVenue.data) return;
        setVenue(updatedVenue.data)
    }

    return (
        <>
            {venue ? (
                <div>
                    <Header venue={venue} onEdit={setOpen} />
                    <EditVenueModal
                        open={open}
                        onOpenChange={setOpen}
                        venue={venue}
                        onSave={handleSubmit}
                    />

                </div>
            ) : (
                <p>Error</p>
            )}
        </>

    )

}
