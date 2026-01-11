import type { components } from "./api";

export type ApiComponents = components;

export type RegisterRequest = ApiComponents['schemas']['Register'];
export type LoginRequest = ApiComponents['schemas']['Login'];
export type VenueRead = ApiComponents['schemas']['VenueRead'];
export type HTTPValidationError = ApiComponents['schemas']['HTTPValidationError'];
export interface ApiResponse<T> {
    success: boolean;
    error?: string;
    message?: string;
    data?: T;
}