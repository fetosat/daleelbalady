import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  ShoppingBag, 
  Clock, 
  DollarSign,
  Plus,
  Minus,
  User,
  Phone,
  Map,
  Trash
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';
interface DeliveryItem {
  name: string;
  quantity: string;
  notes?: string;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  notes?: string;
  phone?: string;
}

const DeliveryRequestForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    requestTitle: '',
    requestDescription: '',
    requestType: 'ANY_STORE' as 'SPECIFIC_STORE' | 'ANY_STORE' | 'GROCERY' | 'PHARMACY' | 'RESTAURANT' | 'OTHER',
    specificStoreId: null as number | null,
    customerBudget: '',
    preferredDeliveryTime: 'ASAP' as 'ASAP' | 'WITHIN_1_HOUR' | 'WITHIN_2_HOURS' | 'TODAY' | 'TOMORROW' | 'SPECIFIC_TIME',
    specificDeliveryTime: '',
    priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    customerNotes: ''
  });

  const [items, setItems] = useState<DeliveryItem[]>([
    { name: '', quantity: '', notes: '' }
  ]);

  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<LocationData | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<'pickup' | 'delivery' | null>(null);

  // إضافة عنصر جديد للقائمة
  const addItem = () => {
    setItems([...items, { name: '', quantity: '', notes: '' }]);
  };

  // حذف عنصر من القائمة
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // تحديث بيانات العنصر
  const updateItem = (index: number, field: keyof DeliveryItem, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // الحصول على الموقع الحالي
  const getCurrentLocation = (type: 'pickup' | 'delivery') => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // تحويل الإحداثيات إلى عنوان (يحتاج لخدمة geocoding)
          const address = await reverseGeocode(latitude, longitude);
          
          const locationData = {
            lat: latitude,
            lng: longitude,
            address,
            notes: '',
            ...(type === 'delivery' && { phone: '' })
          };

          if (type === 'pickup') {
            setPickupLocation(locationData);
          } else {
            setDeliveryLocation(locationData);
          }
        },
        (error) => {
          toast.error('تعذر الحصول على موقعك الحالي');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('المتصفح لا يدعم تحديد الموقع');
    }
  };

  // تحويل الإحداثيات إلى عنوان
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // يمكن استخدام أي خدمة geocoding مثل Google Maps أو OpenStreetMap
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // إرسال الطلب
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.requestTitle.trim()) {
      toast.error('يرجى إدخال عنوان الطلب');
      return;
    }

    if (items.filter(item => item.name.trim()).length === 0) {
      toast.error('يرجى إدخال عنصر واحد على الأقل');
      return;
    }

    if (!deliveryLocation) {
      toast.error('يرجى تحديد موقع التوصيل');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        ...formData,
        items: items.filter(item => item.name.trim()),
        pickupLocation,
        deliveryLocation,
        customerBudget: formData.customerBudget ? parseFloat(formData.customerBudget) : null,
        specificDeliveryTime: formData.specificDeliveryTime || null
      };

      const response = await apiFetch('/delivery/requests', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم إنشاء طلب التوصيل بنجاح!');
        router.push(`/delivery/requests`);
      } else {
        toast.error(result.message || 'خطأ في إنشاء الطلب');
      }
    } catch (error) {
      console.error('Error creating delivery request:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        طلب توصيل جديد
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* عنوان الطلب */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان الطلب *
          </label>
          <input
            type="text"
            value={formData.requestTitle}
            onChange={(e) => setFormData({...formData, requestTitle: e.target.value})}
            placeholder="مثال: احتاج شاي وسكر من أي محل"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* نوع الطلب */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الطلب
          </label>
          <select
            value={formData.requestType}
            onChange={(e) => setFormData({...formData, requestType: e.target.value as any})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ANY_STORE">من أي محل</option>
            <option value="SPECIFIC_STORE">من محل محدد</option>
            <option value="GROCERY">بقالة</option>
            <option value="PHARMACY">صيدلية</option>
            <option value="RESTAURANT">مطعم</option>
            <option value="OTHER">أخرى</option>
          </select>
        </div>

        {/* قائمة الأشياء المطلوبة */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              الأشياء المطلوبة *
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="اسم الصنف"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="الكمية"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="ملاحظات (اختياري)"
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full h-full flex items-center justify-center text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* المواقع */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* موقع الشراء (اختياري) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موقع الشراء (اختياري)
            </label>
            <div className="space-y-3">
              {pickupLocation ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <button
                      type="button"
                      onClick={() => setPickupLocation(null)}
                      className="text-red-600 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{pickupLocation.address}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => getCurrentLocation('pickup')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Map className="w-5 h-5 ml-2" />
                    تحديد موقع الشراء
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* موقع التوصيل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موقع التوصيل *
            </label>
            <div className="space-y-3">
              {deliveryLocation ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation(null)}
                      className="text-red-600 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{deliveryLocation.address}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => getCurrentLocation('delivery')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Map className="w-5 h-5 ml-2" />
                    تحديد موقع التوصيل
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الميزانية والوقت */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* الميزانية المتوقعة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الميزانية المتوقعة (جنيه)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.customerBudget}
                onChange={(e) => setFormData({...formData, customerBudget: e.target.value})}
                placeholder="100"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* وقت التوصيل المفضل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت التوصيل المفضل
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
              <select
                value={formData.preferredDeliveryTime}
                onChange={(e) => setFormData({...formData, preferredDeliveryTime: e.target.value as any})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ASAP">في أسرع وقت</option>
                <option value="WITHIN_1_HOUR">خلال ساعة</option>
                <option value="WITHIN_2_HOURS">خلال ساعتين</option>
                <option value="TODAY">اليوم</option>
                <option value="TOMORROW">غداً</option>
                <option value="SPECIFIC_TIME">وقت محدد</option>
              </select>
            </div>

            {formData.preferredDeliveryTime === 'SPECIFIC_TIME' && (
              <input
                type="datetime-local"
                value={formData.specificDeliveryTime}
                onChange={(e) => setFormData({...formData, specificDeliveryTime: e.target.value})}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* أولوية الطلب */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            أولوية الطلب
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: 'LOW', label: 'منخفضة', color: 'text-green-600 border-green-300' },
              { value: 'NORMAL', label: 'عادية', color: 'text-blue-600 border-blue-300' },
              { value: 'HIGH', label: 'عالية', color: 'text-orange-600 border-orange-300' },
              { value: 'URGENT', label: 'عاجلة', color: 'text-red-600 border-red-300' }
            ].map((priority) => (
              <label key={priority.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  formData.priority === priority.value 
                    ? `${priority.color} bg-opacity-10` 
                    : 'border-gray-200 text-gray-600'
                }`}>
                  <span className="text-sm font-medium">{priority.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ملاحظات إضافية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات إضافية
          </label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
            placeholder="أي ملاحظات أو تفاصيل إضافية..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex justify-end space-x-4 space-x-reverse pt-6">
          <button
            type="button"
            onClick={() => router.push('/delivery')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الإرسال...
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 ml-2" />
                إنشاء الطلب
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryRequestForm;
