import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Truck, 
  Clock, 
  CheckCircle,
  MessageSquare,
  Camera,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import io, { Socket } from 'socket.io-client';

interface TripData {
  id: number;
  deliveryRequestId: number;
  customerId: number;
  deliveryUserId: number;
  tripStatus: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryFee: number;
  itemsCost?: number;
  totalTripCost?: number;
  receiptDetails?: {
    imageUrl: string;
    totalAmount: number;
    items: any[];
    uploadedAt: string;
  };
  deliveryUser: {
    id: number;
    name: string;
    phone: string;
    profilePic?: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  deliveryRequest: {
    requestTitle: string;
    items: any[];
    customerNotes?: string;
  };
}

interface LocationUpdate {
  lat: number;
  lng: number;
  address?: string;
}

const TripTracker: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    newStatus: '',
    updateMessage: '',
    receiptFile: null as File | null,
    itemsCost: ''
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // حالات الرحلة وترجمتها
  const statusLabels = {
    'ACCEPTED': 'تم قبول العرض',
    'HEADING_TO_PICKUP': 'في الطريق للشراء',
    'AT_PICKUP_LOCATION': 'وصل لموقع الشراء',
    'SHOPPING': 'يقوم بالشراء',
    'RECEIPT_UPLOADED': 'تم رفع الفاتورة',
    'PAYMENT_CONFIRMED': 'تم تأكيد الدفع',
    'HEADING_TO_DELIVERY': 'في الطريق للتوصيل',
    'AT_DELIVERY_LOCATION': 'وصل لموقع التوصيل',
    'DELIVERED': 'تم التسليم',
    'CUSTOMER_CONFIRMED': 'أكد العميل الاستلام',
    'COMPLETED': 'اكتملت الرحلة'
  };

  useEffect(() => {
    fetchTripData();
    initializeSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [tripId]);

  useEffect(() => {
    if (tripData) {
      initializeMap();
    }
  }, [tripData]);

  const fetchTripData = async () => {
    try {
      const response = await fetch(`/api/delivery/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setTripData(result.data);
      } else {
        toast.error(result.message || 'خطأ في جلب بيانات الرحلة');
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io('/', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to delivery tracking');
      if (tripId) {
        newSocket.emit('join_trip', tripId);
      }
    });

    newSocket.on('trip_status_update', (update) => {
      setTripData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          tripStatus: update.newStatus,
          currentLocation: update.currentLocation || prevData.currentLocation,
          receiptDetails: update.receiptDetails || prevData.receiptDetails,
          itemsCost: update.itemsCost || prevData.itemsCost,
          totalTripCost: update.totalTripCost || prevData.totalTripCost
        };
      });
      
      updateMapMarkers();
      toast.success(`تحديث الحالة: ${statusLabels[update.newStatus] || update.newStatus}`);
    });

    newSocket.on('location_update', (locationData) => {
      setCurrentLocation(locationData);
      updateDeliveryLocation(locationData);
    });

    setSocket(newSocket);
  };

  const initializeMap = () => {
    if (!mapRef.current || !tripData) return;

    // هنا يمكن استخدام أي مكتبة خرائط مثل Leaflet أو Google Maps
    // مثال باستخدام Leaflet
    if (window.L && !mapInstance.current) {
      const map = window.L.map(mapRef.current).setView([
        tripData.deliveryLocation.lat,
        tripData.deliveryLocation.lng
      ], 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // إضافة markers
      updateMapMarkers(map);
      mapInstance.current = map;
    }
  };

  const updateMapMarkers = (map = mapInstance.current) => {
    if (!map || !tripData) return;

    // مسح العلامات السابقة
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    // إضافة علامة موقع الشراء
    if (tripData.pickupLocation) {
      const pickupIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="bg-blue-500 text-white p-2 rounded-full"><i class="fas fa-store"></i></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      window.L.marker([tripData.pickupLocation.lat, tripData.pickupLocation.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`موقع الشراء<br>${tripData.pickupLocation.address}`);
    }

    // إضافة علامة موقع التوصيل
    const deliveryIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="bg-green-500 text-white p-2 rounded-full"><i class="fas fa-home"></i></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    window.L.marker([tripData.deliveryLocation.lat, tripData.deliveryLocation.lng], { icon: deliveryIcon })
      .addTo(map)
      .bindPopup(`موقع التوصيل<br>${tripData.deliveryLocation.address}`);

    // إضافة علامة موقع المندوب الحالي
    if (currentLocation) {
      const driverIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="bg-red-500 text-white p-2 rounded-full animate-pulse"><i class="fas fa-motorcycle"></i></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      window.L.marker([currentLocation.lat, currentLocation.lng], { icon: driverIcon })
        .addTo(map)
        .bindPopup(`المندوب الآن<br>${currentLocation.address || 'موقع حالي'}`);
    }
  };

  const updateDeliveryLocation = (location: LocationUpdate) => {
    if (mapInstance.current) {
      mapInstance.current.setView([location.lat, location.lng], 15);
      updateMapMarkers();
    }
  };

  const handleStatusUpdate = async () => {
    if (!tripData || !statusUpdateForm.newStatus) {
      toast.error('يرجى اختيار حالة جديدة');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('newStatus', statusUpdateForm.newStatus);
      if (statusUpdateForm.updateMessage) {
        formData.append('updateMessage', statusUpdateForm.updateMessage);
      }
      if (statusUpdateForm.receiptFile) {
        formData.append('receiptImage', statusUpdateForm.receiptFile);
      }
      if (statusUpdateForm.itemsCost) {
        formData.append('itemsCost', statusUpdateForm.itemsCost);
      }
      if (currentLocation) {
        formData.append('currentLocation', JSON.stringify(currentLocation));
      }

      const response = await fetch(`/api/delivery/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم تحديث حالة الرحلة');
        setStatusUpdateForm({
          newStatus: '',
          updateMessage: '',
          receiptFile: null,
          itemsCost: ''
        });
      } else {
        toast.error(result.message || 'خطأ في تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // إرسال الموقع عبر Socket
          if (socket) {
            socket.emit('location_update', {
              tripId: tripId,
              location: location
            });
          }
        },
        (error) => {
          toast.error('تعذر الحصول على موقعك الحالي');
        }
      );
    }
  };

  const getNextStatus = (currentStatus: string): string[] => {
    const statusFlow = {
      'ACCEPTED': ['HEADING_TO_PICKUP'],
      'HEADING_TO_PICKUP': ['AT_PICKUP_LOCATION'],
      'AT_PICKUP_LOCATION': ['SHOPPING'],
      'SHOPPING': ['RECEIPT_UPLOADED'],
      'RECEIPT_UPLOADED': ['HEADING_TO_DELIVERY'],
      'HEADING_TO_DELIVERY': ['AT_DELIVERY_LOCATION'],
      'AT_DELIVERY_LOCATION': ['DELIVERED'],
      'DELIVERED': ['COMPLETED'],
      'PAYMENT_CONFIRMED': ['HEADING_TO_DELIVERY']
    };

    return statusFlow[currentStatus] || [];
  };

  const renderStatusTimeline = () => {
    if (!tripData) return null;

    const allStatuses = [
      'ACCEPTED',
      'HEADING_TO_PICKUP', 
      'AT_PICKUP_LOCATION',
      'SHOPPING',
      'RECEIPT_UPLOADED',
      'HEADING_TO_DELIVERY',
      'AT_DELIVERY_LOCATION',
      'DELIVERED',
      'COMPLETED'
    ];

    const currentStatusIndex = allStatuses.indexOf(tripData.tripStatus);

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">حالة الرحلة</h3>
        <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto">
          {allStatuses.map((status, index) => (
            <div key={status} className="flex items-center flex-shrink-0">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStatusIndex 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index <= currentStatusIndex ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="mr-2 text-center">
                <p className={`text-xs font-medium ${
                  index <= currentStatusIndex ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {statusLabels[status]}
                </p>
              </div>
              {index < allStatuses.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <XCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على الرحلة</h2>
        <p className="text-gray-500">تأكد من رقم الرحلة وحاول مرة أخرى</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">تتبع رحلة التوصيل</h1>
        <p className="text-gray-600">{tripData.deliveryRequest.requestTitle}</p>
      </div>

      {/* Timeline الحالة */}
      {renderStatusTimeline()}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* الخريطة */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">الخريطة التفاعلية</h3>
              <button
                onClick={handleCurrentLocation}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                تحديث موقعي
              </button>
            </div>
          </div>
          <div ref={mapRef} className="h-96 w-full" />
        </div>

        {/* تفاصيل الرحلة */}
        <div className="space-y-6">
          {/* معلومات الأطراف */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">معلومات الأطراف</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <TruckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{tripData.deliveryUser.name}</p>
                    <p className="text-sm text-gray-500">مندوب التوصيل</p>
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <MapPinIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{tripData.customer.name}</p>
                    <p className="text-sm text-gray-500">العميل</p>
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل الطلب */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">تفاصيل الطلب</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">الأشياء المطلوبة:</p>
                <div className="flex flex-wrap gap-2">
                  {tripData.deliveryRequest.items.map((item, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                      {item.name} {item.quantity && `(${item.quantity})`}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span>مصاريف التوصيل:</span>
                  <span className="font-medium">{tripData.deliveryFee} جنيه</span>
                </div>
                {tripData.itemsCost && (
                  <div className="flex justify-between text-sm">
                    <span>تكلفة البضاعة:</span>
                    <span className="font-medium">{tripData.itemsCost} جنيه</span>
                  </div>
                )}
                {tripData.totalTripCost && (
                  <div className="flex justify-between text-sm font-semibold border-t mt-2 pt-2">
                    <span>إجمالي التكلفة:</span>
                    <span>{tripData.totalTripCost} جنيه</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* تحديث الحالة (للمندوب فقط) */}
          {tripData.deliveryUserId === parseInt(localStorage.getItem('userId') || '0') && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">تحديث حالة الرحلة</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة الجديدة
                  </label>
                  <select
                    value={statusUpdateForm.newStatus}
                    onChange={(e) => setStatusUpdateForm({...statusUpdateForm, newStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الحالة</option>
                    {getNextStatus(tripData.tripStatus).map(status => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>

                {statusUpdateForm.newStatus === 'RECEIPT_UPLOADED' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        صورة الفاتورة
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setStatusUpdateForm({
                          ...statusUpdateForm, 
                          receiptFile: e.target.files?.[0] || null
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تكلفة البضاعة (جنيه)
                      </label>
                      <input
                        type="number"
                        value={statusUpdateForm.itemsCost}
                        onChange={(e) => setStatusUpdateForm({
                          ...statusUpdateForm, 
                          itemsCost: e.target.value
                        })}
                        placeholder="150"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رسالة إضافية (اختياري)
                  </label>
                  <textarea
                    value={statusUpdateForm.updateMessage}
                    onChange={(e) => setStatusUpdateForm({...statusUpdateForm, updateMessage: e.target.value})}
                    placeholder="أي ملاحظات أو تحديثات إضافية..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تحديث الحالة
                </button>
              </div>
            </div>
          )}

          {/* عرض الفاتورة */}
          {tripData.receiptDetails && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">فاتورة الشراء</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>تكلفة البضاعة:</span>
                  <span className="font-medium">{tripData.receiptDetails.totalAmount} جنيه</span>
                </div>
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  <PhotoIcon className="w-5 h-5 ml-2" />
                  عرض الفاتورة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal عرض الفاتورة */}
      {showReceiptModal && tripData.receiptDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">فاتورة الشراء</h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center">
                <img
                  src={tripData.receiptDetails.imageUrl}
                  alt="فاتورة الشراء"
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                />
                <p className="text-sm text-gray-500 mt-3">
                  المبلغ الإجمالي: {tripData.receiptDetails.totalAmount} جنيه
                </p>
                <p className="text-xs text-gray-400">
                  تم الرفع: {new Date(tripData.receiptDetails.uploadedAt).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripTracker;
