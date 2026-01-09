import type { RegisterRequest, LoginRequest, Response } from '../types/api';

export async function signup(data: RegisterRequest): Promise<Response> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return response.ok
            ? { success: true }
            : { success: false, error: result.detail || "Unknown error" };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function login(data: LoginRequest): Promise<Response> {
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
            return { success: true, user: result.user };
        } else {
            return { success: false, error: result.detail || "Unknown error" };
        }
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}
