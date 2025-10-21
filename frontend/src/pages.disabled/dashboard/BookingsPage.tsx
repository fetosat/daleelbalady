import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    AlertCircle,
    Filter,
    RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCustomerBookings, cancelBooking, type Booking, type BookingsResponse } from "@/api/bookings";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BookingsPage() {
    const { t } = useTranslation("dashboard");
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

    const fetchBookings = async (page: number = 1, status?: string) => {
        try {
            setIsLoading(page === 1);
            setIsRefreshing(page !== 1);
            const response: BookingsResponse = await getCustomerBookings(page, 10, status);
            setBookings(response.bookings);
            setTotalPages(response.pagination.pages);
            setCurrentPage(page);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
            toast({
                title: "Error",
                description: "Failed to load bookings. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        try {
            setCancellingBookingId(bookingId);
            await cancelBooking(bookingId);
            toast({
                title: "Success",
                description: "Booking cancelled successfully"
            });
            // Refresh bookings
            fetchBookings(currentPage, statusFilter === 'all' ? undefined : statusFilter);
        } catch (err) {
            console.error('Error cancelling booking:', err);
            toast({
                title: "Error",
                description: "Failed to cancel booking. Please try again.",
                variant: "destructive"
            });
        } finally {
            setCancellingBookingId(null);
        }
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        fetchBookings(1, status === 'all' ? undefined : status);
    };

    const handlePageChange = (page: number) => {
        fetchBookings(page, statusFilter === 'all' ? undefined : statusFilter);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusBadge = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED':
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t("bookings.confirmed")}
                    </Badge>
                );
            case 'PENDING':
                return (
                    <Badge variant="secondary">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {t("bookings.pending")}
                    </Badge>
                );
            case 'CANCELLED':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        {t("bookings.cancelled")}
                    </Badge>
                );
            case 'COMPLETED':
                return (
                    <Badge className="bg-blue-500">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t("bookings.completed")}
                    </Badge>
                );
            case 'NO_SHOW':
                return (
                    <Badge variant="outline">
                        <XCircle className="w-4 h-4 mr-1" />
                        {t("bookings.noShow")}
                    </Badge>
                );
        }
    };

    if (isLoading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => fetchBookings()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
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
                className="flex justify-between items-center"
            >
                <h1 className="text-2xl font-bold">{t("bookings.title")}</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => fetchBookings(currentPage, statusFilter === 'all' ? undefined : statusFilter)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {/* Bookings List */}
            <div className="grid gap-6">
                {bookings.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                                <p className="text-stone-500">No bookings found</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    bookings.map((booking, index) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {booking.serviceName}
                                                {booking.bookingRef && (
                                                    <Badge variant="outline" className="text-xs">
                                                        #{booking.bookingRef}
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.shopName}
                                            </p>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{new Date(booking.startAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {booking.shopAddress && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>{booking.shopAddress}, {booking.shopCity}</span>
                                                </div>
                                            )}
                                            {booking.price && (
                                                <div className="text-lg font-semibold text-green-600">
                                                    {booking.price} {booking.currency}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {booking.serviceDescription && (
                                                <div>
                                                    <p className="font-medium mb-1">Service Details</p>
                                                    <p className="text-sm text-muted-foreground">{booking.serviceDescription}</p>
                                                </div>
                                            )}
                                            {booking.shopPhone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{booking.shopPhone}</span>
                                                </div>
                                            )}
                                            {booking.notes && (
                                                <div>
                                                    <p className="font-medium mb-1">Notes</p>
                                                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        disabled={cancellingBookingId === booking.id}
                                                    >
                                                        {cancellingBookingId === booking.id ? (
                                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        {t("bookings.cancel")}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel this booking? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>No, keep booking</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelBooking(booking.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Yes, cancel booking
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isRefreshing}
                    >
                        Previous
                    </Button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isRefreshing}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
