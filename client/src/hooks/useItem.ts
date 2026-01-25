import { useCallback, useState } from "react";
import type { MenuRead, ItemCreate, ItemRead, CategoryRead, ItemUpdate } from "@/types/types";
import { createItem, deleteItem, updateItem } from "@/api/item";
import { useCart } from "@/context/CartContext";

interface UseItemProps {
    venueId: string | undefined;
    activeMenuId: string | null;
    category: CategoryRead | null | undefined;
    setMenus: React.Dispatch<React.SetStateAction<MenuRead[] | null>> | undefined;
}

export const useItem = ({
    venueId,
    activeMenuId,
    category,
    setMenus,
}: UseItemProps) => {
    const [insertAfterItem, setInsertAfterItem] = useState(0);
    const [isItemCreateOpen, setIsItemCreateOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isItemUpdateOpen, setIsItemUpdateOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemRead | null>(null);
    const { updateCartForVenue } = useCart();
    const activeCategoryId = category?.id;

    const handleAddToCart = (item: ItemRead, venueId: string | undefined) => {
        if (!venueId) return;

        const storageKey = `cart_${venueId}`;
        const currentCart = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const existingItemIndex = currentCart.findIndex(
            (cartItem: any) => cartItem.id === item.id
        );

        if (existingItemIndex !== -1) {
            currentCart[existingItemIndex].quantity += 1;
        } else {
            currentCart.push({
                id: item.id,
                name: item.name,
                desc: item.desc,
                price: item.price,
                weight_g: item.weight_g,
                image: item.image,
                quantity: 1,
            });
        }

        localStorage.setItem(storageKey, JSON.stringify(currentCart));

        updateCartForVenue(venueId, currentCart);
    };


    const handleCreateItem = useCallback(
        async (values: ItemCreate) => {
            if (!activeMenuId || !venueId || !activeCategoryId || !setMenus) return;

            try {
                const itemData: ItemCreate = {
                    name: values.name,
                    desc: values.desc ?? null,
                    price: values.price ?? null,
                    weight_g: values.weight_g ?? null,
                    position: insertAfterItem + 1,
                    image_bytes: values.image_bytes ?? null,
                };

                const result = await createItem(
                    venueId,
                    activeMenuId,
                    activeCategoryId,
                    itemData
                );

                if (result.success && result.data) {
                    setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                        if (!prev) return prev;
                        const menuIndex = prev.findIndex((m) => m.id === activeMenuId);
                        if (menuIndex === -1) return prev;

                        const menu = prev[menuIndex];
                        const categoryIndex = menu.categories?.findIndex((c) => c.id === activeCategoryId) ?? -1;
                        if (categoryIndex === -1) return prev;

                        const updatedCategories = menu.categories!.map((cat, i) =>
                            i === categoryIndex ? { ...cat, items: result.data } : cat
                        );

                        const updatedMenu: MenuRead = { ...menu, categories: updatedCategories };
                        return prev.map((m, i) => (i === menuIndex ? updatedMenu : m));
                    });
                }
            } catch (e) {
                console.error(e);
            }
        },
        [activeMenuId, venueId, activeCategoryId, setMenus, insertAfterItem]
    );

    const handleAddItem = useCallback((position: number) => {
        setInsertAfterItem(position);
        setIsItemCreateOpen(true);
    }, []);

    const handleDeleteItem = useCallback(async (itemId: string) => {
        if (!activeMenuId || !venueId || !activeCategoryId || !setMenus) return;

        try {
            const res = await deleteItem(venueId, activeMenuId, activeCategoryId, itemId);
            if (res?.data) {
                setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                    if (!prev) return prev;
                    const menuIndex = prev.findIndex((m) => m.id === activeMenuId!);
                    if (menuIndex === -1) return prev;

                    const categoryIndex = prev[menuIndex].categories?.findIndex((c) => c.id === activeCategoryId!) ?? -1;
                    if (categoryIndex === -1) return prev;

                    const updatedCategory = {
                        ...prev[menuIndex].categories![categoryIndex],
                        items: res.data
                    };

                    const updatedCategories = prev[menuIndex].categories!.map((c, i) =>
                        i === categoryIndex ? updatedCategory : c
                    );

                    const updatedMenu: MenuRead = {
                        ...prev[menuIndex],
                        categories: updatedCategories
                    };

                    return prev.map((m, i) => (i === menuIndex ? updatedMenu : m));
                });
            }
        } catch (e) {
            console.error(e);
        }
    }, [activeMenuId, venueId, activeCategoryId, setMenus]);

    const changeItemPosition = useCallback(
        async (itemId: string, oldPos: number, delta: number) => {
            if (!activeCategoryId || !activeMenuId || !venueId || !setMenus) return;

            const newPos = oldPos + delta;

            setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                if (!prev) return prev;
                const menuIndex = prev.findIndex((m) => m.id === activeMenuId);
                if (menuIndex === -1) return prev;

                const menu = prev[menuIndex];
                const updatedCategories = (menu.categories || []).map((c: CategoryRead) => {
                    if (c.id === activeCategoryId) {
                        const updatedItems = (c.items || []).map((item: ItemRead) => {
                            if (item.id === itemId) return { ...item, position: newPos } as ItemRead;
                            if (item.position === newPos) return { ...item, position: oldPos } as ItemRead;
                            return item;
                        });
                        return { ...c, items: updatedItems };
                    }
                    return c;
                });

                const updatedMenu: MenuRead = { ...menu, categories: updatedCategories };
                return prev.map((m, i) => (i === menuIndex ? updatedMenu : m));
            });
            const item: ItemUpdate = { position: newPos }
            try {
                await updateItem(venueId, activeMenuId, activeCategoryId, itemId, item);
            } catch (e) {
                console.error(e);
            }
        },
        [activeMenuId, venueId, activeCategoryId, setMenus]
    );

    const getItemById = useCallback(
        (itemId: string): ItemRead | undefined => {
            return category?.items?.find((item) => item.id === itemId);
        },
        [category]
    );

    const handleUpdateItemModel = useCallback((itemId: string) => {
        const item = getItemById(itemId);
        if (item) {
            setSelectedItem(item);
            setPreviewImage(item.image || null);
            setIsItemUpdateOpen(true);
        }
    }, [getItemById]);

    const handleUpdateItem = useCallback(async (values: ItemUpdate) => {
        if (!activeMenuId || !selectedItem || !venueId || !activeCategoryId || !setMenus) {
            setIsItemUpdateOpen(false);
            return;
        }

        const hasChanges = Object.entries(values).some(([key, value]) => {
            const currentValue = selectedItem[key as keyof ItemRead];
            return value !== undefined && value !== currentValue;
        });

        if (!hasChanges) {
            setIsItemUpdateOpen(false);
            return;
        }

        try {
            const result = await updateItem(
                venueId,
                activeMenuId,
                activeCategoryId,
                selectedItem.id,
                values
            );

            if (result.success && result.data) {
                setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                    if (!prev) return prev;

                    return prev.map(menu => {
                        if (menu.id === activeMenuId) {
                            return {
                                ...menu,
                                categories: menu.categories?.map(cat =>
                                    cat.id === activeCategoryId
                                        ? {
                                            ...cat,
                                            items: result.data || cat.items
                                        }
                                        : cat
                                ) || []
                            };
                        }
                        return menu;
                    });
                });

                setIsItemUpdateOpen(false);
                setSelectedItem(null);
            }
        } catch (e) {
            console.error("Update item failed:", e);
        }
    }, [activeMenuId, venueId, activeCategoryId, selectedItem, setMenus, updateItem]);


    return {
        handleDeleteItem,
        insertAfterItem,
        isItemCreateOpen,
        setIsItemCreateOpen,
        handleAddItem,
        handleCreateItem,
        changeItemPosition,
        handleUpdateItemModel,
        handleUpdateItem,
        isItemUpdateOpen,
        setIsItemUpdateOpen,
        selectedItem,
        previewImage,
        setPreviewImage,
        handleAddToCart,
    };
};
