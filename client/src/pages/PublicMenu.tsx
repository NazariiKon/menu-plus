import { useParams } from "react-router-dom";
import { useEffect, useCallback, useMemo } from "react";
import Header from "@/components/MenuComponents/Header";
import EditVenueModal from "@/components/MenuComponents/EditMenuModal";
import { Details } from "@/components/MenuComponents/Details";
import { MenuSubmenuTabs } from "@/components/MenuComponents/MenuSubmenuTabs";
import { NameModal } from "@/components/NameModal";
import { CategoriesList } from "@/components/MenuComponents/CategoriesList";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useMenus } from "@/hooks/useMenus";
import { useVenueBySlug } from "@/hooks/useVenue";
import { useCategories } from "@/hooks/useCategories";

interface AdminActions {
    onAddCategory: (position: number) => void;
    onDeleteCategory: (categoryId: string) => void;
    onEditCategory: (categoryId: string) => void;
    onMoveUp: (categoryId: string, position: number) => void;
    onMoveDown: (categoryId: string, position: number) => void;
}

export default function PublicMenu() {
    const { slug } = useParams<{ slug: string }>();

    const {
        venue,
        loading: venueLoading,
        handleVenueSubmit,
        loadVenue,
        openVenueEdit,
        setVenueEditOpen,
        venueEditOpen,
    } = useVenueBySlug(slug!);

    const {
        menus,
        loading: menusLoading,
        activeMenuId,
        setActiveMenuId,
        menuEditOpen,
        setMenuEditOpen,
        selectedMenu,
        menuCreateOpen,
        setMenuCreateOpen,
        setMenus,
        changeMenuPosition,
        handleAddMenuBetween,
        handleCreateMenu,
        handleDeleteMenu,
        handleEditMenu,
        handleEditMenuSubmit,
    } = useMenus(venue?.menus, venue?.id);

    const {
        previewImage,
        isCategoryCreateOpen,
        setIsCategoryCreateOpen,
        handleImageChange,
        handleAddCategory,
        handleEditCategory,
        handleCreateCategory,
        handleDeleteCategory,
        changeCategoryPosition,
    } = useCategories({
        venueId: venue?.id,
        activeMenuId,
        menus,
        setMenus,
    });

    const { isOwner: isAdminMode, loading: ownerLoading } = useIsOwner(venue);

    const activeMenu = menus?.find((m) => m.id === activeMenuId) || null;

    const handleMoveLeft = useCallback(
        (menuId: string) => changeMenuPosition(menuId, -1),
        [changeMenuPosition]
    );
    const handleMoveRight = useCallback(
        (menuId: string) => changeMenuPosition(menuId, 1),
        [changeMenuPosition]
    );

    useEffect(() => {
        loadVenue();
    }, [loadVenue]);

    const adminActions = useMemo<AdminActions>(
        () => ({
            onAddCategory: handleAddCategory,
            onDeleteCategory: handleDeleteCategory,
            onEditCategory: handleEditCategory,
            onMoveUp: (id, pos) => changeCategoryPosition(id, pos, -1),
            onMoveDown: (id, pos) => changeCategoryPosition(id, pos, 1),
        }),
        [handleAddCategory, handleDeleteCategory, handleEditCategory, changeCategoryPosition]
    );

    const isLoading = venueLoading || menusLoading || ownerLoading;
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-dvh">Loading...</div>;
    }
    if (!venue) {
        return (
            <div className="flex items-center justify-center min-h-dvh text-red-500 p-4">
                Venue not found
            </div>
        );
    }

    return (
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[450px] bg-background text-foreground">
            <Header venue={venue} onEdit={openVenueEdit} />
            <Details venue={venue} />

            <MenuSubmenuTabs
                menus={menus ?? []}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onAddBetween={handleAddMenuBetween}
                onValueChange={setActiveMenuId}
            />

            <CategoriesList
                key={activeMenuId}
                categories={activeMenu?.categories ?? []}
                isAdmin={isAdminMode}
                onAdminActions={adminActions}
            />

            <NameModal
                open={isCategoryCreateOpen}
                onOpenChange={setIsCategoryCreateOpen}
                onSubmit={handleCreateCategory}
                title="Create category"
                description="Enter a category name and optionally add an image."
                submitLabel="Create"
                placeholder="e.g. Desserts"
                showImage={true}
                imagePreview={previewImage ?? undefined}
                onImageChange={handleImageChange}
            />


            <NameModal
                open={menuCreateOpen}
                onOpenChange={setMenuCreateOpen}
                onSubmit={handleCreateMenu}
                title="Create menu"
                description="Enter a menu name."
                submitLabel="Create"
                placeholder="e.g. Desserts"
            />

            <NameModal
                open={menuEditOpen}
                onOpenChange={setMenuEditOpen}
                onSubmit={handleEditMenuSubmit}
                title="Edit menu name"
                description="Enter a new menu name."
                submitLabel="Save"
                initialName={selectedMenu?.name ?? ""}
            />

            <EditVenueModal
                open={venueEditOpen}
                onOpenChange={(open) => setVenueEditOpen(open)}
                venue={venue}
                onSave={handleVenueSubmit}
            />
        </div>
    );
}
