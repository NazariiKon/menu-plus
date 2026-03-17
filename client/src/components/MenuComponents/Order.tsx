import { useCart, type CartItem } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import type { PublicMenuContextType } from "@/pages/PublicMenuLayout";
import { supabase } from "@/lib/supabase";
import { createOrder, type CreateOrderRequest } from "@/api/order";

export default function Order() {
    const { venue, currencySymbol } = useOutletContext<PublicMenuContextType>();
    const { cart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const PHONE = venue.phone;

    const buildOrderData = (cart: CartItem[]): CreateOrderRequest => ({
        name: `Order #${Date.now()}`,
        items: cart.map(item => ({
            qty: item.quantity,
            note: item.notes || undefined,
            product_id: item.id,
            price_per_item: parseFloat(item.price ?? "0")
        }))
    });

    const buildWhatsAppMessage = (cart: CartItem[], orderId?: string) => {
        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price ?? "0") * item.quantity), 0);
        const lines = cart.map(item =>
            `${item.name} x${item.quantity} ${item.notes ? `(${item.notes})` : ""} = ${(parseFloat(item.price ?? "0") * item.quantity).toFixed(2)}`
        ).join("\n");
        const orderInfo = orderId ? `\n\n*Order ID: ${orderId}*` : "";
        return `Hey! New order:\n${lines}\n\nTotal: ${total.toFixed(2)} ${currencySymbol}${orderInfo}`;
    };

    const goToPayment = async () => {
        if (cart.length === 0) return;

        try {
            const orderData = buildOrderData(cart);
            const result = await createOrder(venue.id, orderData);

            if (!result.success || !result.data) {
                alert(result.error || "Failed to create order");
                return;
            }

            const message = buildWhatsAppMessage(cart, result.data[0]?.id);
            clearCart();
            window.location.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
        } catch (error) {
            console.error("Order failed:", error);
            const total = cart.reduce((sum, item) => sum + (parseFloat(item.price ?? "0") * item.quantity), 0);
            const lines = cart.map(item => `${item.name} x${item.quantity} = ${(parseFloat(item.price ?? "0") * item.quantity).toFixed(2)}`).join("\n");
            window.location.href = `https://wa.me/${PHONE}?text=Hey!%20Order:%20${lines}%0ATotal:%20${total.toFixed(2)}%20${currencySymbol}`;
        }
    };

    if (!venue.show_cart) return null;

    return (
        <div className="max-w-md mx-auto w-full max-w-[500px] bg-background text-foreground">
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Your Order</h1>

                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">Your cart is empty</p>
                ) : (
                    <>
                        <ul className="space-y-3 mb-6">
                            {cart.map((item) => (
                                <li key={item.id} className="bg-gray-50 p-4 rounded-xl border">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                {item.image && (
                                                    <img
                                                        src={supabase.storage.from("images/").getPublicUrl(item.image).data.publicUrl}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base truncate">{item.name}</h3>
                                                    {item.desc && <p className="text-sm text-muted-foreground line-clamp-2">{item.desc}</p>}
                                                    <p className="text-sm font-medium mt-1">
                                                        {item.quantity} × {Number(item.price).toFixed(2)}
                                                    </p>
                                                    {item.notes && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Note: {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 pt-1">
                                            <p className="font-bold text-lg min-w-[3rem] text-right">
                                                {(Number(item.price) * item.quantity).toFixed(2)}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-full"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-full"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-muted/50 p-4 rounded-xl mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Total items:</span>
                                <span>{totalItems}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                                <span>Total:</span>
                                <span>{totalPrice.toFixed(2)} {currencySymbol}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg mb-12"
                            onClick={goToPayment}
                            disabled={cart.length === 0}
                        >
                            {cart.length === 0 ? "Empty cart" : `Order via WhatsApp (${totalPrice.toFixed(2)})`}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
