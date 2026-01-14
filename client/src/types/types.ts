import type { components } from "./api";

export type ApiComponents = components;

export type RegisterRequest = ApiComponents['schemas']['Register'];
export type LoginRequest = ApiComponents['schemas']['Login'];
export type VenueRead = ApiComponents['schemas']['VenueRead'];
export type VenueBase = ApiComponents['schemas']['VenueBase'];
export type VenueUpdate = ApiComponents['schemas']['VenueUpdate'];
// export type MenuUpdate = ApiComponents['schemas']['MenuUpdate'];
export type MenuRead = ApiComponents['schemas']['MenuRead'];
export type HTTPValidationError = ApiComponents['schemas']['HTTPValidationError'];

export interface ApiResponse<T> {
    success: boolean;
    error?: string;
    message?: string;
    data?: T;
}