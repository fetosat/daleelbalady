import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Phone,
  Star,
  Calendar,
  DollarSign,
  Package,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  getAllUserListings,
  handleUserListingsError,
  type IndependentService,
  type IndependentProduct
} from '@/api/userListings';

interface AnalyticsData {
  totalListings: number;
  totalServices: number;
  totalProducts: number;
  totalViews: number;
  totalContacts: number;
  averageRating: number;
  activeListings: number;
  recentActivity: ActivityItem[];
  performanceMetrics: PerformanceMetric[];
  topPerformers: TopPerformer[];
}

interface ActivityItem {
  id: string;
  type: 'view' | 'contact' | 'rating' | 'inquiry';
  listingId: string;
  listingName: string;
  timestamp: Date;
  value?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopPerformer {
  id: string;
  name: string;
  type: 'service' | 'product';
  views: number;
  contacts: number;
  rating: number;
}

const IndependentListingsAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [listings, setListings] = useState<{ services: IndependentService[]; products: IndependentProduct[] }>({
    services: [],
    products: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const listingsData = await getAllUserListings();
      setListings(listingsData);

      // Generate mock analytics data based on listings
      const mockAnalytics: AnalyticsData = generateMockAnalytics(listingsData);
      setAnalyticsData(mockAnalytics);
    } catch (err: any) {
      toast({
        title: "Error",
        description: handleUserListingsError(err),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = (listingsData: { services: IndependentService[]; products: IndependentProduct[] }): AnalyticsData => {
    const { services, products } = listingsData;
    const totalListings = services.length + products.length;

    return {
      totalListings,
      totalServices: services.length,
      totalProducts: products.length,
      totalViews: Math.floor(totalListings * 50 + Math.random() * 200),
      totalContacts: Math.floor(totalListings * 8 + Math.random() * 30),
      averageRating: 4.2 + Math.random() * 0.6,
      activeListings: Math.floor(totalListings * 0.8),
      recentActivity: generateMockActivity(services, products),
      performanceMetrics: [
        { name: 'Views', value: Math.floor(totalListings * 50), change: 12.5, trend: 'up' },
        { name: 'Contacts', value: Math.floor(totalListings * 8), change: -2.3, trend: 'down' },
        { name: 'Conversions', value: Math.floor(totalListings * 3), change: 8.7, trend: 'up' },
        { name: 'Revenue', value: Math.floor(totalListings * 150), change: 15.2, trend: 'up' }
      ],
      topPerformers: generateTopPerformers(services, products)
    };
  };

  const generateMockActivity = (services: IndependentService[], products: IndependentProduct[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const allListings = [
      ...services.map(s => ({ id: s.id, name: s.translation?.name_en || 'Service', type: 'service' as const })),
      ...products.map(p => ({ id: p.id, name: (p as any).title || (p as any).name || 'Product', type: 'product' as const }))
    ];

    for (let i = 0; i < Math.min(10, allListings.length * 2); i++) {
      const listing = allListings[Math.floor(Math.random() * allListings.length)];
      if (listing) {
        activities.push({
          id: `activity-${i}`,
          type: Math.random() > 0.5 ? 'view' : 'contact',
          listingId: listing.id,
          listingName: listing.name,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          value: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined
        });
      }
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const generateTopPerformers = (services: IndependentService[], products: IndependentProduct[]): TopPerformer[] => {
    const performers: TopPerformer[] = [];

    [...services, ...products].slice(0, 5).forEach((listing) => {
      performers.push({
        id: listing.id,
        name: (listing as any).title || (listing as any).name || ('name' in listing ? listing.name : 'Unnamed'),
        type: 'price' in listing && 'stockQuantity' in listing ? 'product' : 'service',
        views: Math.floor(Math.random() * 100) + 20,
        contacts: Math.floor(Math.random() * 20) + 5,
        rating: 3.5 + Math.random() * 1.5
      });
    });

    return performers.sort((a, b) => b.views - a.views);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-stone-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-stone-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Insights into your independent listings performance</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                  <p className="text-3xl font-bold">{analyticsData.totalListings}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {analyticsData.totalServices} services
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {analyticsData.totalProducts} products
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                  <p className="text-3xl font-bold">{analyticsData.totalContacts}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">-2.3%</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                  <p className="text-3xl font-bold">{analyticsData.averageRating.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(analyticsData.averageRating) ? 'text-yellow-500 fill-current' : 'text-stone-300'}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="top-performers" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Top Performers
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators for your listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.performanceMetrics.map((metric, index) => (
                    <div key={metric.name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-500' : 
                          metric.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Listings Breakdown
                </CardTitle>
                <CardDescription>Distribution of your listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      <span>Services</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{analyticsData.totalServices}</p>
                      <p className="text-xs text-muted-foreground">
                        {((analyticsData.totalServices / analyticsData.totalListings) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-500" />
                      <span>Products</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{analyticsData.totalProducts}</p>
                      <p className="text-xs text-muted-foreground">
                        {((analyticsData.totalProducts / analyticsData.totalListings) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span>Active</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{analyticsData.activeListings}</p>
                      <p className="text-xs text-muted-foreground">
                        {((analyticsData.activeListings / analyticsData.totalListings) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions with your listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'view' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'contact' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      {activity.type === 'contact' && <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />}
                      {activity.type === 'rating' && <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.listingName}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === 'view' ? 'Viewed' :
                         activity.type === 'contact' ? 'Contact inquiry' :
                         activity.type === 'rating' ? `Rated ${activity.value}/5` :
                         'Activity'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="top-performers">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Listings</CardTitle>
              <CardDescription>Your most successful services and products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{performer.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {performer.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {performer.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {performer.contacts} contacts
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {performer.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default IndependentListingsAnalytics;
