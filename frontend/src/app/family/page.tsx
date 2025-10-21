'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Gift,
  Share2,
  Crown,
  Mail,
  Copy,
  Check,
  X,
  Trophy,
  Star,
  Loader2,
  MessageCircle,
  Send,
  Medal,
  TrendingUp
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'head' | 'member';
  joinedAt: string;
  status: 'active' | 'pending';
}

interface Invitation {
  id: string;
  email: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface Referral {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  subscriptionActive: boolean;
  points: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  claimed: boolean;
}

export default function FamilyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [isHead, setIsHead] = useState(false);
  const [userTier, setUserTier] = useState<any>(null);
  
  // Fetch family data
  useEffect(() => {
    const fetchFamilyData = async () => {
      if (authLoading || !user) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('daleel-token');
        
        // Fetch family
        const familyRes = await fetch('/api/family', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const familyData = await familyRes.json();
        
        if (familyData.success && familyData.family) {
          setIsHead(familyData.isHead || false);
          setFamilyMembers(familyData.family.members.map((m: any) => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.profilePic,
            role: m.role,
            joinedAt: m.joinedAt,
            status: 'active'
          })));
          setInvitations(familyData.family.invitations || []);
        } else if (!familyData.family) {
          // Create family if doesn't exist
          const createRes = await fetch('/api/family', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: `عائلة ${user.name}` })
          });
          const created = await createRes.json();
          if (created.success) {
            setIsHead(true);
            setFamilyMembers([{
              id: user.id,
              name: user.name,
              email: user.email || '',
              avatar: user.profilePic,
              role: 'head',
              joinedAt: new Date().toISOString(),
              status: 'active'
            }]);
          }
        }
        
        // Fetch referrals
        const refRes = await fetch('/api/family/referrals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const refData = await refRes.json();
        if (refData.success) {
          setReferrals(refData.referrals);
          setUserTier(refData.tier || null);
        }
        
        // Fetch referral link
        const codeRes = await fetch('/api/family/referrals/code', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const codeData = await codeRes.json();
        if (codeData.success) {
          setReferralLink(codeData.referralLink);
        }
        
        // Fetch points
        const pointsRes = await fetch('/api/family/points', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pointsData = await pointsRes.json();
        if (pointsData.success) {
          setTotalPoints(pointsData.points.currentBalance);
        }
        
        // Fetch rewards
        const rewardsRes = await fetch('/api/family/rewards', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rewardsData = await rewardsRes.json();
        if (rewardsData.success) {
          setRewards(rewardsData.rewards.map((r: any) => ({
            id: r.id,
            title: r.titleAr,
            description: r.descriptionAr,
            pointsRequired: r.pointsRequired,
            claimed: false
          })));
        }
      } catch (error) {
        console.error('Error fetching family data:', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل بيانات العائلة',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilyData();
  }, [user, authLoading, toast]);

  const maxMembers = 4;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال البريد الإلكتروني',
        variant: 'destructive'
      });
      return;
    }

    if (familyMembers.length >= maxMembers) {
      toast({
        title: 'تنبيه',
        description: `الحد الأقصى للعائلة هو ${maxMembers} أعضاء`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('daleel-token');
      const response = await fetch('/api/family/invitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInvitations([data.invitation, ...invitations]);
        setInviteEmail('');
        
        toast({
          title: 'تم الإرسال',
          description: data.message || 'تم إرسال الدعوة بنجاح'
        });
      } else {
        toast({
          title: 'خطأ',
          description: data.message || 'فشل إرسال الدعوة',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الدعوة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ رابط الإحالة'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `🎉 انضم معي إلى دليل بلدي واستمتع بخصومات حصرية!\n\nسجل الآن واحصل على مزايا رائعة:\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareSMS = () => {
    const message = `انضم معي إلى دليل بلدي: ${referralLink}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  const handleClaimReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (totalPoints < reward.pointsRequired) {
      toast({
        title: 'نقاط غير كافية',
        description: `تحتاج إلى ${reward.pointsRequired - totalPoints} نقطة إضافية`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('daleel-token');
      const response = await fetch(`/api/family/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTotalPoints(data.newBalance);
        
        toast({
          title: 'تم الاستبدال',
          description: data.message || `تم استبدال ${reward.title} بنجاح`
        });
      } else {
        toast({
          title: data.message.includes('نقاط') ? 'نقاط غير كافية' : 'خطأ',
          description: data.message || 'فشل استبدال المكافأة',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل استبدال المكافأة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isHead) {
      toast({
        title: 'خطأ',
        description: 'فقط رب الأسرة يمكنه إزالة الأعضاء',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('daleel-token');
      const response = await fetch(`/api/family/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFamilyMembers(familyMembers.filter(m => m.id !== memberId));
        
        toast({
          title: 'تم الإزالة',
          description: data.message || 'تمت إزالة العضو من العائلة'
        });
      } else {
        toast({
          title: 'خطأ',
          description: data.message || 'فشل إزالة العضو',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إزالة العضو',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('daleel-token');
      const response = await fetch(`/api/family/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        
        toast({
          title: 'تم الإلغاء',
          description: data.message || 'تم إلغاء الدعوة'
        });
      } else {
        toast({
          title: 'خطأ',
          description: data.message || 'فشل إلغاء الدعوة',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إلغاء الدعوة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الاشتراك العائلي</h1>
        <p className="text-muted-foreground">
          أضف أفراد عائلتك واستمتع بالخدمات معاً، واحصل على نقاط من الإحالات
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              أفراد العائلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {familyMembers.length} / {maxMembers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {maxMembers - familyMembers.length} مقاعد متاحة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              الدعوات المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              في انتظار القبول
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              إحالاتي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {referrals.filter(r => r.subscriptionActive).length} مشتركين نشطين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              نقاطي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              يمكن استبدالها بمكافآت
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">الأعضاء</TabsTrigger>
          <TabsTrigger value="invitations">الدعوات</TabsTrigger>
          <TabsTrigger value="referrals">الإحالات</TabsTrigger>
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أفراد العائلة</CardTitle>
              <CardDescription>
                يمكن إضافة حتى {maxMembers} أفراد في الاشتراك العائلي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {member.role === 'head' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? 'نشط' : 'معلق'}
                    </Badge>
                    {isHead && member.role !== 'head' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {familyMembers.length < maxMembers && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-medium mb-2">أضف فرد عائلة جديد</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    أرسل دعوة عبر البريد الإلكتروني
                  </p>
                  <Button onClick={() => setActiveTab('invitations')}>
                    إرسال دعوة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إرسال دعوة</CardTitle>
              <CardDescription>
                أدخل البريد الإلكتروني لإرسال دعوة للانضمام للعائلة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInvitation()}
                  disabled={loading || familyMembers.length >= maxMembers}
                />
                <Button
                  onClick={handleSendInvitation}
                  disabled={loading || familyMembers.length >= maxMembers}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'إرسال'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الدعوات المرسلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invitations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لم يتم إرسال أي دعوات بعد
                </p>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        أرسلت في {new Date(invitation.sentAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          invitation.status === 'pending'
                            ? 'secondary'
                            : invitation.status === 'accepted'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {invitation.status === 'pending' && 'معلقة'}
                        {invitation.status === 'accepted' && 'مقبولة'}
                        {invitation.status === 'rejected' && 'مرفوضة'}
                        {invitation.status === 'expired' && 'منتهية'}
                      </Badge>
                      {invitation.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4">
          {userTier && (
            <Card>
              <CardHeader>
                <CardTitle>مستواك الحالي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    userTier.current === 'GOLD' ? 'bg-yellow-500' :
                    userTier.current === 'SILVER' ? 'bg-gray-300' :
                    'bg-orange-400'
                  }`}>
                    <Medal className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{userTier.currentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {userTier.total} إحالة
                    </p>
                  </div>
                </div>
                
                {userTier.nextTier && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>التقدم للمستوى التالي</span>
                      <span className="font-medium">
                        {userTier.progress} / {userTier.nextTierAt}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(userTier.progress / userTier.nextTierAt) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      باقي {userTier.nextTierAt - userTier.progress} إحالة للوصول للمستوى الفضي
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>رابط الإحالة الخاص بك</CardTitle>
              <CardDescription>
                شارك هذا الرابط مع أصدقائك واحصل على 50 نقطة عند تسجيلهم و88100 نقطة إضافية عند اشتراكهم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button onClick={handleCopyReferralLink} variant="outline">
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleShareWhatsApp} variant="outline" className="flex-1 gap-2">
                  <MessageCircle className="w-4 h-4" />
                  مشاركة عبر واتساب
                </Button>
                <Button onClick={handleShareSMS} variant="outline" className="flex-1 gap-2">
                  <Send className="w-4 h-4" />
                  إرسال SMS
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إحالاتي</CardTitle>
              <CardDescription>
                الأشخاص الذين انضموا من خلال رابط الإحالة الخاص بك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Share2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    لم تقم بإحالة أي شخص بعد
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    شارك رابط الإحالة الخاص بك لكسب النقاط
                  </p>
                </div>
              ) : (
                referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.email}</p>
                      <p className="text-xs text-muted-foreground">
                        انضم في {new Date(referral.joinedAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <Star className="w-4 h-4" />
                        {referral.points}
                      </div>
                      <Badge
                        variant={referral.subscriptionActive ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {referral.subscriptionActive ? 'مشترك' : 'غير مشترك'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>رصيد النقاط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                  <p className="text-sm text-muted-foreground">نقطة متاحة</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-sm">كيفية كسب النقاط:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 50 نقطة عند تسجيل شخص من رابط الإحالة</li>
                  <li>• 100 نقطة إضافية عند اشتراكه</li>
                  <li>• 25 نقطة شهرياً لكل مشترك نشط من إحالاتك</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={reward.claimed ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {reward.description}
                      </CardDescription>
                    </div>
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-medium">{reward.pointsRequired} نقطة</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleClaimReward(reward.id)}
                      disabled={
                        loading ||
                        reward.claimed ||
                        totalPoints < reward.pointsRequired
                      }
                    >
                      {reward.claimed ? 'تم الاستبدال' : 'استبدل'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

