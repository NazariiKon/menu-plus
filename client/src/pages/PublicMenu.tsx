import * as React from "react"
import { useParams } from "react-router-dom"

import { edit_venue, get_menu_by_slug } from "@/api/venue"
import type { MenuRead, VenueRead, VenueUpdate } from "@/types/types"
import { useEffect, useState } from "react"
import Header from "@/components/MenuComponents/Header"
import EditVenueModal from "@/components/MenuComponents/EditMenuModal"
import { Details } from "@/components/MenuComponents/Details"
import { MenuSubmenuTabs } from "@/components/MenuComponents/MenuSubmenuTabs"
import { NameModal, type FormValues } from "@/components/NameModal"
import { create_menu, delete_menu, edit_menu } from "@/api/menu"
import { CategoriesList } from "@/components/MenuComponents/CategoriesList"
import { useIsOwner } from "@/hooks/useIsOwner"
import { create_category } from "@/api/category"

const gradientBtn =
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 hover:bg-primary/90 font-semibold"

function formatPrice(price: number, currency?: string | null) {
    const cur = currency ?? "USD"
    return `${price.toFixed(2)} ${cur}`
}

export default function PublicMenu() {
    const { slug } = useParams<{ slug: string }>()

    const [venue, setVenue] = React.useState<VenueRead | null>(null)
    const [menus, setMenus] = React.useState<MenuRead[] | null>(null)
    const [activeMenu, setActiveMenu] = React.useState<MenuRead | null>(null)
    const [selectedMenu, setSelectedMenu] = React.useState<MenuRead | null>(null)
    const [open, setOpen] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openCreateCategory, setOpenCreateCategory] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | undefined>(undefined)
    const [insertAfterMenu, setInsertAfterMenu] = useState<number>(0);
    const [insertAfterCategory, setInsertAfterCategory] = useState<number>(0);
    const { isOwner: isAdminMode, loading: ownerLoading } = useIsOwner(venue);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageChange = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    const getMenuById = (menuId: string) => {
        if (!menus) return;
        return menus.find(menu => menu.id === menuId);
    }

    const changePosition = async (menuId: string, delta: number) => {
        if (!menus || !venue) return;

        const currentMenu = getMenuById(menuId);
        if (!currentMenu) return;

        const oldPos = currentMenu.position;
        const newPos = oldPos + delta;

        setMenus(prev => {
            if (!prev) return prev;
            return prev.map(m => {
                if (m.id === menuId) {
                    return { ...m, position: newPos };
                }
                if (m.position === newPos) {
                    return { ...m, position: oldPos };
                }
                return m;
            });
        });

        try {
            const res = await edit_menu(null, newPos, menuId, venue.id);
            if (!res || !res.data) {
                console.error("Failed to update menu position on server");
            } else {
                setMenus(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleLeftBtn = async (menuId: string) => {
        changePosition(menuId, -1);
    }

    const onChangeMenu = async (menuId: string) => {
        const selectedMenu = getMenuById(menuId);
        if (!selectedMenu) return;
        console.log(selectedMenu);
        setActiveMenu(selectedMenu);
    }

    const handleRightBtn = async (menuId: string) => {
        changePosition(menuId, 1);
    }

    const handleEditBtn = (menuId: string) => {
        const currentMenu = getMenuById(menuId);
        if (currentMenu) {
            setSelectedMenu(currentMenu);
            setOpenEdit(true);
        } else {
            console.log(`Menu ${menuId} doesn't exist`);
        }
    };

    const handleEditSubmit = async (values: FormValues) => {
        if (selectedMenu?.name === values.name || !selectedMenu || !venue) return;
        const res = await edit_menu(values.name, null, selectedMenu.id, venue.id);
        if (!res || !res.data) return;
        setMenus(res.data);
    };

    const deleteMenu = async (menuId: string) => {
        if (!venue) return;
        const res = await delete_menu(venue.id, menuId);
        if (!res || !res.data) return;
        setMenus(res.data);
    }

    const handleAddBetween = (position: number) => {
        setInsertAfterMenu(position);
        setOpenCreate(true);
    }

    const handleCreate = async (values: FormValues) => {
        if (!venue) return;
        const res = await create_menu(venue.id, values.name, insertAfterMenu);
        if (!res || !res.data) return;
        setMenus(res.data);
    };

    const handleCreateCategory = (position: number) => {
        setInsertAfterCategory(position);
        setOpenCreateCategory(true);
    }

    const createCategory = async (values: FormValues) => {
        if (!activeMenu || !venue) return;
        const result = await create_category(venue.id, activeMenu.id, values.name, insertAfterCategory + 1, values.image || undefined);
        console.log(result);

        if (result.success) {
            setOpenCreate(false);
            load();
        }
    };

    const load = async () => {
        setLoading(true);
        if (!slug) return;
        const result = await get_menu_by_slug(slug);

        if (result.success && result.data) {
            setVenue(result.data);
            setMenus(result.data.menus ? result.data.menus : [])
            setActiveMenu(result.data.menus ? result.data.menus[1] : null);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    useEffect(() => {
        load()
    }, [slug])


    const menu = venue?.menus?.[0] ?? null
    const categories = menu?.categories ?? []
    const defaultTab = categories[0]?.id

    const handleSubmit = async (updatedData: Partial<VenueUpdate>) => {
        if (!venue) return;
        const updatedVenue = await edit_venue(updatedData, venue?.id);
        if (!updatedVenue.data) return;
        setVenue(updatedVenue.data)
    }

    if (!venue || !menus || loading || ownerLoading) return <>Loading...</>;
    if (error) return <>{error}</>;

    return (
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[450px] bg-background text-foreground">
            <Header venue={venue} onEdit={setOpen} />
            <Details venue={venue} />
            <MenuSubmenuTabs
                menus={menus ?? []}
                onMoveLeft={handleLeftBtn}
                onMoveRight={handleRightBtn}
                onEdit={handleEditBtn}
                onDelete={deleteMenu}
                onAddBetween={handleAddBetween}
                onValueChange={onChangeMenu}
            />

            <CategoriesList
                categories={activeMenu?.categories ?? []}
                isAdmin={isAdminMode}
                onAdminActions={{
                    onAddCategory: (id) => handleCreateCategory(id),
                    onDeleteCategory: (id) => console.log('Delete', id),
                    onEditCategory: (id) => console.log('Edit', id),
                    onMoveUp: (id) => console.log('Move up', id),
                    onMoveDown: (id) => console.log('Move down', id),
                }}
            />

            <NameModal
                open={openCreateCategory}
                onOpenChange={setOpenCreateCategory}
                onSubmit={createCategory}
                title="Create category"
                description="Enter a category name and optionally add an image."
                submitLabel="Create"
                placeholder="e.g. Deserts"
                showImage={true}
                imagePreview={previewImage}
                onImageChange={handleImageChange}
            />


            {/* Create a submenu */}
            <NameModal
                open={openCreate}
                onOpenChange={setOpenCreate}
                onSubmit={handleCreate}
                title="Create menu"
                description="Enter a menu name."
                submitLabel="Create"
                placeholder="e.g. Deserts"
            />

            {/* Edit the submenu */}
            <NameModal
                open={openEdit}
                onOpenChange={setOpenEdit}
                onSubmit={handleEditSubmit}
                title="Edit menu name"
                description="Enter a new menu name."
                submitLabel="Save"
                initialName={selectedMenu?.name ?? ""}
            />


            <EditVenueModal
                open={open}
                onOpenChange={setOpen}
                venue={venue}
                onSave={handleSubmit}
            />
        </div>
    )

}
