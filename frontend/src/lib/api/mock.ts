// Mock API functions for DaleelBalady dashboard

// Types based on Prisma schema
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'GUEST' | 'CUSTOMER' | 'PROVIDER' | 'SHOP_OWNER' | 'DELIVERY' | 'ADMIN';
  isVerified: boolean;
  verifiedBadge?: string;
  profilePic?: string;
}

export interface Booking {
  id: string;
  service: string;
  shop: string;
  startAt: string;
  endAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  price?: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  isVerified: boolean;
  city?: string;
  address?: string;
  phone?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  available: boolean;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  authorName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'SYSTEM' | 'BOOKING' | 'ORDER' | 'CHAT' | 'REVIEW';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Mock data
const mockBookings: Booking[] = [
  {
    id: 'b1',
    service: 'Doctor Consultation',
    shop: 'Al Salam Hospital',
    startAt: '2025-09-10T18:00:00Z',
    endAt: '2025-09-10T19:00:00Z',
    status: 'CONFIRMED',
    price: 300,
  },
  {
    id: 'b2',
    service: 'Plumbing Fix',
    shop: 'Handyman Co.',
    startAt: '2025-09-12T09:00:00Z',
    endAt: '2025-09-12T11:00:00Z',
    status: 'PENDING',
    price: 150,
  },
];

const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'DB-2024-001',
    totalAmount: 450,
    status: 'SHIPPED',
    items: [
      { id: 'oi1', productName: 'Medicine Pack', quantity: 2, unitPrice: 150, totalPrice: 300 },
      { id: 'oi2', productName: 'Health Supplements', quantity: 1, unitPrice: 150, totalPrice: 150 },
    ],
    createdAt: '2025-09-08T10:00:00Z',
  },
];

const mockShops: Shop[] = [
  {
    id: 's1',
    name: 'Al Salam Medical Center',
    description: 'Full medical services with experienced doctors',
    isVerified: true,
    city: 'Cairo',
    address: 'Downtown Cairo',
    phone: '0223456789',
  },
  {
    id: 's2',
    name: 'Tech Repair Shop',
    description: 'Professional electronics repair services',
    isVerified: false,
    city: 'Alexandria',
    phone: '0334567890',
  },
];

const mockServices: Service[] = [
  {
    id: 'srv1',
    name: 'General Consultation',
    description: 'Complete health checkup with experienced doctor',
    price: 300,
    available: true,
    category: 'Healthcare',
  },
  {
    id: 'srv2',
    name: 'Home Plumbing',
    description: 'Professional plumbing services at your doorstep',
    price: 200,
    available: true,
    category: 'Home Services',
  },
];

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Medicine Pack',
    description: 'Essential medicines for common ailments',
    price: 150,
    stock: 50,
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Health Supplements',
    description: 'Daily vitamins and supplements',
    price: 200,
    stock: 25,
    isActive: true,
  },
];

const mockReviews: Review[] = [
  {
    id: 'r1',
    rating: 5,
    comment: 'Excellent service, highly recommended!',
    authorName: 'Ahmed Mohamed',
    createdAt: '2025-09-08T15:30:00Z',
  },
  {
    id: 'r2',
    rating: 4,
    comment: 'Good service, but could be faster',
    authorName: 'Fatima Ali',
    createdAt: '2025-09-07T12:20:00Z',
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'BOOKING',
    title: 'Booking Confirmed',
    message: 'Your appointment with Dr. Ahmed has been confirmed for tomorrow at 6 PM',
    isRead: false,
    createdAt: '2025-09-09T10:00:00Z',
  },
  {
    id: 'n2',
    type: 'ORDER',
    title: 'Order Shipped',
    message: 'Your order DB-2024-001 has been shipped and will arrive soon',
    isRead: true,
    createdAt: '2025-09-08T14:30:00Z',
  },
];

// API Functions

export async function getUser(id: string): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id,
    name: "Ahmed Mohamed",
    email: "ahmed@example.com",
    phone: "01012345678",
    role: "CUSTOMER",
    isVerified: true,
  };
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockBookings;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockOrders;
}

export async function getUserShops(userId: string): Promise<Shop[]> {
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockShops;
}

export async function getUserServices(userId: string): Promise<Service[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockServices;
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 650));
  return mockProducts;
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockReviews;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockNotifications;
}

export async function getShopAnalytics(shopId: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    totalBookings: 47,
    totalRevenue: 12500,
    avgRating: 4.7,
    completedOrders: 134,
    pendingBookings: 8,
  };
}

export async function getDeliveryOrders(deliveryId: string) {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: 'do1',
      orderNumber: 'DB-2024-001',
      customerName: 'Ahmed Ali',
      address: 'Downtown Cairo, Building 5',
      status: 'IN_TRANSIT',
      value: 450,
      pickupTime: '2025-09-09T09:00:00Z',
    },
    {
      id: 'do2',
      orderNumber: 'DB-2024-002',
      customerName: 'Fatima Hassan',
      address: 'Nasr City, Apartment 10',
      status: 'PENDING',
      value: 280,
      pickupTime: '2025-09-09T14:00:00Z',
    },
  ];
}

export async function getAdminStats() {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    totalUsers: 1247,
    totalShops: 89,
    totalBookings: 534,
    totalRevenue: 125400,
    dailySearches: 2341,
    pendingVerifications: 12,
  };
}