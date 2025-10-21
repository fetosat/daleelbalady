import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ShopManagement from "@/components/shop/ShopManagement";
import ServiceManagement from "@/components/shop/ServiceManagement";
import {
    CalendarCheck, ShoppingBag, MessageCircle,
    BarChart3
} from "lucide-react";

export default function ShopOwnerDashboard() {
    const { t } = useTranslation("dashboard");

    const stats = [
        { label: "todayBookings", count: 12, icon: CalendarCheck },
        { label: "pendingOrders", count: 8, icon: ShoppingBag },
        { label: "unreadMessages", count: 5, icon: MessageCircle },
        { label: "todayRevenue", count: "$1,234", icon: BarChart3 },
    ];

    return (
        <div className="space-y-6 bg-background p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map(({ label, count, icon: Icon }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t(`shopOwner.${label}`)}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <ShopManagement />
                <ServiceManagement />

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("shopOwner.recentBookings")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4">
                                    <CalendarCheck className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Hair Cut & Styling</p>
                                        <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <CalendarCheck className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Full Car Service</p>
                                        <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("shopOwner.recentOrders")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4">
                                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Order #1234</p>
                                        <p className="text-sm text-muted-foreground">2 items - $129.99</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Order #1235</p>
                                        <p className="text-sm text-muted-foreground">1 item - $49.99</p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("shopOwner.analytics")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("shopOwner.totalRevenue")}</p>
                                <p className="text-2xl font-bold">$12,345</p>
                                <p className="text-xs text-green-600">+12% from last month</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("shopOwner.totalBookings")}</p>
                                <p className="text-2xl font-bold">234</p>
                                <p className="text-xs text-green-600">+8% from last month</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("shopOwner.avgRating")}</p>
                                <p className="text-2xl font-bold">4.8</p>
                                <p className="text-xs text-green-600">+0.2 from last month</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
