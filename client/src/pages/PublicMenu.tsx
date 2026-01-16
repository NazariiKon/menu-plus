import * as React from "react";
import { useParams } from "react-router-dom";

import { editVenue, getMenuBySlug } from "@/api/venue";
import type { CategoryRead, MenuRead, VenueRead, VenueUpdate } from "@/types/types";
import { useEffect, useCallback, useMemo, useState } from "react";
import Header from "@/components/MenuComponents/Header";
import EditVenueModal from "@/components/MenuComponents/EditMenuModal";
import { Details } from "@/components/MenuComponents/Details";
import { MenuSubmenuTabs } from "@/components/MenuComponents/MenuSubmenuTabs";
import { NameModal, type FormValues } from "@/components/NameModal";
import { createMenu, deleteMenu, editMenu } from "@/api/menu";
import { CategoriesList } from "@/components/MenuComponents/CategoriesList";
import { useIsOwner } from "@/hooks/useIsOwner";
import { createCategory, deleteCategory, updateCategory } from "@/api/category";

interface AdminActions {
    onAddCategory: (position: number) => void;
    onDeleteCategory: (categoryId: string) => void;
    onEditCategory: (categoryId: string) => void;
    onMoveUp: (categoryId: string, position: number) => void;
    onMoveDown: (categoryId: string, position: number) => void;
}

export default function PublicMenu() {
    const { slug } = useParams<{ slug: string }>();

    const [venue, setVenue] = useState<VenueRead | null>(null);
    const [menus, setMenus] = useState<MenuRead[] | null>([]);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [selectedMenu, setSelectedMenu] = useState<MenuRead | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [modals, setModals] = useState({
        venueEdit: false,
        menuCreate: false,
        menuEdit: false,
        categoryCreate: false,
    });

    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);

    const [insertAfterMenu, setInsertAfterMenu] = useState(0);
    const [insertAfterCategory, setInsertAfterCategory] = useState(0);

    const { isOwner: isAdminMode, loading: ownerLoading } = useIsOwner(venue);

    const activeMenu = menus?.find(m => m.id === activeMenuId) || null;
    const isLoading = initialLoading || ownerLoading;

    const getMenuById = useCallback((menuId: string): MenuRead | undefined =>
        menus?.find(m => m.id === menuId), [menus]
    );

    const loadData = useCallback(async () => {
        if (!slug) return;

        setInitialLoading(true);
        setError(undefined);

        try {
            const result = await getMenuBySlug(slug);
            if (result.success && result.data) {
                setVenue(result.data);
                const menusList = result.data.menus ?? [];
                setMenus(menusList);
                if (menusList.length > 0 && !activeMenuId) {
                    setActiveMenuId(menusList[0].id);
                }
            } else {
                setError(result.error || "Failed to load venue data");
            }
        } catch {
            setError("Failed to load venue data");
        } finally {
            setInitialLoading(false);
        }
    }, [slug]);

    const handleImageChange = useCallback((file: File | null) => {
        if (!file) {
            setPreviewImage(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const changeCategoryPosition = useCallback(
        async (categoryId: string, oldPos: number, delta: number) => {
            if (!activeMenu || !venue || !menus) return;

            const newPos = oldPos + delta;

            setMenus(prev => {
                if (!prev) return prev;
                const menuIndex = prev.findIndex(m => m.id === activeMenu.id);
                if (menuIndex === -1) return prev;

                const menu = prev[menuIndex];
                const updatedCategories = (menu.categories || []).map(c => {
                    if (c.id === categoryId) return { ...c, position: newPos } as CategoryRead;
                    if (c.position === newPos) return { ...c, position: oldPos } as CategoryRead;
                    return c;
                });

                const updatedMenu = { ...menu, categories: updatedCategories } as MenuRead;
                return prev.map((m, i) => i === menuIndex ? updatedMenu : m) as MenuRead[];
            });

            try {
                await updateCategory(venue.id, activeMenu.id, categoryId, undefined, newPos);
            } catch (e) {
                console.error(e);
                loadData();
            }
        },
        [activeMenu, venue, menus]
    );

    const changeMenuPosition = useCallback(
        async (menuId: string, delta: number) => {
            if (!menus || !venue) return;

            const menu = getMenuById(menuId);
            if (!menu) return;

            const oldPos = menu.position;
            const newPos = oldPos + delta;

            setMenus(prev => {
                if (!prev) return prev;
                return prev.map(m => {
                    if (m.id === menuId) return { ...m, position: newPos } as MenuRead;
                    if (m.position === newPos) return { ...m, position: oldPos } as MenuRead;
                    return m;
                }) as MenuRead[];
            });

            try {
                const res = await editMenu(null, newPos, menuId, venue.id);
                if (res?.data) {
                    setMenus(res.data);
                }
            } catch (e) {
                console.error(e);
                loadData();
            }
        },
        [getMenuById, menus, venue]
    );

    const handleMoveLeft = useCallback((menuId: string) => changeMenuPosition(menuId, -1), [changeMenuPosition]);
    const handleMoveRight = useCallback((menuId: string) => changeMenuPosition(menuId, 1), [changeMenuPosition]);

    const handleEditMenu = useCallback(
        (menuId: string) => {
            const menu = getMenuById(menuId);
            if (menu) {
                setSelectedMenu(menu);
                setModals(p => ({ ...p, menuEdit: true }));
            }
        },
        [getMenuById]
    );

    const handleDeleteMenu = useCallback(async (menuId: string) => {
        if (!venue || !menus) return;

        try {
            const res = await deleteMenu(venue.id, menuId);

            if (res.success) {
                const updatedMenus = (menus || []).filter((m: any) => m.id !== menuId);
                setMenus(updatedMenus);

                const newActiveId = updatedMenus[0]?.id || null;
                setActiveMenuId(newActiveId);
            }
        } catch (e) {
            console.error(e);
            loadData();
        }
    }, [venue, menus]);


    const handleAddMenuBetween = useCallback((position: number) => {
        setInsertAfterMenu(position);
        setModals(p => ({ ...p, menuCreate: true }));
    }, []);

    const handleCreateCategory = useCallback(
        async (values: FormValues) => {
            if (!activeMenu || !venue) return;

            try {
                const result = await createCategory(venue.id, activeMenu.id, values.name, insertAfterCategory + 1, values.image || undefined);
                if (result.success && result.data) {
                    setMenus(prev => {
                        if (!prev || !activeMenu) return prev;
                        const menuIndex = prev.findIndex(m => m.id === activeMenu.id);
                        if (menuIndex === -1) return prev;

                        const updatedMenu = { ...prev[menuIndex], categories: result.data } as MenuRead;
                        return prev.map((m, i) => i === menuIndex ? updatedMenu : m) as MenuRead[];
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setModals(p => ({ ...p, categoryCreate: false }));
                setPreviewImage(null);
            }
        },
        [activeMenu, venue, insertAfterCategory]
    );

    const handleDeleteCategory = useCallback(
        async (categoryId: string) => {
            if (!activeMenu || !venue) return;

            try {
                const res = await deleteCategory(venue.id, activeMenu.id, categoryId);
                if (res?.data) {
                    setMenus(prev => {
                        if (!prev || !activeMenu) return prev;
                        const menuIndex = prev.findIndex(m => m.id === activeMenu.id);
                        if (menuIndex === -1) return prev;

                        const updatedMenu = { ...prev[menuIndex], categories: res.data } as MenuRead;
                        return prev.map((m, i) => i === menuIndex ? updatedMenu : m) as MenuRead[];
                    });
                }
            } catch (e) {
                console.error(e);
            }
        },
        [activeMenu, venue]
    );

    const handleAddCategory = useCallback((position: number) => {
        setInsertAfterCategory(position);
        setModals(p => ({ ...p, categoryCreate: true }));
    }, []);

    const handleCreateMenu = useCallback(
        async (values: FormValues) => {
            if (!venue) return;
            try {
                const res = await createMenu(venue.id, values.name, insertAfterMenu);
                if (res?.data) {
                    setMenus(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setModals(p => ({ ...p, menuCreate: false }));
            }
        },
        [venue, insertAfterMenu]
    );

    const handleEditMenuSubmit = useCallback(
        async (values: FormValues) => {
            if (!selectedMenu || !venue || selectedMenu.name === values.name) return;
            try {
                const res = await editMenu(values.name, null, selectedMenu.id, venue.id);
                if (res?.data) {
                    setMenus(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setModals(p => ({ ...p, menuEdit: false }));
                setSelectedMenu(null);
            }
        },
        [selectedMenu, venue]
    );

    const handleVenueSubmit = useCallback(
        async (updatedData: Partial<VenueUpdate>) => {
            if (!venue) return;
            try {
                const updatedVenue = await editVenue(updatedData, venue.id);
                if (updatedVenue.data) setVenue(updatedVenue.data);
            } catch { }
            setModals(p => ({ ...p, venueEdit: false }));
        },
        [venue]
    );

    useEffect(() => {
        loadData();
    }, [loadData]);

    const adminActions = useMemo<AdminActions>(
        () => ({
            onAddCategory: handleAddCategory,
            onDeleteCategory: handleDeleteCategory,
            onEditCategory: () => { },
            onMoveUp: (id, pos) => changeCategoryPosition(id, pos, -1),
            onMoveDown: (id, pos) => changeCategoryPosition(id, pos, 1),
        }),
        [handleAddCategory, handleDeleteCategory, changeCategoryPosition]
    );

    if (isLoading) return <div className="flex items-center justify-center min-h-dvh">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-dvh text-red-500">{error}</div>;

    return (
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[450px] bg-background text-foreground">
            <Header venue={venue!} onEdit={() => setModals(p => ({ ...p, venueEdit: true }))} />
            <Details venue={venue!} />

            <MenuSubmenuTabs
                menus={menus ?? []}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onAddBetween={handleAddMenuBetween}
                onValueChange={setActiveMenuId}
                value={activeMenuId ?? ""}
            />

            <CategoriesList
                key={activeMenuId}
                categories={activeMenu?.categories ?? []}
                isAdmin={isAdminMode}
                onAdminActions={adminActions}
            />

            <NameModal
                open={modals.categoryCreate}
                onOpenChange={open => setModals(p => ({ ...p, categoryCreate: open }))}
                onSubmit={handleCreateCategory}
                title="Create category"
                description="Enter a category name and optionally add an image."
                submitLabel="Create"
                placeholder="e.g. Desserts"
                showImage={true}
                imagePreview={previewImage}
                onImageChange={handleImageChange}
            />

            <NameModal
                open={modals.menuCreate}
                onOpenChange={open => setModals(p => ({ ...p, menuCreate: open }))}
                onSubmit={handleCreateMenu}
                title="Create menu"
                description="Enter a menu name."
                submitLabel="Create"
                placeholder="e.g. Desserts"
            />

            <NameModal
                open={modals.menuEdit}
                onOpenChange={open => setModals(p => ({ ...p, menuEdit: open }))}
                onSubmit={handleEditMenuSubmit}
                title="Edit menu name"
                description="Enter a new menu name."
                submitLabel="Save"
                initialName={selectedMenu?.name ?? ""}
            />

            <EditVenueModal
                open={modals.venueEdit}
                onOpenChange={open => setModals(p => ({ ...p, venueEdit: open }))}
                venue={venue!}
                onSave={handleVenueSubmit}
            />
        </div>
    );
}
