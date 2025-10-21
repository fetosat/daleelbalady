import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  TriangleAlert
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryTrip {
  id: number;
  deliveryRequestId: number;
  tripStatus: string;
  deliveryFee: number;
  itemsCost?: number;
  totalTripCost?: number;
  tripStartedAt: string;
  tripCompletedAt?: string;
  totalDuration?: number;
  distanceTraveled?: number;
  deliveryRating?: number;
  customerRating?: number;
  deliveryRequest: {
    requestTitle: string;
    items: any[];
    priority: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
    profilePic?: string;
  };
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  pickupLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
}

const MyDeliveryTrips: React.FC = () => {
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
    try {
      const response = await fetch('/api/delivery/my-trips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setTrips(result.data.trips);
        setStats(result.data.stats);
      } else {
        toast.error(result.message || 'خطأ في جلب الرحلات');
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ACCEPTED': 'text-blue-600 bg-blue-100',
      'HEADING_TO_PICKUP': 'text-purple-600 bg-purple-100',
      'AT_PICKUP_LOCATION': 'text-indigo-600 bg-indigo-100',
      'SHOPPING': 'text-orange-600 bg-orange-100',
      'RECEIPT_UPLOADED': 'text-pink-600 bg-pink-100',
      'PAYMENT_CONFIRMED': 'text-cyan-600 bg-cyan-100',
      'HEADING_TO_DELIVERY': 'text-yellow-600 bg-yellow-100',
      'AT_DELIVERY_LOCATION': 'text-teal-600 bg-teal-100',
      'DELIVERED': 'text-green-600 bg-green-100',
      'CUSTOMER_CONFIRMED': 'text-green-700 bg-green-200',
      'COMPLETED': 'text-green-800 bg-green-300',
      'CANCELLED': 'text-red-600 bg-red-100',
      'PROBLEM_REPORTED': 'text-red-700 bg-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'ACCEPTED': 'تم قبول العرض',
      'HEADING_TO_PICKUP': 'في الطريق للشراء',
      'AT_PICKUP_LOCATION': 'وصلت للمحل',
      'SHOPPING': 'أقوم بالشراء',
      'RECEIPT_UPLOADED': 'رفعت الفاتورة',
      'PAYMENT_CONFIRMED': 'تم تأكيد الدفع',
      'HEADING_TO_DELIVERY': 'في الطريق للعميل',
      'AT_DELIVERY_LOCATION': 'وصلت للعميل',
      'DELIVERED': 'تم التسليم',
      'CUSTOMER_CONFIRMED': 'أكد العميل الاستلام',
      'COMPLETED': 'مكتملة',
      'CANCELLED': 'ملغية',
      'PROBLEM_REPORTED': 'مشكلة مبلغ عنها'
    };
    return labels[status] || status;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      'URGENT': '🔴',
      'HIGH': '🟡',
      'NORMAL': '🔵',
      'LOW': '🟢'
    };
    return icons[priority] || '⚪';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED'].includes(trip.tripStatus);
    if (filter === 'COMPLETED') return trip.tripStatus === 'COMPLETED';
    if (filter === 'CANCELLED') return trip.tripStatus === 'CANCELLED';
    return trip.tripStatus === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* العنوان والإحصائيات */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">رحلات التوصيل</h1>
        <p className="text-gray-600">جميع رحلات التوصيل التي قمت بها</p>
      </div>

      {/* إحصائيات المندوب */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalTrips}</div>
          <p className="text-sm text-blue-700">إجمالي الرحلات</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completedTrips}</div>
          <p className="text-sm text-green-700">مكتملة</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.totalEarnings}</div>
          <p className="text-sm text-yellow-700">إجمالي الأرباح</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center">
            <Star className="w-6 h-6 text-purple-600 fill-current" />
            <span className="text-2xl font-bold text-purple-600 mr-1">
              {stats.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-purple-700">متوسط التقييم</p>
        </div>
      </div>

      {/* فلاتر الرحلات */}
      <div className="flex space-x-2 space-x-reverse mb-6 overflow-x-auto">
        {[
          { value: 'ALL', label: 'الكل' },
          { value: 'ACTIVE', label: 'النشطة' },
          { value: 'HEADING_TO_PICKUP', label: 'في الطريق للشراء' },
          { value: 'HEADING_TO_DELIVERY', label: 'في الطريق للتوصيل' },
          { value: 'COMPLETED', label: 'مكتملة' },
          { value: 'CANCELLED', label: 'ملغية' }
        ].map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === filterOption.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* قائمة الرحلات */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'ALL' ? 'لا توجد رحلات' : `لا توجد رحلات ${filter === 'ACTIVE' ? 'نشطة' : 'بهذا التصنيف'}`}
          </h3>
          <p className="text-gray-500 mb-4">
            ابدأ بقبول طلبات توصيل من لوحة التحكم
          </p>
          <Link
            href="/delivery/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            اذهب للوحة التحكم
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {trip.deliveryRequest.requestTitle}
                    </h3>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.tripStatus)}`}>
                      {getStatusLabel(trip.tripStatus)}
                    </span>
                    
                    <span className="text-sm">
                      {getPriorityIcon(trip.deliveryRequest.priority)}
                    </span>
                  </div>

                  {/* معلومات العميل */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                      👤
                    </div>
                    <span className="font-medium">{trip.customer.name}</span>
                    <span className="mx-2">•</span>
                    <span>{trip.customer.phone}</span>
                  </div>

                  {/* المواقع */}
                  <div className="space-y-1 mb-3">
                    {trip.pickupLocation && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 ml-1 text-blue-600" />
                        <span>من: {trip.pickupLocation.address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 ml-1 text-green-600" />
                      <span>إلى: {trip.deliveryLocation.address}</span>
                    </div>
                  </div>

                  {/* الأشياء المطلوبة */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {trip.deliveryRequest.items.slice(0, 3).map((item, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {item.name} {item.quantity && `(${item.quantity})`}
                        </span>
                      ))}
                      {trip.deliveryRequest.items.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                          +{trip.deliveryRequest.items.length - 3} أخرى
                        </span>
                      )}
                    </div>
                  </div>

                  {/* معلومات الرحلة والوقت */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 ml-1" />
                        <span>{new Date(trip.tripStartedAt).toLocaleString('ar-EG')}</span>
                      </div>
                      
                      {trip.totalDuration && (
                        <div className="flex items-center">
                          <span>⏱️</span>
                          <span className="mr-1">{formatDuration(trip.totalDuration)}</span>
                        </div>
                      )}
                      
                      {trip.distanceTraveled && (
                        <div className="flex items-center">
                          <span>📏</span>
                          <span className="mr-1">{trip.distanceTraveled.toFixed(1)} كم</span>
                        </div>
                      )}
                    </div>

                    {/* الأرباح */}
                    <div className="text-left">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 ml-1" />
                        <span className="font-semibold text-green-600">
                          {trip.deliveryFee} جنيه
                        </span>
                      </div>
                      {trip.totalTripCost && (
                        <p className="text-xs text-gray-500">
                          إجمالي: {trip.totalTripCost} جنيه
                        </p>
                      )}
                    </div>
                  </div>

                  {/* التقييمات */}
                  {(trip.deliveryRating || trip.customerRating) && (
                    <div className="flex items-center space-x-4 space-x-reverse mt-3 pt-3 border-t">
                      {trip.deliveryRating && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 ml-1">تقييم العميل:</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= trip.deliveryRating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {trip.customerRating && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 ml-1">تقييمك للعميل:</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= trip.customerRating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* الإجراءات */}
                <div className="flex flex-col space-y-2 ml-4">
                  {/* زر التتبع للرحلات النشطة */}
                  {!['COMPLETED', 'CANCELLED'].includes(trip.tripStatus) && (
                    <Link
                      href={`/delivery/track/${trip.id}`}
                      className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                    </Link>
                  )}

                  {/* زر عرض التفاصيل */}
                  <Link
                    href={`/delivery/requests/${trip.deliveryRequestId}`}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* أيقونة الحالة */}
                  <div className="flex items-center justify-center w-10 h-10">
                    {trip.tripStatus === 'COMPLETED' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : trip.tripStatus === 'CANCELLED' ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : trip.tripStatus === 'PROBLEM_REPORTED' ? (
                      <TriangleAlert className="w-6 h-6 text-red-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ملخص الأداء */}
      {trips.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">ملخص الأداء</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((stats.completedTrips / stats.totalTrips) * 100)}%
              </div>
              <p className="text-sm text-gray-600">معدل إنجاز الرحلات</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {trips.filter(t => t.totalDuration).length > 0 
                  ? Math.round(trips.filter(t => t.totalDuration).reduce((sum, t) => sum + (t.totalDuration || 0), 0) / trips.filter(t => t.totalDuration).length)
                  : 0}د
              </div>
              <p className="text-sm text-gray-600">متوسط وقت الرحلة</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {trips.filter(t => t.distanceTraveled).length > 0
                  ? (trips.filter(t => t.distanceTraveled).reduce((sum, t) => sum + (t.distanceTraveled || 0), 0)).toFixed(1)
                  : 0} كم
              </div>
              <p className="text-sm text-gray-600">إجمالي المسافة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeliveryTrips;
