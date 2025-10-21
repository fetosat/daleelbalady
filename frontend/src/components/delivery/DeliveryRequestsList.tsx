import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';

interface DeliveryRequest {
  id: number;
  requestTitle: string;
  requestDescription: string;
  status: string;
  priority: string;
  customerBudget: number;
  deliveryFee?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  items: any[];
  deliveryLocation: {
    address: string;
  };
  offers: any[];
  acceptedOffer?: {
    offerPrice: number;
    deliveryUser: {
      name: string;
      phone: string;
    };
  };
}

const DeliveryRequestsList: React.FC = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await apiFetch('/delivery/requests/my');
      
      const result = await response.json();
      if (result.success) {
        setRequests(result.data);
      } else {
        toast.error(result.message || 'خطأ في جلب الطلبات');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'OFFERS_RECEIVED': 'text-blue-600 bg-blue-100',
      'OFFER_ACCEPTED': 'text-green-600 bg-green-100',
      'PICKUP_IN_PROGRESS': 'text-purple-600 bg-purple-100',
      'AT_PICKUP_LOCATION': 'text-indigo-600 bg-indigo-100',
      'SHOPPING_IN_PROGRESS': 'text-orange-600 bg-orange-100',
      'RECEIPT_SUBMITTED': 'text-pink-600 bg-pink-100',
      'DELIVERY_IN_PROGRESS': 'text-cyan-600 bg-cyan-100',
      'AT_DELIVERY_LOCATION': 'text-teal-600 bg-teal-100',
      'COMPLETED': 'text-green-700 bg-green-200',
      'CANCELLED': 'text-red-600 bg-red-100',
      'EXPIRED': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDING': 'في الانتظار',
      'OFFERS_RECEIVED': 'تم استلام عروض',
      'OFFER_ACCEPTED': 'تم قبول العرض',
      'PICKUP_IN_PROGRESS': 'في طريقه للشراء',
      'AT_PICKUP_LOCATION': 'وصل للمحل',
      'SHOPPING_IN_PROGRESS': 'يقوم بالشراء',
      'RECEIPT_SUBMITTED': 'تم إرسال الفاتورة',
      'DELIVERY_IN_PROGRESS': 'في الطريق إليك',
      'AT_DELIVERY_LOCATION': 'وصل لموقعك',
      'COMPLETED': 'مكتمل',
      'CANCELLED': 'مُلغى',
      'EXPIRED': 'منتهي الصلاحية'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'URGENT': 'text-red-600',
      'HIGH': 'text-orange-600',
      'NORMAL': 'text-blue-600',
      'LOW': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(request.status);
    if (filter === 'COMPLETED') return request.status === 'COMPLETED';
    if (filter === 'CANCELLED') return ['CANCELLED', 'EXPIRED'].includes(request.status);
    return request.status === filter;
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
      {/* العنوان والإجراءات */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلبات التوصيل</h1>
          <p className="text-gray-600">جميع طلبات التوصيل الخاصة بك</p>
        </div>
        
        <Link
          href="/delivery/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 ml-2" />
          طلب جديد
        </Link>
      </div>

      {/* فلاتر الطلبات */}
      <div className="flex space-x-2 space-x-reverse mb-6 overflow-x-auto">
        {[
          { value: 'ALL', label: 'الكل' },
          { value: 'ACTIVE', label: 'النشطة' },
          { value: 'PENDING', label: 'في الانتظار' },
          { value: 'OFFERS_RECEIVED', label: 'بها عروض' },
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

      {/* قائمة الطلبات */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'ALL' ? 'لا توجد طلبات' : `لا توجد طلبات ${filter === 'ACTIVE' ? 'نشطة' : 'بهذا التصنيف'}`}
          </h3>
          <p className="text-gray-500 mb-4">
            ابدأ بإنشاء طلب توصيل جديد
          </p>
          <Link
            href="/delivery/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            اطلب توصيل الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.requestTitle}
                    </h3>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                    
                    <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority === 'URGENT' ? '🔴' : 
                       request.priority === 'HIGH' ? '🟡' : 
                       request.priority === 'NORMAL' ? '🔵' : '🟢'}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 ml-1" />
                    <span>{request.deliveryLocation.address}</span>
                    <span className="mx-2">•</span>
                    <ClockIcon className="w-4 h-4 ml-1" />
                    <span>{new Date(request.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>

                  {/* عرض الأشياء المطلوبة */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {request.items.slice(0, 3).map((item, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {item.name} {item.quantity && `(${item.quantity})`}
                        </span>
                      ))}
                      {request.items.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                          +{request.items.length - 3} أخرى
                        </span>
                      )}
                    </div>
                  </div>

                  {/* معلومات المندوب المقبول */}
                  {request.acceptedOffer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            المندوب: {request.acceptedOffer.deliveryUser.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {request.acceptedOffer.deliveryUser.phone}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-800">
                            {request.acceptedOffer.offerPrice} جنيه
                          </p>
                          <p className="text-xs text-green-600">مصاريف التوصيل</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* التكلفة */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {request.customerBudget && (
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 ml-1" />
                          <span>الميزانية: {request.customerBudget} جنيه</span>
                        </div>
                      )}
                      
                      {request.offers.length > 0 && (
                        <span className="text-blue-600 font-medium">
                          {request.offers.length} عرض سعر
                        </span>
                      )}
                    </div>

                    {request.totalAmount && (
                      <div className="text-left">
                        <span className="text-lg font-semibold text-gray-900">
                          {request.totalAmount} جنيه
                        </span>
                        <p className="text-xs text-gray-500">إجمالي</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* الإجراءات */}
                <div className="flex flex-col space-y-2 ml-4">
                  {/* زر عرض التفاصيل */}
                  <Link
                    to={`/delivery/requests/${request.id}`}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>

                  {/* زر التتبع للطلبات النشطة */}
                  {request.status === 'OFFER_ACCEPTED' && request.acceptedOffer && (
                    <Link
                      to={`/delivery/track/${request.id}`} // يحتاج trip ID هنا
                      className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <TruckIcon className="w-4 h-4" />
                    </Link>
                  )}

                  {/* أيقونة الحالة */}
                  <div className="flex items-center justify-center w-10 h-10">
                    {request.status === 'COMPLETED' ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    ) : ['CANCELLED', 'EXPIRED'].includes(request.status) ? (
                      <XCircleIcon className="w-6 h-6 text-red-600" />
                    ) : (
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* إحصائيات سريعة */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {requests.filter(r => !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(r.status)).length}
          </div>
          <p className="text-sm text-blue-700">طلبات نشطة</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'COMPLETED').length}
          </div>
          <p className="text-sm text-green-700">مكتملة</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'PENDING').length}
          </div>
          <p className="text-sm text-yellow-700">في الانتظار</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {requests.length}
          </div>
          <p className="text-sm text-purple-700">إجمالي الطلبات</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRequestsList;
