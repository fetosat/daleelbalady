import api from '@/lib/api';

// Customer Orders
export async function getCustomerOrders(page = 1, limit = 10, status?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
  const { data } = await api.get(`/dashboard/customer/orders?${params}`);
  return data;
}

export async function getOrderDetails(orderId: string) {
  const { data } = await api.get(`/dashboard/customer/orders/${orderId}`);
  return data;
}

// Types
export interface OrderItem {
  productName: string;
  productDescription?: string;
  shopName?: string;
  shopPhone?: string;
  shopCity?: string;
  shopAddress?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryInfo {
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  carrier?: string;
  trackingCode?: string;
  eta?: string;
  lastLocation?: any;
  updatedAt?: string;
}

export interface CouponInfo {
  code: string;
  title?: string;
  discountPercent?: number;
  discountAmount?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod?: 'CASH' | 'CARD' | 'WALLET' | 'ONLINE';
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  items: OrderItem[];
  delivery?: DeliveryInfo;
  coupon?: CouponInfo;
  metadata?: any;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
