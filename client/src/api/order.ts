import { supabase } from "@/lib/supabase";
import type { ApiResponse, OrderRead } from "@/types/types";

export interface CreateOrderRequest {
    name?: string;
    desc?: string;
    price?: string | number;
    weight_g?: number;
    items: Array<{
        qty: number;
        note?: string;
        size?: string;
        product_id: string;
        price_per_item?: number;
    }>;
}

export async function createOrder(
    venueId: string,
    orderData: CreateOrderRequest
): Promise<ApiResponse<OrderRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) {
            return { success: false, error: "Not authenticated" };
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/orders/${venueId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            }
        );

        const result = await response.json();
        return response.ok && response.status === 201
            ? { success: true, data: result }
            : { success: false, error: result.detail || `HTTP ${response.status}` };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function getOrdersByVenue(venueId: string,): Promise<ApiResponse<OrderRead[]>> {
    try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (error || !token) return { success: false, error: "Not authenticated" };

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/orders/${venueId}`,
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