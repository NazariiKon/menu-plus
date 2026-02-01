import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import type { OrderRead } from "@/types/types";
import { getOrdersByVenue } from "@/api/order";
import { useVenueBySlug } from "@/hooks/useVenue";
import { useParams } from "react-router-dom";

export function Stats() {
    const { slug } = useParams<{ slug: string }>();
    const { venue } = useVenueBySlug(slug!);
    const [orders, setOrders] = useState<OrderRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                if (!venue) return;
                const response = await getOrdersByVenue(venue.id);
                setOrders(response.data || []);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load");
                setLoading(false);
            }
        }
        fetchOrders();
    }, [venue?.id]);

    if (loading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>;
    if (error) return <Card><CardContent className="p-8 text-center text-destructive">{error}</CardContent></Card>;
    if (!orders.length) return <Card><CardContent className="p-8 text-center text-muted-foreground">No orders</CardContent></Card>;

    const today = new Date();
    const ordersToday = orders.filter(o => new Date(o.created_at).toDateString() === today.toDateString());
    const totalRevenue = orders.reduce((acc, o) => acc + parseFloat(o.price?.toString() ?? "0"), 0).toFixed(2);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? (parseFloat(totalRevenue) / totalOrders).toFixed(2) : "0";

    const ordersByDay = orders.reduce<Record<string, number>>((acc, o) => {
        const date = new Date(o.created_at).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(ordersByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([date, count]) => ({
            date: format(new Date(date), "MMM d"),
            orders: count,
        }));

    const allItems = orders.flatMap(order =>
        (order.order_items || []).map(item => ({
            name: (item as any).items?.name || item.note || 'Item',
            qty: typeof item.qty === 'number' ? item.qty : parseInt(item.qty || '1'),
            price: parseFloat(item.price_per_item?.toString() ?? "0")
        }))
    );

    const itemStats = allItems.reduce<Record<string, { qty: number; revenue: number }>>((acc, item) => {
        acc[item.name] = acc[item.name] || { qty: 0, revenue: 0 };
        acc[item.name].qty += item.qty;
        acc[item.name].revenue += item.qty * item.price;
        return acc;
    }, {});

    const topItemsData = Object.entries(itemStats)
        .sort(([, a], [, b]) => b.qty - a.qty)
        .slice(0, 5)
        .map(([name, stats], index) => ({
            name: name.length > 30 ? name.slice(0, 27) + '...' : name,
            qty: stats.qty,
            revenue: stats.revenue.toFixed(2),
            fill: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]
        }));

    return (
        <ScrollArea className="h-screen w-full mb-10">
            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold">Stats</h1>
                    <p className="text-xs text-muted-foreground">Orders overview</p>
                </div>

                <div className="space-y-3">
                    <Card className="overflow-hidden">
                        <CardContent className="p-4 pt-6">
                            <div className="text-2xl font-bold text-primary">€{totalRevenue}</div>
                            <p className="text-xs text-muted-foreground">Total revenue</p>
                            <p className="text-xs">{totalOrders} orders</p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-lg font-bold">{totalOrders}</div>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-lg font-bold">{ordersToday.length}</div>
                                <p className="text-xs text-muted-foreground">Today</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="overflow-hidden">
                        <CardContent className="p-4 pt-6">
                            <div className="text-lg font-bold">€{avgOrderValue}</div>
                            <p className="text-xs text-muted-foreground">Avg order</p>
                        </CardContent>
                    </Card>
                </div>

                {chartData.length > 1 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Orders by Day (Last 7 days)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-32 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ left: -20, right: -10 }}>
                                        <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {topItemsData.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Top Items by Quantity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={topItemsData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={60}
                                            dataKey="qty"
                                            nameKey="name"
                                            labelLine={false}
                                            label={({ name, qty }) => qty > 1 ? `${name}\n${qty}` : name}
                                        >
                                            {topItemsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: any) => [value, `${name}`]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ScrollArea className="h-96">
                            <div className="space-y-3">
                                {orders.slice(0, 10).map(order => (
                                    <div key={order.id} className="space-y-2 p-4 border rounded-lg bg-card/50">
                                        <div className="flex justify-between items-start mb-3 pb-2 border-b">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm leading-tight">{order.name}</h4>
                                                {order.desc && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{order.desc}</p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4 min-w-[80px]">
                                                <div className="font-bold text-sm">€{parseFloat(order.price?.toString() || "0").toFixed(2)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(order.created_at), "MMM d, HH:mm")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {(order.order_items || []).map(item => {
                                                const qtyNum = typeof item.qty === 'number' ? item.qty : parseInt(item.qty || '1');
                                                const qtyStr = String(qtyNum);
                                                const pricePerItem = parseFloat(item.price_per_item?.toString() ?? "0");
                                                const itemTotal = (qtyNum * pricePerItem).toFixed(2);
                                                const itemName = (item as any).items?.name || item.note || 'Item';
                                                return (
                                                    <div key={item.id} className="flex justify-between text-sm py-1 px-2 bg-muted/50 rounded-md">
                                                        <div className="flex-1 truncate">
                                                            <span className="font-medium">{qtyStr}x </span>
                                                            <span>{itemName}</span>
                                                            {item.size && <span className="ml-1 text-xs bg-primary/10 px-1 py-0.5 rounded text-primary font-mono">({item.size})</span>}
                                                        </div>
                                                        <span className="font-bold text-primary min-w-[50px] text-right">€{itemTotal}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
}
