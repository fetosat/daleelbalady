'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter
} from 'recharts'
import {
  Brain, TrendingUp, TrendingDown, Zap, Target, AlertTriangle,
  CheckCircle, Clock, Users, ShoppingCart, DollarSign, Star,
  Lightbulb, ArrowRight, Sparkles, Eye, Calculator, Rocket
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'prediction' | 'anomaly' | 'opportunity' | 'warning' | 'optimization'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  priority: number
  actionable: boolean
  data?: any[]
  recommendation?: string
  estimatedValue?: number
}

interface AIModel {
  name: string
  accuracy: number
  lastTrained: string
  status: 'active' | 'training' | 'outdated'
  predictions: number
}

const mockPredictionData = [
  { month: 'يوليو', actual: 42300, predicted: 46800, confidence: 87 },
  { month: 'أغسطس', actual: null, predicted: 48200, confidence: 82 },
  { month: 'سبتمبر', actual: null, predicted: 51500, confidence: 78 },
  { month: 'أكتوبر', actual: null, predicted: 49800, confidence: 74 },
  { month: 'نوفمبر', actual: null, predicted: 53200, confidence: 71 },
  { month: 'ديسمبر', actual: null, predicted: 57800, confidence: 68 }
]

const customerSegmentPredictions = [
  { segment: 'VIP العملاء', currentValue: 850, predictedValue: 920, growth: 8.2 },
  { segment: 'عملاء منتظمين', currentValue: 420, predictedValue: 465, growth: 10.7 },
  { segment: 'عملاء جدد', currentValue: 180, predictedValue: 210, growth: 16.7 },
  { segment: 'عملاء مترددين', currentValue: 95, predictedValue: 125, growth: 31.6 }
]

const anomalyData = [
  { day: 1, normal: 100, actual: 98, anomaly: false },
  { day: 2, normal: 105, actual: 107, anomaly: false },
  { day: 3, normal: 110, actual: 108, anomaly: false },
  { day: 4, normal: 115, actual: 89, anomaly: true }, // Anomaly detected
  { day: 5, normal: 120, actual: 118, anomaly: false },
  { day: 6, normal: 125, actual: 156, anomaly: true }, // Positive anomaly
  { day: 7, normal: 130, actual: 132, anomaly: false }
]

export default function AIAnalytics() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [activeModels, setActiveModels] = useState<AIModel[]>([
    { name: 'نموذج التوقعات المالية', accuracy: 87.3, lastTrained: '2024-01-20', status: 'active', predictions: 1247 },
    { name: 'تحليل سلوك العملاء', accuracy: 92.1, lastTrained: '2024-01-19', status: 'active', predictions: 2156 },
    { name: 'كشف الشذوذ', accuracy: 89.5, lastTrained: '2024-01-18', status: 'active', predictions: 856 },
    { name: 'تحسين المبيعات', accuracy: 84.2, lastTrained: '2024-01-15', status: 'training', predictions: 567 }
  ])

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      const newInsights: AIInsight[] = [
        {
          id: '1',
          type: 'prediction',
          title: 'نمو متوقع في المبيعات',
          description: 'بناءً على البيانات الحالية، من المتوقع زيادة المبيعات بنسبة 18.5% خلال الشهرين القادمين',
          confidence: 87,
          impact: 'high',
          priority: 1,
          actionable: true,
          data: mockPredictionData,
          recommendation: 'زيادة المخزون وتحضير حملة تسويقية',
          estimatedValue: 45000
        },
        {
          id: '2',
          type: 'anomaly',
          title: 'كشف شذوذ في نمط الطلبات',
          description: 'لوحظ انخفاض غير طبيعي في الطلبات يوم الخميس الماضي بنسبة 23%',
          confidence: 94,
          impact: 'medium',
          priority: 2,
          actionable: true,
          data: anomalyData,
          recommendation: 'فحص المشاكل التقنية أو العروض المنافسة'
        },
        {
          id: '3',
          type: 'opportunity',
          title: 'فرصة تحسين معدل التحويل',
          description: 'يمكن تحسين معدل التحويل بـ 15% عبر تحسين صفحات المنتجات',
          confidence: 82,
          impact: 'high',
          priority: 1,
          actionable: true,
          recommendation: 'تحديث صفحات المنتجات وتحسين الصور',
          estimatedValue: 28000
        },
        {
          id: '4',
          type: 'warning',
          title: 'انخفاض في رضا العملاء الجدد',
          description: 'معدل رضا العملاء الجدد انخفض إلى 3.9/5 مقارنة بـ 4.2 الشهر السابق',
          confidence: 91,
          impact: 'high',
          priority: 1,
          actionable: true,
          recommendation: 'تحسين عملية الإعداد الأولي للعملاء الجدد'
        },
        {
          id: '5',
          type: 'optimization',
          title: 'تحسين أوقات الذروة',
          description: 'يمكن زيادة الإيرادات بـ 12% عبر تعديل استراتيجية التسعير في أوقات الذروة',
          confidence: 78,
          impact: 'medium',
          priority: 3,
          actionable: true,
          recommendation: 'تطبيق تسعير ديناميكي في الساعات 6-9 مساءً',
          estimatedValue: 15000
        },
        {
          id: '6',
          type: 'prediction',
          title: 'توقع موسم الذروة',
          description: 'من المتوقع زيادة كبيرة في الطلب خلال الأسبوع الأول من الشهر القادم',
          confidence: 85,
          impact: 'high',
          priority: 2,
          actionable: true,
          recommendation: 'زيادة طاقة الخادم وتحضير فريق الدعم',
          estimatedValue: 35000
        }
      ]
      setInsights(newInsights.sort((a, b) => a.priority - b.priority))
    }

    generateInsights()
  }, [])

  const runAIAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate new insights
    const newInsight: AIInsight = {
      id: Math.random().toString(),
      type: 'opportunity',
      title: 'فرصة جديدة مكتشفة',
      description: 'اكتشف النظام فرصة لزيادة المبيعات من خلال استهداف العملاء غير النشطين',
      confidence: 89,
      impact: 'high',
      priority: 1,
      actionable: true,
      recommendation: 'إرسال حملة استهداف للعملاء غير النشطين',
      estimatedValue: 22000
    }
    
    setInsights(prev => [newInsight, ...prev])
    setIsAnalyzing(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp
      case 'anomaly': return AlertTriangle
      case 'opportunity': return Lightbulb
      case 'warning': return AlertTriangle
      case 'optimization': return Zap
      default: return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-500'
      case 'anomaly': return 'text-red-500'
      case 'opportunity': return 'text-green-500'
      case 'warning': return 'text-orange-500'
      case 'optimization': return 'text-purple-500'
      default: return 'text-stone-500'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">التحليلات الذكية</h2>
            <p className="text-stone-600">رؤى مدعومة بالذكاء الاصطناعي لتحسين الأداء</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            AI مدعوم
          </Badge>
        </div>

        <Button 
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              تحليل جاري...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              تشغيل تحليل جديد
            </div>
          )}
        </Button>
      </div>

      {/* AI Models Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeModels.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    model.status === 'active' ? 'bg-green-500' :
                    model.status === 'training' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <Badge variant="outline" className="text-xs">
                    {model.accuracy}% دقة
                  </Badge>
                </div>
                <h3 className="font-medium text-sm text-stone-900 mb-1">{model.name}</h3>
                <p className="text-xs text-stone-600">{model.predictions.toLocaleString()} توقع</p>
                <div className="mt-2">
                  <Progress value={model.accuracy} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                الرؤى الذكية
                <Badge variant="destructive">{insights.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {insights.map((insight, index) => {
                    const IconComponent = getInsightIcon(insight.type)
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border border-stone-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedInsight(insight)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-stone-50 ${getInsightColor(insight.type)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-stone-900 text-sm">{insight.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={getImpactColor(insight.impact)}>
                                  {insight.impact === 'high' ? 'عالي' : insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {insight.confidence}% ثقة
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-stone-600 mb-2">{insight.description}</p>
                            {insight.estimatedValue && (
                              <div className="flex items-center gap-2 text-xs">
                                <DollarSign className="w-3 h-3 text-green-500" />
                                <span className="text-green-600 font-medium">
                                  القيمة المتوقعة: {insight.estimatedValue.toLocaleString()} جنيه
                                </span>
                              </div>
                            )}
                            {insight.actionable && (
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-blue-600">قابل للتنفيذ</span>
                                <ArrowRight className="w-3 h-3 text-stone-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed View / Charts */}
        <div className="space-y-6">
          {/* Prediction Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                دقة التوقعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPredictionData.slice(0, 3).map((item, index) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.month}</span>
                      <span>{item.confidence}%</span>
                    </div>
                    <Progress value={item.confidence} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segment Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                توقعات شرائح العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegmentPredictions.map((segment, index) => (
                  <div key={segment.segment} className="p-3 bg-stone-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{segment.segment}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 text-xs font-medium">
                          +{segment.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>حالي: {segment.currentValue.toLocaleString()} ج</span>
                      <span>متوقع: {segment.predictedValue.toLocaleString()} ج</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-orange-600" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calculator className="w-4 h-4 ml-2" />
                  حساب ROI للحملات
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="w-4 h-4 ml-2" />
                  تحليل سلوك العملاء
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Star className="w-4 h-4 ml-2" />
                  تقييم جودة المنتجات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {React.createElement(getInsightIcon(selectedInsight.type), {
                    className: `w-6 h-6 ${getInsightColor(selectedInsight.type)}`
                  })}
                  <h3 className="text-xl font-bold">{selectedInsight.title}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedInsight(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-stone-700">{selectedInsight.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <Badge className={getImpactColor(selectedInsight.impact)}>
                    تأثير {selectedInsight.impact === 'high' ? 'عالي' : selectedInsight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                  </Badge>
                  <Badge variant="outline">
                    {selectedInsight.confidence}% مستوى الثقة
                  </Badge>
                  {selectedInsight.estimatedValue && (
                    <Badge className="bg-green-100 text-green-800">
                      {selectedInsight.estimatedValue.toLocaleString()} جنيه
                    </Badge>
                  )}
                </div>

                {selectedInsight.recommendation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      التوصية
                    </h4>
                    <p className="text-blue-700 text-sm">{selectedInsight.recommendation}</p>
                  </div>
                )}

                {selectedInsight.data && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">البيانات المرتبطة</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        {selectedInsight.type === 'prediction' ? (
                          <LineChart data={selectedInsight.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="actual" stroke="#82ca9d" />
                          </LineChart>
                        ) : (
                          <BarChart data={selectedInsight.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="normal" fill="#8884d8" />
                            <Bar dataKey="actual" fill="#82ca9d" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <CheckCircle className="w-4 h-4 ml-2" />
                    تطبيق التوصية
                  </Button>
                  <Button variant="outline">
                    <Clock className="w-4 h-4 ml-2" />
                    تذكيري لاحقاً
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
