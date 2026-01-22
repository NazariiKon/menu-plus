import { useParams } from "react-router-dom";
import { useEffect, useCallback, useMemo, useState } from "react";
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
import { ItemsList } from "../components/MenuComponents/ItemsList";
import type { AdminCallbacksCategories, AdminCallbacksItems } from "@/types/types";
import { useItem } from "@/hooks/useItem";
import PanelFooter from "@/components/PanelComponents/PanelFooter";

export default function PublicMenu() {
    const { slug } = useParams<{ slug: string }>();
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

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
        isCategoryCreateOpen,
        selectedCategory,
        setIsCategoryCreateOpen,
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
    });
    const activeMenu = menus?.find((m) => m.id === activeMenuId) || null;
    const activeCategory = activeMenu?.categories?.find(c => c.id === activeCategoryId);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const handleImageChange = useCallback((file: File | null | undefined) => {
        if (!file) {
            setPreviewImage(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const {
        isItemCreateOpen,
        setIsItemCreateOpen,
        handleAddItem,
        handleCreateItem,
        handleDeleteItem,
        changeItemPosition,
        setIsItemUpdateOpen,
        isItemUpdateOpen,
        handleUpdateItemModel,
        handleUpdateItem,
        selectedItem
    } = useItem({
        venueId: venue?.id,
        activeMenuId: activeMenuId,
        category: activeCategory,
        setMenus
    });

    const { isOwner: isAdminMode, loading: ownerLoading } = useIsOwner(venue);

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

    const categoryAdminActions = useMemo<AdminCallbacksCategories>(
        () => ({
            onAddCategory: handleAddCategory,
            onDeleteCategory: handleDeleteCategory,
            onUpdateCategory: handleUpdateCategoryModal,
            onMoveUp: (id, pos) => changeCategoryPosition(id, pos, -1),
            onMoveDown: (id, pos) => changeCategoryPosition(id, pos, 1),
            setActiveCategoryId: (id) => setActiveCategoryId(id)
        }),
        [handleAddCategory, handleDeleteCategory, handleUpdateCategoryModal, changeCategoryPosition, setActiveCategoryId]
    );

    const ItemsAdminActions = useMemo<AdminCallbacksItems>(
        () => ({
            onAddItem: handleAddItem,
            onDeleteItem: handleDeleteItem,
            onUpdateItem: handleUpdateItemModel,
            onMoveUp: (id, pos) => changeItemPosition(id, pos, -1),
            onMoveDown: (id, pos) => changeItemPosition(id, pos, 1),
        }),
        [handleAddItem, handleDeleteItem, changeItemPosition]
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
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[500px] bg-background text-foreground">
            <Header venue={venue} onEdit={openVenueEdit} isAdmin={isAdminMode} />
            <Details venue={venue} />

            <MenuSubmenuTabs
                menus={menus ?? []}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onAddBetween={handleAddMenuBetween}
                onValueChange={(menuId) => {
                    setActiveMenuId(menuId);
                    setActiveCategoryId(null);
                }}
                isAdmin={isAdminMode}
            />

            {activeCategoryId ? (
                <ItemsList
                    key={activeCategoryId}
                    currency={venue.currency}
                    items={activeCategory?.items ?? []}
                    category={activeCategory}
                    onBack={() => setActiveCategoryId(null)}
                    isAdmin={isAdminMode}
                    onAdminActions={ItemsAdminActions}
                />
            ) : (
                <CategoriesList
                    key={activeMenuId}
                    categories={activeMenu?.categories ?? []}
                    isAdmin={isAdminMode}
                    onAdminActions={categoryAdminActions}
                />
            )}
            <NameModal
                defaultItem={selectedItem ?? undefined}
                open={isItemUpdateOpen}
                onOpenChange={(open) => {
                    setIsItemUpdateOpen(open);
                    if (!open) {
                        handleImageChange(null);
                    }
                }}
                onSubmit={async (values) => {
                    if (!selectedItem) return;
                    let imageBytes: string | null = null;
                    if (values.image) {
                        imageBytes = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const result = reader.result as string;
                                resolve(result.split(',')[1]);
                            };
                            reader.onerror = () => reject(new Error('Something wrong with your file'));
                            reader.readAsDataURL(values.image!);
                        });
                    }

                    const itemData = {
                        ...values,
                        price: values.price ? parseFloat(values.price) : null,
                        weight_g: values.weight_g ? parseInt(values.weight_g, 10) : null,
                        image_bytes: imageBytes,
                    };


                    await handleUpdateItem(itemData);
                }}
                title="Edit the item"
                description="Enter the new item's name and optionally add an image."
                submitLabel="Save"
                placeholder="e.g. Puncake"
                showImage={true}
                isItem={true}
                showDropList={true}
                dropListData={activeMenu?.categories ?? null}
                currentId={selectedItem?.category_id}
                imagePreview={selectedItem?.image}
                onImageChange={handleImageChange}
                dropDataLabel="Category"
            />

            <NameModal
                open={isItemCreateOpen}
                onOpenChange={(open) => {
                    setIsItemCreateOpen(open);
                    if (!open) {
                        handleImageChange(null);
                    }
                }}
                onSubmit={async (values) => {
                    let imageBytes: string | null = null;
                    if (values.image) {
                        imageBytes = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const result = reader.result as string;
                                resolve(result.split(',')[1]);
                            };
                            reader.onerror = () => reject(new Error('Something wrong with your file'));
                            reader.readAsDataURL(values.image!);
                        });
                    }

                    const itemData = {
                        ...values,
                        price: values.price ? parseFloat(values.price) : null,
                        weight_g: values.weight_g ? parseInt(values.weight_g, 10) : null,
                        image_bytes: imageBytes,
                    };

                    console.log(values.image);
                    await handleCreateItem(itemData);
                }}
                title="Create a new item"
                description="Enter a item's name and optionally add an image."
                submitLabel="Create"
                placeholder="e.g. Puncake"
                showImage={true}
                isItem={true}
                imagePreview={previewImage ?? undefined}
                onImageChange={handleImageChange}
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
                currentId={selectedCategory?.menu_id}
                showDropList={true}
                dropDataLabel="Menu"
                dropListData={menus ?? null}
                imagePreview={selectedCategory?.image}
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

            {isAdminMode && <PanelFooter></PanelFooter>}
        </div>
    );
}
