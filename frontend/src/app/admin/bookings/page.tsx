'use client'

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, Eye, Edit, Clock, User, Store, Phone, Mail, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Booking {
  id: string;
  bookingRef: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  service: {
    id: string;
  };
  shop: {
    id: string;
    name: string;
  } | null;
  startAt: string;
  endAt: string;
  durationMins: number;
  status: string;
  price: number;
  currency: string;
  notes: string | null;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('daleel-token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'ALL' && { status: statusFilter })
      });

      const response = await fetch(`/api/dashboard/admin/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        // Avoid noisy console errors for expected unimplemented endpoints during development
        const logFn = (response.status === 404 || response.status >= 500) ? console.warn : console.error;
        logFn('Failed to fetch bookings:', response.status, response.statusText);
        // For development: provide mock data if API fails
        if (response.status === 404 || response.status >= 500) {
          console.warn('Using mock bookings data for development');
          setBookings([
            {
              id: '1',
              bookingRef: 'BK001',
              user: {
                id: 'u1',
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '+201234567890'
              },
              service: { id: 's1' },
              shop: {
                id: 'shop1',
                name: 'عيادة د. سارة'
              },
              startAt: new Date().toISOString(),
              endAt: new Date(Date.now() + 3600000).toISOString(),
              durationMins: 60,
              status: 'CONFIRMED',
              price: 250,
              currency: 'EGP',
              notes: 'فحص دوري',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: '2',
              bookingRef: 'BK002',
              user: {
                id: 'u2',
                name: 'فاطمة علي',
                email: 'fatima@example.com',
                phone: '+201234567891'
              },
              service: { id: 's2' },
              shop: {
                id: 'shop2',
                name: 'صالون الجمال'
              },
              startAt: new Date(Date.now() + 86400000).toISOString(),
              endAt: new Date(Date.now() + 90000000).toISOString(),
              durationMins: 90,
              status: 'PENDING',
              price: 150,
              currency: 'EGP',
              notes: 'قص شعر وترتيب',
              createdAt: new Date(Date.now() - 172800000).toISOString()
            }
          ]);
          setTotalPages(1);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('فشل في تحميل الحجوزات - جاري استخدام بيانات تجريبية');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      const token = localStorage.getItem('daleel-token');
      const response = await fetch(`/api/dashboard/admin/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('تم تحديث حالة الحجز بنجاح');
        setShowStatusModal(false);
        setSelectedBooking(null);
        setNewStatus('');
        fetchBookings();
      } else {
        throw new Error('فشل في تحديث حالة الحجز');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('فشل في تحديث حالة الحجز');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      NO_SHOW: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400'
    };
    return colors[status as keyof typeof colors] || 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'في الانتظار',
      CONFIRMED: 'مؤكد',
      COMPLETED: 'منجز',
      CANCELLED: 'ملغي',
      NO_SHOW: 'لم يحضر'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredBookings = bookings.filter(booking => {
    // Text search filter
    const matchesSearch = booking.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                إدارة الحجوزات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع حجوزات الخدمات والمواعيد</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث بالمرجع أو الاسم أو البريد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
              </div>
              
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="dark:bg-stone-800 dark:border-stone-700">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الحالات</SelectItem>
                    <SelectItem value="PENDING">في الانتظار</SelectItem>
                    <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                    <SelectItem value="COMPLETED">منجز</SelectItem>
                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                    <SelectItem value="NO_SHOW">لم يحضر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                <Filter className="w-4 h-4 ml-2" />
                مرشح متقدم
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{bookings.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الحجوزات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">مؤكدة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">منجزة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {bookings.filter(b => b.status === 'PENDING').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">في الانتظار</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة الحجوزات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                لا توجد حجوزات
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900 dark:text-stone-100 mb-1">
                          رقم المرجع: {booking.bookingRef || 'غير محدد'}
                        </div>
                        <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {booking.user.name}
                          </span>
                          {booking.shop && (
                            <span className="flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              {booking.shop.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(booking.startAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {booking.price ? `${booking.price} ${booking.currency || 'EGP'}` : 'مجاني'}
                        </div>
                        <div className="text-sm text-stone-500 dark:text-stone-400">
                          {booking.durationMins} دقيقة
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowViewModal(true);
                          }}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setNewStatus(booking.status);
                            setShowStatusModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          title="تحديث الحالة"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="dark:border-stone-700 dark:text-stone-300"
            >
              السابق
            </Button>
            <span className="text-sm text-stone-600 dark:text-stone-400">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="dark:border-stone-700 dark:text-stone-300"
            >
              التالي
            </Button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedBooking && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">
                تفاصيل الحجز
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-stone-600 dark:text-stone-400">رقم المرجع</label>
                  <p className="text-stone-900 dark:text-stone-100 font-medium">{selectedBooking.bookingRef || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm text-stone-600 dark:text-stone-400">الحالة</label>
                  <p>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {getStatusLabel(selectedBooking.status)}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">الاسم</label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedBooking.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">البريد الإلكتروني</label>
                    <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-500" />
                      {selectedBooking.user.email}
                    </p>
                  </div>
                  {selectedBooking.user.phone && (
                    <div>
                      <label className="text-sm text-stone-600 dark:text-stone-400">رقم الهاتف</label>
                      <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-stone-500" />
                        {selectedBooking.user.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  تفاصيل الحجز
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBooking.shop && (
                    <div>
                      <label className="text-sm text-stone-600 dark:text-stone-400">المتجر/العيادة</label>
                      <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Store className="w-4 h-4 text-stone-500" />
                        {selectedBooking.shop.name}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">وقت البداية</label>
                    <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-500" />
                      {format(new Date(selectedBooking.startAt), 'dd/MM/yyyy - HH:mm', { locale: ar })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">وقت الانتهاء</label>
                    <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-500" />
                      {format(new Date(selectedBooking.endAt), 'dd/MM/yyyy - HH:mm', { locale: ar })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">مدة الخدمة</label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedBooking.durationMins} دقيقة</p>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">السعر</label>
                    <p className="text-stone-900 dark:text-stone-100 font-semibold">
                      {selectedBooking.price ? `${selectedBooking.price} ${selectedBooking.currency || 'EGP'}` : 'مجاني'}
                    </p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-stone-600 dark:text-stone-400">ملاحظات</label>
                      <p className="text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                <div className="text-sm text-stone-600 dark:text-stone-400">
                  تم إنشاء الحجز {formatDistanceToNow(new Date(selectedBooking.createdAt), { addSuffix: true, locale: ar })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedBooking && (
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent className="sm:max-w-md dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">
                تحديث حالة الحجز
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                  رقم المرجع: {selectedBooking.bookingRef || 'غير محدد'}
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="dark:bg-stone-800 dark:border-stone-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">في الانتظار</SelectItem>
                    <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                    <SelectItem value="COMPLETED">منجز</SelectItem>
                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                    <SelectItem value="NO_SHOW">لم يحضر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBooking(null);
                    setNewStatus('');
                  }}
                  className="flex-1 dark:border-stone-700"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  تحديث الحالة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}

