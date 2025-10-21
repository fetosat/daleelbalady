import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    BarChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import {
    Users,
    ShoppingBag,
    CalendarDays,
    Star,
    TrendingUp,
    DollarSign,
    Activity,
    Package
} from "lucide-react";

// Mock data - replace with real data from your API
const revenueData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 2000 },
    { month: "Apr", revenue: 2780 },
    { month: "May", revenue: 1890 },
    { month: "Jun", revenue: 2390 },
];

const bookingsData = [
    { month: "Jan", bookings: 40 },
    { month: "Feb", bookings: 30 },
    { month: "Mar", bookings: 20 },
    { month: "Apr", bookings: 27 },
    { month: "May", bookings: 18 },
    { month: "Jun", bookings: 23 },
];

const ordersData = [
    { month: "Jan", orders: 100 },
    { month: "Feb", orders: 80 },
    { month: "Mar", orders: 60 },
    { month: "Apr", orders: 70 },
    { month: "May", orders: 50 },
    { month: "Jun", orders: 65 },
];

const statsData = [
    {
        title: "Total Users",
        value: "1,234",
        change: "+12.5%",
        icon: Users,
        trend: "up"
    },
    {
        title: "Total Orders",
        value: "856",
        change: "+23.4%",
        icon: ShoppingBag,
        trend: "up"
    },
    {
        title: "Total Bookings",
        value: "432",
        change: "+18.7%",
        icon: CalendarDays,
        trend: "up"
    },
    {
        title: "Average Rating",
        value: "4.8",
        change: "+0.3",
        icon: Star,
        trend: "up"
    }
];

export default function AnalyticsPage() {
    const { t } = useTranslation("dashboard");

    return (
        <div className="space-y-6 bg-background p-6 rounded-lg shadow">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t(`analyticsPage.${stat.title.toLowerCase().replace(" ", "")}`)}
                                    </p>
                                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                                    <p className={`text-sm mt-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {stat.change}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <stat.icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Charts */}
            <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="revenue">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {t("analyticsPage.revenue")}
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                        <Package className="h-4 w-4 mr-2" />
                        {t("analyticsPage.orders")}
                    </TabsTrigger>
                    <TabsTrigger value="bookings">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {t("analyticsPage.bookings")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("analyticsPage.revenueOverTime")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#0ea5e9"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("analyticsPage.ordersOverTime")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ordersData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="orders"
                                            fill="#0ea5e9"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("analyticsPage.bookingsOverTime")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bookingsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="bookings"
                                            fill="#0ea5e9"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Additional Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("analyticsPage.performanceMetrics")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {t("analyticsPage.conversionRate")}
                                </span>
                                <span className="text-sm font-bold">3.2%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {t("analyticsPage.averageOrderValue")}
                                </span>
                                <span className="text-sm font-bold">$85.20</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {t("analyticsPage.customerRetention")}
                                </span>
                                <span className="text-sm font-bold">76%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("analyticsPage.topServices")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Medical Consultation</span>
                                <span className="text-sm font-bold">324 bookings</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Car Maintenance</span>
                                <span className="text-sm font-bold">256 bookings</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Legal Consultation</span>
                                <span className="text-sm font-bold">198 bookings</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}
