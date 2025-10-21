'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Service page error:', error);
  }, [error]);

  const getErrorMessage = () => {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return {
        title: 'Service Not Found',
        description: 'The service you are looking for could not be found. It may have been removed or is temporarily unavailable.',
        titleAr: 'الخدمة غير موجودة',
        descriptionAr: 'لا يمكن العثور على الخدمة التي تبحث عنها. قد تكون محذوفة أو غير متاحة مؤقتاً.'
      };
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Connection Error',
        description: 'Unable to load service information. Please check your internet connection and try again.',
        titleAr: 'خطأ في الاتصال',
        descriptionAr: 'لا يمكن تحميل معلومات الخدمة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
      };
    }

    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred while loading the service page. Please try again.',
      titleAr: 'حدث خطأ ما',
      descriptionAr: 'حدث خطأ غير متوقع أثناء تحميل صفحة الخدمة. يرجى المحاولة مرة أخرى.'
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen pt-6 pb-16 bg-background">
      {/* Navigation Header */}
      <div className="bg-background border-b shadow-sm mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button variant="ghost" className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        <Card className="bg-background">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            
            {/* English Content */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {errorInfo.title}
              </h1>
              <p className="text-text-secondary leading-relaxed">
                {errorInfo.description}
              </p>
            </div>

            {/* Arabic Content */}
            <div className="mb-8 text-right" dir="rtl">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {errorInfo.titleAr}
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {errorInfo.descriptionAr}
              </p>
            </div>

            {/* Error Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button variant="outline" asChild className="gap-2">
                <Link href="/search">
                  <Home className="h-4 w-4" />
                  Browse Services
                </Link>
              </Button>
              
              <Button variant="ghost" asChild>
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left bg-stone-100 dark:bg-stone-800 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {error.message}
                  {error.stack && `\n\nStack trace:\n${error.stack}`}
                  {error.digest && `\n\nError ID: ${error.digest}`}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
