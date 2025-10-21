import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { 
  CreditCard,
  Calendar,
  Download,
  Receipt,
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Crown,
  Shield,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiFetch } from '@/utils/apiClient';
import api from '@/lib/api';
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '@/api/payments';

interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentMethod: string;
  planName: string;
  planNameAr: string;
  planType: 'PROVIDER' | 'USER';
  date: string;
  period: string;
  description?: string;
  receipt?: string;
}

interface Subscription {
  id: string;
  planType: 'PROVIDER' | 'USER';
  planName: string;
  planNameAr: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number;
  currency: string;
  nextPaymentDate?: string;
  features: string[];
  featuresAr: string[];
}

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'WALLET' | 'BANK_TRANSFER';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  walletProvider?: string;
  isDefault: boolean;
}

const PaymentHistory = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState('history');
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Mock data - replace with actual API calls
  const mockPaymentHistory: PaymentRecord[] = [
    {
      id: '1',
      transactionId: 'TXN_20240119_001',
      amount: 2000,
      currency: 'EGP',
      status: 'SUCCESS',
      paymentMethod: 'Visa **** 1234',
      planName: 'Products Package (Premium)',
      planNameAr: 'باقة المنتجات (المتميزة)',
      planType: 'PROVIDER',
      date: '2024-01-19',
      period: '12 months',
      description: 'Annual subscription payment'
    },
    {
      id: '2',
      transactionId: 'TXN_20231219_002',
      amount: 120,
      currency: 'EGP',
      status: 'SUCCESS',
      paymentMethod: 'Vodafone Cash',
      planName: 'Medical Directory Card',
      planNameAr: 'بطاقة الدليل الطبي',
      planType: 'USER',
      date: '2023-12-19',
      period: '12 months',
      description: 'Digital discount card renewal'
    },
    {
      id: '3',
      transactionId: 'TXN_20231115_003',
      amount: 1000,
      currency: 'EGP',
      status: 'FAILED',
      paymentMethod: 'MasterCard **** 5678',
      planName: 'Booking Package (Basic Plus)',
      planNameAr: 'باقة الحجز (الأساسية المحسنة)',
      planType: 'PROVIDER',
      date: '2023-11-15',
      period: '12 months',
      description: 'Card declined by bank'
    }
  ];

  const mockSubscriptions: Subscription[] = [
    {
      id: 'sub_1',
      planType: 'PROVIDER',
      planName: 'Products Package (Premium)',
      planNameAr: 'باقة المنتجات (المتميزة)',
      status: 'ACTIVE',
      startDate: '2024-01-19',
      endDate: '2025-01-19',
      autoRenew: true,
      amount: 2000,
      currency: 'EGP',
      nextPaymentDate: '2025-01-19',
      features: [
        'All features of the Booking Package',
        'Add products to your page',
        'Delivery Service',
        'Commission charged per delivery'
      ],
      featuresAr: [
        'جميع ميزات باقة الحجز',
        'إضافة منتجات لصفحتك',
        'خدمة التوصيل',
        'عمولة على كل عملية توصيل'
      ]
    },
    {
      id: 'sub_2',
      planType: 'USER',
      planName: 'Medical Directory Card',
      planNameAr: 'بطاقة الدليل الطبي',
      status: 'ACTIVE',
      startDate: '2023-12-19',
      endDate: '2024-12-19',
      autoRenew: false,
      amount: 120,
      currency: 'EGP',
      features: [
        'Access discounts from medical providers',
        'Up to 5 family members',
        'Digital card with QR code'
      ],
      featuresAr: [
        'خصومات من مقدمي الخدمات الطبية',
        'حتى 5 أفراد من العائلة',
        'بطاقة رقمية مع رمز QR'
      ]
    }
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'CARD',
      last4: '1234',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2026,
      holderName: 'John Doe',
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'WALLET',
      walletProvider: 'Vodafone Cash',
      isDefault: false
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when filters change (for payment history)
  useEffect(() => {
    if (activeTab === 'history') {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 500); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch payment history from API
      try {
        const paymentsResponse = await api.get('/payments/history', {
          params: {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchTerm || undefined,
            page: 1,
            limit: 50
          }
        });
        
        if (paymentsResponse.data && paymentsResponse.data.payments) {
          setPaymentHistory(paymentsResponse.data.payments);
        } else {
          // If no payments found or error, use empty array
          setPaymentHistory([]);
        }
      } catch (paymentError) {
        console.error('Failed to fetch payment history:', paymentError);
        // Use mock data as fallback
        setPaymentHistory(mockPaymentHistory);
      }

      // Fetch subscriptions from API
      try {
        const subscriptionsResponse = await api.get('/subscriptions');
        
        if (subscriptionsResponse.data && Array.isArray(subscriptionsResponse.data)) {
          setSubscriptions(subscriptionsResponse.data);
        } else {
          setSubscriptions([]);
        }
      } catch (subError) {
        console.error('Failed to fetch subscriptions:', subError);
        // Use mock data as fallback
        setSubscriptions(mockSubscriptions);
      }

      // Fetch payment methods from API
      try {
        const methodsResponse = await api.get('/payments/methods');
        
        if (methodsResponse.data && Array.isArray(methodsResponse.data)) {
          setPaymentMethods(methodsResponse.data);
        } else {
          setPaymentMethods([]);
        }
      } catch (methodError) {
        console.error('Failed to fetch payment methods:', methodError);
        // Use mock data as fallback
        setPaymentMethods(mockPaymentMethods);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Fallback to mock data on general error
      setPaymentHistory(mockPaymentHistory);
      setSubscriptions(mockSubscriptions);
      setPaymentMethods(mockPaymentMethods);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REFUNDED': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'EXPIRED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-stone-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      SUCCESS: isRTL ? 'نجح' : 'Success',
      FAILED: isRTL ? 'فشل' : 'Failed',
      PENDING: isRTL ? 'قيد الانتظار' : 'Pending',
      REFUNDED: isRTL ? 'مُسترد' : 'Refunded',
      ACTIVE: isRTL ? 'نشط' : 'Active',
      EXPIRED: isRTL ? 'منتهي الصلاحية' : 'Expired',
      CANCELLED: isRTL ? 'مُلغي' : 'Cancelled'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredPaymentHistory = paymentHistory.filter(payment => {
    const matchesSearch = payment.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await apiFetch(`/payments/receipt/${paymentId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (window.confirm(isRTL ? 'هل تريد إلغاء هذا الاشتراك؟' : 'Are you sure you want to cancel this subscription?')) {
      try {
        const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, {
          immediate: false // Cancel at end of period, not immediately
        });
        
        if (response.data.success) {
          alert(isRTL 
            ? 'تم إلغاء الاشتراك بنجاح' 
            : 'Subscription cancelled successfully');
          fetchData();
        }
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
        alert(isRTL 
          ? 'فشل في إلغاء الاشتراك' 
          : 'Failed to cancel subscription');
      }
    }
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    const planId = subscription.planType === 'PROVIDER' ? 'PRODUCTS_PREMIUM' : 'MEDICAL_CARD';
    navigate(`/payment-checkout?planId=${planId}`);
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (window.confirm(isRTL ? 'هل تريد حذف طريقة الدفع هذه؟' : 'Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(methodId);
        alert(isRTL ? 'تم حذف طريقة الدفع بنجاح' : 'Payment method deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Failed to delete payment method:', error);
        alert(isRTL ? 'فشل في حذف طريقة الدفع' : 'Failed to delete payment method');
      }
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      await updatePaymentMethod(methodId, { isDefault: true });
      alert(isRTL ? 'تم تعيين طريقة الدفع الافتراضية' : 'Default payment method set');
      fetchData();
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      alert(isRTL ? 'فشل في تعيين طريقة الدفع الافتراضية' : 'Failed to set default payment method');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-background-tertiary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {isRTL ? 'رجوع' : 'Back'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {isRTL ? 'المدفوعات والاشتراكات' : 'Payments & Subscriptions'}
                </h1>
                <p className="text-text-secondary">
                  {isRTL ? 'إدارة مدفوعاتك وتاريخ الاشتراكات' : 'Manage your payments and subscription history'}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/subscription-plans')}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'اشتراك جديد' : 'New Subscription'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {isRTL ? 'تاريخ المدفوعات' : 'Payment History'}
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {isRTL ? 'الاشتراكات' : 'Subscriptions'}
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {isRTL ? 'طرق الدفع' : 'Payment Methods'}
            </TabsTrigger>
          </TabsList>

          {/* Payment History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-blue-600" />
                  {isRTL ? 'البحث والتصفية' : 'Search & Filter'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{isRTL ? 'بحث' : 'Search'}</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-secondary" />
                      <Input
                        placeholder={isRTL ? 'البحث في المدفوعات...' : 'Search payments...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{isRTL ? 'الحالة' : 'Status'}</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
                        <SelectItem value="SUCCESS">{isRTL ? 'نجح' : 'Success'}</SelectItem>
                        <SelectItem value="FAILED">{isRTL ? 'فشل' : 'Failed'}</SelectItem>
                        <SelectItem value="PENDING">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? 'الفترة الزمنية' : 'Date Range'}</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'جميع التواريخ' : 'All Time'}</SelectItem>
                        <SelectItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
                        <SelectItem value="quarter">{isRTL ? 'آخر 3 أشهر' : 'Last 3 Months'}</SelectItem>
                        <SelectItem value="year">{isRTL ? 'هذا العام' : 'This Year'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {isRTL ? 'تاريخ المدفوعات' : 'Payment History'}
                  </span>
                  <Badge variant="secondary">
                    {filteredPaymentHistory.length} {isRTL ? 'معاملة' : 'transactions'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPaymentHistory.map((payment) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {getStatusIcon(payment.status)}
                        <div>
                          <h3 className="font-semibold">
                            {isRTL ? payment.planNameAr : payment.planName}
                          </h3>
                          <div className="text-sm text-text-secondary space-y-1">
                            <p>{isRTL ? 'رقم المعاملة:' : 'Transaction ID:'} {payment.transactionId}</p>
                            <p>{isRTL ? 'طريقة الدفع:' : 'Payment Method:'} {payment.paymentMethod}</p>
                            <p>{isRTL ? 'التاريخ:' : 'Date:'} {new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {payment.amount.toLocaleString()} {payment.currency}
                          </p>
                          <Badge className={
                            payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {getStatusLabel(payment.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>{isRTL ? 'تفاصيل المعاملة' : 'Transaction Details'}</DialogTitle>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-text-secondary">{isRTL ? 'رقم المعاملة' : 'Transaction ID'}</Label>
                                      <p className="font-mono text-sm">{selectedPayment.transactionId}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-text-secondary">{isRTL ? 'المبلغ' : 'Amount'}</Label>
                                      <p className="font-semibold">{selectedPayment.amount.toLocaleString()} {selectedPayment.currency}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-text-secondary">{isRTL ? 'الباقة' : 'Plan'}</Label>
                                      <p>{isRTL ? selectedPayment.planNameAr : selectedPayment.planName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-text-secondary">{isRTL ? 'الحالة' : 'Status'}</Label>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedPayment.status)}
                                        <span>{getStatusLabel(selectedPayment.status)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedPayment.description && (
                                    <div>
                                      <Label className="text-xs text-text-secondary">{isRTL ? 'الوصف' : 'Description'}</Label>
                                      <p className="text-sm">{selectedPayment.description}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {payment.status === 'SUCCESS' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredPaymentHistory.length === 0 && (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto text-text-secondary mb-4" />
                      <p className="text-text-secondary">
                        {isRTL ? 'لا توجد معاملات مطابقة للبحث' : 'No transactions match your search'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subscriptions.map((subscription) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          <div>
                            <CardTitle className="text-lg">
                              {isRTL ? subscription.planNameAr : subscription.planName}
                            </CardTitle>
                            <p className="text-text-secondary">
                              {subscription.planType === 'PROVIDER' 
                                ? (isRTL ? 'باقة مقدم خدمة' : 'Service Provider Plan')
                                : (isRTL ? 'باقة مستخدم' : 'User Plan')
                              }
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {getStatusLabel(subscription.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-text-secondary">{isRTL ? 'تاريخ البداية' : 'Start Date'}</Label>
                          <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-text-secondary">{isRTL ? 'تاريخ النهاية' : 'End Date'}</Label>
                          <p>{new Date(subscription.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-text-secondary">{isRTL ? 'السعر' : 'Price'}</Label>
                          <p className="font-semibold">{subscription.amount.toLocaleString()} {subscription.currency}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-text-secondary">{isRTL ? 'التجديد التلقائي' : 'Auto Renew'}</Label>
                          <p>{subscription.autoRenew ? (isRTL ? 'مفعل' : 'Enabled') : (isRTL ? 'معطل' : 'Disabled')}</p>
                        </div>
                      </div>

                      {subscription.nextPaymentDate && subscription.status === 'ACTIVE' && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-800">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">
                              {isRTL ? 'التجديد التالي:' : 'Next Renewal:'} {new Date(subscription.nextPaymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          {isRTL ? 'الميزات:' : 'Features:'}
                        </Label>
                        <ul className="space-y-2">
                          {(isRTL ? subscription.featuresAr : subscription.features).slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-text-secondary">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        {subscription.status === 'ACTIVE' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => navigate('/dashboard/subscription')}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              {isRTL ? 'إدارة' : 'Manage'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                          </>
                        )}
                        
                        {subscription.status === 'EXPIRED' && (
                          <Button 
                            className="w-full"
                            onClick={() => handleRenewSubscription(subscription)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {isRTL ? 'تجديد' : 'Renew'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {subscriptions.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Crown className="h-16 w-16 mx-auto text-text-secondary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'لا توجد اشتراكات نشطة' : 'No Active Subscriptions'}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {isRTL 
                      ? 'اشترك في إحدى باقاتنا للاستفادة من المزايا الحصرية'
                      : 'Subscribe to one of our plans to enjoy exclusive benefits'
                    }
                  </p>
                  <Button onClick={() => navigate('/subscription-plans')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isRTL ? 'تصفح الباقات' : 'Browse Plans'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {isRTL ? 'طرق الدفع المحفوظة' : 'Saved Payment Methods'}
              </h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                          <div>
                            {method.type === 'CARD' ? (
                              <>
                                <h3 className="font-semibold">{method.brand} **** {method.last4}</h3>
                                <p className="text-text-secondary text-sm">
                                  {isRTL ? 'تنتهي' : 'Expires'} {method.expiryMonth}/{method.expiryYear}
                                </p>
                                <p className="text-text-secondary text-xs">{method.holderName}</p>
                              </>
                            ) : (
                              <>
                                <h3 className="font-semibold">{method.walletProvider}</h3>
                                <p className="text-text-secondary text-sm">
                                  {isRTL ? 'محفظة إلكترونية' : 'Digital Wallet'}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {method.isDefault && (
                          <Badge className="bg-green-100 text-green-800">
                            {isRTL ? 'افتراضي' : 'Default'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          disabled={method.isDefault}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {isRTL ? 'تعيين كافتراضي' : 'Set Default'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isRTL ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto text-text-secondary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'لا توجد طرق دفع محفوظة' : 'No Saved Payment Methods'}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {isRTL 
                      ? 'أضف طريقة دفع لتسهيل المدفوعات المستقبلية'
                      : 'Add a payment method to make future payments easier'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentHistory;
