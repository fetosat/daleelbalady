import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Users, Store, Package, Wrench,
    CreditCard, FileText, Bell, TrendingUp, AlertCircle, ShoppingCart, Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAdminOverview, type AdminOverview } from "@/api/admin";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const { t } = useTranslation("dashboard");
    const { toast } = useToast();
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOverview = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminOverview();
            setOverview(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching admin overview:', err);
            setError('Failed to load dashboard data');
            toast({
                title: "Error",
                description: "Failed to load dashboard data. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error || !overview) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'No data available'}</p>
                    <Button onClick={fetchOverview}>Retry</Button>
                </div>
            </div>
        );
    }

    const stats = [
        { icon: Users, label: "userManagement", count: overview.stats.totalUsers.toLocaleString(), growth: overview.stats.userGrowth },
        { icon: Store, label: "shopsManagement", count: overview.stats.totalShops.toLocaleString(), growth: overview.stats.shopGrowth },
        { icon: Wrench, label: "servicesManagement", count: overview.stats.totalServices.toLocaleString(), growth: overview.stats.serviceGrowth },
        { icon: Package, label: "productsManagement", count: overview.stats.totalProducts.toLocaleString(), growth: overview.stats.productGrowth },
        { icon: ShoppingCart, label: "ordersManagement", count: overview.stats.totalOrders.toLocaleString(), growth: overview.stats.orderGrowth },
        { icon: Calendar, label: "bookingsManagement", count: overview.stats.totalBookings.toLocaleString(), growth: overview.stats.bookingGrowth },
        { icon: Bell, label: "notifications", count: overview.stats.unreadNotifications.toLocaleString(), growth: "+3.4%" },
    ];

    return (
        <div className="space-y-6 bg-background p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Overview of platform statistics and recent activity</p>
                </div>
                <Button onClick={fetchOverview} variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map(({ icon: Icon, label, count, growth }, index) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                    >
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {t(`admin.${label}`)}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className={`text-sm font-medium ${
                                        growth.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {growth}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Recent Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {overview.recentActivities.users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            user.role === 'ADMIN' ? 'bg-red-500' :
                                            user.role === 'SHOP_OWNER' ? 'bg-blue-500' :
                                            user.role === 'PROVIDER' ? 'bg-purple-500' :
                                            'bg-green-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.role}</p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Shops */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Recent Shops
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {overview.recentActivities.shops.map((shop) => (
                                    <div key={shop.id} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            shop.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{shop.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {shop.isVerified ? 'Verified' : 'Pending'}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(shop.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Recent Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {overview.recentActivities.orders.map((order) => (
                                    <div key={order.id} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            order.status === 'DELIVERED' ? 'bg-green-500' :
                                            order.status === 'SHIPPED' ? 'bg-blue-500' :
                                            order.status === 'PENDING' ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">#{order.orderNumber}</p>
                                            <p className="text-xs text-muted-foreground">{order.user.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {order.totalAmount.toLocaleString()} {order.currency}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* System Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <div>
                                    <p className="font-medium text-sm">API Services</p>
                                    <p className="text-xs text-muted-foreground">99.9% Uptime</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <div>
                                    <p className="font-medium text-sm">Database</p>
                                    <p className="text-xs text-muted-foreground">Healthy</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <div>
                                    <p className="font-medium text-sm">Storage</p>
                                    <p className="text-xs text-muted-foreground">75% Used</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <div>
                                    <p className="font-medium text-sm">Background Jobs</p>
                                    <p className="text-xs text-muted-foreground">{overview.stats.pendingOrders} Pending</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
