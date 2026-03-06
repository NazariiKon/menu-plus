import { supabase } from "@/lib/supabase";
import type { ApiResponse, ItemCreate, ItemRead, ItemUpdate } from "@/types/types";

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

        if (itemData.image_bytes) formData.append('image_bytes', itemData.image_bytes);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}/items/`, {
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

export async function deleteItem(venueId: string, menuId: string, categoryId: string, itemId: string):
    Promise<ApiResponse<ItemRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}/items/${itemId}`, {
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

export async function getItems(
    venueId: string,
    menuId: string,
    categoryId: string
): Promise<ApiResponse<ItemRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}/items`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();
        return response.ok
            ? { success: true, data: result }
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateItem(
    venueId: string,
    menuId: string,
    categoryId: string,
    itemId: string,
    item: Partial<ItemUpdate>
): Promise<ApiResponse<ItemRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const formData = new FormData();
        if (item.name) formData.append('name', item.name);
        if (item.desc) formData.append('desc', item.desc);
        if (item.price) formData.append('price', item.price?.toString());
        if (item.weight_g) formData.append('weight_g', item.weight_g?.toString());
        if (item.position) formData.append('position', item.position.toString());
        if (item.image_bytes) formData.append('image_bytes', item.image_bytes);

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}/items/${itemId}`,
            {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            }
        );

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
