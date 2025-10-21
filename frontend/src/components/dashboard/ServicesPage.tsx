import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    MoreVertical,
    PenSquare,
    Trash2,
    Search,
    RefreshCw,
    Wrench,
    MapPin,
    DollarSign,
    Calendar,
    Star,
    Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAdminServices, type AdminService } from "@/api/admin";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import ProviderServicesPage from "./ProviderServicesPage";

export default function ServicesPage() {
    const { t } = useTranslation("dashboard");
    const { toast } = useToast();
    const { user } = useAuth();
    const [services, setServices] = useState<AdminService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cityFilter, setCityFilter] = useState<string>("all");
    const [availableFilter, setAvailableFilter] = useState<string>("all");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // For ADMIN and SHOP_OWNER, show the admin services management
    const fetchServices = async (page: number = 1, search?: string, city?: string, available?: string) => {
        try {
            setIsLoading(page === 1);
            setIsRefreshing(page !== 1);
            
            const availableBool = available === "available" ? true : available === "unavailable" ? false : undefined;
            const response = await getAdminServices(
                page, 
                20, 
                search, 
                city === 'all' ? undefined : city,
                availableBool
            );
            
            setServices(response.data || response.services || []);
            setTotalPages(response.pagination?.pages || 1);
            setCurrentPage(page);
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to load services');
            toast({
                title: "Error",
                description: "Failed to load services. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleSearch = () => {
        fetchServices(1, searchQuery, cityFilter === 'all' ? undefined : cityFilter, availableFilter === 'all' ? undefined : availableFilter);
    };

    const handleCityFilterChange = (city: string) => {
        setCityFilter(city);
        fetchServices(1, searchQuery, city === 'all' ? undefined : city, availableFilter === 'all' ? undefined : availableFilter);
    };

    const handleAvailableFilterChange = (available: string) => {
        setAvailableFilter(available);
        fetchServices(1, searchQuery, cityFilter === 'all' ? undefined : cityFilter, available === 'all' ? undefined : available);
    };

    const handlePageChange = (page: number) => {
        fetchServices(page, searchQuery, cityFilter === 'all' ? undefined : cityFilter, availableFilter === 'all' ? undefined : availableFilter);
    };

    useEffect(() => {
        if (user?.role !== 'PROVIDER') {
            fetchServices();
        }
    }, [user]);

    // If user is a PROVIDER, show the provider-specific services page
    if (user?.role === 'PROVIDER') {
        return <ProviderServicesPage />;
    }

    if (isLoading && services.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error && services.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => fetchServices()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Get unique cities for filter
    const uniqueCities = Array.from(new Set(services.map(service => service.city).filter(Boolean)));

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6 bg-background"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('admin.servicesManagement')}</h1>
                    <p className="text-muted-foreground">{t('admin.servicesManagementDesc')}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.servicesList')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('admin.searchServices')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-8"
                                />
                            </div>
                            <Button onClick={handleSearch} variant="outline">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                            
                            <Select value={cityFilter} onValueChange={handleCityFilterChange}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Cities</SelectItem>
                                    {uniqueCities.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Select value={availableFilter} onValueChange={handleAvailableFilterChange}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Availability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="unavailable">Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button 
                                onClick={() => fetchServices(currentPage, searchQuery, cityFilter === 'all' ? undefined : cityFilter, availableFilter === 'all' ? undefined : availableFilter)} 
                                variant="outline" 
                                size="icon"
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin.service')}</TableHead>
                                    <TableHead>{t('admin.provider')}</TableHead>
                                    <TableHead>{t('admin.shop')}</TableHead>
                                    <TableHead>{t('admin.location')}</TableHead>
                                    <TableHead>{t('admin.price')}</TableHead>
                                    <TableHead>{t('admin.availability')}</TableHead>
                                    <TableHead>{t('admin.bookings')}</TableHead>
                                    <TableHead>{t('admin.createdAt')}</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">
                                                    {searchQuery || cityFilter !== 'all' || availableFilter !== 'all' 
                                                        ? 'No services found matching your filters.'
                                                        : 'No services found.'
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {service.translation?.name_en || 'N/A'}
                                                    </span>
                                                    {service.translation?.description_en && (
                                                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                            {service.translation.description_en}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {service.ownerUser ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{service.ownerUser.name}</span>
                                                        <span className="text-sm text-muted-foreground">{service.ownerUser.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {service.shop ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{service.shop.name}</span>
                                                        {service.shop.isVerified && (
                                                            <Badge variant="default" className="text-xs">
                                                                Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Independent</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {service.city && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{service.city}</span>
                                                    </div>
                                                )}
                                                {service.locationLat && service.locationLon && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {service.locationLat.toFixed(4)}, {service.locationLon.toFixed(4)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {service.price && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {service.price} {service.currency}
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={service.available ? 'default' : 'secondary'}
                                                    className="font-medium"
                                                >
                                                    {service.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-medium">{service._count.bookings}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem>
                                                            <PenSquare className="mr-2 h-4 w-4" />
                                                            Edit Service
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isRefreshing}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isRefreshing}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                    
                </CardContent>
            </Card>
        </motion.div>
    );
}
