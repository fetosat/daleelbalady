import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Receipt, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { PinService } from '@/services/pinService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Use the PinUsageHistory type from the service
type PinUsage = {
  id: string;
  verificationCode: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountPercent: number;
  currency: string;
  verificationLocation?: string;
  customerName?: string;
  receiptNumber?: string;
  verifiedAt: string;
  status: string;
  monthYear: string;
  service?: {
    id: string;
    embeddingText: string;
  };
  product?: {
    id: string;
    name: string;
  };
  shop?: {
    id: string;
    name: string;
  };
  offer?: {
    id: string;
    title: string;
    level: string;
  };
  // Additional fields for UI compatibility
  providerName?: string;
  providerLocation?: string;
  usedAt?: string;
  failureReason?: string;
};

interface PinUsageHistoryProps {
  userId?: string;
  className?: string;
}

const PinUsageHistory: React.FC<PinUsageHistoryProps> = ({ 
  userId, 
  className = "" 
}) => {
  const [history, setHistory] = useState<PinUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsage, setSelectedUsage] = useState<PinUsage | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await PinService.getPinUsageHistory();
      // response is already an array of PinUsageHistory
      setHistory(response || []);
    } catch (error) {
      console.error('فشل في جلب تاريخ الاستخدام:', error);
      setHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'نجح';
      case 'FAILED':
        return 'فشل';
      default:
        return 'غير معروف';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy - HH:mm', { locale: ar });
  };

  // Helper function to get provider name from usage data
  const getProviderName = (usage: PinUsage) => {
    return usage.providerName || usage.shop?.name || usage.offer?.title || 'غير محدد';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تاريخ استخدام PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-stone-400" />
            <span className="ml-2 text-stone-500">جاري التحميل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تاريخ استخدام PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-stone-500">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-stone-300" />
            <p>لم يتم استخدام PIN حتى الآن</p>
            <p className="text-sm mt-1">سيظهر هنا تاريخ استخداماتك عند البدء</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تاريخ استخدام PIN ({history.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHistory}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {history.map((usage, index) => (
                <div key={usage.id}>
                  <div 
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedUsage(usage);
                      setShowDetails(true);
                    }}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(usage.status)}
                        <span className="font-medium">{getProviderName(usage)}</span>
                        <Badge variant={usage.status === 'SUCCESS' ? 'default' : 'destructive'}>
                          {getStatusText(usage.status)}
                        </Badge>
                      </div>

                      <div className="text-sm text-stone-600">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(usage.verifiedAt || usage.usedAt || '')}
                        </div>
                        {(usage.verificationLocation || usage.providerLocation) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {usage.verificationLocation || usage.providerLocation}
                          </div>
                        )}
                      </div>

                      {usage.status === 'FAILED' && usage.failureReason && (
                        <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                          {usage.failureReason}
                        </div>
                      )}
                    </div>

                    <div className="text-left space-y-1">
                      {usage.status === 'SUCCESS' && (
                        <>
                          <div className="text-sm line-through text-stone-400">
                            {formatCurrency(usage.originalAmount)}
                          </div>
                          <div className="text-green-600 font-medium">
                            {formatCurrency(usage.finalAmount)}
                          </div>
                          <div className="text-xs text-green-600">
                            وفرت {formatCurrency(usage.discountAmount)}
                          </div>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {index < history.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Usage Details Dialog */}
      {showDetails && selectedUsage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetails(false)}>
          <div 
            className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">تفاصيل الاستخدام</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedUsage.status)}
                <span className="font-medium text-lg">{getProviderName(selectedUsage)}</span>
                <Badge variant={selectedUsage.status === 'SUCCESS' ? 'default' : 'destructive'}>
                  {getStatusText(selectedUsage.status)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-stone-600">التاريخ والوقت</label>
                  <p className="text-sm">{formatDate(selectedUsage.verifiedAt || selectedUsage.usedAt || '')}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-600">رمز التحقق</label>
                  <p className="text-sm font-mono">{selectedUsage.verificationCode}</p>
                </div>

                {(selectedUsage.verificationLocation || selectedUsage.providerLocation) && (
                  <div>
                    <label className="text-sm font-medium text-stone-600">الموقع</label>
                    <p className="text-sm">{selectedUsage.verificationLocation || selectedUsage.providerLocation}</p>
                  </div>
                )}

                {selectedUsage.status === 'SUCCESS' && (
                  <div className="bg-green-50 p-3 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-stone-600">المبلغ الأصلي</label>
                        <p>{formatCurrency(selectedUsage.originalAmount)}</p>
                      </div>
                      <div>
                        <label className="font-medium text-stone-600">الخصم</label>
                        <p className="text-green-600">-{formatCurrency(selectedUsage.discountAmount)}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="font-medium text-stone-600">المبلغ النهائي</label>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(selectedUsage.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUsage.status === 'FAILED' && selectedUsage.failureReason && (
                  <div className="bg-red-50 p-3 rounded">
                    <label className="text-sm font-medium text-stone-600">سبب الفشل</label>
                    <p className="text-sm text-red-600 mt-1">{selectedUsage.failureReason}</p>
                  </div>
                )}

                {selectedUsage.service && (
                  <div>
                    <label className="text-sm font-medium text-stone-600">الخدمة</label>
                    <p className="text-sm">{selectedUsage.service.embeddingText}</p>
                  </div>
                )}

                {selectedUsage.product && (
                  <div>
                    <label className="text-sm font-medium text-stone-600">المنتج</label>
                    <p className="text-sm">{selectedUsage.product.name}</p>
                  </div>
                )}

                {selectedUsage.shop && (
                  <div>
                    <label className="text-sm font-medium text-stone-600">المتجر</label>
                    <p className="text-sm">{selectedUsage.shop.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PinUsageHistory;
