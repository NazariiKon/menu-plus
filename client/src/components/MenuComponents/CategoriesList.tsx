import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminCallbacksCategories, CategoryRead } from "@/types/types";
import React from "react";
import { Alert } from "../Alert";

interface CategoriesListProps {
    categories?: CategoryRead[];
    isAdmin?: boolean;
    onAdminActions?: AdminCallbacksCategories;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
    categories = [],
    isAdmin = false,
    onAdminActions,
}) => {
    const [deleteCategoryId, setDeleteCategoryId] = React.useState<string | null>(null);
    const [deletingCategoryId, setDeletingCategoryId] = React.useState<string | null>(null);
    const [updatedCategories, setUpdatedCategories] = React.useState<Set<string>>(new Set());

    const handleImageUpdated = React.useCallback((categoryId: string) => {
        setUpdatedCategories(prev => new Set([...prev, categoryId]));
        setTimeout(() => {
            setUpdatedCategories(prev => {
                const next = new Set(prev);
                next.delete(categoryId);
                return next;
            });
        }, 10000);
    }, []);

    const sortedCategories = React.useMemo(() =>
        (categories ?? []).sort((a, b) => a.position - b.position),
        [categories]
    );

    React.useEffect(() => {
        setDeleteCategoryId(null);
    }, [categories]);

    const toggleDeleteAlert = (categoryId: string | null) => {
        setDeleteCategoryId(prev => prev === categoryId ? null : categoryId);
    };

    const handleCategoryClick = (categoryId: string) => {
        onAdminActions?.setActiveCategoryId(categoryId);
    };

    return (
        <div className="w-full space-y-4 px-4 py-6">
            {isAdmin && (
                <div className="flex justify-center pb-6 border-b border-border">
                    <p className="text-lg font-semibold text-foreground tracking-wide">
                        ADD CATEGORIES
                    </p>
                </div>
            )}

            {isAdmin && onAdminActions?.onAddCategory && (
                <Button
                    onClick={() => onAdminActions.onAddCategory(0)}
                    className="w-full h-auto text-3xl border-3 rounded-md bg-black text-white transition-all"
                    variant="outline"
                    size="lg"
                >
                    +
                </Button>
            )}

            {sortedCategories.map((category, index) => {
                const imageUrl = category.image
                    ? `${supabase.storage.from("images/").getPublicUrl(category.image).data.publicUrl}?t=${updatedCategories.has(category.id) ? Date.now() : 0
                    }`
                    : null;

                return (
                    <div key={category.id} className="w-full space-y-2">
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all relative group">
                            <CardContent className="p-0 relative h-32">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                                )}

                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 cursor-pointer hover:bg-black/80 transition-all duration-300"
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    <h3 className="text-white font-bold text-lg truncate drop-shadow-lg">
                                        {category.name}
                                    </h3>
                                </div>

                                {isAdmin && onAdminActions && (
                                    <div className="absolute top-3 right-3 flex space-x-1 bg-black/95 backdrop-blur-sm rounded-xl p-1.5 shadow-2xl border border-black/50">
                                        <Alert
                                            description="This action cannot be undone. This will permanently delete your category."
                                            open={deleteCategoryId === category.id}
                                            onOpenChange={() => toggleDeleteAlert(category.id)}
                                            onConfirm={async () => {
                                                setDeletingCategoryId(category.id);

                                                try {
                                                    await onAdminActions.onDeleteCategory(category.id);
                                                } finally {
                                                    setDeletingCategoryId(null);
                                                }

                                                setDeleteCategoryId(null);
                                            }}
                                            id={category.id}
                                            isLoading={deletingCategoryId === category.id}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 bg-black text-white hover:bg-red-600 hover:text-white border-transparent shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                                                title="Delete"
                                                disabled={deletingCategoryId === category.id}
                                            >
                                                {deletingCategoryId === category.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </Alert>

                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAdminActions.onUpdateCategory(category.id);
                                                handleImageUpdated(category.id);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg border-transparent transition-all"
                                            title="Edit"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Button>

                                        <div className="flex space-x-0.5 items-center">
                                            {index > 0 && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAdminActions.onMoveUp(category.id, category.position);
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg border-transparent transition-all"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {index < sortedCategories.length - 1 && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAdminActions.onMoveDown(category.id, category.position);
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg border-transparent transition-all"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {isAdmin && onAdminActions && (
                            <Button
                                onClick={() => onAdminActions.onAddCategory(index + 1)}
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
    );
};
