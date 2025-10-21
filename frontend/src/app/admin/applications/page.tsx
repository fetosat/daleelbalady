'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Search, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Application {
  id: string
  businessName: string
  businessEmail: string
  businessPhone: string
  description?: string
  businessType: string
  status: string
  statusNotes?: string
  submittedAt: string
  applicant: {
    id: string
    name: string
    email: string
    phone?: string
  }
  documents: Array<{
    id: string
    documentType: string
    originalName: string
    fileUrl?: string
    isVerified: boolean
  }>
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [page, searchTerm, statusFilter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/applications?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        throw new Error('فشل في تحميل الطلبات')
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast.error('فشل في تحميل الطلبات')
      // Mock data for development
      setApplications([
        {
          id: '1',
          businessName: 'عيادة د. محمد الطبية',
          businessEmail: 'clinic.dr.mohammed@example.com',
          businessPhone: '+201234567890',
          description: 'عيادة طبية متخصصة في أمراض القلب والأوعية الدموية',
          businessType: 'طبي',
          status: 'PENDING',
          submittedAt: new Date(Date.now() - 172800000).toISOString(),
          applicant: {
            id: 'u1',
            name: 'د. محمد أحمد علي',
            email: 'dr.mohammed@example.com',
            phone: '+201234567890'
          },
          documents: [
            {
              id: 'd1',
              documentType: 'رخصة مزاولة الطب',
              originalName: 'medical_license.pdf',
              fileUrl: '/uploads/documents/medical_license.pdf',
              isVerified: true
            },
            {
              id: 'd2',
              documentType: 'الهوية الشخصية',
              originalName: 'national_id.pdf',
              fileUrl: '/uploads/documents/national_id.pdf',
              isVerified: false
            }
          ]
        },
        {
          id: '2',
          businessName: 'صالون الجمال النسائي',
          businessEmail: 'beauty.salon@example.com',
          businessPhone: '+201987654321',
          description: 'صالون تجميل نسائي متخصص في العناية بالبشرة والشعر',
          businessType: 'خدمات جمال',
          status: 'APPROVED',
          statusNotes: 'تم قبول الطلب بعد مراجعة جميع المستندات',
          submittedAt: new Date(Date.now() - 432000000).toISOString(),
          applicant: {
            id: 'u2',
            name: 'فاطمة محمد حسن',
            email: 'fatima.hassan@example.com',
            phone: '+201987654321'
          },
          documents: [
            {
              id: 'd3',
              documentType: 'رخصة تجارية',
              originalName: 'commercial_license.pdf',
              fileUrl: '/uploads/documents/commercial_license.pdf',
              isVerified: true
            }
          ]
        },
        {
          id: '3',
          businessName: 'ورشة تصليح السيارات',
          businessEmail: 'car.repair@example.com',
          businessPhone: '+201555666777',
          description: 'ورشة متخصصة في تصليح وصيانة المركبات',
          businessType: 'أوتوموتيف',
          status: 'REQUIRES_DOCUMENTS',
          statusNotes: 'يتطلب إرفاق شهادة الخبرة في مجال تصليح السيارات',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          applicant: {
            id: 'u3',
            name: 'عبدالله صالح',
            email: 'abdullah.saleh@example.com',
            phone: '+201555666777'
          },
          documents: [
            {
              id: 'd4',
              documentType: 'رخصة مزاولة النشاط',
              originalName: 'activity_license.pdf',
              fileUrl: '/uploads/documents/activity_license.pdf',
              isVerified: false
            }
          ]
        }
      ])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedApp || !reviewStatus) return
    
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: reviewStatus,
          statusNotes: reviewNotes
        })
      })
      
      if (response.ok) {
        toast.success('تم تحديث حالة الطلب بنجاح')
        setDialogOpen(false)
        setSelectedApp(null)
        setReviewStatus('')
        setReviewNotes('')
        fetchApplications()
      }
    } catch (error) {
      console.error('Failed to update application:', error)
      toast.error('فشل في تحديث الطلب')
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      PENDING: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      UNDER_REVIEW: { label: 'قيد المراجعة', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Eye },
      APPROVED: { label: 'موافق عليه', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      REJECTED: { label: 'مرفوض', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      REQUIRES_DOCUMENTS: { label: 'يتطلب مستندات', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle }
    }
    
    const cfg = config[status] || config.PENDING
    const Icon = cfg.icon
    
    return (
      <Badge className={cfg.className}>
        <Icon className="w-3 h-3 ml-1" />
        {cfg.label}
      </Badge>
    )
  }

  const openDetails = (app: Application) => {
    setSelectedApp(app)
    setReviewStatus(app.status)
    setReviewNotes(app.statusNotes || '')
    setDialogOpen(true)
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
            إدارة طلبات الأعمال
          </h1>
          <p className="text-stone-600 dark:text-stone-400">مراجعة والموافقة على طلبات مقدمي الخدمات</p>
        </div>

        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              >
                <option value="">جميع الحالات</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="UNDER_REVIEW">قيد المراجعة</option>
                <option value="APPROVED">موافق عليه</option>
                <option value="REJECTED">مرفوض</option>
                <option value="REQUIRES_DOCUMENTS">يتطلب مستندات</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{applications.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الطلبات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {applications.filter(a => a.status === 'PENDING').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">قيد الانتظار</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {applications.filter(a => a.status === 'APPROVED').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">موافق عليها</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {applications.filter(a => a.status === 'REJECTED').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">مرفوضة</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد طلبات</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <div className="flex-1">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{app.businessName}</div>
                      <div className="text-sm text-stone-500 dark:text-stone-400">
                        {app.applicant.name} • {app.businessEmail} • {app.businessPhone}
                      </div>
                      <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                        تاريخ التقديم: {new Date(app.submittedAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{app.businessType}</Badge>
                      {getStatusBadge(app.status)}
                      <Badge variant="secondary">{app.documents.length} مستند</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDetails(app)}
                        className="dark:text-stone-400 dark:hover:bg-stone-800"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
                <span className="text-sm text-stone-600 dark:text-stone-400">صفحة {page} من {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-3xl dark:bg-stone-900 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">تفاصيل طلب العمل</DialogTitle>
              <DialogDescription className="dark:text-stone-400">مراجعة الطلب والموافقة أو الرفض</DialogDescription>
            </DialogHeader>

            {selectedApp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">اسم العمل</Label>
                    <p className="text-stone-900 dark:text-stone-100 font-medium">{selectedApp.businessName}</p>
                  </div>
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">نوع العمل</Label>
                    <Badge variant="outline">{selectedApp.businessType}</Badge>
                  </div>
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">البريد الإلكتروني</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedApp.businessEmail}</p>
                  </div>
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">الهاتف</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedApp.businessPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-stone-600 dark:text-stone-400">مقدم الطلب</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedApp.applicant.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{selectedApp.applicant.email}</p>
                  </div>
                </div>

                {selectedApp.description && (
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">الوصف</Label>
                    <p className="text-stone-900 dark:text-stone-100 mt-1">{selectedApp.description}</p>
                  </div>
                )}

                <div>
                  <Label className="text-stone-600 dark:text-stone-400">المستندات المرفقة ({selectedApp.documents.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded dark:border-stone-700">
                        <div>
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{doc.originalName}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{doc.documentType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.isVerified && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              موثق
                            </Badge>
                          )}
                          {doc.fileUrl && (
                            <Button size="sm" variant="outline" onClick={() => window.open(doc.fileUrl, '_blank')}>
                              عرض
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 dark:border-stone-800">
                  <Label htmlFor="status">تحديث الحالة</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger className="mt-2 dark:bg-stone-800 dark:border-stone-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                      <SelectItem value="UNDER_REVIEW">قيد المراجعة</SelectItem>
                      <SelectItem value="APPROVED">موافق عليه</SelectItem>
                      <SelectItem value="REJECTED">مرفوض</SelectItem>
                      <SelectItem value="REQUIRES_DOCUMENTS">يتطلب مستندات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="أضف ملاحظات حول قرارك..."
                    rows={3}
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                  <Button onClick={handleReview} className="bg-indigo-600 hover:bg-indigo-700">
                    حفظ التحديث
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

