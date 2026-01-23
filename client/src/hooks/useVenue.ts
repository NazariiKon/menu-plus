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
                const response = await editVenue(updatedData, venue.id);

                if (response && response.data) {
                    const newData = response.data;

                    setVenue(prev => {
                        if (!prev) return newData;

                        return {
                            ...prev,
                            ...newData,
                            menus: (newData.menus && newData.menus.length > 0)
                                ? newData.menus
                                : prev.menus
                        };
                    });

                    setVenueEditOpen(false);
                }
            } catch (error) {
                console.error("Update failed", error);
            }
        },
        [venue, setVenue]
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
