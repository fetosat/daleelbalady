import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  DollarSign, 
  User, 
  MapPin, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  Percent
} from 'lucide-react';
import { PinVerificationService, PinVerificationRequest, PinVerificationResult, PinValidationResult } from '@/services/pinService';
import { toast } from 'sonner';

// Validation schema
const pinVerificationSchema = z.object({
  pin: z.string().min(8, 'رقم PIN يجب أن يكون 8 أرقام على الأقل').max(9, 'رقم PIN لا يمكن أن يزيد عن 9 أحرف'),
  originalAmount: z.number().min(1, 'يجب إدخال مبلغ صحيح'),
  customerName: z.string().optional(),
  receiptNumber: z.string().optional(),
  verificationLocation: z.string().optional(),
  serviceId: z.string().optional(),
  productId: z.string().optional(),
  offerId: z.string().optional(),
});

type PinVerificationFormData = z.infer<typeof pinVerificationSchema>;

interface PinVerificationFormProps {
  onSuccess?: (result: PinVerificationResult) => void;
  serviceId?: string;
  productId?: string;
  shopId?: string;
}

const PinVerificationForm: React.FC<PinVerificationFormProps> = ({ 
  onSuccess,
  serviceId,
  productId,
  shopId
}) => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PinValidationResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<PinVerificationResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<PinVerificationFormData>({
    resolver: zodResolver(pinVerificationSchema),
    defaultValues: {
      serviceId,
      productId,
    }
  });

  const pinValue = watch('pin');

  // Validate PIN on change (debounced)
  React.useEffect(() => {
    if (pinValue && pinValue.length >= 8) {
      const timeoutId = setTimeout(() => {
        validatePin(pinValue);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setValidationResult(null);
    }
  }, [pinValue]);

  const validatePin = async (pin: string) => {
    if (!pin || pin.length < 8) return;
    
    setValidating(true);
    try {
      const result = await PinVerificationService.validatePin(pin);
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({
        success: false,
        error: error.response?.data?.error || 'خطأ في التحقق من PIN'
      });
    } finally {
      setValidating(false);
    }
  };

  const onSubmit = async (data: PinVerificationFormData) => {
    setLoading(true);
    try {
      const requestData: PinVerificationRequest = {
        pin: data.pin,
        originalAmount: data.originalAmount,
        serviceId: serviceId || data.serviceId,
        productId: productId || data.productId,
        shopId,
        offerId: data.offerId,
        customerName: data.customerName,
        receiptNumber: data.receiptNumber,
        verificationLocation: data.verificationLocation,
      };

      const result = await PinVerificationService.verifyPin(requestData);
      setVerificationResult(result);
      setShowResultDialog(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      toast.success('تم التحقق من PIN بنجاح!');
      reset();
    } catch (error: any) {
      console.error('PIN verification error:', error);
      toast.error(error.response?.data?.error || 'فشل في التحقق من PIN');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPin = (pin: string) => {
    // Auto-format PIN as XXXX-XXXX
    const cleaned = pin.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            التحقق من PIN والخصم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* PIN Input */}
            <div className="space-y-2">
              <Label htmlFor="pin">رقم PIN *</Label>
              <div className="relative">
                <Input
                  id="pin"
                  {...register('pin')}
                  placeholder="1234-5678"
                  className="font-mono text-lg tracking-wider pr-10"
                  onChange={(e) => {
                    const formatted = formatPin(e.target.value);
                    e.target.value = formatted;
                  }}
                />
                <div className="absolute left-3 top-1/2 transform -transtone-y-1/2">
                  {validating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                  ) : validationResult?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : validationResult?.error ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : null}
                </div>
              </div>
              {errors.pin && (
                <p className="text-sm text-red-600">{errors.pin.message}</p>
              )}
              
              {/* PIN Validation Result */}
              {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border ${
                    validationResult.success 
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {validationResult.success ? (
                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        PIN صحيح
                      </p>
                      {validationResult.planOwner && (
                        <div className="text-sm space-y-1">
                          <p>المالك: {validationResult.planOwner.name}</p>
                          <p>نوع الخطة: {validationResult.planType}</p>
                          <p>يشمل خصومات: {validationResult.includesDiscounts ? 'نعم' : 'لا'}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {validationResult.error}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="originalAmount">مبلغ الخدمة/المنتج (جنيه) *</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="originalAmount"
                  type="number"
                  step="0.01"
                  min="1"
                  {...register('originalAmount', { valueAsNumber: true })}
                  placeholder="500"
                  className="pr-10"
                />
              </div>
              {errors.originalAmount && (
                <p className="text-sm text-red-600">{errors.originalAmount.message}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">اسم العميل (اختياري)</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="customerName"
                    {...register('customerName')}
                    placeholder="أحمد محمد"
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptNumber">رقم الفاتورة (اختياري)</Label>
                <div className="relative">
                  <Receipt className="absolute right-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="receiptNumber"
                    {...register('receiptNumber')}
                    placeholder="INV-001"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationLocation">موقع التحقق (اختياري)</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-stone-400" />
                <Textarea
                  id="verificationLocation"
                  {...register('verificationLocation')}
                  placeholder="عيادة الدكتور أحمد - شارع التحرير - المهندسين"
                  className="pr-10"
                  rows={2}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !validationResult?.success}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 ml-2" />
                  تطبيق الخصم
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verification Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              تم التحقق بنجاح
            </DialogTitle>
          </DialogHeader>
          
          {verificationResult && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-stone-600">كود التحقق</p>
                  <p className="font-mono text-xl font-bold text-green-700">
                    {verificationResult.verification.code}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">المبلغ الأصلي:</span>
                  <span className="font-medium">
                    {formatCurrency(verificationResult.verification.originalAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>مبلغ الخصم:</span>
                  <span className="font-medium">
                    -{formatCurrency(verificationResult.verification.discountAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>نسبة الخصم:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {verificationResult.verification.discountPercent}%
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المبلغ النهائي:</span>
                    <span className="text-green-700">
                      {formatCurrency(verificationResult.verification.finalAmount)}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-stone-600 text-center">
                  <p>العرض المستخدم: {verificationResult.verification.offerUsed}</p>
                  <p className="mt-1">
                    صاحب الخطة: {verificationResult.verification.planOwner.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PinVerificationForm;
