'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  User, 
  Calendar,
  MapPin,
  Receipt,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Calculator
} from 'lucide-react';
import { PinService } from '@/services/pinService';
import { toast } from 'sonner';

interface PinVerificationResult {
  isValid: boolean;
  user: {
    name: string;
    plan: {
      type: string;
      discountPercentage: number;
    };
  };
  usagesThisMonth: number;
  maxUsagesPerMonth: number;
  remainingUsages: number;
  expiresAt: string;
}

interface DiscountCalculation {
  originalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
}

const VerifyPinPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PinVerificationResult | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [calculation, setCalculation] = useState<DiscountCalculation | null>(null);
  const [confirming, setConfirming] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on PIN input
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, []);

  const handleVerifyPin = async () => {
    if (!pin || pin.length !== 6) {
      toast.error('يرجى إدخال رقم PIN مكون من 6 أرقام');
      return;
    }

    try {
      setLoading(true);
      const result = await PinService.validatePin(pin);
      setVerificationResult(result as any);
      
      if (result.success) {
        toast.success('تم التحقق من PIN بنجاح');
      } else {
        toast.error(result.error || 'رقم PIN غير صحيح أو منتهي الصلاحية');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'فشل في التحقق من PIN');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!verificationResult || !billAmount) return;

    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    const discountPercentage = verificationResult.user.plan.discountPercentage;
    const discountAmount = (amount * discountPercentage) / 100;
    const finalAmount = amount - discountAmount;

    setCalculation({
      originalAmount: amount,
      discountPercentage,
      discountAmount,
      finalAmount
    });
  };

  const confirmUsage = async () => {
    if (!verificationResult || !calculation) return;

    try {
      setConfirming(true);
      await PinService.confirmPinUsage({
        pinCode: pin,
        originalAmount: calculation.originalAmount,
        discountAmount: calculation.discountAmount,
        finalAmount: calculation.finalAmount
      });

      toast.success('تم تطبيق الخصم وتسجيل الاستخدام بنجاح');
      
      // Reset form
      setPin('');
      setBillAmount('');
      setVerificationResult(null);
      setCalculation(null);
      
      // Focus back on PIN input
      if (pinInputRef.current) {
        pinInputRef.current.focus();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'فشل في تطبيق الخصم');
    } finally {
      setConfirming(false);
    }
  };

  const resetForm = () => {
    setPin('');
    setBillAmount('');
    setVerificationResult(null);
    setCalculation(null);
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  };

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

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-stone-950">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">التحقق من PIN</h1>
          </div>
          <p className="text-stone-600">أدخل رقم PIN الخاص بالعميل للتحقق وتطبيق الخصم</p>
        </div>

        <div className="space-y-6">
          {/* PIN Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                التحقق من رقم PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pin">رقم PIN (6 أرقام)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    ref={pinInputRef}
                    id="pin"
                    type="text"
                    placeholder="123456"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setPin(value);
                    }}
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleVerifyPin();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleVerifyPin} 
                    disabled={loading || pin.length !== 6}
                    className="px-6"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'تحقق'
                    )}
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <>
                  <Separator />
                  
                  {verificationResult.isValid ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>PIN صحيح!</strong> يمكن تطبيق الخصم
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>PIN غير صحيح أو منتهي الصلاحية</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          {verificationResult?.isValid && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">{verificationResult.user.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      {verificationResult.user.plan.type}
                    </Badge>
                    <span className="text-sm text-stone-600">
                      {verificationResult.user.plan.discountPercentage}% خصم
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-stone-400" />
                    <span className="text-sm">
                      استخدم {verificationResult.usagesThisMonth} من {verificationResult.maxUsagesPerMonth} هذا الشهر
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-stone-400" />
                    <span className="text-sm">
                      ينتهي في {formatDate(verificationResult.expiresAt)}
                    </span>
                  </div>
                </div>

                {verificationResult.remainingUsages === 0 && (
                  <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      لقد وصل العميل للحد الأقصى من الاستخدامات هذا الشهر
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Discount Calculator */}
          {verificationResult?.isValid && verificationResult.remainingUsages > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  حساب الخصم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">مبلغ الفاتورة</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="text-right"
                      step="0.01"
                      min="0"
                    />
                    <Button 
                      onClick={calculateDiscount} 
                      disabled={!billAmount}
                      variant="outline"
                    >
                      احسب
                    </Button>
                  </div>
                </div>

                {calculation && (
                  <>
                    <Separator />
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span>المبلغ الأصلي:</span>
                        <span className="font-medium">{formatCurrency(calculation.originalAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between text-green-600">
                        <span>الخصم ({calculation.discountPercentage}%):</span>
                        <span className="font-medium">-{formatCurrency(calculation.discountAmount)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>المبلغ النهائي:</span>
                        <span className="text-green-600">{formatCurrency(calculation.finalAmount)}</span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={confirmUsage} 
                          disabled={confirming}
                          className="flex-1"
                        >
                          {confirming ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              جاري التطبيق...
                            </>
                          ) : (
                            'تطبيق الخصم وتأكيد الاستخدام'
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reset Button */}
          {(verificationResult || pin) && (
            <div className="text-center">
              <Button variant="outline" onClick={resetForm} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                بدء عملية جديدة
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPinPage;
