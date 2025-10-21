'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar, Receipt, DollarSign } from 'lucide-react';

export default function PaymentHistoryPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">تاريخ المدفوعات</h1>
        <p className="text-gray-600">عرض تاريخ جميع العمليات المالية والمدفوعات</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            تاريخ المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد مدفوعات
            </h3>
            <p className="text-gray-500">
              لم يتم العثور على أي عمليات دفع
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
