import { supabase } from "@/lib/supabase";
import type { ApiResponse, MenuRead } from "@/types/types";


export async function create_menu(venueId: string, name: string, position: number): Promise<ApiResponse<MenuRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const data = {
            "name": name,
            "position": position + 1,
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus`, {
            method: "POST",
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

export async function delete_menu(venueId: string, menuId: string): Promise<ApiResponse<MenuRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });

        const result = await response.json();
        return response.ok
            ? { success: true, data: result }
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}