import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search,
  Filter,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  Phone,
  Navigation
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { admin } from "@/lib/api";

type AdminDelivery = {
  id: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  carrier: string | null;
  trackingCode: string | null;
  eta: string | null;
  lastLocation: any;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    user: {
      name: string;
      phone: string;
    };
    items: Array<{
      product: {
        name: string;
        shop: {
          name: string;
          city: string;
        };
      };
    }>;
  };
};

// Mock data - replace with real API data
const mockDeliveries: AdminDelivery[] = [
  {
    id: "DEL001",
    status: "IN_TRANSIT",
    carrier: "شركة التوصيل السريع",
    trackingCode: "TRK123456",
    eta: "2025-09-11T15:00:00Z",
    lastLocation: { lat: 30.0444, lng: 31.2357, address: "القاهرة الجديدة" },
    createdAt: "2025-09-10T10:00:00Z",
    updatedAt: "2025-09-11T12:00:00Z",
    order: {
      id: "ORDER001",
      orderNumber: "ORD-2025-001",
      totalAmount: 1500,
      currency: "EGP",
      user: {
        name: "أحمد محمد",
        phone: "01234567890"
      },
      items: [{
        product: {
          name: "هاتف ذكي Samsung",
          shop: {
            name: "متجر الالكترونيات",
            city: "القاهرة"
          }
        }
      }]
    }
  },
  {
    id: "DEL002",
    status: "PENDING",
    carrier: null,
    trackingCode: null,
    eta: null,
    lastLocation: null,
    createdAt: "2025-09-11T08:30:00Z",
    updatedAt: "2025-09-11T08:30:00Z",
    order: {
      id: "ORDER002",
      orderNumber: "ORD-2025-002",
      totalAmount: 800,
      currency: "EGP",
      user: {
        name: "فاطمة علي",
        phone: "01987654321"
      },
      items: [{
        product: {
          name: "ساعة ذكية",
          shop: {
            name: "متجر الساعات",
            city: "الجيزة"
          }
        }
      }]
    }
  },
  {
    id: "DEL003",
    status: "DELIVERED",
    carrier: "فيدكس مصر",
    trackingCode: "FDX789012",
    eta: "2025-09-10T16:00:00Z",
    lastLocation: { lat: 30.0626, lng: 31.2497, address: "مدينة نصر" },
    createdAt: "2025-09-09T14:00:00Z",
    updatedAt: "2025-09-10T16:30:00Z",
    order: {
      id: "ORDER003",
      orderNumber: "ORD-2025-003",
      totalAmount: 2500,
      currency: "EGP",
      user: {
        name: "محمد حسن",
        phone: "01122334455"
      },
      items: [{
        product: {
          name: "لابتوب Dell",
          shop: {
            name: "معرض الكمبيوتر",
            city: "الإسكندرية"
          }
        }
      }]
    }
  }
];

export default function Deliveries() {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load deliveries data
  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 20,
        };
        
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        
        const data = await admin.getDeliveries(params);
        setDeliveries(data.deliveries);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل بيانات التوصيل");
        console.error('Error fetching deliveries:', error);
        // Fallback to mock data for development
        setDeliveries(mockDeliveries);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [currentPage, statusFilter]);

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      await admin.updateDelivery(deliveryId, { status: newStatus });
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus as AdminDelivery['status'], updatedAt: new Date().toISOString() }
          : delivery
      ));
      toast.success("تم تحديث حالة التوصيل");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة التوصيل");
      console.error('Error updating delivery status:', error);
    }
  };

  const getStatusBadge = (status: AdminDelivery['status']) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            تم التوصيل
          </Badge>
        );
      case 'IN_TRANSIT':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3 mr-1" />
            في الطريق
          </Badge>
        );
      case 'PICKED_UP':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Package className="w-3 h-3 mr-1" />
            تم الاستلام
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-stone-100 text-stone-800">
            <Clock className="w-3 h-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            فشل التوصيل
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: total, // Use total from API
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
    delivered: deliveries.filter(d => d.status === 'DELIVERED').length
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة التوصيل</h1>
          <p className="text-muted-foreground">متابعة وإدارة جميع عمليات التوصيل</p>
        </div>
        <Button className="bg-green-primary hover:bg-green-primary/90">
          <Truck className="mr-2 h-4 w-4" />
          تعيين سائق
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <Package className="w-3 h-3 mr-1" />
              جميع طلبات التوصيل
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="flex items-center text-xs text-yellow-600 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              بحاجة لتعيين سائق
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في الطريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <Truck className="w-3 h-3 mr-1" />
              قيد التوصيل
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تم التوصيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              مكتمل بنجاح
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات التوصيل</CardTitle>
          <CardDescription>متابعة وإدارة جميع عمليات التوصيل الجارية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في طلبات التوصيل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة التوصيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="PENDING">في الانتظار</SelectItem>
                    <SelectItem value="PICKED_UP">تم الاستلام</SelectItem>
                    <SelectItem value="IN_TRANSIT">في الطريق</SelectItem>
                    <SelectItem value="DELIVERED">تم التوصيل</SelectItem>
                    <SelectItem value="FAILED">فشل التوصيل</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المنتجات</TableHead>
                  <TableHead>الشركة</TableHead>
                  <TableHead>رقم التتبع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      لا توجد طلبات توصيل
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div className="font-medium">{delivery.order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {delivery.order.totalAmount} {delivery.order.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{delivery.order.user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {delivery.order.user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{delivery.order.items[0]?.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.order.items[0]?.product.shop.name}
                        </div>
                        {delivery.order.items.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            +{delivery.order.items.length - 1} منتجات أخرى
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {delivery.carrier ? (
                          <>
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{delivery.carrier}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">غير محدد</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {delivery.trackingCode ? (
                        <code className="bg-stone-100 px-2 py-1 rounded text-xs">
                          {delivery.trackingCode}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(delivery.updatedAt).toLocaleDateString('ar-EG')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(delivery.updatedAt).toLocaleTimeString('ar-EG', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">فتح القائمة</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          {delivery.lastLocation && (
                            <DropdownMenuItem>
                              <Navigation className="mr-2 h-4 w-4" />
                              تتبع الموقع
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {delivery.status === 'PENDING' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(delivery.id, 'PICKED_UP')}
                              className="text-blue-600"
                            >
                              <Package className="mr-2 h-4 w-4" />
                              تأكيد الاستلام
                            </DropdownMenuItem>
                          )}
                          {delivery.status === 'PICKED_UP' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(delivery.id, 'IN_TRANSIT')}
                              className="text-blue-600"
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              بدء التوصيل
                            </DropdownMenuItem>
                          )}
                          {delivery.status === 'IN_TRANSIT' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(delivery.id, 'DELIVERED')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              تأكيد التوصيل
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          {(delivery.status === 'PENDING' || delivery.status === 'PICKED_UP') && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(delivery.id, 'FAILED')}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              إلغاء التوصيل
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  عرض {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)} من {total} طلب
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  السابق
                </Button>
                <span className="text-sm font-medium">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
