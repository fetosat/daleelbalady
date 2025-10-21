'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, Clock, MapPin, Phone, Star, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface Booking {
  id: string;
  bookingRef: string;
  serviceName: string;
  serviceDescription: string;
  shopName: string;
  shopPhone: string;
  shopCity: string;
  shopAddress: string;
  startAt: string;
  endAt: string;
  durationMins: number;
  status: string;
  price: number;
  currency: string;
  notes: string;
  createdAt: string;
}

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async (page = 1, status = '', search = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await api.get(`/dashboard/customer/bookings?${params.toString()}`);
      setBookings(response.data.bookings);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings(currentPage, statusFilter, searchTerm);
    }
  }, [user, currentPage, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary' as const, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      'CONFIRMED': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-100' },
      'COMPLETED': { variant: 'outline' as const, color: 'text-blue-600', bg: 'bg-blue-100' },
      'CANCELLED': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-100' },
      'NO_SHOW': { variant: 'secondary' as const, color: 'text-stone-600', bg: 'bg-stone-100' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant} className={`${config.bg} ${config.color}`}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CANCELLED':
        return <X className="h-4 w-4 text-red-600" />;
      case 'COMPLETED':
        return <Star className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-stone-600" />;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.patch(`/dashboard/customer/bookings/${bookingId}/cancel`);
      fetchBookings(currentPage, statusFilter, searchTerm);
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    // Convert "all" back to empty string for API call
    const filterValue = status === 'all' ? '' : status;
    setStatusFilter(filterValue);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchBookings(1, statusFilter, searchTerm)}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Calendar className="h-8 w-8 mr-3" />
              My Bookings
            </h1>
            <p className="text-blue-100">
              Manage and track all your service appointments
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{bookings.length}</p>
            <p className="text-blue-100">Total Bookings</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 h-4 w-4" />
          <Input
            placeholder="Search bookings by service, shop, or reference..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(booking.status)}
                        <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-stone-600">Reference Number</p>
                          <p className="font-medium">#{booking.bookingRef}</p>
                        </div>
                        <div>
                          <p className="text-sm text-stone-600">Price</p>
                          <p className="font-semibold text-lg text-green-600">{booking.price} {booking.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-stone-600">Date & Time</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <p className="font-medium">{new Date(booking.startAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-stone-600">Duration</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <p className="font-medium">{booking.durationMins} minutes</p>
                          </div>
                        </div>
                      </div>

                      {/* Shop Info */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2 text-stone-800">Service Provider</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-stone-500" />
                            <div>
                              <p className="font-medium">{booking.shopName}</p>
                              <p className="text-stone-600">{booking.shopCity}</p>
                            </div>
                          </div>
                          {booking.shopPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-stone-500" />
                              <p>{booking.shopPhone}</p>
                            </div>
                          )}
                          {booking.shopAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-stone-500" />
                              <p className="text-stone-600">{booking.shopAddress}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Service Description */}
                      {booking.serviceDescription && (
                        <div className="mt-3 p-3 bg-stone-50 rounded-lg">
                          <p className="text-sm text-stone-700">{booking.serviceDescription}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-40">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                      {booking.status === 'PENDING' && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button variant="outline" size="sm" className="w-full">
                          Reschedule
                        </Button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Star className="h-4 w-4 mr-1" />
                          Rate Service
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="w-full">
                        Book Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <Calendar className="h-16 w-16 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 mb-2">No Bookings Found</h3>
            <p className="text-stone-500 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'You haven\'t made any bookings yet'}
            </p>
            {!searchTerm && !statusFilter && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                Book a Service
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-2"
        >
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
              className="w-10"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
}
