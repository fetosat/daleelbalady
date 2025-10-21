import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// استيراد مكونات الدليفري
import DeliveryRequestForm from '../components/delivery/DeliveryRequestForm';
import DeliveryDashboard from '../components/delivery/DeliveryDashboard';
import TripTracker from '../components/delivery/TripTracker';
import DeliveryConfirmation from '../components/delivery/DeliveryConfirmation';
import DeliveryRequestsList from '../components/delivery/DeliveryRequestsList';
import MyDeliveryTrips from '../components/delivery/MyDeliveryTrips';

const DeliveryRoutes: React.FC = () => {
  const { user } = useAuth();

  // حماية الصفحات حسب نوع المستخدم
  const ProtectedRoute: React.FC<{ 
    children: React.ReactNode;
    allowedRoles?: string[];
  }> = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/delivery" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      {/* الصفحة الرئيسية للدليفري */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DeliveryHome />
          </ProtectedRoute>
        } 
      />

      {/* صفحات العملاء */}
      <Route 
        path="/request/new" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DeliveryRequestForm />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/my-requests" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DeliveryRequestsList />
          </ProtectedRoute>
        } 
      />

      {/* صفحات مندوبي التوصيل */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['DELIVERY']}>
            <DeliveryDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute allowedRoles={['DELIVERY']}>
            <MyDeliveryTrips />
          </ProtectedRoute>
        } 
      />

      {/* صفحات مشتركة */}
      <Route 
        path="/track/:tripId" 
        element={
          <ProtectedRoute>
            <TripTracker />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/requests/:requestId" 
        element={
          <ProtectedRoute>
            <DeliveryRequestDetails />
          </ProtectedRoute>
        } 
      />

      {/* توجيه افتراضي */}
      <Route path="*" element={<Navigate to="/delivery" replace />} />
    </Routes>
  );
};

// الصفحة الرئيسية للدليفري
const DeliveryHome: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'DELIVERY') {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          خدمة التوصيل السريع 🚚
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          اطلب أي شيء من أي مكان وسيصلك في أسرع وقت
        </p>
        
        <div className="flex justify-center space-x-4 space-x-reverse">
          <Link
            to="/delivery/request/new"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            اطلب توصيل جديد
          </Link>
          
          <Link
            to="/delivery/my-requests"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            طلباتي السابقة
          </Link>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">15 دقيقة</div>
          <p className="text-gray-700">متوسط وقت التوصيل</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
          <p className="text-gray-700">عملية توصيل مكتملة</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
          <p className="text-gray-700">تقييم المستخدمين</p>
        </div>
      </div>

      {/* كيفية العمل */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">كيف يعمل التوصيل؟</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold mb-2">1. اطلب</h3>
            <p className="text-sm text-gray-600">حدد ما تريده ومن أين</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold mb-2">2. اختر العرض</h3>
            <p className="text-sm text-gray-600">قارن بين عروض المندوبين</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="font-semibold mb-2">3. تتبع</h3>
            <p className="text-sm text-gray-600">تابع رحلة التوصيل مباشرة</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-semibold mb-2">4. استلم</h3>
            <p className="text-sm text-gray-600">أكد الاستلام وقيم الخدمة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// صفحة تفاصيل الطلب
const DeliveryRequestDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails(requestId);
    }
  }, [requestId]);

  const fetchRequestDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/delivery/requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setRequest(result.data);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!request) {
    return <div className="text-center p-8">
      <p className="text-gray-500">لم يتم العثور على الطلب</p>
    </div>;
  }

  // عرض تفاصيل الطلب هنا
  return <div>تفاصيل الطلب</div>;
};

export default DeliveryRoutes;
