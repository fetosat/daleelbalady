import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';

interface DeliveryRequest {
  id: number;
  requestTitle: string;
  requestDescription: string;
  requestType: string;
  items: any[];
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  };
  pickupLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  customerBudget: number;
  preferredDeliveryTime: string;
  priority: string;
  status: string;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
  };
}

interface OfferFormData {
  offerPrice: string;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  offerMessage: string;
  deliveryMethod: string;
  canWaitForPayment: boolean;
  advancePaymentRequired: string;
}

const DeliveryDashboard: React.FC = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DeliveryRequest | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  
  const [offerForm, setOfferForm] = useState<OfferFormData>({
    offerPrice: '',
    estimatedPickupTime: '30',
    estimatedDeliveryTime: '60',
    offerMessage: '',
    deliveryMethod: 'MOTORCYCLE',
    canWaitForPayment: true,
    advancePaymentRequired: ''
  });

  useEffect(() => {
    fetchAvailableRequests();
  }, []);

  const fetchAvailableRequests = async () => {
    try {
      const response = await apiFetch('/delivery/requests/available');
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

  const handleSubmitOffer = async () => {
    if (!selectedRequest) return;

    if (!offerForm.offerPrice || parseFloat(offerForm.offerPrice) <= 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }

    setOfferLoading(true);

    try {
      const response = await apiFetch(`/delivery/requests/${selectedRequest.id}/offers`, {
        method: 'POST',
        body: JSON.stringify({
          offerPrice: parseFloat(offerForm.offerPrice),
          estimatedPickupTime: parseInt(offerForm.estimatedPickupTime),
          estimatedDeliveryTime: parseInt(offerForm.estimatedDeliveryTime),
          offerMessage: offerForm.offerMessage,
          deliveryMethod: offerForm.deliveryMethod,
          canWaitForPayment: offerForm.canWaitForPayment,
          advancePaymentRequired: offerForm.advancePaymentRequired ? parseFloat(offerForm.advancePaymentRequired) : null
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم تقديم العرض بنجاح!');
        setShowOfferModal(false);
        setSelectedRequest(null);
        setOfferForm({
          offerPrice: '',
          estimatedPickupTime: '30',
          estimatedDeliveryTime: '60',
          offerMessage: '',
          deliveryMethod: 'MOTORCYCLE',
          canWaitForPayment: true,
          advancePaymentRequired: ''
        });
        fetchAvailableRequests();
      } else {
        toast.error(result.message || 'خطأ في تقديم العرض');
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setOfferLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'NORMAL': return 'text-blue-600 bg-blue-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'عاجل';
      case 'HIGH': return 'عالي';
      case 'NORMAL': return 'عادي';
      case 'LOW': return 'منخفض';
      default: return priority;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'GROCERY': return 'بقالة';
      case 'PHARMACY': return 'صيدلية';
      case 'RESTAURANT': return 'مطعم';
      case 'SPECIFIC_STORE': return 'محل محدد';
      case 'ANY_STORE': return 'أي محل';
      default: return 'أخرى';
    }
  };

  const calculateDistance = (request: DeliveryRequest) => {
    // حساب تقديري للمسافة - يحتاج لتطوير أكثر دقة
    return '2.5 كم';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم مندوب التوصيل</h1>
        <p className="text-gray-600">الطلبات المتاحة للتوصيل</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TruckIcon className="w-8 h-8 text-blue-600" />
            <div className="mr-3">
              <p className="text-sm font-medium text-blue-600">طلبات متاحة</p>
              <p className="text-2xl font-bold text-blue-900">{requests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="mr-3">
              <p className="text-sm font-medium text-green-600">مكتملة اليوم</p>
              <p className="text-2xl font-bold text-green-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <div className="mr-3">
              <p className="text-sm font-medium text-yellow-600">متوسط الوقت</p>
              <p className="text-2xl font-bold text-yellow-900">45د</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <StarIcon className="w-8 h-8 text-purple-600" />
            <div className="mr-3">
              <p className="text-sm font-medium text-purple-600">التقييم</p>
              <p className="text-2xl font-bold text-purple-900">4.8</p>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الطلبات */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات متاحة</h3>
            <p className="text-gray-500">سيتم إشعارك عند توفر طلبات جديدة</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.requestTitle}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {getPriorityLabel(request.priority)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {getRequestTypeLabel(request.requestType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 ml-1" />
                    <span>{request.deliveryLocation.address}</span>
                    <span className="mx-2">•</span>
                    <span>{calculateDistance(request)}</span>
                    {request.customerBudget && (
                      <>
                        <span className="mx-2">•</span>
                        <CurrencyDollarIcon className="w-4 h-4 ml-1" />
                        <span>ميزانية: {request.customerBudget} جنيه</span>
                      </>
                    )}
                  </div>

                  {/* عرض الأشياء المطلوبة */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">المطلوب:</p>
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

                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 ml-1" />
                    <span>{new Date(request.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowOfferModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    تقديم عرض
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    {request.customer.name}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal تقديم العرض */}
      {showOfferModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">تقديم عرض توصيل</h2>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {/* تفاصيل الطلب */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedRequest.requestTitle}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedRequest.requestDescription}</p>
                <div className="text-sm text-gray-600">
                  <p><strong>التوصيل إلى:</strong> {selectedRequest.deliveryLocation.address}</p>
                  {selectedRequest.customerBudget && (
                    <p><strong>الميزانية:</strong> {selectedRequest.customerBudget} جنيه</p>
                  )}
                </div>
              </div>

              {/* نموذج العرض */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر التوصيل (جنيه) *
                    </label>
                    <input
                      type="number"
                      value={offerForm.offerPrice}
                      onChange={(e) => setOfferForm({...offerForm, offerPrice: e.target.value})}
                      placeholder="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وسيلة التوصيل
                    </label>
                    <select
                      value={offerForm.deliveryMethod}
                      onChange={(e) => setOfferForm({...offerForm, deliveryMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MOTORCYCLE">دراجة نارية</option>
                      <option value="CAR">سيارة</option>
                      <option value="BICYCLE">دراجة</option>
                      <option value="WALKING">مشياً</option>
                      <option value="OTHER">أخرى</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وقت الوصول للشراء (دقيقة)
                    </label>
                    <input
                      type="number"
                      value={offerForm.estimatedPickupTime}
                      onChange={(e) => setOfferForm({...offerForm, estimatedPickupTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      إجمالي وقت التوصيل (دقيقة)
                    </label>
                    <input
                      type="number"
                      value={offerForm.estimatedDeliveryTime}
                      onChange={(e) => setOfferForm({...offerForm, estimatedDeliveryTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مبلغ مقدم مطلوب (اختياري)
                  </label>
                  <input
                    type="number"
                    value={offerForm.advancePaymentRequired}
                    onChange={(e) => setOfferForm({...offerForm, advancePaymentRequired: e.target.value})}
                    placeholder="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رسالة للعميل (اختياري)
                  </label>
                  <textarea
                    value={offerForm.offerMessage}
                    onChange={(e) => setOfferForm({...offerForm, offerMessage: e.target.value})}
                    placeholder="أهلاً، يمكنني توصيل طلبك بسرعة وأمان..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canWaitForPayment"
                    checked={offerForm.canWaitForPayment}
                    onChange={(e) => setOfferForm({...offerForm, canWaitForPayment: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canWaitForPayment" className="mr-2 block text-sm text-gray-900">
                    يمكنني انتظار دفع العميل للبضاعة
                  </label>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-3 space-x-reverse mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmitOffer}
                  disabled={offerLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {offerLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    'تقديم العرض'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
