import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ArrowLeft, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service Not Found - Daleel Balady',
  description: 'The service you are looking for could not be found. Browse our available services or search for what you need.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen pt-6 pb-16 bg-background">
      {/* Simple Navigation Header */}
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
            <Search className="h-16 w-16 text-stone-400 mx-auto mb-6" />
            
            {/* English Content */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Service Not Found
              </h1>
              <p className="text-text-secondary leading-relaxed">
                The service you are looking for could not be found. It may have been removed, 
                renamed, or is temporarily unavailable.
              </p>
            </div>

            {/* Arabic Content */}
            <div className="mb-8 text-right" dir="rtl">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                الخدمة غير موجودة
              </h2>
              <p className="text-text-secondary leading-relaxed">
                لا يمكن العثور على الخدمة التي تبحث عنها. قد تكون محذوفة أو تم تغيير اسمها أو غير متاحة مؤقتاً.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="gap-2">
                <Link href="/search">
                  <Search className="h-4 w-4" />
                  Search Services
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="gap-2">
                <Link href="/shops">
                  <Home className="h-4 w-4" />
                  Browse Shops
                </Link>
              </Button>
              
              <Button variant="ghost" asChild>
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Popular Services Suggestions */}
            <div className="mt-8 text-sm text-text-muted">
              <p className="mb-2">Popular services you might be interested in:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link 
                  href="/search?category=medical" 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Medical Services
                </Link>
                <Link 
                  href="/search?category=automotive" 
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                >
                  Automotive
                </Link>
                <Link 
                  href="/search?category=home-services" 
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                >
                  Home Services
                </Link>
                <Link 
                  href="/search?category=education" 
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
                >
                  Education
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
