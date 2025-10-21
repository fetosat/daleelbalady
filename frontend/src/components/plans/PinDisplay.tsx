import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Shield
} from 'lucide-react';
import { UserPlan, PinInfo, PlanService } from '@/services/planService';
import { toast } from 'sonner';

interface PinDisplayProps {
  plan: UserPlan;
}

const PinDisplay: React.FC<PinDisplayProps> = ({ plan }) => {
  const [pinInfo, setPinInfo] = useState<PinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullPin, setShowFullPin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPinInfo();
  }, []);

  const loadPinInfo = async () => {
    setLoading(true);
    try {
      const info = await PlanService.getPinInfo();
      setPinInfo(info);
    } catch (error) {
      console.error('Error loading PIN info:', error);
      toast.error('فشل في تحميل معلومات PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPin = async () => {
    if (!pinInfo) return;

    try {
      await navigator.clipboard.writeText(pinInfo.maskedPin);
      toast.success('تم نسخ رقم PIN');
    } catch (error) {
      toast.error('فشل في نسخ رقم PIN');
    }
  };

  const handleRefreshPin = async () => {
    setRefreshing(true);
    try {
      // Note: PIN refresh is typically done monthly by admin
      // This is just for demonstration
      await loadPinInfo();
      toast.success('تم تحديث معلومات PIN');
    } catch (error) {
      toast.error('فشل في تحديث PIN');
    } finally {
      setRefreshing(false);
    }
  };

  const formatPinForDisplay = (maskedPin: string, showFull: boolean) => {
    if (showFull) {
      // In a real app, you'd need to get the full PIN through secure means
      return maskedPin; // For demo purposes
    }
    return maskedPin;
  };

  const getPinStatusColor = (isExpired: boolean) => {
    return isExpired ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200';
  };

  const getPinStatusIcon = (isExpired: boolean) => {
    return isExpired ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-stone-200 rounded w-1/4"></div>
            <div className="h-12 bg-stone-200 rounded"></div>
            <div className="h-4 bg-stone-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pinInfo) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          لم يتم العثور على معلومات PIN
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* PIN Display Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            رقم PIN الشهري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* PIN Number */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-inner"
              >
                <div className="text-center">
                  <p className="text-sm text-stone-600 mb-2">رقم PIN الحالي</p>
                  <div className="font-mono text-4xl font-bold text-stone-900 tracking-wider">
                    {formatPinForDisplay(pinInfo.maskedPin, showFullPin)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullPin(!showFullPin)}
                      className="text-stone-600 hover:text-stone-900"
                    >
                      {showFullPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showFullPin ? 'إخفاء' : 'عرض'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPin}
                      className="text-stone-600 hover:text-stone-900"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshPin}
                      disabled={refreshing}
                      className="text-stone-600 hover:text-stone-900"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                      تحديث
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* PIN Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getPinStatusColor(pinInfo.isPinExpired)}`}>
                <div className="flex items-center gap-2">
                  {getPinStatusIcon(pinInfo.isPinExpired)}
                  <span className="font-medium">
                    {pinInfo.isPinExpired ? 'منتهي الصلاحية' : 'نشط'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    الشهر الحالي: {pinInfo.currentMonthYear}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-700">
                    ينتهي: {new Date(pinInfo.pinExpiresAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            {plan.pinUsageCount !== undefined && (
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600">عدد مرات الاستخدام هذا الشهر</p>
                    <p className="text-2xl font-bold text-stone-900">{plan.pinUsageCount}</p>
                  </div>
                  <Shield className="h-8 w-8 text-stone-400" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>كيفية استخدام PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">عند طلب الخدمة</h4>
                <p className="text-sm text-stone-600">
                  أخبر مقدم الخدمة أن لديك رقم PIN للحصول على خصم
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">شارك رقم PIN</h4>
                <p className="text-sm text-stone-600">
                  أعطِ مقدم الخدمة رقم PIN الخاص بك للتحقق
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">احصل على الخصم</h4>
                <p className="text-sm text-stone-600">
                  سيتم تطبيق الخصم المناسب على الفاتورة النهائية
                </p>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>هام:</strong> لا تشارك رقم PIN مع أشخاص غير مخولين. 
              يتم تجديد رقم PIN تلقائياً في بداية كل شهر.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinDisplay;
