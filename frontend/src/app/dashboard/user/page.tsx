'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Shield,
  Tag,
  Users,
  TrendingUp,
  Clock,
  Gift,
  Crown,
  Sparkles,
  ChevronRight,
  Calendar,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

// Mock data - In production, this would come from API calls
const mockStats = {
  totalSavings: 2450,
  pinUsageCount: 8,
  activeOffers: 24,
  familyMembers: 3
};

const mockRecentOffers = [
  {
    id: '1',
    title: 'خصم 25% على جميع الوجبات',
    provider: 'مطعم الأصالة',
    discount: '25%',
    endDate: '2024-02-15',
    featured: true
  },
  {
    id: '2', 
    title: 'اشتري 2 واحصل على 1 مجاناً',
    provider: 'صيدلية النور',
    discount: 'BOGO',
    endDate: '2024-02-20',
    featured: false
  },
  {
    id: '3',
    title: 'خصم 150 جنيه على الفواتير',
    provider: 'محطة وقود شل',
    discount: '150 جنيه',
    endDate: '2024-02-10',
    featured: true
  }
];

const mockPinInfo = {
  code: '246813',
  isActive: true,
  expiresAt: '2024-02-29',
  usagesThisMonth: 8,
  maxUsagesPerMonth: 15
};

const mockPlan = {
  type: 'عائلية',
  discountPercentage: 15,
  familyMembers: 3,
  maxFamilyMembers: 5
};

const UserDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (dateString: string) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-900">لوحة التحكم</h1>
              <p className="text-stone-600">نظرة عامة على حسابك وخصوماتك</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الوفورات</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(mockStats.totalSavings)}
              </div>
              <p className="text-xs text-muted-foreground">
                هذا الشهر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">استخدامات PIN</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.pinUsageCount} / {mockPinInfo.maxUsagesPerMonth}
              </div>
              <p className="text-xs text-muted-foreground">
                الاستخدامات المتاحة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العروض النشطة</CardTitle>
              <Tag className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.activeOffers}
              </div>
              <p className="text-xs text-muted-foreground">
                عرض متاح
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أفراد العائلة</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.familyMembers} / {mockPlan.maxFamilyMembers}
              </div>
              <p className="text-xs text-muted-foreground">
                أعضاء نشطون
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PIN Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  رقم PIN الشهري
                  {mockPinInfo.isActive && (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      نشط
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-blue-600 mb-2 tracking-widest">
                    {mockPinInfo.code}
                  </div>
                  <p className="text-sm text-stone-600">
                    ينتهي في {formatDate(mockPinInfo.expiresAt)} ({getDaysUntilExpiry(mockPinInfo.expiresAt)} يوم متبقي)
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-stone-600">الاستخدامات هذا الشهر:</span>
                    <span className="font-medium">{mockPinInfo.usagesThisMonth} / {mockPinInfo.maxUsagesPerMonth}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(mockPinInfo.usagesThisMonth / mockPinInfo.maxUsagesPerMonth) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href="/subscription-plans">
                      <Shield className="h-4 w-4 ml-2" />
                      عرض التفاصيل
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/verify-pin">
                      التحقق من PIN
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Offers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  أحدث العروض
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/offers" className="flex items-center gap-1">
                    عرض الكل
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRecentOffers.map((offer, index) => (
                  <div 
                    key={offer.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      offer.featured ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-stone-900 mb-1 flex items-center gap-2">
                          {offer.title}
                          {offer.featured && <Crown className="h-4 w-4 text-yellow-500" />}
                        </h4>
                        <p className="text-sm text-stone-600">{offer.provider}</p>
                      </div>
                      <Badge variant={offer.featured ? 'default' : 'secondary'}>
                        {offer.discount}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        ينتهي {formatDate(offer.endDate)}
                      </span>
                      <Button size="sm" variant="outline">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Plan Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  خطتك الحالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2 text-lg px-4 py-2">
                    {mockPlan.type}
                  </Badge>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {mockPlan.discountPercentage}% خصم
                  </div>
                  <p className="text-sm text-stone-600">على جميع العروض</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>أفراد العائلة:</span>
                    <span>{mockPlan.familyMembers} / {mockPlan.maxFamilyMembers}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(mockPlan.familyMembers / mockPlan.maxFamilyMembers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href="/subscription-plans">
                    <CreditCard className="h-4 w-4 ml-2" />
                    إدارة الخطة
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/family-invite/new">
                    <Users className="h-4 w-4 ml-2" />
                    دعوة عضو عائلة
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/offers?featured=true">
                    <Crown className="h-4 w-4 ml-2" />
                    العروض المميزة
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/pin-history">
                    <Clock className="h-4 w-4 ml-2" />
                    تاريخ الاستخدام
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                <strong>نصيحة:</strong> استخدم رقم PIN الخاص بك في أي من المتاجر المشاركة للحصول على خصم فوري!
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
