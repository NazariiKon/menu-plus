import { supabase } from "@/lib/supabase";
import type { ApiResponse, CategoryRead } from "@/types/types";

export async function create_category(
    venueId: string,
    menuId: string,
    name: string,
    position: number = 1,
    image?: File | null
): Promise<ApiResponse<CategoryRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const formData = new FormData();
        formData.append('menu_id', menuId);
        formData.append('name', name);
        formData.append('position', position.toString());
        if (image) {
            formData.append('image_file', image);
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.detail || "Unknown error" };
        }

        const result = await response.json();
        return { success: true, data: result };

    } catch (error) {
        return { success: false, error: "Network error" };
    }
}
