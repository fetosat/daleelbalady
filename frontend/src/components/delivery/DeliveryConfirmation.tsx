import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Camera,
  Star,
  AlertTriangle,
  MessageSquare,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/utils/apiClient';

interface ConfirmationProps {
  tripId: number;
  currentStatus: string;
  userRole: 'CUSTOMER' | 'DELIVERY';
  otherPartyConfirmed?: boolean;
  onConfirmationComplete: () => void;
}

interface ConfirmationData {
  confirmationType: 'DELIVERY' | 'RECEIPT';
  rating?: number;
  review?: string;
  confirmationCode?: string;
  photos?: File[];
  issues?: string[];
  notes?: string;
}

const DeliveryConfirmation: React.FC<ConfirmationProps> = ({
  tripId,
  currentStatus,
  userRole,
  otherPartyConfirmed = false,
  onConfirmationComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [confirmationData, setConfirmationData] = useState<ConfirmationData>({
    confirmationType: userRole === 'DELIVERY' ? 'DELIVERY' : 'RECEIPT',
    rating: 5,
    review: '',
    confirmationCode: '',
    photos: [],
    issues: [],
    notes: ''
  });

  const [issueForm, setIssueForm] = useState({
    issueType: '',
    description: '',
    photos: [] as File[],
    priority: 'NORMAL'
  });

  // بدء العد التنازلي عند الوصول للموقع
  useEffect(() => {
    if (currentStatus === 'AT_DELIVERY_LOCATION' && userRole === 'DELIVERY') {
      setCountdown(300); // 5 دقائق
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStatus, userRole]);

  const handleConfirmation = async () => {
    if (userRole === 'DELIVERY' && !confirmationData.confirmationCode) {
      toast.error('يرجى إدخال رمز التأكيد');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('confirmationType', confirmationData.confirmationType);
      formData.append('rating', String(confirmationData.rating));
      formData.append('review', confirmationData.review || '');
      formData.append('notes', confirmationData.notes || '');
      
      if (confirmationData.confirmationCode) {
        formData.append('confirmationCode', confirmationData.confirmationCode);
      }

      // إضافة الصور
      confirmationData.photos?.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      const response = await fetch(`${API_BASE_URL}/delivery/trips/${tripId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          userRole === 'DELIVERY' 
            ? 'تم تأكيد التسليم بنجاح' 
            : 'تم تأكيد الاستلام بنجاح'
        );
        setShowConfirmationModal(false);
        onConfirmationComplete();
      } else {
        toast.error(result.message || 'خطأ في التأكيد');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueForm.issueType || !issueForm.description) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('issueType', issueForm.issueType);
      formData.append('description', issueForm.description);
      formData.append('priority', issueForm.priority);

      // إضافة الصور
      issueForm.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch(`${API_BASE_URL}/delivery/trips/${tripId}/report-issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم إرسال البلاغ بنجاح');
        setShowIssueModal(false);
        setIssueForm({
          issueType: '',
          description: '',
          photos: [],
          priority: 'NORMAL'
        });
      } else {
        toast.error(result.message || 'خطأ في إرسال البلاغ');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateConfirmationCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const canShowConfirmation = () => {
    if (userRole === 'DELIVERY') {
      return currentStatus === 'AT_DELIVERY_LOCATION';
    } else {
      return currentStatus === 'DELIVERED';
    }
  };

  const getConfirmationTitle = () => {
    if (userRole === 'DELIVERY') {
      return 'تأكيد التسليم';
    } else {
      return 'تأكيد الاستلام';
    }
  };

  const getConfirmationDescription = () => {
    if (userRole === 'DELIVERY') {
      return 'يرجى تأكيد أنك قمت بتسليم الطلب للعميل';
    } else {
      return 'يرجى تأكيد أنك استلمت الطلب من مندوب التوصيل';
    }
  };

  if (!canShowConfirmation()) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            {userRole === 'DELIVERY' ? (
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            ) : (
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getConfirmationTitle()}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {getConfirmationDescription()}
        </p>

        {/* العد التنازلي للمندوب */}
        {userRole === 'DELIVERY' && countdown > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="w-5 h-5 text-orange-600 ml-2" />
              <span className="text-orange-800 font-medium">
                وقت الانتظار المتبقي: {formatTime(countdown)}
              </span>
            </div>
            <p className="text-sm text-orange-700">
              سيتم إلغاء الطلب تلقائياً عند انتهاء الوقت
            </p>
          </div>
        )}

        {/* حالة تأكيد الطرف الآخر */}
        {otherPartyConfirmed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 ml-2" />
              <span className="text-blue-800 font-medium">
                {userRole === 'DELIVERY' 
                  ? 'العميل أكد الاستلام' 
                  : 'المندوب أكد التسليم'}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              في انتظار تأكيدك لاكتمال العملية
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => setShowConfirmationModal(true)}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {userRole === 'DELIVERY' ? 'تأكيد التسليم' : 'تأكيد الاستلام'}
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            className="w-full bg-red-50 text-red-600 py-3 px-6 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
          >
            الإبلاغ عن مشكلة
          </button>
        </div>
      </div>

      {/* Modal التأكيد */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {getConfirmationTitle()}
                </h2>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* رمز التأكيد للمندوب */}
                {userRole === 'DELIVERY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رمز التأكيد من العميل *
                    </label>
                    <input
                      type="text"
                      value={confirmationData.confirmationCode}
                      onChange={(e) => setConfirmationData({
                        ...confirmationData, 
                        confirmationCode: e.target.value.toUpperCase()
                      })}
                      placeholder="ABC123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center font-mono text-lg"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      اطلب من العميل إعطاءك الرمز المكون من 6 أرقام/حروف
                    </p>
                  </div>
                )}

                {/* التقييم */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التقييم (1-5 نجوم)
                  </label>
                  <div className="flex justify-center space-x-1 space-x-reverse">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setConfirmationData({
                          ...confirmationData, 
                          rating: star
                        })}
                        className={`p-1 ${
                          star <= (confirmationData.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <StarIcon className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* التعليق */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تعليق (اختياري)
                  </label>
                  <textarea
                    value={confirmationData.review}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData, 
                      review: e.target.value
                    })}
                    placeholder={
                      userRole === 'DELIVERY' 
                        ? 'تعليق على العميل...' 
                        : 'تعليق على خدمة التوصيل...'
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                {/* صور التأكيد */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صور التأكيد (اختياري)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setConfirmationData({
                        ...confirmationData, 
                        photos: files
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكن إرفاق صور للطلب المُسلم
                  </p>
                </div>

                {/* ملاحظات إضافية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={confirmationData.notes}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData, 
                      notes: e.target.value
                    })}
                    placeholder="أي ملاحظات أو تفاصيل إضافية..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-3 space-x-reverse mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmation}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري التأكيد...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 ml-2" />
                      تأكيد
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal الإبلاغ عن مشكلة */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  الإبلاغ عن مشكلة
                </h2>
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* نوع المشكلة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع المشكلة *
                  </label>
                  <select
                    value={issueForm.issueType}
                    onChange={(e) => setIssueForm({
                      ...issueForm, 
                      issueType: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">اختر نوع المشكلة</option>
                    <option value="WRONG_ITEMS">أشياء خاطئة</option>
                    <option value="DAMAGED_ITEMS">أشياء تالفة</option>
                    <option value="MISSING_ITEMS">أشياء ناقصة</option>
                    <option value="WRONG_ADDRESS">عنوان خاطئ</option>
                    <option value="PAYMENT_ISSUE">مشكلة في الدفع</option>
                    <option value="DELIVERY_DELAY">تأخير في التوصيل</option>
                    <option value="RUDE_BEHAVIOR">سلوك غير لائق</option>
                    <option value="OTHER">أخرى</option>
                  </select>
                </div>

                {/* وصف المشكلة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف المشكلة *
                  </label>
                  <textarea
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({
                      ...issueForm, 
                      description: e.target.value
                    })}
                    placeholder="يرجى وصف المشكلة بالتفصيل..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    required
                  />
                </div>

                {/* مستوى الأولوية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مستوى الأولوية
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'LOW', label: 'منخفض', color: 'text-green-600 border-green-300' },
                      { value: 'NORMAL', label: 'عادي', color: 'text-blue-600 border-blue-300' },
                      { value: 'HIGH', label: 'عالي', color: 'text-red-600 border-red-300' }
                    ].map((priority) => (
                      <label key={priority.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={issueForm.priority === priority.value}
                          onChange={(e) => setIssueForm({
                            ...issueForm, 
                            priority: e.target.value
                          })}
                          className="sr-only"
                        />
                        <div className={`p-2 border-2 rounded-lg text-center transition-colors ${
                          issueForm.priority === priority.value 
                            ? `${priority.color} bg-opacity-10` 
                            : 'border-gray-200 text-gray-600'
                        }`}>
                          <span className="text-sm font-medium">{priority.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* صور المشكلة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صور توضيحية (اختياري)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setIssueForm({
                        ...issueForm, 
                        photos: files
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكن إرفاق صور توضح المشكلة
                  </p>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-3 space-x-reverse mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReportIssue}
                  disabled={loading || !issueForm.issueType || !issueForm.description}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-5 h-5 ml-2" />
                      إرسال البلاغ
                    </>
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

export default DeliveryConfirmation;
