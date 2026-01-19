// useItem.tsx
import { useCallback, useState } from "react";
import type { MenuRead, ItemCreate } from "@/types/types";
import { createItem } from "@/api/item";

interface UseItemProps {
    venueId: string | undefined;
    activeMenuId: string | null;
    activeCategoryId: string | null;
    setMenus: React.Dispatch<React.SetStateAction<MenuRead[] | null>> | undefined;
}

export const useItem = ({
    venueId,
    activeMenuId,
    activeCategoryId,
    setMenus,
}: UseItemProps) => {
    const [insertAfterItem, setInsertAfterItem] = useState(0);
    const [isItemCreateOpen, setIsItemCreateOpen] = useState(false);

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
                    image: values.image ?? null,
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
        console.log(position);
        setInsertAfterItem(position);
        setIsItemCreateOpen(true);
    }, [setInsertAfterItem, setIsItemCreateOpen]);

    return {
        insertAfterItem,
        isItemCreateOpen,
        setIsItemCreateOpen,
        handleAddItem,
        handleCreateItem,
    };
};
