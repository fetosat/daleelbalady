'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin, Phone, Mail } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';

interface Booking {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  service?: {
    translation?: {
      name: string;
    };
  };
  shop?: {
    name: string;
    city?: string;
  };
}

interface AnalyticsSummary {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

interface ProviderBookingsCalendarProps {
  bookings: Booking[];
  analytics: AnalyticsSummary;
  onRefresh?: () => void;
}

const statusColor = (status: string) => ({
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
}[status] || 'bg-stone-100 text-stone-700 border-stone-200');

const statusBadge = (status: string) => ({
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}[status] || status);

const AnalyticsCard: React.FC<{ title: string; value: number; color?: string }> = ({ title, value, color = 'text-stone-900' }) => (
  <motion.div
    className="bg-white shadow-sm rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-md transition-all border border-stone-100"
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <span className="text-stone-500 text-sm font-medium mb-1">{title}</span>
    <span className={`text-3xl font-bold ${color}`}>{value}</span>
  </motion.div>
);

export default function ProviderBookingsCalendar({ bookings, analytics, onRefresh }: ProviderBookingsCalendarProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const calendarDays = useMemo(() => {
    let days: Date[] = [];

    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      days = eachDayOfInterval({ start, end });
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      days = eachDayOfInterval({ start, end });
    } else {
      days = [currentDate];
    }

    return days.map(day => {
      const dayBookings = bookings.filter(booking => 
        isSameDay(new Date(booking.startAt), day)
      );
      
      return {
        date: day,
        label: format(day, viewMode === 'day' ? 'EEEE, MMM d, yyyy' : 'd'),
        fullLabel: format(day, 'MMM d, yyyy'),
        isCurrentMonth: isSameMonth(day, currentDate),
        isToday: isSameDay(day, new Date()),
        bookings: dayBookings,
      };
    });
  }, [bookings, currentDate, viewMode]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -7) : addDays(currentDate, 7));
    } else {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };

  const openBookingDrawer = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDrawer = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-blue-600" />
          My Bookings Calendar
        </h2>
        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-stone-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AnalyticsCard title="Total" value={analytics.total} color="text-stone-900" />
        <AnalyticsCard title="Confirmed" value={analytics.confirmed} color="text-emerald-600" />
        <AnalyticsCard title="Pending" value={analytics.pending} color="text-yellow-600" />
        <AnalyticsCard title="Completed" value={analytics.completed} color="text-blue-600" />
        <AnalyticsCard title="Cancelled" value={analytics.cancelled} color="text-red-600" />
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-stone-100">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h3 className="text-lg font-semibold text-stone-900">
          {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
          {viewMode === 'week' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
          {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <button
          onClick={() => navigateDate('next')}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-3 ${viewMode === 'month' ? 'grid-cols-7' : viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
        {/* Day Headers */}
        {viewMode !== 'day' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-stone-600 text-sm py-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map(day => (
          <motion.div
            key={day.date.toISOString()}
            className={`bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all border ${
              day.isToday ? 'border-blue-500 ring-2 ring-blue-100' : 'border-stone-200'
            } ${!day.isCurrentMonth && viewMode === 'month' ? 'opacity-40' : ''} min-h-[120px] ${
              viewMode === 'day' ? 'min-h-[400px]' : ''
            }`}
            whileHover={{ scale: viewMode === 'day' ? 1 : 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm font-semibold ${day.isToday ? 'text-blue-600' : 'text-stone-700'}`}>
                {viewMode === 'day' ? day.fullLabel : day.label}
              </div>
              {day.bookings.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {day.bookings.length}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px]">
              <AnimatePresence>
                {day.bookings.map(booking => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-2 rounded-lg text-xs cursor-pointer hover:scale-105 transition-transform border ${statusColor(booking.status)}`}
                    onClick={() => openBookingDrawer(booking)}
                  >
                    <div className="font-semibold truncate">
                      {booking.service?.translation?.name || 'Service'}
                    </div>
                    <div className="text-xs opacity-80 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(booking.startAt), 'h:mm a')}
                    </div>
                    <div className="text-xs opacity-80 truncate">
                      {booking.customerName}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Details Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeBookingDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-stone-900">Booking Details</h3>
                  <button
                    onClick={closeBookingDrawer}
                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl leading-none">&times;</span>
                  </button>
                </div>

                <div className={`p-4 rounded-lg border-2 ${statusColor(selectedBooking.status)}`}>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <div className="text-lg font-bold">{statusBadge(selectedBooking.status)}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-stone-500 mb-1">Service</div>
                    <div className="text-base font-semibold text-stone-900">
                      {selectedBooking.service?.translation?.name || 'N/A'}
                    </div>
                  </div>

                  {selectedBooking.shop && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Shop
                      </div>
                      <div className="text-base font-semibold text-stone-900">
                        {selectedBooking.shop.name}
                      </div>
                      {selectedBooking.shop.city && (
                        <div className="text-sm text-stone-600">{selectedBooking.shop.city}</div>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-stone-500 mb-1 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Customer
                    </div>
                    <div className="text-base font-semibold text-stone-900">
                      {selectedBooking.customerName}
                    </div>
                  </div>

                  {selectedBooking.customerPhone && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone
                      </div>
                      <a
                        href={`tel:${selectedBooking.customerPhone}`}
                        className="text-base font-medium text-blue-600 hover:underline"
                      >
                        {selectedBooking.customerPhone}
                      </a>
                    </div>
                  )}

                  {selectedBooking.customerEmail && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                      <a
                        href={`mailto:${selectedBooking.customerEmail}`}
                        className="text-base font-medium text-blue-600 hover:underline"
                      >
                        {selectedBooking.customerEmail}
                      </a>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-stone-500 mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </div>
                    <div className="text-base font-semibold text-stone-900">
                      {format(new Date(selectedBooking.startAt), 'MMM d, yyyy h:mm a')}
                      {' - '}
                      {format(new Date(selectedBooking.endAt), 'h:mm a')}
                    </div>
                  </div>

                  {selectedBooking.notes && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1">Notes</div>
                      <div className="text-base text-stone-700 bg-stone-50 p-3 rounded-lg">
                        {selectedBooking.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

