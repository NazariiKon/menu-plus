import { supabase } from "@/lib/supabase";
import type { ApiResponse, CategoryRead } from "@/types/types";

export async function createCategory(
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

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/`, {
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

export async function deleteCategory(venueId: string, menuId: string, categoryId: string): Promise<ApiResponse<CategoryRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}`, {
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

export async function updateCategory(
    venueId: string,
    menuId: string,
    categoryId: string,
    newMenuId?: string,
    name?: string,
    position?: number,
    image?: File | null
): Promise<ApiResponse<CategoryRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const formData = new FormData();
        if (name !== undefined) formData.append('name', name);
        if (position !== undefined) formData.append('position', position.toString());
        if (newMenuId !== undefined) formData.append('new_menu_id', newMenuId);
        if (image) formData.append('image_file', image);

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/venues/${venueId}/menus/${menuId}/categories/${categoryId}`,
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
