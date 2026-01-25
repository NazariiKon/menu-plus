import { useOutletContext } from "react-router-dom";
import { MenuSubmenuTabs } from "@/components/MenuComponents/MenuSubmenuTabs";
import { CategoriesList } from "@/components/MenuComponents/CategoriesList";
import { ItemsList } from "@/components/MenuComponents/ItemsList";
import { getCurrencySymbol } from "@/utils/currency";
import type { PublicMenuContextType } from "./PublicMenuLayout";

export default function PublicMenuContent() {
    const {
        venue,
        menus,
        activeMenuId,
        activeMenu,
        activeCategoryId,
        setActiveCategoryId,
        activeCategory,
        isAdminMode,
        categoryAdminActions,
        itemsAdminActions,
        handleMoveLeft,
        handleMoveRight,
        handleEditMenu,
        handleDeleteMenu,
        handleAddMenuBetween,
        onValueChange,
    } = useOutletContext<PublicMenuContextType>();

    return (
        <>
            {/* Menu Tabs */}
            <MenuSubmenuTabs
                menus={menus ?? []}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onAddBetween={handleAddMenuBetween}
                onValueChange={onValueChange}
                isAdmin={isAdminMode}
            />

            {/* Main Content */}
            {activeCategoryId ? (
                <ItemsList
                    key={activeCategoryId}
                    currencySymbol={getCurrencySymbol(venue.currency)}
                    items={activeCategory?.items ?? []}
                    category={activeCategory}
                    onBack={() => setActiveCategoryId(null)}
                    isAdmin={isAdminMode}
                    onAdminActions={itemsAdminActions}
                />
            ) : (
                <CategoriesList
                    key={activeMenuId}
                    categories={activeMenu?.categories ?? []}
                    isAdmin={isAdminMode}
                    onAdminActions={categoryAdminActions}
                />
            )}
        </>
    );
}
