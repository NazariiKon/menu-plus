import * as React from "react"
import { useParams } from "react-router-dom"

import { edit_venue, get_menu_by_slug } from "@/api/venue"
import type { MenuRead, VenueRead, VenueUpdate } from "@/types/types"
import { useEffect, useState } from "react"
import Header from "@/components/MenuComponents/Header"
import EditVenueModal from "@/components/MenuComponents/EditMenuModal"
import { Details } from "@/components/MenuComponents/Details"
import { MenuSubmenuTabs } from "@/components/MenuComponents/MenuSubmenuTabs"
import { VenueModal, type FormValues } from "@/components/VenueModal"
import { create_menu, delete_menu, edit_menu_name } from "@/api/menu"
import { Alert } from "@/components/Alert"

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
    const [selectedMenu, setSelectedMenu] = React.useState<MenuRead | null>(null)
    const [open, setOpen] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | undefined>(undefined)
    const [insertAfterMenu, setInsertAfterMenu] = useState<number>(0);

    const handleLeftBtn = (menuId: string) => {
        console.log(`Menu ${menuId} to the left`);
    }
    const handleRightBtn = (menuId: string) => {
        console.log(`Menu ${menuId} to the right`);
    }

    const handleEditBtn = (menuId: string) => {
        if (!menus) {
            console.log('You dont have any menus');
            return;
        }

        const currentMenu = menus.find(menu => menu.id === menuId);

        if (currentMenu) {
            setSelectedMenu(currentMenu);
            setOpenEdit(true);
        } else {
            console.log(`Menu ${menuId} doesn't exist`);
        }
    };

    const handleEditSubmit = async (values: FormValues) => {
        if (selectedMenu?.name === values.name || !selectedMenu || !venue) return;
        const res = await edit_menu_name(values.name, selectedMenu.id, venue.id);
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


    const load = async () => {
        setLoading(true);
        if (!slug) return;
        const result = await get_menu_by_slug(slug);

        if (result.success && result.data) {
            setVenue(result.data);
            setMenus(result.data.menus ? result.data.menus : [])
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

    if (!venue || !menus || loading) return <>Loading...</>;

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
            // onValueChange={ }
            />

            <VenueModal
                open={openCreate}
                onOpenChange={setOpenCreate}
                onSubmit={handleCreate}
                title="Create menu"
                description="Enter a menu name."
                submitLabel="Create"
                placeholder="e.g. Deserts"
            />

            <VenueModal
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
