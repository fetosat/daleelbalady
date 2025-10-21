import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Crown, 
  Users, 
  Shield, 
  MessageCircle, 
  Percent, 
  Calendar,
  TrendingUp,
  Gift,
  Star,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { PlanService, UserPlan, PlanStats, CategoryService } from '@/services/planService';
import { PinVerificationService, PinUsageStats } from '@/services/pinService';
import { toast } from 'sonner';

// Components
import PinDisplay from '@/components/plans/PinDisplay';
import PlanUpgradeDialog from '@/components/plans/PlanUpgradeDialog';
import FamilyMembersCard from '@/components/plans/FamilyMembersCard';
import InviteFamilyDialog from '@/components/plans/InviteFamilyDialog';
import PinUsageHistory from '@/components/plans/PinUsageHistory';

const PlansPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [planStats, setPlanStats] = useState<PlanStats | null>(null);
  const [pinStats, setPinStats] = useState<PinUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadPlanData();
  }, []);

  const loadPlanData = async () => {
    setLoading(true);
    try {
      const [plan, stats] = await Promise.all([
        PlanService.getMyPlan(),
        PlanService.getPlanStats(),
      ]);
      
      setCurrentPlan(plan);
      setPlanStats(stats);

      // Load PIN stats if user has paid plan
      if (plan.planType !== 'FREE') {
        try {
          const pinStatsData = await PinVerificationService.getPinUsageStats();
          setPinStats(pinStatsData);
        } catch (error) {
          console.log('PIN stats not available');
        }
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
      toast.error('فشل في تحميل بيانات الخطة');
    } finally {
      setLoading(false);
    }
  };

  const getPlanTypeLabel = (planType: string) => {
    switch (planType) {
      case 'FREE':
        return 'مجانية';
      case 'SINGLE_CATEGORY':
        return 'فئة واحدة';
      case 'ALL_CATEGORIES':
        return 'شاملة';
      default:
        return planType;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'FREE':
        return 'bg-stone-100 text-stone-800';
      case 'SINGLE_CATEGORY':
        return 'bg-blue-100 text-blue-800';
      case 'ALL_CATEGORIES':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            لم يتم العثور على بيانات الخطة. سيتم إنشاء خطة مجانية تلقائياً.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">إدارة الخطة</h1>
            <p className="text-stone-600 mt-1">قم بإدارة خطتك ومزاياك والعائلة</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPlanColor(currentPlan.planType)}>
              {getPlanTypeLabel(currentPlan.planType)}
            </Badge>
            {currentPlan.planType === 'FREE' && (
              <Button onClick={() => setUpgradeDialogOpen(true)}>
                <Crown className="h-4 w-4 ml-2" />
                ترقية الخطة
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="pin">رقم PIN</TabsTrigger>
          <TabsTrigger value="family">العائلة</TabsTrigger>
          <TabsTrigger value="history">التاريخ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                خطتك الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {getPlanTypeLabel(currentPlan.planType)}
                  </h3>
                  {currentPlan.selectedCategory && (
                    <p className="text-sm text-stone-600 mb-2">
                      الفئة: {currentPlan.selectedCategory.name}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentPlan.pricePerMonth)}
                    {currentPlan.pricePerMonth > 0 && <span className="text-sm font-normal">/شهر</span>}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">المزايا المتاحة:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {currentPlan.includesChat ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-stone-400" />
                      )}
                      <span className={currentPlan.includesChat ? 'text-green-700' : 'text-stone-500'}>
                        الدردشة
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentPlan.includesDiscounts ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-stone-400" />
                      )}
                      <span className={currentPlan.includesDiscounts ? 'text-green-700' : 'text-stone-500'}>
                        الخصومات
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>
                        العائلة: {currentPlan.currentMembers}/{currentPlan.maxFamilyMembers + 1}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">معلومات الاشتراك:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-stone-600">تاريخ البدء: </span>
                      {new Date(currentPlan.startedAt).toLocaleDateString('ar-EG')}
                    </div>
                    {currentPlan.nextPaymentDue && (
                      <div>
                        <span className="text-stone-600">التجديد التالي: </span>
                        {new Date(currentPlan.nextPaymentDue).toLocaleDateString('ar-EG')}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {currentPlan.isActive ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span className={currentPlan.isActive ? 'text-green-600' : 'text-red-600'}>
                        {currentPlan.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {currentPlan.planType === 'FREE' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">ترقية لخطة مدفوعة</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        احصل على الدردشة والخصومات ودعوة أفراد العائلة
                      </p>
                    </div>
                    <Button onClick={() => setUpgradeDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Crown className="h-4 w-4 ml-2" />
                      ترقية الآن
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {planStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-600">أيام الاشتراك</p>
                      <p className="text-2xl font-bold">{planStats.daysActive}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-600">استخدام PIN</p>
                      <p className="text-2xl font-bold">{planStats.pinUsageCount}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-600">أفراد العائلة</p>
                      <p className="text-2xl font-bold">{planStats.familyMembersCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              {pinStats && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600">توفير هذا الشهر</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(pinStats.totalSavingsThisMonth)}
                        </p>
                      </div>
                      <Percent className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* PIN Tab */}
        <TabsContent value="pin">
          {currentPlan.planType === 'FREE' ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Gift className="h-16 w-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">رقم PIN غير متاح</h3>
                <p className="text-stone-600 mb-4">
                  أرقام PIN متاحة فقط للخطط المدفوعة
                </p>
                <Button onClick={() => setUpgradeDialogOpen(true)}>
                  <Crown className="h-4 w-4 ml-2" />
                  ترقية الخطة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <PinDisplay plan={currentPlan} />
              {pinStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات الاستخدام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{pinStats.totalUsages}</p>
                        <p className="text-sm text-stone-600">إجمالي الاستخدامات</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{pinStats.thisMonthUsages}</p>
                        <p className="text-sm text-stone-600">هذا الشهر</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{pinStats.averageDiscount}%</p>
                        <p className="text-sm text-stone-600">متوسط الخصم</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(pinStats.totalSavingsThisMonth)}
                        </p>
                        <p className="text-sm text-stone-600">التوفير الشهري</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family">
          <div className="space-y-6">
            <FamilyMembersCard 
              plan={currentPlan} 
              onInviteClick={() => setInviteDialogOpen(true)}
              onRefresh={loadPlanData}
            />
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <PinUsageHistory />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PlanUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentPlan={currentPlan}
        onSuccess={loadPlanData}
      />

      <InviteFamilyDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        plan={currentPlan}
        onSuccess={loadPlanData}
      />
    </div>
  );
};

export default PlansPage;
