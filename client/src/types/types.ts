import type { components } from "./api";

export type ApiComponents = components;

export type RegisterRequest = ApiComponents['schemas']['Register'];
export type LoginRequest = ApiComponents['schemas']['Login'];

export type VenueRead = ApiComponents['schemas']['VenueRead'];
export type VenueBase = ApiComponents['schemas']['VenueBase'];
export type VenueUpdate = ApiComponents['schemas']['VenueUpdate'];

// export type MenuUpdate = ApiComponents['schemas']['MenuUpdate'];
export type MenuRead = ApiComponents['schemas']['MenuRead'];

export type CategoryRead = ApiComponents['schemas']['CategoryRead'];

export type ItemRead = ApiComponents['schemas']['ItemRead'];
export type ItemCreate = ApiComponents['schemas']['ItemCreate'];
export type ItemUpdate = ApiComponents['schemas']['ItemUpdate'];

export type HTTPValidationError = ApiComponents['schemas']['HTTPValidationError'];

export interface ApiResponse<T> {
    success: boolean;
    error?: string;
    message?: string;
    data?: T;
}

export interface AdminCallbacksCategories {
    onAddCategory: (position: number) => void;
    onDeleteCategory: (categoryId: string) => void;
    onUpdateCategory: (categoryId: string) => void;
    onMoveUp: (categoryId: string, position: number) => void;
    onMoveDown: (categoryId: string, position: number) => void;
    setActiveCategoryId: (categoryId: string) => void;
}

export interface AdminCallbacksItems {
    onAddItem: (position: number) => void;
    onDeleteItem: (item: ItemRead) => void;
    onUpdateItem: (itemId: string) => void;
    onMoveUp: (itemId: string, position: number) => void;
    onMoveDown: (itemId: string, position: number) => void;
    onAddToCart: (item: ItemRead) => void;
}
