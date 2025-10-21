import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  Eye,
  MapPin,
  Calendar,
  CreditCard,
  Timer,
  XCircle,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCustomerOrders, getOrderDetails, type Order, type OrdersResponse } from "@/api/orders";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function OrdersPage() {
  const { t } = useTranslation("dashboard");
  const { toast } = useToast();

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  const fetchOrders = async (page: number = 1, status?: string) => {
    try {
      setIsLoading(page === 1);
      setIsRefreshing(page !== 1);
      const response: OrdersResponse = await getCustomerOrders(page, 10, status);
      setOrders(response.orders);
      setTotalPages(response.pagination.pages);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setOrderDetailsLoading(true);
      const orderDetails = await getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchOrders(1, status || undefined);
  };

  const handlePageChange = (page: number) => {
    fetchOrders(page, statusFilter || undefined);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t("orders.delivered")}
          </Badge>
        );
      case 'SHIPPED':
        return (
          <Badge className="bg-blue-500">
            <Truck className="w-4 h-4 mr-1" />
            {t("orders.shipped")}
          </Badge>
        );
      case 'PACKED':
        return (
          <Badge className="bg-purple-500">
            <Package className="w-4 h-4 mr-1" />
            {t("orders.packed")}
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge className="bg-orange-500">
            <Timer className="w-4 h-4 mr-1" />
            {t("orders.confirmed")}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-4 h-4 mr-1" />
            {t("orders.pending")}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            <XCircle className="w-4 h-4 mr-1" />
            {t("orders.cancelled")}
          </Badge>
        );
      case 'RETURNED':
        return (
          <Badge variant="outline">
            <RefreshCw className="w-4 h-4 mr-1" />
            {t("orders.returned")}
          </Badge>
        );
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'CASH':
        return <Package className="w-4 h-4" />;
      case 'WALLET':
        return <CreditCard className="w-4 h-4" />;
      case 'ONLINE':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchOrders()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  };

  return (
      <div className="space-y-6 bg-background p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("orders.title")}</h1>
          <Button>{t("orders.exportOrders")}</Button>
        </div>

        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>
                      {t("orders.orderNumber", { number: order.id })}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} • {order.items.length} {t("orders.items")}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">{t("orders.items")}</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                          </div>
                          <span className="font-medium">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                        <span>{t("orders.total")}</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">
                        {t("orders.customerDetails")}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{order.orderNumber}</span>
                        </div>
                        {order.paymentMethod && (
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span>{order.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">
                        {t("orders.deliveryDetails")}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>{order.status}</span>
                        </div>
                        {order.deliveredAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {t("orders.deliveredAt")}:{" "}
                              {formatDate(order.deliveredAt)}
                            </span>
                          </div>
                        )}
                        {order.shippedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {t("orders.shippedAt")}: {formatDate(order.shippedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => fetchOrderDetails(order.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    {t("orders.viewDetails")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
