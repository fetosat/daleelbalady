import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Crown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryService, PlanService, PlanUpgradeData, UserPlan } from '@/services/planService';
import { toast } from 'sonner';

const formSchema = z.object({
  planType: z.enum(['SINGLE_CATEGORY', 'ALL_CATEGORIES']),
  selectedCategoryId: z.string().optional(),
  egyptianNationalId: z.string().min(14, 'الرقم القومي 14 رقم').max(14, 'الرقم القومي 14 رقم').regex(/^\d{14}$/, 'أرقام فقط'),
  fullArabicName: z.string().min(7, 'الاسم الرباعي مطلوب'),
  profilePicture: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentPlan: UserPlan;
  onSuccess: () => void;
}

const PlanUpgradeDialog: React.FC<PlanUpgradeDialogProps> = ({ open, onOpenChange, currentPlan, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planType: 'SINGLE_CATEGORY',
      selectedCategoryId: undefined,
      egyptianNationalId: '',
      fullArabicName: '',
      profilePicture: ''
    }
  });

  const planType = watch('planType');

  useEffect(() => {
    if (!open) return;
    (async () => {
      const cats = await CategoryService.getCategories();
      setCategories(cats.map(c => ({ id: c.id, name: c.name })));
    })();
  }, [open]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (data.planType === 'SINGLE_CATEGORY' && !data.selectedCategoryId) {
        toast.error('اختر فئة للخطة');
        return;
      }

      const payload: PlanUpgradeData = {
        planType: data.planType,
        selectedCategoryId: data.planType === 'SINGLE_CATEGORY' ? data.selectedCategoryId : undefined,
        egyptianNationalId: data.egyptianNationalId,
        fullArabicName: data.fullArabicName,
        profilePicture: data.profilePicture || undefined,
      };

      await PlanService.upgradePlan(payload);
      toast.success('تمت ترقية الخطة بنجاح');
      onOpenChange(false);
      onSuccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'تعذر ترقية الخطة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" /> ترقية الخطة
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>نوع الخطة</Label>
            <RadioGroup defaultValue="SINGLE_CATEGORY" onValueChange={(v) => setValue('planType', v as any)} className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 space-x-reverse rounded border p-3">
                <RadioGroupItem value="SINGLE_CATEGORY" id="single" />
                <Label htmlFor="single">فئة واحدة</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded border p-3">
                <RadioGroupItem value="ALL_CATEGORIES" id="all" />
                <Label htmlFor="all">كل الفئات</Label>
              </div>
            </RadioGroup>
          </div>

          {planType === 'SINGLE_CATEGORY' && (
            <div className="space-y-2">
              <Label>اختر الفئة</Label>
              <Select onValueChange={(v) => setValue('selectedCategoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedCategoryId && (
                <p className="text-sm text-red-600">{errors.selectedCategoryId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nid">الرقم القومي المصري</Label>
            <Input id="nid" placeholder="14 رقم" {...register('egyptianNationalId')} />
            {errors.egyptianNationalId && <p className="text-sm text-red-600">{errors.egyptianNationalId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullArabicName">الاسم الرباعي بالعربية</Label>
            <Input id="fullArabicName" placeholder="مثال: أحمد محمد علي حسن" {...register('fullArabicName')} />
            {errors.fullArabicName && <p className="text-sm text-red-600">{errors.fullArabicName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePicture">رابط الصورة الشخصية (اختياري)</Label>
            <Input id="profilePicture" placeholder="https://..." {...register('profilePicture')} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري الترقية...</>) : 'تأكيد الترقية'}
          </Button>

          <Alert>
            <AlertDescription>
              سيتم إنشاء رقم PIN شهري بمجرد الترقية، ويمكنك دعوة حتى 4 أفراد للعائلة.
            </AlertDescription>
          </Alert>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeDialog;
