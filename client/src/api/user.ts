import type { RegisterRequest } from '../types/api';

interface SignupResponse {
    success: boolean;
    error?: string;
}

export async function signup(data: RegisterRequest): Promise<SignupResponse> {
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
