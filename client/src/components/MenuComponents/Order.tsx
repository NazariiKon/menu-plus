import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function Order() {
    const {
        cart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
    } = useCart();

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    const goToPayment = () => {
        if (cart.length === 0) return;
    };

    return (
        <div className="max-w-md mx-auto w-full max-w-[500px] bg-background text-foreground">
            <div className="p-4">
                <h1 className="text-2xl font-bold">Your Order</h1>

                {cart.length === 0 ? (
                    <p className="text-gray-500 mt-4">Your cart is empty.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {cart.map((item) => (
                            <li
                                key={item.id}
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            {item.image && (
                                                <div className="w-12 h-12 flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-base">{item.name}</h3>
                                                {item.desc && (
                                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                                )}
                                                <p className="text-sm text-gray-800">
                                                    {item.quantity} × {Number(item.price).toFixed(2)}
                                                </p>

                                                {item.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <span className="font-medium">Note: </span>
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between">
                                        <p className="font-semibold text-base">
                                            {(Number(item.price) * item.quantity).toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-8 w-8 p-0 rounded-full text-lg font-bold"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                −
                                            </Button>

                                            <span className="min-w-8 text-center text-sm">
                                                {item.quantity}
                                            </span>

                                            <Button
                                                variant="outline"
                                                className="h-8 w-8 p-0 rounded-full text-lg font-bold"
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
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                        <span className="font-semibold">Total Items:</span>
                        <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-lg">{totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-6 mb-12">
                    <Button
                        className="w-full h-12 bg-black text-white hover:bg-black/90 rounded-xl font-bold"
                        onClick={goToPayment}
                        disabled={cart.length === 0}
                    >
                        {cart.length === 0
                            ? "Cart is empty"
                            : `Go to Payment (${totalPrice.toFixed(2)})`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
