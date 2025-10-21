'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

/**
 * Debug component to display current user information
 * Use this temporarily to diagnose user data issues
 * 
 * Usage: Add <DebugUserInfo /> to any page to see user data
 */
export function DebugUserInfo() {
  const { user, refreshUser, isLoading } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      alert('✅ تم تحديث البيانات بنجاح!');
    } catch (error: any) {
      alert('❌ فشل تحديث البيانات: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm">جاري تحميل بيانات المستخدم...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">❌ لا يوجد مستخدم مسجل</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>🐛 معلومات المستخدم (Debug)</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-7"
          >
            <RefreshCw className={`h-3 w-3 ml-1 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-semibold text-stone-600">ID:</div>
          <div className="text-stone-900">{user.id || '❌ غير موجود'}</div>

          <div className="font-semibold text-stone-600">الاسم:</div>
          <div className="text-stone-900">{user.name || '❌ غير موجود'}</div>

          <div className="font-semibold text-stone-600">البريد:</div>
          <div className="text-stone-900">{user.email || '❌ غير موجود'}</div>

          <div className="font-semibold text-stone-600">الهاتف:</div>
          <div className="text-stone-900">{user.phone || '❌ غير موجود'}</div>

          <div className="font-semibold text-stone-600">الصلاحية:</div>
          <div className="text-stone-900">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
              {user.role || '❌ غير موجود'}
            </span>
          </div>

          <div className="font-semibold text-stone-600">الصورة:</div>
          <div className="text-stone-900">{user.profilePic ? '✅ موجودة' : '❌ غير موجودة'}</div>

          <div className="font-semibold text-stone-600">موثق:</div>
          <div className="text-stone-900">{user.isVerified ? '✅ نعم' : '❌ لا'}</div>

          <div className="font-semibold text-stone-600">الباقة:</div>
          <div className="text-stone-900">
            {user.subscription ? (
              <div className="space-y-1">
                <div>{user.subscription.planNameAr || user.subscription.planName}</div>
                <div className="text-xs">
                  <span className={`px-1.5 py-0.5 rounded ${
                    user.subscription.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {user.subscription.status}
                  </span>
                </div>
              </div>
            ) : (
              '❌ لا توجد باقة'
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="font-semibold text-stone-600 mb-2">LocalStorage Data:</div>
          <div className="bg-white p-2 rounded text-[10px] overflow-auto max-h-32">
            <div><strong>Token:</strong> {localStorage.getItem('daleel-token') ? '✅ موجود' : '❌ غير موجود'}</div>
            <div><strong>User:</strong></div>
            <pre className="mt-1 whitespace-pre-wrap">
              {JSON.stringify(JSON.parse(localStorage.getItem('daleel-user') || '{}'), null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DebugUserInfo;

