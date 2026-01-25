import { useCart } from "@/context/CartContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";

interface FooterProps {
    currencySymbol: string;
    isAdminMode: boolean;
}

export default function FooterCart({ currencySymbol, isAdminMode }: FooterProps) {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { getTotalItems, getTotalPrice } = useCart();
    const location = useLocation();

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    return (
        <div className={`fixed bottom-0 left-0 ${isAdminMode ? 'mb-12' : ''} z-20 w-full`}>
            <div className="mx-auto max-w-[500px]">
                {totalItems > 0 && location.pathname !== `/p/${slug}/order` && (
                    <div className="p-2">
                        <Button
                            className="w-full h-13 bg-black text-white hover:bg-black/90 rounded-xl flex items-center justify-between px-6 group shadow-xl"
                            onClick={() => navigate("order")}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <ShoppingCart className="!size-7" />
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                                        {totalItems}
                                    </span>
                                </div>
                                <span className="text-base font-semibold">
                                    Show My Order
                                </span>
                            </div>
                            <span className="text-xl font-bold">
                                {totalPrice.toFixed(2)} {currencySymbol}
                            </span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}