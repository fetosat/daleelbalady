'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Users, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Crown
} from 'lucide-react';
import { PlanService } from '@/services/planService';
import { toast } from 'sonner';

interface FamilyInviteData {
  id: string;
  inviterName: string;
  planType: string;
  planBenefits: string[];
  discountPercentage: number;
  maxFamilyMembers: number;
  currentFamilyMembers: number;
  expiresAt: string;
  isExpired: boolean;
  isAlreadyUsed: boolean;
}

const FamilyInvitePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [inviteData, setInviteData] = useState<FamilyInviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInviteData();
    }
  }, [token]);

  const fetchInviteData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PlanService.getInviteData(token);
      setInviteData(response.invite);
    } catch (error: any) {
      setError(error?.response?.data?.error || 'فشل في جلب بيانات الدعوة');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!inviteData) return;

    try {
      setAccepting(true);
      await PlanService.acceptFamilyInvite(token);
      
      toast.success('تم قبول الدعوة بنجاح! مرحباً بك في العائلة');
      
      // Redirect to plans page after success
      setTimeout(() => {
        router.push('/plans');
      }, 2000);
      
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'فشل في قبول الدعوة');
    } finally {
      setAccepting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-stone-600">جاري تحميل بيانات الدعوة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              خطأ في الدعوة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              onClick={fetchInviteData}
              className="w-full mt-4"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-stone-400" />
            <p className="text-stone-600">لم يتم العثور على الدعوة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteData.isExpired) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Calendar className="h-5 w-5" />
              دعوة منتهية الصلاحية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                انتهت صلاحية هذه الدعوة في {formatDate(inviteData.expiresAt)}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-stone-600 mt-4">
              يمكنك طلب دعوة جديدة من {inviteData.inviterName}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteData.isAlreadyUsed) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="h-5 w-5" />
              دعوة مستخدمة مسبقاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                تم قبول هذه الدعوة من قبل
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/plans')} 
              className="w-full mt-4"
            >
              الانتقال لصفحة الخطط
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">دعوة انضمام للعائلة</h1>
          </div>
          <p className="text-stone-600">لديك دعوة للانضمام لخطة عائلية</p>
        </div>

        <div className="space-y-6">
          {/* Invite Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                تفاصيل الدعوة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">دعاك:</span>
                <span className="font-medium text-lg">{inviteData.inviterName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-stone-600">نوع الخطة:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {inviteData.planType}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-stone-600">نسبة الخصم:</span>
                <span className="font-bold text-green-600 text-lg">
                  {inviteData.discountPercentage}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-stone-600">الأعضاء الحاليون:</span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {inviteData.currentFamilyMembers} من {inviteData.maxFamilyMembers}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-stone-600">تنتهي في:</span>
                <span className="text-sm">{formatDate(inviteData.expiresAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Plan Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                مميزات الخطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {inviteData.planBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={acceptInvite}
              disabled={accepting}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {accepting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري القبول...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 ml-2" />
                  قبول الدعوة والانضمام للعائلة
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              لا شكراً، ربما لاحقاً
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظة مهمة:</strong> بقبول هذه الدعوة، ستصبح عضواً في خطة {inviteData.inviterName} العائلية 
              وستحصل على جميع المميزات المذكورة أعلاه. يمكنك مغادرة العائلة في أي وقت من إعدادات حسابك.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default FamilyInvitePage;
