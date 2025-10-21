'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, Search, Filter, Eye, Truck, CreditCard, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: {
    productName: string;
    productDescription: string;
    shopName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  delivery?: {
    status: string;
    carrier: string;
    trackingCode: string;
    eta: string;
    lastLocation: string;
  };
  coupon?: {
    code: string;
    discountPercent: number;
    discountAmount: number;
  };
}

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page = 1, status = '', search = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await api.get(`/dashboard/customer/orders?${params.toString()}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders(currentPage, statusFilter, searchTerm);
    }
  }, [user, currentPage, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary' as const, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      'CONFIRMED': { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-100' },
      'PACKED': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-100' },
      'SHIPPED': { variant: 'outline' as const, color: 'text-orange-600', bg: 'bg-orange-100' },
      'DELIVERED': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-100' },
      'CANCELLED': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-100' },
      'RETURNED': { variant: 'secondary' as const, color: 'text-stone-600', bg: 'bg-stone-100' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant} className={`${config.bg} ${config.color}`}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'CANCELLED':
        return <Calendar className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    // Convert "all" back to empty string for API call
    const filterValue = status === 'all' ? '' : status;
    setStatusFilter(filterValue);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchOrders(1, statusFilter, searchTerm)}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Package className="h-8 w-8 mr-3" />
              My Orders
            </h1>
            <p className="text-purple-100">
              Track and manage all your orders
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{orders.length}</p>
            <p className="text-purple-100">Total Orders</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 h-4 w-4" />
          <Input
            placeholder="Search orders by number, product, or shop..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PACKED">Packed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-stone-600">Total Amount</p>
                          <p className="font-semibold text-lg">{order.totalAmount} {order.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-stone-600">Payment Method</p>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <p className="font-medium">{order.paymentMethod}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-stone-600">Order Date</p>
                          <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="border-t pt-3">
                        <p className="text-sm text-stone-600 mb-2">{order.items.length} item(s):</p>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.productName}</span>
                              <span className="font-medium">{item.totalPrice} {order.currency}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-stone-500">
                              + {order.items.length - 2} more item(s)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      {order.delivery && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">Delivery Status: {order.delivery.status}</p>
                          </div>
                          {order.delivery.trackingCode && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-stone-500" />
                              <span>Tracking: {order.delivery.trackingCode}</span>
                              {order.delivery.lastLocation && (
                                <span className="text-stone-600">• {order.delivery.lastLocation}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Coupon */}
                      {order.coupon && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            Coupon Applied: {order.coupon.code} 
                            ({order.coupon.discountPercent ? `${order.coupon.discountPercent}%` : `${order.coupon.discountAmount} ${order.currency}`} off)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-32">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {order.status === 'PENDING' && (
                        <Button variant="destructive" size="sm" className="w-full">
                          Cancel Order
                        </Button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <Button variant="outline" size="sm" className="w-full">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 mb-2">No Orders Found</h3>
            <p className="text-stone-500 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'You haven\'t placed any orders yet'}
            </p>
            {!searchTerm && !statusFilter && (
              <Button className="bg-purple-600 hover:bg-purple-700">
                Start Shopping
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-2"
        >
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
              className="w-10"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
}
