import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen pt-6 pb-16 bg-background">
      {/* Navigation Header Skeleton */}
      <div className="bg-background border-b shadow-sm mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Breadcrumb Skeleton */}
          <div className="mb-4 flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Back Button Skeleton */}
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Service Header Skeleton */}
        <Card className="mb-8 bg-background">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Service Icon Skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="w-24 h-24 rounded-full" />
              </div>

              {/* Service Info Skeleton */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>

                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-20 w-full" />

                  {/* Filter Tags Skeleton */}
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </div>
                </div>

                {/* Key Stats Skeleton */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>

                {/* Availability Status Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* Priority Indicator Skeleton */}
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Information Skeleton */}
        <Card className="mb-8 bg-background">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>

              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Service Details Tabs Skeleton */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>

          <Card className="bg-background">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-18" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
