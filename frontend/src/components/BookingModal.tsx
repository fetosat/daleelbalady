'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { API_BASE } from '@/utils/env'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  service: {
    id: string
    name: string
    translation?: {
      name_ar?: string
      name_en?: string
      description_ar?: string
      description_en?: string
    }
    price: number
    currency?: string
    durationMins?: number
    provider?: {
      id: string
      name: string
      phone?: string
      email?: string
    }
  }
  onSuccess?: () => void
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookingModal({ isOpen, onClose, service, onSuccess }: BookingModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'datetime' | 'details' | 'confirm' | 'success'>('datetime')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: ''
  })

  // Generate time slots
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({ time, available: true })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Generate next 14 days
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const availableDates = generateDates()

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleNextStep = () => {
    if (step === 'datetime' && selectedDate && selectedTime) {
      setStep('details')
    } else if (step === 'details') {
      setStep('confirm')
    }
  }

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime) return

    setLoading(true)
    setError(null)

    try {
      // Create booking datetime
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const bookingDate = new Date(selectedDate)
      bookingDate.setHours(hours, minutes, 0, 0)

      // Calculate end time
      const endDate = new Date(bookingDate)
      endDate.setMinutes(endDate.getMinutes() + (service.durationMins || 60))

      // Make API call to backend
      const token = localStorage.getItem('daleel-token')
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: service.id,
          startAt: bookingDate.toISOString(),
          endAt: endDate.toISOString(),
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email || undefined,
          notes: formData.notes || undefined
        })
      })

      if (!response.ok) {
        let errorMessage = 'فشل في إنشاء الحجز'
        try {
          const errorData = await response.json()
          errorMessage = (errorData as any).error || (errorData as any).message || errorMessage
        } catch (e) {
          // If response is not JSON, use status text or default message
          console.error('Non-JSON error response:', response.status, response.statusText)
          if (response.status === 404) {
            errorMessage = 'لم يتم العثور على الخدمة'
          } else if (response.status === 401) {
            errorMessage = 'يجب تسجيل الدخول أولاً'
          } else if (response.status >= 500) {
            errorMessage = 'حدث خطأ في الخادم'
          }
        }
        throw new Error(errorMessage)
      }

      const booking = await response.json()
      console.log('✅ Booking created:', booking)

      setStep('success')
      
      // Call onSuccess callback after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 3000)

    } catch (err: any) {
      console.error('❌ Booking error:', err)
      setError(err.message || 'حدث خطأ أثناء إنشاء الحجز')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('datetime')
        setSelectedDate(null)
        setSelectedTime(null)
        setError(null)
        setFormData({
          name: user?.name || '',
          phone: user?.phone || '',
          email: user?.email || '',
          notes: ''
        })
      }, 300)
    }
  }, [isOpen, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center py-8">
        <Card className="w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">احجز موعدك</h2>
              <p className="text-blue-100 text-sm">
                {service.translation?.name_ar || service.translation?.name_en || service.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

          {/* Progress Steps */}
          <div className="bg-stone-50 dark:bg-stone-900 border-b dark:border-stone-700 px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { id: 'datetime', label: 'التاريخ والوقت', icon: Calendar },
              { id: 'details', label: 'البيانات', icon: User },
              { id: 'confirm', label: 'التأكيد', icon: CheckCircle2 }
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${step === s.id || (idx === 0 && step === 'success') ? 'text-blue-600' : 'text-stone-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step === s.id || (idx === 0 && step === 'success')
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-stone-300'
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium hidden sm:inline">{s.label}</span>
                </div>
                {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${idx === 0 && ['details', 'confirm', 'success'].includes(step) || idx === 1 && ['confirm', 'success'].includes(step) ? 'bg-blue-600' : 'bg-stone-300'}`} />}
              </div>
            ))}
          </div>
        </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white dark:bg-stone-800">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Step 1: Date and Time Selection */}
          {step === 'datetime' && (
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  اختر التاريخ
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-stone-700'
                    }`}
                    >
                      <div className="text-xs text-stone-500">
                        {formatDate(date).split(' ')[0]}
                      </div>
                      <div className="text-lg font-bold">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-stone-500">
                        {formatDate(date).split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    اختر الوقت
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedTime === slot.time
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : slot.available
                          ? 'border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-500 hover:scale-105 bg-white dark:bg-stone-700'
                          : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                      }`}
                      >
                        <div className="text-sm font-medium">{slot.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                معلومات الاتصال
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسمك"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي معلومات إضافية تود إضافتها..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                تأكيد الحجز
              </h3>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-blue-900">
                      {service.translation?.name_ar || service.translation?.name_en || service.name}
                    </h4>
                    {service.translation?.description_ar && (
                      <p className="text-sm text-stone-600">{service.translation.description_ar}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-xs text-stone-500">التاريخ</div>
                        <div className="font-medium">{selectedDate && formatFullDate(selectedDate)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-xs text-stone-500">الوقت</div>
                        <div className="font-medium">{selectedTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Phone className="w-4 h-4" />
                      <span>{formData.phone}</span>
                    </div>
                    {formData.email && (
                      <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{formData.email}</span>
                      </div>
                    )}
                  </div>

                  {service.price > 0 && (
                    <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600">السعر</span>
                        <div className="text-2xl font-bold text-blue-600">
                          {service.price} {service.currency || 'جنيه'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">تم الحجز بنجاح!</h3>
              <p className="text-stone-600 mb-6">
                سيتم التواصل معك قريباً لتأكيد الموعد
              </p>
              <div className="text-sm text-stone-500">
                جاري إغلاق النافذة...
              </div>
            </div>
          )}
        </div>

          {/* Footer */}
          {step !== 'success' && (
            <div className="sticky bottom-0 bg-stone-50 dark:bg-stone-900 border-t dark:border-stone-700 p-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'datetime') {
                  onClose()
                } else if (step === 'details') {
                  setStep('datetime')
                } else if (step === 'confirm') {
                  setStep('details')
                }
              }}
            >
              {step === 'datetime' ? 'إلغاء' : 'رجوع'}
            </Button>

            <Button
              onClick={step === 'confirm' ? handleSubmitBooking : handleNextStep}
              disabled={
                (step === 'datetime' && (!selectedDate || !selectedTime)) ||
                (step === 'details' && (!formData.name || !formData.phone)) ||
                loading
              }
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الحجز...
                </>
              ) : step === 'confirm' ? (
                'تأكيد الحجز'
              ) : (
                'التالي'
              )}
            </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

