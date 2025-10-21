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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  BellRing,
  Calendar,
  CheckCircle,
  Filter,
  Mail,
  Package,
  RefreshCw,
  ShoppingCart,
  Star,
  Store,
  Trash2,
  User,
  AlertTriangle,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { admin } from "@/lib/api";

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  shop?: {
    name: string;
  };
  metadata?: any;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: "NOTIF001",
      type: "BOOKING",
      title: "تأكيد حجز الموعد",
      message: "تم تأكيد موعدك مع عيادة د. أحمد محمد في 12 سبتمبر 2025 في تمام الساعة 3:00 مساءًا",
      createdAt: "2025-09-11T15:30:00Z",
      isRead: false
    },
    {
      id: "NOTIF002",
      type: "ORDER",
      title: "تم شحن طلبك",
      message: "تم شحن طلبك رقم ORD-2025-001 وهو في طريقه إليك. رقم التتبع: TRK123456",
      createdAt: "2025-09-11T10:15:00Z",
      isRead: false
    },
    {
      id: "NOTIF003",
      type: "SYSTEM",
      title: "تحديث النظام",
      message: "تم تحديث دليل بلدي بميزات جديدة. استمتع بتجربة محسَّنة!",
      createdAt: "2025-09-11T08:00:00Z",
      isRead: true,
      readAt: "2025-09-11T09:00:00Z"
    },
    {
      id: "NOTIF004",
      type: "REVIEW",
      title: "تقييم جديد",
      message: "أضاف أحمح محمد تقييم 5 نجوم على خدمة تصليح السيارات",
      createdAt: "2025-09-10T20:30:00Z",
      isRead: true,
      readAt: "2025-09-11T07:00:00Z"
    },
    {
      id: "NOTIF005",
      type: "PAYMENT",
      title: "تم استلام الدفعة",
      message: "تم استلام دفعة 1500 جنيه مصري لطلب ORD-2025-001 بنجاح",
      createdAt: "2025-09-10T14:20:00Z",
      isRead: false
    },
    {
      id: "NOTIF006",
      type: "DELIVERY",
      title: "تم التوصيل",
      message: "تم توصيل طلبك رقم ORD-2025-002 بنجاح. نشكرك لتعاملك معنا!",
      createdAt: "2025-09-09T16:45:00Z",
      isRead: true,
      readAt: "2025-09-09T18:00:00Z"
    }
  ]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  // Load notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 20,
        };
        
        if (typeFilter !== 'all') {
          params.type = typeFilter;
        }
        
        if (readFilter !== 'all') {
          params.isRead = readFilter === 'read';
        }
        
        const data = await admin.getNotifications(params);
        setNotifications(data.notifications);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
        setStats(data.stats);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل الإشعارات");
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage, typeFilter, readFilter]);

  const getIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case "BOOKING":
        return <Calendar className={iconClass} />;
      case "ORDER":
        return <ShoppingCart className={iconClass} />;
      case "SYSTEM":
        return <Settings className={iconClass} />;
      case "REVIEW":
        return <Star className={iconClass} />;
      case "SHOP":
        return <Store className={iconClass} />;
      case "MESSAGE":
        return <Mail className={iconClass} />;
      case "PAYMENT":
        return <Package className={iconClass} />;
      case "DELIVERY":
        return <Package className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BOOKING":
        return "bg-blue-100 text-blue-800";
      case "ORDER":
        return "bg-green-100 text-green-800";
      case "SYSTEM":
        return "bg-stone-100 text-stone-800";
      case "REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "SHOP":
        return "bg-purple-100 text-purple-800";
      case "MESSAGE":
        return "bg-indigo-100 text-indigo-800";
      case "PAYMENT":
        return "bg-orange-100 text-orange-800";
      case "DELIVERY":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-stone-100 text-stone-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "BOOKING": return "حجز";
      case "ORDER": return "طلب";
      case "SYSTEM": return "نظام";
      case "REVIEW": return "تقييم";
      case "SHOP": return "متجر";
      case "MESSAGE": return "رسالة";
      case "PAYMENT": return "دفع";
      case "DELIVERY": return "توصيل";
      default: return type;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setLoading(true);
    try {
      // API call would go here
      // await markNotificationAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ));
      toast.success("تم تمييز الإشعار كمقروء");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الإشعار");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      // API call would go here
      // await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date().toISOString()
      })));
      toast.success("تم تمييز جميع الإشعارات كمقروءة");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success("تم حذف الإشعار");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    if (diffInMinutes < 10080) return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  // Calculate additional stats from current page data
  const pageStats = {
    read: notifications.filter(n => n.isRead).length,
    today: notifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.createdAt);
      return today.toDateString() === notifDate.toDateString();
    }).length
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإشعارات</h1>
          <p className="text-muted-foreground">
            {stats.unread > 0 
              ? `لديك ${stats.unread} إشعار غير مقروء`
              : "تم قراءة جميع الإشعارات"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          {stats.unread > 0 && (
            <Button onClick={handleMarkAllAsRead} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              تمييز الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <Bell className="w-3 h-3 mr-1" />
              جميع الإشعارات
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              غير مقروءة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              تحتاج لقراءة
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مقروءة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pageStats.read}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              تم الاطلاع عليها
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pageStats.today}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              إشعارات جديدة
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الإشعارات</CardTitle>
          <CardDescription>جميع إشعاراتك في مكان واحد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="نوع الإشعار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="BOOKING">الحجوزات</SelectItem>
                    <SelectItem value="ORDER">الطلبات</SelectItem>
                    <SelectItem value="PAYMENT">الدفعات</SelectItem>
                    <SelectItem value="DELIVERY">التوصيل</SelectItem>
                    <SelectItem value="REVIEW">التقييمات</SelectItem>
                    <SelectItem value="SYSTEM">النظام</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="حالة القراءة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="unread">غير مقروءة</SelectItem>
                    <SelectItem value="read">مقروءة</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground">لا توجد إشعارات مطابقة للفلاتر المحدد</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                    notification.isRead
                      ? "bg-background border-border"
                      : "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                  }`}
                >
                  <div className={`rounded-full p-2 ${
                    notification.isRead
                      ? "bg-muted text-muted-foreground"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${
                          !notification.isRead ? "text-blue-900 dark:text-blue-100" : ""
                        }`}>
                          {notification.title}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          تمييز كمقروء
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  عرض {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)} من {total} إشعار
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
