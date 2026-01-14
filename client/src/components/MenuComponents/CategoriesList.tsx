import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Category {
    id: string;
    menu_id: string;
    name: string;
    image?: string | null;
}

interface AdminCallbacks {
    onAddCategory: (position: number) => void;
    onDeleteCategory: (categoryId: string) => void;
    onEditCategory: (categoryId: string) => void;
    onMoveUp: (categoryId: string) => void;
    onMoveDown: (categoryId: string) => void;
}

interface CategoriesListProps {
    categories?: Category[];
    isAdmin?: boolean;
    onAdminActions?: AdminCallbacks;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
    categories = [],
    isAdmin = false,
    onAdminActions,
}) => {
    return (
        <div className="w-full space-y-4 px-4 py-6">
            {isAdmin && (
                <div className="flex justify-center pb-6 border-b border-border">
                    <p className="text-lg font-semibold text-foreground tracking-wide">
                        ADD CATEGORIES
                    </p>
                </div>
            )}

            {isAdmin && onAdminActions && (
                <Button
                    onClick={() => onAdminActions.onAddCategory(0)}
                    className="w-full h-10 text-2xl border-2 border-black"
                    variant="outline"
                    size="lg"
                >
                    +
                </Button>
            )}

            {categories.map((category, index) => (
                <div key={category.id} className="w-full space-y-2">
                    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-0 relative h-32">
                            {category.image ? (
                                <img
                                    src={supabase.storage.from("images/categories").getPublicUrl(category.image).data.publicUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                            )}

                            <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                                <h3 className="text-white font-semibold text-lg truncate">
                                    {category.name}
                                </h3>
                            </div>

                            {isAdmin && onAdminActions && (
                                <div className="absolute top-3 right-3 flex space-x-1 bg-black/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-black/50">
                                    {/* ✅ Черные кнопки */}
                                    <Button
                                        onClick={() => onAdminActions.onDeleteCategory(category.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-black text-white hover:bg-red-600 hover:text-white border border-transparent"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={() => onAdminActions.onEditCategory(category.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 border border-transparent"
                                        title="Edit"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </Button>

                                    <div className="flex space-x-0.5 items-center">
                                        {index > 0 && (
                                            <Button
                                                onClick={() => onAdminActions.onMoveUp(category.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 border border-transparent"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {index < categories.length - 1 && (
                                            <Button
                                                onClick={() => onAdminActions.onMoveDown(category.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 bg-black text-white hover:bg-black/90 border border-transparent"
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
                            className="w-full h-10 text-2xl border-2 border-black"
                            variant="outline"
                            size="lg"
                        >
                            +
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};
