import type { LoginRequest, RegisterRequest, ApiResponse } from "@/types/types";
import type { User } from "@supabase/supabase-js";

export async function signup(data: RegisterRequest): Promise<ApiResponse<User>> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return response.ok
            ? { success: true, data: result.user }
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function login(data: LoginRequest): Promise<ApiResponse<User>> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.access_token) {
                localStorage.setItem('access_token', result.access_token);
                if (result.refresh_token) {
                    localStorage.setItem('refresh_token', result.refresh_token);
                }
            }
            return { success: true, data: result.user };
        } else {
            return { success: false, error: result.detail || "Unknown error" };
        }
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}
