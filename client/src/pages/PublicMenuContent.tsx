import { useOutletContext } from "react-router-dom";
import { MenuSubmenuTabs } from "@/components/MenuComponents/MenuSubmenuTabs";
import { CategoriesList } from "@/components/MenuComponents/CategoriesList";
import { ItemsList } from "@/components/MenuComponents/ItemsList";
import { getCurrencySymbol } from "@/utils/currency";
import type { PublicMenuContextType } from "./PublicMenuLayout";
import { SearchPanel } from "@/components/SearchPanel";
import { useCallback, useState } from "react";
import type { ItemRead } from "@/types/types";

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
        searchItems
    } = useOutletContext<PublicMenuContextType>();


    const [searchResults, setSearchResults] = useState<ItemRead[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(
        (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const foundItems = searchItems(query);
                setSearchResults(foundItems);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        },
        [searchItems, setIsSearching, menus]
    );


    return (
        <div className="p-4">
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
                <div className="my-6">
                    <SearchPanel
                        onSearch={handleSearch}
                        placeholder="Search"
                        debounceMs={300}
                        initialValue=""
                    />
                    {isSearching && <div>Loading...</div>}

                    {searchResults.length > 0 &&
                        <ItemsList
                            key={activeCategoryId}
                            currencySymbol={getCurrencySymbol(venue.currency)}
                            items={searchResults}
                            onBack={() => setActiveCategoryId(null)}
                            isAdmin={isAdminMode}
                            onAdminActions={itemsAdminActions}
                            isSearch={true}
                        />
                    }

                    {searchResults.length == 0 &&
                        <CategoriesList
                            key={activeMenuId}
                            categories={activeMenu?.categories ?? []}
                            isAdmin={isAdminMode}
                            onAdminActions={categoryAdminActions}
                        />
                    }
                </div>
            )}
        </div>
    );
}
