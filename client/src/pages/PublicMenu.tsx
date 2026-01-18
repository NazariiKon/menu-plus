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
    onUpdateCategory: (categoryId: string) => void;
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
        selectedCategory,
        setIsCategoryCreateOpen,
        handleImageChange,
        isCategoryUpdateOpen,
        setIsCategoryUpdateOpen,
        handleAddCategory,
        handleUpdateCategory,
        handleUpdateCategoryModal,
        handleCreateCategory,
        handleDeleteCategory,
        changeCategoryPosition,
    } = useCategories({
        venueId: venue?.id,
        activeMenuId,
        menus,
        setMenus,
        setActiveMenuId
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
            onUpdateCategory: handleUpdateCategoryModal,
            onMoveUp: (id, pos) => changeCategoryPosition(id, pos, -1),
            onMoveDown: (id, pos) => changeCategoryPosition(id, pos, 1),
        }),
        [handleAddCategory, handleDeleteCategory, handleUpdateCategoryModal, changeCategoryPosition]
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
            <Header venue={venue} onEdit={openVenueEdit} isAdmin={isAdminMode} />
            <Details venue={venue} />

            <MenuSubmenuTabs
                menus={menus ?? []}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onAddBetween={handleAddMenuBetween}
                onValueChange={setActiveMenuId}
                isAdmin={isAdminMode}
            />

            <CategoriesList
                key={activeMenuId}
                categories={activeMenu?.categories ?? []}
                isAdmin={isAdminMode}
                onAdminActions={adminActions}
            />

            <NameModal
                open={isCategoryCreateOpen}
                onOpenChange={(open) => {
                    setIsCategoryCreateOpen(open);
                    if (!open) {
                        handleImageChange(null);
                    }
                }}
                onSubmit={handleCreateCategory}
                title="Create a category"
                description="Enter a category name and optionally add an image."
                submitLabel="Create"
                placeholder="e.g. Desserts"
                showImage={true}
                imagePreview={previewImage ?? undefined}
                onImageChange={handleImageChange}
            />

            <NameModal
                open={isCategoryUpdateOpen}
                onOpenChange={(open) => {
                    setIsCategoryUpdateOpen(open);
                    if (!open) {
                        handleImageChange(null);
                    }
                }}
                onSubmit={handleUpdateCategory}
                title="Edit the category"
                description="Enter new category name and optionally add an image."
                submitLabel="Save"
                placeholder="e.g. Desserts"
                initialName={selectedCategory?.name ?? ""}
                showImage={true}
                currentMenu={selectedCategory?.menu_id}
                showDropList={true}
                dropListData={menus ?? null}
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
