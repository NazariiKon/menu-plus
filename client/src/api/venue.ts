import { supabase } from "@/lib/supabase";
import type { ApiResponse, VenueBase, VenueRead } from "@/types/types";
export type VenueCreateInput = Pick<VenueBase, "name">;

export async function create_venue(data: VenueCreateInput): Promise<ApiResponse<VenueRead>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/create-venue`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return response.ok
            ? result
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Network error" };
    }
}
