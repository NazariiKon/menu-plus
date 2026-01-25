import { Outlet, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/MenuComponents/Header";
import { Details } from "@/components/MenuComponents/Details";
import { useCategories } from "@/hooks/useCategories";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useItem } from "@/hooks/useItem";
import { useMenus } from "@/hooks/useMenus";
import { useVenueBySlug } from "@/hooks/useVenue";
import type { AdminCallbacksCategories, AdminCallbacksItems, CategoryRead, MenuRead, VenueRead } from "@/types/types";
import { getCurrencySymbol } from "@/utils/currency";
import { NameModal } from "@/components/NameModal";
import EditVenueModal from "@/components/MenuComponents/EditMenuModal";
import { convertImageToBase64 } from "@/utils/imageConverter";
import { useCart } from "@/context/CartContext";
import PanelFooter from "@/components/PanelComponents/PanelFooter";
import FooterCart from "@/components/MenuComponents/Footer";

export type PublicMenuContextType = {
  venue: VenueRead;
  menus: MenuRead[] | undefined | null;
  activeMenuId: string | null;
  setActiveMenuId: (id: string) => void;
  activeMenu: MenuRead | null;
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
  activeCategory: CategoryRead | null;
  isAdminMode: boolean;
  categoryAdminActions: AdminCallbacksCategories;
  itemsAdminActions: AdminCallbacksItems;
  currencySymbol: string;
  handleImageChange: (file: File | null | undefined) => void;
  handleMoveLeft: (menuId: string) => void;
  handleMoveRight: (menuId: string) => void;
  handleEditMenu: (menuId: string) => void;
  handleDeleteMenu: (id: string) => void;
  handleAddMenuBetween: (position: number) => void;
  onValueChange: (menuId: string) => void;
};

export default function PublicMenuLayout() {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ==================== HOOKS ====================
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

  const activeMenu = useMemo(
    () => menus?.find((m) => m.id === activeMenuId) || null,
    [menus, activeMenuId]
  );

  const activeCategory = useMemo(
    () => activeMenu?.categories?.find(c => c.id === activeCategoryId) || null,
    [activeMenu, activeCategoryId]
  );

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
    selectedItem,
    handleAddToCart,
  } = useItem({
    venueId: venue?.id,
    activeMenuId: activeMenuId,
    category: activeCategory,
    setMenus,
  });

  const { isOwner: isAdminMode, loading: ownerLoading } = useIsOwner(venue);

  const { setCurrentVenueId } = useCart();

  // ==================== UTILITY FUNCTIONS ====================
  const handleImageChange = useCallback((file: File | null | undefined) => {
    if (!file) {
      setPreviewImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ==================== CALLBACKS ====================
  const handleMoveLeft = useCallback(
    (menuId: string) => changeMenuPosition(menuId, -1),
    [changeMenuPosition]
  );

  const handleMoveRight = useCallback(
    (menuId: string) => changeMenuPosition(menuId, 1),
    [changeMenuPosition]
  );

  // ==================== ADMIN ACTIONS ====================
  const categoryAdminActions = useMemo<AdminCallbacksCategories>(
    () => ({
      onAddCategory: handleAddCategory,
      onDeleteCategory: handleDeleteCategory,
      onUpdateCategory: handleUpdateCategoryModal,
      onMoveUp: (id, pos) => changeCategoryPosition(id, pos, -1),
      onMoveDown: (id, pos) => changeCategoryPosition(id, pos, 1),
      setActiveCategoryId: (id) => setActiveCategoryId(id),
    }),
    [handleAddCategory, handleDeleteCategory, handleUpdateCategoryModal, changeCategoryPosition]
  );

  const itemsAdminActions = useMemo<AdminCallbacksItems>(
    () => ({
      onAddItem: handleAddItem,
      onDeleteItem: handleDeleteItem,
      onUpdateItem: handleUpdateItemModel,
      onMoveUp: (id, pos) => changeItemPosition(id, pos, -1),
      onMoveDown: (id, pos) => changeItemPosition(id, pos, 1),
      onAddToCart: (item) => handleAddToCart(item, venue?.id),
    }),
    [handleAddItem, handleDeleteItem, handleUpdateItemModel, changeItemPosition, handleAddToCart]
  );

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadVenue();
  }, [loadVenue]);

  useEffect(() => {
    if (venue?.id) {
      setCurrentVenueId(venue.id);
    } else {
      setCurrentVenueId(null);
    }
  }, [venue?.id, setCurrentVenueId]);

  // ==================== LOADING & ERROR STATES ====================
  const isLoading = venueLoading || menusLoading || ownerLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        Loading...
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-red-500 p-4">
        Venue not found
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="w-full h-full bg-gray-100 flex justify-center">
      <div className="w-full max-w-[500px] bg-white text-foreground ">
        {/* Header */}
        <Header
          venue={venue}
          onEdit={openVenueEdit}
          isAdmin={isAdminMode}
        />

        {/* Details */}
        <Details venue={venue} />

        <Outlet
          context={{
            venue,
            menus,
            activeMenuId,
            setActiveMenuId,
            activeMenu,
            activeCategoryId,
            setActiveCategoryId,
            activeCategory,
            isAdminMode,
            categoryAdminActions,
            itemsAdminActions,
            currencySymbol: getCurrencySymbol(venue.currency),
            handleImageChange,
            handleMoveLeft,
            handleMoveRight,
            handleEditMenu,
            handleDeleteMenu,
            handleAddMenuBetween,
            onValueChange: (menuId: string) => {
              setActiveMenuId(menuId);
              setActiveCategoryId(null);
            },
          } satisfies PublicMenuContextType}
        />

        {/* Footers */}
        {isAdminMode && <PanelFooter />}
        <FooterCart currencySymbol={getCurrencySymbol(venue.currency)} isAdminMode={isAdminMode}></FooterCart>


        {/* ==================== MODALS ==================== */}
        {/* Item Update Modal */}
        <NameModal
          defaultItem={selectedItem ?? undefined}
          open={isItemUpdateOpen}
          onOpenChange={(open) => {
            setIsItemUpdateOpen(open);
            if (!open) handleImageChange(null);
          }}
          onSubmit={async (values) => {
            if (!selectedItem) return;

            const imageBytes = values.image
              ? await convertImageToBase64(values.image)
              : null;

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
          placeholder="e.g. Pancake"
          showImage={true}
          isItem={true}
          showDropList={true}
          dropListData={activeMenu?.categories ?? null}
          currentId={selectedItem?.category_id}
          imagePreview={selectedItem?.image}
          onImageChange={handleImageChange}
          dropDataLabel="Category"
        />

        {/* Item Create Modal */}
        <NameModal
          open={isItemCreateOpen}
          onOpenChange={(open) => {
            setIsItemCreateOpen(open);
            if (!open) handleImageChange(null);
          }}
          onSubmit={async (values) => {
            const imageBytes = values.image
              ? await convertImageToBase64(values.image)
              : null;

            const itemData = {
              ...values,
              price: values.price ? parseFloat(values.price) : null,
              weight_g: values.weight_g ? parseInt(values.weight_g, 10) : null,
              image_bytes: imageBytes,
            };

            await handleCreateItem(itemData);
          }}
          title="Create a new item"
          description="Enter an item's name and optionally add an image."
          submitLabel="Create"
          placeholder="e.g. Pancake"
          showImage={true}
          isItem={true}
          imagePreview={previewImage ?? undefined}
          onImageChange={handleImageChange}
        />

        {/* Category Create Modal */}
        <NameModal
          open={isCategoryCreateOpen}
          onOpenChange={(open) => {
            setIsCategoryCreateOpen(open);
            if (!open) handleImageChange(null);
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

        {/* Category Update Modal */}
        <NameModal
          open={isCategoryUpdateOpen}
          onOpenChange={(open) => {
            setIsCategoryUpdateOpen(open);
            if (!open) handleImageChange(null);
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

        {/* Menu Create Modal */}
        <NameModal
          open={menuCreateOpen}
          onOpenChange={setMenuCreateOpen}
          onSubmit={handleCreateMenu}
          title="Create menu"
          description="Enter a menu name."
          submitLabel="Create"
          placeholder="e.g. Breakfast"
        />

        {/* Menu Edit Modal */}
        <NameModal
          open={menuEditOpen}
          onOpenChange={setMenuEditOpen}
          onSubmit={handleEditMenuSubmit}
          title="Edit menu name"
          description="Enter a new menu name."
          submitLabel="Save"
          initialName={selectedMenu?.name ?? ""}
        />

        {/* Venue Edit Modal */}
        <EditVenueModal
          open={venueEditOpen}
          onOpenChange={setVenueEditOpen}
          venue={venue}
          onSave={handleVenueSubmit}
        />
      </div>
    </div>
  );
}
