'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts'
import {
  TrendingUp, TrendingDown, Target, Users, ShoppingCart, 
  Calendar, MapPin, Clock, Zap, Brain, Eye, Filter
} from 'lucide-react'

// Advanced data for sophisticated charts
const heatmapData = [
  { hour: '00', day: 'السبت', value: 15, sales: 2300 },
  { hour: '01', day: 'السبت', value: 8, sales: 1200 },
  { hour: '02', day: 'السبت', value: 5, sales: 800 },
  { hour: '03', day: 'السبت', value: 3, sales: 400 },
  { hour: '04', day: 'السبت', value: 2, sales: 300 },
  { hour: '05', day: 'السبت', value: 4, sales: 600 },
  { hour: '06', day: 'السبت', value: 12, sales: 1800 },
  { hour: '07', day: 'السبت', value: 25, sales: 3500 },
  { hour: '08', day: 'السبت', value: 35, sales: 4800 },
  { hour: '09', day: 'السبت', value: 45, sales: 6200 },
  { hour: '10', day: 'السبت', value: 65, sales: 8500 },
  { hour: '11', day: 'السبت', value: 85, sales: 11200 },
  { hour: '12', day: 'السبت', value: 95, sales: 12800 },
  { hour: '13', day: 'السبت', value: 88, sales: 11800 },
  { hour: '14', day: 'السبت', value: 75, sales: 9800 },
  { hour: '15', day: 'السبت', value: 82, sales: 10500 },
  { hour: '16', day: 'السبت', value: 90, sales: 12000 },
  { hour: '17', day: 'السبت', value: 85, sales: 11200 },
  { hour: '18', day: 'السبت', value: 78, sales: 10200 },
  { hour: '19', day: 'السبت', value: 72, sales: 9500 },
  { hour: '20', day: 'السبت', value: 65, sales: 8500 },
  { hour: '21', day: 'السبت', value: 55, sales: 7200 },
  { hour: '22', day: 'السبت', value: 42, sales: 5800 },
  { hour: '23', day: 'السبت', value: 28, sales: 3800 }
]

const funnelData = [
  { name: 'زوار الموقع', value: 15420, percentage: 100, color: '#8884d8' },
  { name: 'مشاهدة المنتجات', value: 8234, percentage: 53.4, color: '#82ca9d' },
  { name: 'إضافة للسلة', value: 3456, percentage: 22.4, color: '#ffc658' },
  { name: 'بدء الدفع', value: 1567, percentage: 10.2, color: '#ff7c7c' },
  { name: 'إتمام الشراء', value: 892, percentage: 5.8, color: '#8dd1e1' }
]

const customerBehaviorData = [
  { segment: 'VIP العملاء', purchases: 45, avgOrderValue: 850, retention: 95, satisfaction: 4.8 },
  { segment: 'عملاء منتظمين', purchases: 25, avgOrderValue: 420, retention: 78, satisfaction: 4.2 },
  { segment: 'عملاء جدد', purchases: 8, avgOrderValue: 180, retention: 45, satisfaction: 3.9 },
  { segment: 'عملاء مترددين', purchases: 3, avgOrderValue: 95, retention: 25, satisfaction: 3.5 }
]

const cohortData = [
  { month: 'يناير', week1: 100, week2: 85, week3: 72, week4: 65, week8: 45, week12: 38 },
  { month: 'فبراير', week1: 100, week2: 88, week3: 75, week4: 68, week8: 48, week12: 42 },
  { month: 'مارس', week1: 100, week2: 82, week3: 69, week4: 62, week8: 43, week12: 35 },
  { month: 'أبريل', week1: 100, week2: 90, week3: 78, week4: 71, week8: 52, week12: 45 },
  { month: 'مايو', week1: 100, week2: 92, week3: 81, week4: 74, week8: 55, week12: 48 },
  { month: 'يونيو', week1: 100, week2: 89, week3: 76, week4: 69 }
]

const geographicData = [
  { city: 'كوم حمادة', orders: 1245, revenue: 185750, growth: 23 },
  { city: 'دمنهور', orders: 892, revenue: 134800, growth: 18 },
  { city: 'كفر الدوار', orders: 567, revenue: 78450, growth: 15 },
  { city: 'إيتاي البارود', orders: 334, revenue: 45320, growth: 12 },
  { city: 'الدلنجات', orders: 223, revenue: 32150, growth: 8 },
  { city: 'أبو المطامير', orders: 156, revenue: 21890, growth: 6 }
]

const predictiveData = [
  { month: 'يناير', actual: 28500, predicted: null, confidence: null },
  { month: 'فبراير', actual: 32100, predicted: null, confidence: null },
  { month: 'مارس', actual: 29800, predicted: null, confidence: null },
  { month: 'أبريل', actual: 35200, predicted: null, confidence: null },
  { month: 'مايو', actual: 38900, predicted: null, confidence: null },
  { month: 'يونيو', actual: 42300, predicted: null, confidence: null },
  { month: 'يوليو', actual: null, predicted: 46800, confidence: 0.87 },
  { month: 'أغسطس', actual: null, predicted: 48200, confidence: 0.82 },
  { month: 'سبتمبر', actual: null, predicted: 51500, confidence: 0.78 },
  { month: 'أكتوبر', actual: null, predicted: 49800, confidence: 0.74 }
]

export default function AdvancedCharts() {
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [timeRange, setTimeRange] = useState('7d')
  const [aiInsights, setAiInsights] = useState([
    {
      type: 'trend',
      title: 'ارتفاع في المبيعات المسائية',
      description: 'لوحظ زيادة 34% في المبيعات بين الساعة 6-9 مساءً هذا الأسبوع',
      confidence: 92,
      actionable: true
    },
    {
      type: 'prediction',
      title: 'توقع نمو المبيعات',
      description: 'من المتوقع زيادة المبيعات بنسبة 23% الشهر القادم بناءً على البيانات الحالية',
      confidence: 78,
      actionable: true
    },
    {
      type: 'optimization',
      title: 'فرصة تحسين التحويل',
      description: 'يمكن تحسين معدل التحويل بـ 15% عبر تحسين صفحة الدفع',
      confidence: 85,
      actionable: true
    }
  ])

  const getHeatmapColor = (value: number) => {
    if (value <= 20) return '#f0f9ff'
    if (value <= 40) return '#bae6fd'
    if (value <= 60) return '#7dd3fc'
    if (value <= 80) return '#38bdf8'
    return '#0284c7'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-stone-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold text-purple-900">رؤى ذكية مدعومة بالذكاء الاصطناعي</h3>
          <Badge className="bg-purple-100 text-purple-800">جديد</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 border border-purple-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {insight.type === 'prediction' && <Target className="w-4 h-4 text-blue-500" />}
                  {insight.type === 'optimization' && <Zap className="w-4 h-4 text-orange-500" />}
                  <span className="text-sm font-medium text-stone-900">{insight.title}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% دقة
                </Badge>
              </div>
              <p className="text-sm text-stone-600 mb-3">{insight.description}</p>
              {insight.actionable && (
                <Button size="sm" variant="outline" className="text-xs">
                  تطبيق التوصية
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="heatmap">خريطة الحرارة</TabsTrigger>
          <TabsTrigger value="funnel">مسار التحويل</TabsTrigger>
          <TabsTrigger value="behavior">تحليل السلوك</TabsTrigger>
          <TabsTrigger value="geographic">التوزيع الجغرافي</TabsTrigger>
          <TabsTrigger value="prediction">التوقعات الذكية</TabsTrigger>
        </TabsList>

        {/* Heatmap Analysis */}
        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                خريطة حرارية للنشاط على مدار الساعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Hour-by-Hour Heatmap Visualization */}
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const data = heatmapData.find(d => parseInt(d.hour) === hour)
                    const value = data?.value || 0
                    return (
                      <div
                        key={hour}
                        className="aspect-square rounded-sm cursor-pointer transition-all hover:scale-110 flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: getHeatmapColor(value),
                          color: value > 60 ? 'white' : '#374151'
                        }}
                        title={`الساعة ${hour}:00 - النشاط: ${value}%${data ? ` - المبيعات: ${data.sales.toLocaleString()} ج` : ''}`}
                      >
                        {hour}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span>نشاط منخفض</span>
                  <div className="flex gap-1">
                    {[20, 40, 60, 80, 100].map(value => (
                      <div
                        key={value}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getHeatmapColor(value) }}
                      />
                    ))}
                  </div>
                  <span>نشاط عالي</span>
                </div>

                {/* Detailed Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="value" fill="#3B82F6" name="نشاط %" />
                    <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} name="مبيعات (ج)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Analysis */}
        <TabsContent value="funnel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  مسار تحويل العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart data={funnelData}>
                    <Tooltip formatter={(value, name) => [`${value.toLocaleString()}`, name]} />
                    <Funnel
                      dataKey="value"
                      data={funnelData}
                      isAnimationActive
                      fill="#8884d8"
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحليل معدلات التحويل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((step, index) => (
                    <div key={step.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{step.name}</span>
                        <span className="text-stone-600">{step.percentage}%</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: step.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${step.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-stone-500">
                        {step.value.toLocaleString()} مستخدم
                        {index > 0 && (
                          <span className="mr-2 text-red-500">
                            ({(funnelData[index - 1].value - step.value).toLocaleString()} تسرب)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">توصيات التحسين</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• تحسين صفحة المنتج يمكن أن يقلل التسرب بـ 15%</li>
                    <li>• تبسيط عملية الدفع قد يزيد التحويل بـ 8%</li>
                    <li>• إضافة عروض في السلة تحفز الإتمام بـ 12%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Behavior Analysis */}
        <TabsContent value="behavior" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  تحليل سلوك العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={customerBehaviorData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="segment" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="الاحتفاظ %" dataKey="retention" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Radar name="الرضا (5/5)" dataKey="satisfaction" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {customerBehaviorData.map((segment, index) => (
                    <motion.div
                      key={segment.segment}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-stone-900">{segment.segment}</h4>
                        <Badge variant="outline">{segment.purchases} مشتريات/شهر</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {segment.avgOrderValue.toLocaleString()} ج
                          </div>
                          <div className="text-stone-600">متوسط الطلب</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{segment.retention}%</div>
                          <div className="text-stone-600">الاحتفاظ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{segment.satisfaction}/5</div>
                          <div className="text-stone-600">الرضا</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Analysis */}
        <TabsContent value="geographic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                التوزيع الجغرافي للمبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={geographicData}>
                    <CartesianGrid />
                    <XAxis dataKey="orders" name="طلبات" />
                    <YAxis dataKey="revenue" name="إيرادات" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'orders' ? `${value} طلب` : `${value.toLocaleString()} ج`,
                        name === 'orders' ? 'الطلبات' : 'الإيرادات'
                      ]}
                      labelFormatter={(label) => geographicData[label]?.city || ''}
                    />
                    <Scatter name="المدن" dataKey="revenue" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {geographicData.map((city, index) => (
                    <motion.div
                      key={city.city}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50"
                    >
                      <div>
                        <div className="font-medium text-stone-900">{city.city}</div>
                        <div className="text-sm text-stone-600">
                          {city.orders.toLocaleString()} طلب • {city.revenue.toLocaleString()} ج
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 ${city.growth > 20 ? 'text-green-600' : city.growth > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {city.growth > 15 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="text-sm font-medium">{city.growth}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Predictions */}
        <TabsContent value="prediction" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                التوقعات الذكية للمبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={predictiveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value?.toLocaleString()} ج`,
                      name === 'actual' ? 'فعلي' : 'متوقع'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="فعلي"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stackId="2"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.4}
                    strokeDasharray="5 5"
                    name="متوقع"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">النمو المتوقع</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">+18.5%</div>
                  <div className="text-sm text-green-600">للشهرين القادمين</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">دقة النموذج</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">87.3%</div>
                  <div className="text-sm text-blue-600">على البيانات التاريخية</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">آخر تحديث</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">اليوم</div>
                  <div className="text-sm text-purple-600">تحديث تلقائي يومي</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
