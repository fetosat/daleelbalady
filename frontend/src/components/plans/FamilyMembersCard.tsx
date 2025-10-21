import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Phone, CheckCircle, Clock, X } from 'lucide-react';
import { UserPlan } from '@/services/planService';

interface FamilyMembersCardProps {
  plan: UserPlan;
  onInviteClick: () => void;
  onRefresh: () => void;
}

const FamilyMembersCard: React.FC<FamilyMembersCardProps> = ({ plan, onInviteClick, onRefresh }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-3 w-3" />;
      case 'PENDING':
        return <Clock className="h-3 w-3" />;
      case 'EXPIRED':
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'مقبولة';
      case 'PENDING':
        return 'في الانتظار';
      case 'EXPIRED':
        return 'منتهية';
      default:
        return status;
    }
  };

  const canInviteMore = plan.planType !== 'FREE' && 
    (plan.familyMembers?.length || 0) < plan.maxFamilyMembers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            أفراد العائلة
          </div>
          {canInviteMore && (
            <Button onClick={onInviteClick} size="sm">
              <UserPlus className="h-4 w-4 ml-2" />
              دعوة عضو
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plan.planType === 'FREE' ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">دعوات العائلة غير متاحة</h3>
            <p className="text-stone-600">ترقية لخطة مدفوعة لدعوة أفراد العائلة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Members Count */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">الأعضاء الحاليون</span>
              <span className="text-lg font-bold text-blue-600">
                {plan.currentMembers} / {plan.maxFamilyMembers + 1}
              </span>
            </div>

            {/* Family Members List */}
            {plan.familyMembers && plan.familyMembers.length > 0 ? (
              <div className="space-y-3">
                {plan.familyMembers.map((member) => (
                  <div key={member.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {member.invitedUser ? (
                          <span className="font-medium">{member.invitedUser.name}</span>
                        ) : (
                          <span className="text-stone-600">{member.tempName || 'غير محدد'}</span>
                        )}
                        <Badge className={`${getStatusColor(member.inviteStatus)} flex items-center gap-1`}>
                          {getStatusIcon(member.inviteStatus)}
                          {getStatusText(member.inviteStatus)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-stone-600 space-y-1">
                      {member.inviteEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.inviteEmail}
                        </div>
                      )}
                      {member.invitePhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.invitePhone}
                        </div>
                      )}
                      {member.expiresAt && member.inviteStatus === 'PENDING' && (
                        <div className="text-xs">
                          تنتهي الدعوة: {new Date(member.expiresAt).toLocaleDateString('ar-EG')}
                        </div>
                      )}
                      {member.acceptedAt && (
                        <div className="text-xs">
                          انضم في: {new Date(member.acceptedAt).toLocaleDateString('ar-EG')}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className={member.canUseChat ? 'text-green-600' : 'text-stone-400'}>
                        الدردشة: {member.canUseChat ? 'متاح' : 'غير متاح'}
                      </span>
                      <span className={member.canUseDiscounts ? 'text-green-600' : 'text-stone-400'}>
                        الخصومات: {member.canUseDiscounts ? 'متاح' : 'غير متاح'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600">لم يتم دعوة أي أفراد بعد</p>
                {canInviteMore && (
                  <Button onClick={onInviteClick} size="sm" className="mt-3">
                    <UserPlus className="h-4 w-4 ml-2" />
                    إرسال أول دعوة
                  </Button>
                )}
              </div>
            )}

            {!canInviteMore && plan.familyMembers && plan.familyMembers.length >= plan.maxFamilyMembers && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-orange-700 text-sm">
                  تم الوصول للحد الأقصى لأفراد العائلة ({plan.maxFamilyMembers} أفراد)
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyMembersCard;
