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

interface ItemsListProps {
    items?: ItemRead[];
    category?: { id: string; name: string };
    onBack: () => void;
    isAdmin?: boolean;
    onAdminActions?: AdminCallbacksItems;
    onAddToCart?: (item: ItemRead) => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
    items = [],
    category,
    onBack,
    isAdmin = false,
    onAdminActions,
    onAddToCart,
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
        <div className="w-full space-y-4 px-4 py-6">
            {/* Заголовок + back */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="h-8 w-8 p-0 -ml-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex justify-center flex-1">
                    <p className="text-xl font-semibold text-foreground tracking-wide">
                        {category?.name || "Items"}
                    </p>
                </div>
                {/* Добавить item в начало (position 0) */}
                {isAdmin && onAdminActions && (
                    <Button
                        onClick={() => onAdminActions.onAddItem(0)}
                        className="h-10 text-2xl border-2 border-black"
                        variant="outline"
                        size="lg"
                    >
                        +
                    </Button>
                )}
            </div>

            {sortedItems.map((item, index) => {
                const imageUrl = item.image
                    ? `${supabase.storage.from("images/").getPublicUrl(item.image).data.publicUrl}?t=${updatedItems.has(item.id) ? Date.now() : 0
                    }`
                    : null;

                return (
                    <div key={item.id} className="w-full space-y-2">
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 relative">
                                <div className="flex gap-4">
                                    {/* Изображение */}
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-lg flex-shrink-0" />
                                    )}

                                    {/* Контент */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg leading-tight truncate">
                                                    {item.name}
                                                </h3>
                                                {item.desc && (
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {item.desc}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2 text-lg font-bold text-foreground">
                                                    <span>{item.price}</span>
                                                    {item.weight_g && (
                                                        <span className="text-sm text-muted-foreground font-normal">
                                                            ({item.weight_g}g)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Кнопка добавить в корзину (всегда видна) */}
                                            {onAddToCart && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="whitespace-nowrap"
                                                    onClick={() => onAddToCart(item)}
                                                >
                                                    Add to cart
                                                </Button>
                                            )}
                                        </div>

                                        {/* Admin actions (как в CategoriesList) */}
                                        {isAdmin && onAdminActions && (
                                            <div className="mt-3 flex justify-end">
                                                <div className="flex space-x-1 bg-black/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-black/50">
                                                    <Alert
                                                        description="This action cannot be undone. This will permanently delete your item."
                                                        open={deleteItemId === item.id}
                                                        onOpenChange={() => toggleDeleteAlert(item.id)}
                                                        onConfirm={async () => {
                                                            setDeletingItemId(item.id);
                                                            try {
                                                                await onAdminActions.onDeleteItem(item.id);
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
                                                            className="h-8 w-8 p-0 bg-black text-white hover:bg-red-600 hover:text-white border-transparent disabled:opacity-50"
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
                                                            await onAdminActions.onUpdateItem(item.id);
                                                            handleImageUpdated(item.id);
                                                        }}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 border-transparent"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>

                                                    <div className="flex space-x-0.5 items-center">
                                                        {index > 0 && (
                                                            <Button
                                                                onClick={() =>
                                                                    onAdminActions.onMoveUp(item.id, item.position)
                                                                }
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 border-transparent"
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
                                                                className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 border-transparent"
                                                                title="Move Down"
                                                            >
                                                                <ArrowDown className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Кнопка “+” после каждого item (как в CategoriesList) */}
                        {isAdmin && onAdminActions && (
                            <Button
                                onClick={() => onAdminActions.onAddItem(index + 1)}
                                className="w-full h-10 text-2xl border-2 border-black"
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
    );
};
