import { supabase } from "@/lib/supabase";
import type { ApiResponse, ItemCreate, ItemRead } from "@/types/types";

export async function createItem(
    venueId: string,
    menuId: string,
    categoryId: string,
    itemData: ItemCreate,
): Promise<ApiResponse<ItemRead[]>> {
    try {

        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const formData = new FormData();
        formData.append('name', itemData.name);
        formData.append('desc', itemData.desc || '');
        formData.append('price', itemData.price?.toString() ?? '0');
        formData.append('weight_g', itemData.weight_g?.toString() ?? '0');
        formData.append('position', itemData.position?.toString() || '1');

        if (itemData.image) formData.append('image', itemData.image);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}/items`, {
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
