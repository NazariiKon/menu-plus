import { createMenu, deleteMenu, editMenu } from "@/api/menu";
import type { FormValues } from "@/components/NameModal";
import type { ItemRead, MenuRead } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export const useMenus = (menus: MenuRead[] | null | undefined, venueId: string | null | undefined) => {
    const [localMenus, setLocalMenus] = useState<MenuRead[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuRead | null>(null);
    const [menuEditOpen, setMenuEditOpen] = useState(false);
    const [menuCreateOpen, setMenuCreateOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);


    const getMenuById = useCallback((menuId: string): MenuRead | undefined =>
        localMenus?.find(m => m.id === menuId), [localMenus]);

    useEffect(() => {
        setLoading(true)
        if (menus !== undefined && menus !== null) {
            setLocalMenus(menus);
        }
        setLoading(false)
    }, [menus]);

    const handleEditMenu = useCallback((menuId: string) => {
        const menu = getMenuById(menuId);
        if (menu) {
            setSelectedMenu(menu);
            setMenuEditOpen(true);
        }
    }, [getMenuById]);

    const handleEditMenuSubmit = useCallback(async (values: FormValues) => {
        if (!selectedMenu) {
            setMenuEditOpen(false);
            setSelectedMenu(null);
            return;
        }

        try {
            const res = await editMenu(values.name, null, selectedMenu.id, selectedMenu.venue_id);
            if (res?.data) {
                setLocalMenus(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setMenuEditOpen(false);
            setSelectedMenu(null);
        }
    }, [selectedMenu]);

    const changeMenuPosition = useCallback(async (menuId: string, delta: number) => {
        if (!localMenus?.length) return;

        const menu = getMenuById(menuId);
        if (!menu) return;

        const oldPos = menu.position;
        const newPos = oldPos + delta;

        setLocalMenus(prev => {
            if (!prev) return prev;
            return prev.map(m => {
                if (m.id === menuId) return { ...m, position: newPos } as MenuRead;
                if (m.position === newPos) return { ...m, position: oldPos } as MenuRead;
                return m;
            }).sort((a, b) => a.position - b.position);
        });

        try {
            const res = await editMenu(null, newPos, menuId, menu.venue_id);
            if (res?.data) {
                setLocalMenus(res.data.sort((a, b) => a.position - b.position));
            }
        } catch (e) {
            console.error(e);
        }
    }, [getMenuById, localMenus]);

    const handleDeleteMenu = useCallback(async (menuId: string) => {

        if (!localMenus?.length) return;

        try {
            const menu = getMenuById(menuId);
            if (!menu) return;

            const res = await deleteMenu(menu.venue_id, menuId);

            if (res.success) {
                setLocalMenus(prev => prev?.filter(m => m.id !== menuId) ?? null);
            }
        } catch (e) {
            console.error(e);
        }
    }, [getMenuById, localMenus]);

    const [insertAfterMenu, setInsertAfterMenu] = useState(0);
    const handleAddMenuBetween = useCallback((position: number) => {
        setInsertAfterMenu(position);
        setMenuCreateOpen(true);
    }, []);

    const handleCreateMenu = useCallback(
        async (values: FormValues) => {
            if (!venueId) return;
            try {
                const res = await createMenu(venueId, values.name, insertAfterMenu + 1);
                if (res?.data) {
                    setLocalMenus(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setMenuCreateOpen(false);
            }
        },
        [venueId, insertAfterMenu]
    );

    const searchItems = useCallback((query: string): ItemRead[] => {
        const q = query.trim().toLowerCase();

        if (!q || !localMenus) return [];

        return localMenus
            .flatMap((menu) => menu.categories ?? [])
            .flatMap((category) => category.items ?? [])
            .filter((item) => {
                const nameOk = item.name.toLowerCase().includes(q);
                const descOk = item.desc ? item.desc.toLowerCase().includes(q) : false;
                return nameOk || descOk;
            });
    }, [localMenus]);

    return {
        menus: localMenus,
        loading,
        menuEditOpen,
        selectedMenu,
        setMenuEditOpen,
        menuCreateOpen,
        setMenuCreateOpen,
        activeMenuId,
        setActiveMenuId,
        setMenus: setLocalMenus,
        changeMenuPosition,
        handleDeleteMenu,
        getMenuById,
        handleAddMenuBetween,
        handleCreateMenu,
        handleEditMenu,
        handleEditMenuSubmit,
        searchItems
    };
};
