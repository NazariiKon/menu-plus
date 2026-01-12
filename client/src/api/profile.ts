import { supabase } from "@/lib/supabase";
import type { VenueRead, ApiResponse } from "@/types/types";

export async function get_my_venues(): Promise<ApiResponse<VenueRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/my-venues`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();

        if (response.ok) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || "Unknown error" };
        }
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}
