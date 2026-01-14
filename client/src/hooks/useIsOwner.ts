import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Venue {
    id: string;
    owner_id: string;
}

export const useIsOwner = (venue: Venue | null) => {
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkOwner = async () => {
            if (!venue) {
                setIsOwner(false);
                setLoading(false);
                return;
            }

            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    setIsOwner(false);
                    setLoading(false);
                    return;
                }

                const userId = session?.user?.id;
                const isOwner = userId === venue.owner_id;

                setIsOwner(isOwner);
            } catch (err) {
                console.error('Error checking owner:', err);
                setIsOwner(false);
            } finally {
                setLoading(false);
            }
        };

        checkOwner();
    }, [venue]);

    return { isOwner, loading };
};
