import { Plus } from "lucide-react";
import { Button } from "./button";
import type { ItemRead } from "@/types/types";

interface ItemProps {
    item: ItemRead,
    currencySymbol: string,
    onAddToCart: (item: ItemRead) => void,
}

export default function Item({ item, currencySymbol, onAddToCart }: ItemProps) {
    return (
        <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-bold text-lg leading-tight truncate text-foreground">
                    {item.name}
                </h3>
                {item.desc && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {item.desc}
                    </p>
                )}
                <div className="flex items-baseline gap-3 pt-1">
                    {!!item.price && Number(item.price) > 0 && (
                        <span className="text-xl font-black text-emerald-600 drop-shadow-sm bg-emerald-50 px-3 py-1 rounded-lg shadow-md">
                            {item.price} {currencySymbol}
                        </span>
                    )}
                    {!!item.weight_g && Number(item.weight_g) > 0 && (
                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            {item.weight_g}g
                        </span>
                    )}
                </div>
            </div>
            <Button
                size="icon"
                className="h-12 mt-14 w-12 rounded-full bg-black text-white hover:bg-black/90 shadow-lg hover:shadow-xl transition-all flex-shrink-0"
                onClick={() => onAddToCart(item)}
                title="Add to cart"
            >
                <Plus className="h-5 w-5" />
            </Button>
        </div>
    );
}

