import { editVenue, getMenuBySlug } from "@/api/venue";
import type { VenueRead, VenueUpdate } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export const useVenueBySlug = (slug: string) => {
    const [venue, setVenue] = useState<VenueRead | null>(null);
    const [venueEditOpen, setVenueEditOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadVenue = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getMenuBySlug(slug);
            if (result.success && result.data) {
                setVenue(result.data);
            } else {
                setVenue(null);
            }
        } catch (e) {
            console.error(e);
            setVenue(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    const handleVenueSubmit = useCallback(
        async (updatedData: Partial<VenueUpdate>) => {
            if (!venue) return;
            try {
                const updatedVenue = await editVenue(updatedData, venue.id);
                if (updatedVenue.data) setVenue(updatedVenue.data);
            } catch { }
            setVenueEditOpen(false);
        },
        [venue]
    );

    const openVenueEdit = useCallback(() => {
        if (venue) setVenueEditOpen(true);
    }, [venue]);

    useEffect(() => { loadVenue(); }, [loadVenue]);

    return {
        venue,
        loading,
        loadVenue,
        setVenue,
        handleVenueSubmit,
        venueEditOpen,
        setVenueEditOpen,
        openVenueEdit
    };
};
