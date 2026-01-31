import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown,
    Loader2,
    ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminCallbacksItems, ItemRead } from "@/types/types";
import React from "react";
import { Alert } from "@/components/Alert";
import Item from "../ui/item";

interface ItemsListProps {
    currencySymbol: string;
    items?: ItemRead[];
    category?: { id: string; name: string } | null;
    onBack: () => void;
    isAdmin?: boolean;
    onAdminActions?: AdminCallbacksItems;
    isSearch?: boolean;
}

export const ItemsList: React.FC<ItemsListProps> = ({
    currencySymbol = "EUR",
    items = [],
    category,
    onBack,
    isAdmin = false,
    onAdminActions,
    isSearch = false,

}) => {
    const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);
    const [deletingItemId, setDeletingItemId] = React.useState<string | null>(null);
    const [updatedItems, setUpdatedItems] = React.useState<Set<string>>(new Set());

    const handleImageUpdated = React.useCallback((itemId: string) => {
        setUpdatedItems(prev => new Set([...prev, itemId]));
        setTimeout(() => {
            setUpdatedItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }, 10000);
    }, []);


    const sortedItems = React.useMemo(
        () => (items ?? []).sort((a, b) => a.position - b.position),
        [items]
    );


    React.useEffect(() => {
        setDeleteItemId(null);
    }, [items]);


    const toggleDeleteAlert = (itemId: string | null) => {
        setDeleteItemId(prev => (prev === itemId ? null : itemId));
    };

    return (
        <div className="w-full py-6">
            {!isSearch &&
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="h-8 w-8 p-0 -ml-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex justify-center">
                        <p className="text-xl font-semibold text-foreground tracking-wide">
                            {category?.name || "Items"}
                        </p>
                    </div>
                </div>
            }

            {!isSearch && isAdmin && onAdminActions?.onAddItem && (
                <Button
                    onClick={() => onAdminActions.onAddItem(0)}
                    className="w-full h-auto text-3xl border-3 mb-2 rounded-md bg-black text-white transition-all"
                    variant="outline"
                    size="lg"
                >
                    +
                </Button>
            )}

            <div className={`grid grid-row-1 gap-6 w-full ${isAdmin ? "mb-16" : ""}`}>
                {sortedItems.map((item, index) => {
                    const imageUrl = item.image
                        ? `${supabase.storage.from("images/").getPublicUrl(item.image).data.publicUrl}?t=${updatedItems.has(item.id) ? Date.now() : 0}`
                        : null;


                    return (
                        <div key={item.id} className="w-full space-y-2">
                            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4 relative">
                                    <div className="flex flex-col gap-4">
                                        <div className="relative">
                                            {imageUrl &&
                                                <img
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-70 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                                />
                                            }


                                            {isAdmin && onAdminActions && (
                                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                    <Alert
                                                        description="This action cannot be undone. This will permanently delete your item."
                                                        open={deleteItemId === item.id}
                                                        onOpenChange={() => toggleDeleteAlert(item.id)}
                                                        onConfirm={async () => {
                                                            setDeletingItemId(item.id);
                                                            try {
                                                                await onAdminActions.onDeleteItem(item);
                                                            } finally {
                                                                setDeletingItemId(null);
                                                            }
                                                            setDeleteItemId(null);
                                                        }}
                                                        id={item.id}
                                                        isLoading={deletingItemId === item.id}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 bg-black text-white hover:bg-red-600 hover:text-white border-transparent shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
                                                            title="Delete"
                                                            disabled={deletingItemId === item.id}
                                                        >
                                                            {deletingItemId === item.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </Alert>

                                                    <Button
                                                        onClick={async () => {
                                                            await onAdminActions.onUpdateItem(item);
                                                            handleImageUpdated(item.id);
                                                        }}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 shadow-sm hover:shadow-md border-transparent transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>

                                                    {!isSearch &&
                                                        <div className="flex gap-1">
                                                            {index > 0 && (
                                                                <Button
                                                                    onClick={() =>
                                                                        onAdminActions.onMoveUp(item.id, item.position)
                                                                    }
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 shadow-sm hover:shadow-md border-transparent transition-all"
                                                                    title="Move Up"
                                                                >
                                                                    <ArrowUp className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {index < sortedItems.length - 1 && (
                                                                <Button
                                                                    onClick={() =>
                                                                        onAdminActions.onMoveDown(item.id, item.position)
                                                                    }
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 shadow-sm hover:shadow-md border-transparent transition-all"
                                                                    title="Move Down"
                                                                >
                                                                    <ArrowDown className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {onAdminActions && onAdminActions?.onAddToCart &&
                                                <Item
                                                    item={item}
                                                    currencySymbol={currencySymbol}
                                                    onAddToCart={onAdminActions?.onAddToCart}>
                                                </Item>
                                            }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {!isSearch && isAdmin && onAdminActions && (
                                <Button
                                    onClick={() => onAdminActions.onAddItem(index + 1)}
                                    className="w-full h-auto text-3xl border-3 rounded-md bg-black text-white transition-all"
                                    variant="outline"
                                    size="lg"
                                >
                                    +
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};