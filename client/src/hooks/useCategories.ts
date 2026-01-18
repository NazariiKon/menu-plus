import { useCallback, useState } from "react";
import type { CategoryRead, MenuRead } from "@/types/types";
import { createCategory, deleteCategory, updateCategory } from "@/api/category";

interface UseCategoriesProps {
    venueId: string | undefined;
    activeMenuId: string | null;
    menus: MenuRead[] | null | undefined;
    setMenus: React.Dispatch<React.SetStateAction<MenuRead[] | null>> | undefined;
    setActiveMenuId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useCategories = ({
    venueId,
    activeMenuId,
    menus,
    setMenus,
    setActiveMenuId
}: UseCategoriesProps) => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryRead | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [insertAfterCategory, setInsertAfterCategory] = useState(0);
    const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false);
    const [isCategoryUpdateOpen, setIsCategoryUpdateOpen] = useState(false);

    const getCategoryById = useCallback(
        (categoryId: string): CategoryRead | undefined => {
            if (!activeMenuId || !menus) return undefined;
            const menu = menus.find((m) => m.id === activeMenuId);
            return menu?.categories?.find((cat) => cat.id === categoryId);
        },
        [activeMenuId, menus]
    );

    const changeCategoryPosition = useCallback(
        async (categoryId: string, oldPos: number, delta: number) => {
            if (!activeMenuId || !venueId || !menus || !setMenus) return;

            const newPos = oldPos + delta;
            const activeMenu = menus.find((m) => m.id === activeMenuId);
            if (!activeMenu) return;

            setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                if (!prev) return prev;
                const menuIndex = prev.findIndex((m) => m.id === activeMenuId);
                if (menuIndex === -1) return prev;

                const menu = prev[menuIndex];
                const updatedCategories = (menu.categories || []).map((c: CategoryRead) => {
                    if (c.id === categoryId) return { ...c, position: newPos } as CategoryRead;
                    if (c.position === newPos) return { ...c, position: oldPos } as CategoryRead;
                    return c;
                });

                const updatedMenu: MenuRead = { ...menu, categories: updatedCategories };
                return prev.map((m, i) => (i === menuIndex ? updatedMenu : m));
            });

            try {
                await updateCategory(venueId, activeMenuId, categoryId, undefined, undefined, newPos);
            } catch (e) {
                console.error(e);
            }
        },
        [activeMenuId, venueId, menus, setMenus]
    );

    const handleCreateCategory = useCallback(
        async (values: { name: string; image?: File | null | undefined }) => {
            if (!activeMenuId || !venueId || !setMenus) return;

            try {
                const result = await createCategory(
                    venueId,
                    activeMenuId,
                    values.name,
                    insertAfterCategory + 1,
                    values.image || undefined
                );
                if (result.success && result.data) {
                    setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                        if (!prev) return prev;
                        const menuIndex = prev.findIndex((m) => m.id === activeMenuId!);
                        if (menuIndex === -1) return prev;

                        const updatedMenu: MenuRead = { ...prev[menuIndex], categories: result.data };
                        return prev.map((m, i) => (i === menuIndex ? updatedMenu : m));
                    });
                }
            } catch (e) {
                console.error(e);
            }
        },
        [activeMenuId, venueId, insertAfterCategory, setMenus]
    );

    const handleDeleteCategory = useCallback(
        async (categoryId: string) => {
            if (!activeMenuId || !venueId || !setMenus) return;

            try {
                const res = await deleteCategory(venueId, activeMenuId, categoryId);
                if (res?.data) {
                    setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                        if (!prev) return prev;
                        const menuIndex = prev.findIndex((m) => m.id === activeMenuId!);
                        if (menuIndex === -1) return prev;

                        const updatedMenu: MenuRead = { ...prev[menuIndex], categories: res.data };
                        return prev.map((m, i) => (i === menuIndex ? updatedMenu : m));
                    });
                }
            } catch (e) {
                console.error(e);
            }
        },
        [activeMenuId, venueId, setMenus]
    );

    const handleAddCategory = useCallback((position: number) => {
        setInsertAfterCategory(position);
        setIsCategoryCreateOpen(true);
    }, [setIsCategoryCreateOpen, setInsertAfterCategory]);

    const handleUpdateCategoryModal = useCallback((categoryId: string) => {
        const category = getCategoryById(categoryId) ?? null;
        console.log("UPDATE MODAL OPEN", category);
        setSelectedCategory(category);
        if (category?.image)
            setPreviewImage(category?.image)
        setIsCategoryUpdateOpen(true);
    }, [setSelectedCategory, setIsCategoryUpdateOpen, setPreviewImage, getCategoryById]);

    const handleUpdateCategory = useCallback(async (values: {
        name: string;
        image?: File | null;
        menuId?: string
    }) => {
        if (!activeMenuId || !selectedCategory || !venueId || !setMenus) return;

        const newMenuId = values.menuId || activeMenuId;
        const hasChanges =
            values.name !== selectedCategory.name ||
            values.image !== null ||
            newMenuId !== activeMenuId;

        if (!hasChanges) {
            setIsCategoryUpdateOpen(false);
            return;
        }

        try {
            const result = await updateCategory(
                venueId,
                activeMenuId,
                selectedCategory.id,
                newMenuId,
                values.name,
                undefined,
                values.image || null
            );

            if (result.success && result.data) {
                setMenus((prev: MenuRead[] | null): MenuRead[] | null => {
                    if (!prev) return prev;

                    return prev.map(menu => {
                        if (menu.id === activeMenuId) {
                            return {
                                ...menu,
                                categories: menu.id === newMenuId
                                    ? result.data
                                    : menu.categories?.filter(c => c.id !== selectedCategory.id) || []
                            };
                        }
                        if (menu.id === newMenuId) {
                            return {
                                ...menu,
                                categories: result.data
                            };
                        }
                        return menu;
                    });
                });

                setIsCategoryUpdateOpen(false);
            }
        } catch (e) {
            console.error("Update failed:", e);
            alert("Failed to update category");
        }
    }, [activeMenuId, venueId, selectedCategory, setMenus]);




    const handleImageChange = useCallback((file: File | null | undefined) => {
        if (!file) {
            setPreviewImage(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    return {
        selectedCategory,
        previewImage,
        insertAfterCategory,
        isCategoryCreateOpen,
        isCategoryUpdateOpen,
        setIsCategoryCreateOpen,

        getCategoryById,
        handleImageChange,
        handleAddCategory,
        handleUpdateCategory,
        handleUpdateCategoryModal,
        handleCreateCategory,
        handleDeleteCategory,
        changeCategoryPosition,
        setIsCategoryUpdateOpen
    };

};
