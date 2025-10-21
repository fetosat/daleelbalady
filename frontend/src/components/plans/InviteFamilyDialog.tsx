import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Mail, Phone, Link } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlanService, UserPlan } from '@/services/planService';
import { toast } from 'sonner';

const formSchema = z.object({
  inviteMethod: z.enum(['EMAIL', 'PHONE', 'LINK']),
  inviteEmail: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
  invitePhone: z.string().optional(),
  tempName: z.string().min(2, 'الاسم قصير جداً').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface InviteFamilyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: UserPlan;
  onSuccess: () => void;
}

const InviteFamilyDialog: React.FC<InviteFamilyDialogProps> = ({ 
  open, 
  onOpenChange, 
  plan, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteMethod: 'EMAIL',
      inviteEmail: '',
      invitePhone: '',
      tempName: ''
    }
  });

  const inviteMethod = watch('inviteMethod');

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Validate based on method
      if (data.inviteMethod === 'EMAIL' && !data.inviteEmail) {
        toast.error('البريد الإلكتروني مطلوب');
        return;
      }

      if (data.inviteMethod === 'PHONE' && !data.invitePhone) {
        toast.error('رقم الهاتف مطلوب');
        return;
      }

      const payload = {
        inviteEmail: data.inviteMethod === 'EMAIL' ? data.inviteEmail : undefined,
        invitePhone: data.inviteMethod === 'PHONE' ? data.invitePhone : undefined,
        tempName: data.tempName || undefined,
        inviteMethod: data.inviteMethod,
      };

      const result = await PlanService.inviteFamilyMember(payload);
      
      if (data.inviteMethod === 'LINK') {
        setInviteLink(result.invite.inviteLink);
      } else {
        toast.success('تم إرسال الدعوة بنجاح');
        onOpenChange(false);
        onSuccess();
        reset();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل في إرسال الدعوة');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('تم نسخ رابط الدعوة');
      onOpenChange(false);
      onSuccess();
      reset();
      setInviteLink(null);
    } catch {
      toast.error('فشل في نسخ الرابط');
    }
  };

  if (inviteLink) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" /> رابط الدعوة جاهز
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                شارك هذا الرابط مع الشخص المراد دعوته
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-stone-50 rounded border font-mono text-sm break-all">
              {inviteLink}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopyLink} className="flex-1">
                نسخ الرابط
              </Button>
              <Button variant="outline" onClick={() => {
                setInviteLink(null);
                reset();
              }}>
                إلغاء
              </Button>
            </div>

            <p className="text-sm text-stone-600 text-center">
              ينتهي هذا الرابط خلال 7 أيام
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> دعوة عضو عائلة
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <Label>طريقة الدعوة</Label>
            <RadioGroup 
              defaultValue="EMAIL" 
              onValueChange={(v) => setValue('inviteMethod', v as any)} 
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2 space-x-reverse rounded border p-3">
                <RadioGroupItem value="EMAIL" id="email" />
                <Label htmlFor="email" className="flex items-center gap-1 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  إيميل
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded border p-3">
                <RadioGroupItem value="PHONE" id="phone" />
                <Label htmlFor="phone" className="flex items-center gap-1 cursor-pointer">
                  <Phone className="h-4 w-4" />
                  هاتف
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded border p-3">
                <RadioGroupItem value="LINK" id="link" />
                <Label htmlFor="link" className="flex items-center gap-1 cursor-pointer">
                  <Link className="h-4 w-4" />
                  رابط
                </Label>
              </div>
            </RadioGroup>
          </div>

          {inviteMethod === 'EMAIL' && (
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@domain.com" 
                {...register('inviteEmail')} 
              />
              {errors.inviteEmail && (
                <p className="text-sm text-red-600">{errors.inviteEmail.message}</p>
              )}
            </div>
          )}

          {inviteMethod === 'PHONE' && (
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input 
                id="phone" 
                placeholder="+201234567890" 
                {...register('invitePhone')} 
              />
              {errors.invitePhone && (
                <p className="text-sm text-red-600">{errors.invitePhone.message}</p>
              )}
            </div>
          )}

          {inviteMethod !== 'LINK' && (
            <div className="space-y-2">
              <Label htmlFor="tempName">الاسم (اختياري)</Label>
              <Input 
                id="tempName" 
                placeholder="اسم الشخص المدعو" 
                {...register('tempName')} 
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 ml-2" />
                {inviteMethod === 'LINK' ? 'إنشاء رابط دعوة' : 'إرسال الدعوة'}
              </>
            )}
          </Button>

          <Alert>
            <AlertDescription>
              <strong>المتاح:</strong> {plan.maxFamilyMembers - (plan.familyMembers?.length || 0)} دعوات إضافية.
              صالحة لمدة 7 أيام.
            </AlertDescription>
          </Alert>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFamilyDialog;
