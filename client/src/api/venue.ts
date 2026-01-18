import { supabase } from "@/lib/supabase";
import type { ApiResponse, VenueBase, VenueRead, VenueUpdate } from "@/types/types";
export type VenueCreateInput = Pick<VenueBase, "name">;

export async function createVenue(data: VenueCreateInput): Promise<ApiResponse<VenueRead>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return response.ok
            ? result
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteVenue(venueId: string): Promise<ApiResponse<VenueRead>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });

        const result = await response.json();
        return response.ok
            ? result
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function getMenuBySlug(slug: string): Promise<ApiResponse<VenueRead>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/p/${slug}`, {
            headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.error || `HTTP ${response.status}` };
        }

        const result = await response.json();
        return { success: true, data: result };

    } catch (error) {
        console.error("getMenuBySlug error:", error);
        return { success: false, error: "Network error" };
    }
}


export async function editVenue(data: VenueUpdate, venue_id: string): Promise<ApiResponse<VenueRead>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venue_id}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return response.ok
            ? { success: true, data: result }
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}