import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ItemRead } from '@/types/types';

interface CartItem extends ItemRead {
    quantity: number;
    notes?: string;
}

interface CartContextType {
    cart: CartItem[];
    currentVenueId: string | null;
    setCurrentVenueId: (id: string | null) => void;

    addToCart: (item: ItemRead) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;

    getTotalPrice: () => number;
    getTotalItems: () => number;

    updateCartForVenue: (venueId: string, newCart: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [currentVenueId, setCurrentVenueId] = useState<string | null>(null);
    const getStorageKey = (venueId: string) => `cart_${venueId}`;

    useEffect(() => {
        if (!currentVenueId) {
            setCart([]);
            return;
        }

        const key = `cart_${currentVenueId}`;

        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as CartItem[];
                setCart(parsed);
            } catch (e) {
                console.error(`Failed to parse cart for ${key}`, e);
                setCart([]);
            }
        } else {
            setCart([]);
        }
    }, [currentVenueId]);


    useEffect(() => {
        if (!currentVenueId) return;
        const key = getStorageKey(currentVenueId);
        try {
            localStorage.setItem(key, JSON.stringify(cart));
        } catch (e) {
            console.error(`Failed to save cart for ${key}`, e);
        }
    }, [cart, currentVenueId]);

    const addToCart = (item: ItemRead) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((i) => i.id === item.id);
            if (existingIndex !== -1) {
                return prev.map((i, idx) =>
                    idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            const price = Number(item.price) || 0;
            return total + price * item.quantity;
        }, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const updateCartForVenue = useCallback(
        (venueId: string, newCart: CartItem[]) => {
            if (currentVenueId === venueId) {
                setCart(newCart);
            }

            const key = getStorageKey(venueId);
            try {
                localStorage.setItem(key, JSON.stringify(newCart));
            } catch (e) {
                console.error(`Failed to save cart for ${key}`, e);
            }
        },
        [currentVenueId, getStorageKey]
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                currentVenueId,
                setCurrentVenueId,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems,
                updateCartForVenue,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
