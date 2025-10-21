import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import {
    ShoppingBag,
    Calendar,
    Store,
    Settings,
    Bell,
    Package,
    Settings2,
    MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
    {
        icon: ShoppingBag,
        label: "orders.title",
        path: "/dashboard/orders"
    },
    {
        icon: Calendar,
        label: "bookings.title",
        path: "/dashboard/bookings"
    },
    {
        icon: Store,
        label: "shops.title",
        path: "/dashboard/shops"
    },
    {
        icon: Package,
        label: "products.title",
        path: "/dashboard/products"
    },
    {
        icon: Settings2,
        label: "services.title",
        path: "/dashboard/services"
    },
    {
        icon: MessageSquare,
        label: "chatPage.title",
        path: "/dashboard/chat"
    },
    {
        icon: Bell,
        label: "notifications.title",
        path: "/dashboard/notifications"
    },
    {
        icon: Settings,
        label: "settings.title",
        path: "/dashboard/settings"
    }
];

export default function Overview() {
    const { t } = useTranslation("dashboard");

    return (
        <div className="bg-background shadow grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, index) => (
                <Link
                    key={index}
                    to={link.path}
                    className="block"
                >
                    <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-accent">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <link.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">{t(link.label)}</h3>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
