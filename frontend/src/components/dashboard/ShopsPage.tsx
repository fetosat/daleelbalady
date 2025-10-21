import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Store,
    RefreshCw,
    MapPin,
    Phone,
    Mail,
    Eye,
    Package,
    Wrench,
    Clock,
    Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { provider, categories as categoriesApi } from "@/lib/api";
import { debugUserRole, canAccessProviderFeatures, getProviderFeatureErrorMessage } from "@/utils/roleUtils";
import RoleUpgradeCard from "@/components/ui/RoleUpgradeCard";
import { MapPicker } from "@/components/ui/MapPicker";
import { ImageUploader, MultiImageUploader } from "@/components/ui/ImageUploader";

interface Shop {
    id: string;
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    email?: string;
    city: string;
    isVerified: boolean;
    locationLat?: number;
    locationLon?: number;
    createdAt: string;
    updatedAt: string;
    address?: {
        text_en: string;
        text_ar: string;
    };
    design?: {
        name: string;
        slug: string;
    };
    _count: {
        services: number;
        products: number;
        reviews: number;
    };
}

interface CreateShopFormData {
    name: string;
    description: string;
    phone: string;
    email: string;
    whatsapp?: string;
    website?: string;
    city: string;
    area?: string;
    address_en: string;
    address_ar: string;
    designSlug: string;
    locationLat?: string;
    locationLon?: string;
    category?: string;
    serviceType?: string;
    workingDays?: string[];
    openingHours?: string;
    closingHours?: string;
    logo?: string;
    coverImage?: string;
    images?: string[];
}

export default function ShopsPage() {
    const { t } = useTranslation("dashboard");
    const { toast } = useToast();
    const { user } = useAuth();
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [categories, setCategories] = useState<Array<{id: string; name: string; slug: string}>>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<CreateShopFormData>({
        name: '',
        description: '',
        phone: '',
        email: '',
        whatsapp: '',
        website: '',
        city: '',
        area: '',
        address_en: '',
        address_ar: '',
        designSlug: 'medical',
        locationLat: '',
        locationLon: '',
        category: '',
        serviceType: '',
        workingDays: [],
        openingHours: '09:00',
        closingHours: '18:00',
        logo: '',
        coverImage: '',
        images: []
    });

    const fetchShops = async () => {
        try {
            setIsLoading(true);
            
            console.log('🔄 [ShopsPage] Fetching shops...');
            debugUserRole(user);
            
            // Check if user has the right permissions before making API call
            if (!user) {
                console.log('⚠️ [ShopsPage] User not logged in, skipping fetch');
                setError('User not logged in');
                return;
            }
            
            if (!canAccessProviderFeatures(user.role)) {
                console.log('⚠️ [ShopsPage] User role not eligible:', user.role);
                const errorMessage = getProviderFeatureErrorMessage(user.role);
                setError(errorMessage);
                return;
            }
            
            const data = await provider.getShops();
            console.log('✅ [ShopsPage] Successfully fetched shops:', data);
            setShops(data.shops || []);
            setError(null);
        } catch (err: any) {
            console.error('❌ [ShopsPage] Error fetching shops:', err);
            setError(err.message || 'Failed to load shops');
            
            // Handle role-based errors with specific messaging
            if (err.message?.includes('providers can access') || err.message?.includes('Provider')) {
                toast({
                    title: "Access Denied",
                    description: err.message,
                    variant: "destructive"
                });
            } else if (err.message?.includes('not logged in')) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to access this feature.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: err.message || "Failed to load shops. Please try again.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateShopFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            phone: '',
            email: '',
            whatsapp: '',
            website: '',
            city: '',
            area: '',
            address_en: '',
            address_ar: '',
            designSlug: 'medical',
            locationLat: '',
            locationLon: '',
            category: '',
            serviceType: '',
            workingDays: [],
            openingHours: '09:00',
            closingHours: '18:00',
            logo: '',
            coverImage: '',
            images: []
        });
        setValidationErrors({});
    };

    const handleCreateShop = async () => {
        try {
            setIsCreating(true);
            
            console.log('🔍 [Validation] Checking form data...', formData);
            
            // Clear previous validation errors
            const errors: Record<string, string> = {};
            
            // Validate required fields
            if (!formData.name.trim()) {
                errors.name = 'Shop name is required';
            }
            
            if (!formData.city.trim()) {
                errors.city = 'City is required';
            }
            
            if (!formData.phone.trim()) {
                errors.phone = 'Phone number is required';
            }
            
            if (!formData.description.trim()) {
                errors.description = 'Description is required';
            } else if (formData.description.length < 10) {
                errors.description = 'Description must be at least 10 characters';
            }
            
            // If there are validation errors, show them and return
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                const errorFields = Object.keys(errors);
                const missingFields = errorFields.map(field => {
                    switch(field) {
                        case 'name': return 'Shop Name';
                        case 'city': return 'City';
                        case 'phone': return 'Phone Number';
                        case 'description': return 'Description';
                        default: return field;
                    }
                }).join(', ');
                
                toast({
                    title: "⚠️ Missing Required Fields",
                    description: `Please fill in: ${missingFields}`,
                    variant: "destructive"
                });
                return;
            }
            
            // Clear validation errors if all is valid
            setValidationErrors({});
            console.log('✅ [Validation] All required fields valid');
            
            console.log('🔄 Sending shop data to API...');
            const data = await provider.createShop(formData);
            console.log('✅ Shop created successfully:', data);
            
            toast({
                title: "Success",
                description: data.message || "Shop created successfully!"
            });
            
            setIsCreateModalOpen(false);
            resetForm();
            fetchShops();
            
        } catch (err: any) {
            console.error('❌ Error creating shop:', err);
            console.error('❌ Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            
            // Handle specific error types from the API
            if (err.message?.includes('subscription')) {
                toast({
                    title: "Subscription Required",
                    description: err.message,
                    variant: "destructive"
                });
                return;
            }
            
            if (err.message?.includes('upgrade') || err.message?.includes('Basic plan')) {
                toast({
                    title: "Upgrade Required",
                    description: err.message,
                    variant: "destructive"
                });
                return;
            }
            
            // Handle validation errors
            if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
                const errorMessage = err.response.data.details.join(', ');
                toast({
                    title: "Validation Error",
                    description: errorMessage,
                    variant: "destructive"
                });
                return;
            }
            
            toast({
                title: "Error",
                description: err.response?.data?.message || err.message || "Failed to create shop. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        if (user && canAccessProviderFeatures(user.role)) {
            fetchShops();
            loadCategories();
        } else if (user) {
            setIsLoading(false);
        }
    }, [user]);
    
    const loadCategories = async () => {
        try {
            const response = await categoriesApi.getAll();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    // Check if user has permission to access provider features
    if (user && !canAccessProviderFeatures(user.role)) {
        return (
            <div className="p-6 bg-background">
                <div className="max-w-2xl mx-auto">
                    <RoleUpgradeCard 
                        currentRole={user.role} 
                        onUpgradeComplete={() => {
                            // Reload the page to fetch shops with new role
                            window.location.reload();
                        }}
                    />
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error && !error.includes('Provider')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => fetchShops()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6 bg-background"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Shops</h1>
                    <p className="text-muted-foreground">Manage your shops and create new ones</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Shop
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Shop</DialogTitle>
                            <DialogDescription>
                                Create a new shop to start selling your services and products.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">Basic Information</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Shop Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter shop name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="general">Loading...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe your shop and what you offer (min 10 characters)"
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2 pt-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">Contact Information</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone" className={validationErrors.phone ? 'text-red-500' : ''}>Phone *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            handleInputChange('phone', e.target.value);
                                            if (validationErrors.phone) {
                                                setValidationErrors(prev => ({ ...prev, phone: '' }));
                                            }
                                        }}
                                        placeholder="Enter phone number"
                                        required
                                        className={validationErrors.phone ? 'border-red-500' : ''}
                                    />
                                    {validationErrors.phone && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input
                                        id="whatsapp"
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                        placeholder="WhatsApp number (optional)"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://example.com (optional)"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city" className={validationErrors.city ? 'text-red-500' : ''}>City *</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => {
                                            handleInputChange('city', e.target.value);
                                            if (validationErrors.city) {
                                                setValidationErrors(prev => ({ ...prev, city: '' }));
                                            }
                                        }}
                                        placeholder="Enter city"
                                        required
                                        className={validationErrors.city ? 'border-red-500' : ''}
                                    />
                                    {validationErrors.city && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="area">Area/District</Label>
                                    <Input
                                        id="area"
                                        value={formData.area}
                                        onChange={(e) => handleInputChange('area', e.target.value)}
                                        placeholder="Enter area or district"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address_en">Address (English)</Label>
                                <Input
                                    id="address_en"
                                    value={formData.address_en}
                                    onChange={(e) => handleInputChange('address_en', e.target.value)}
                                    placeholder="Enter address in English"
                                />
                            </div>

                            <div>
                                <Label htmlFor="address_ar">Address (Arabic)</Label>
                                <Input
                                    id="address_ar"
                                    value={formData.address_ar}
                                    onChange={(e) => handleInputChange('address_ar', e.target.value)}
                                    placeholder="Enter address in Arabic"
                                    dir="rtl"
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Working Hours
                                </h4>
                            </div>
                            
                            <div>
                                <Label className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Working Days
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                        <Button
                                            key={day}
                                            type="button"
                                            variant={formData.workingDays?.includes(day) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                const current = formData.workingDays || [];
                                                const updated = current.includes(day)
                                                    ? current.filter(d => d !== day)
                                                    : [...current, day];
                                                setFormData(prev => ({ ...prev, workingDays: updated }));
                                            }}
                                            className="text-xs"
                                        >
                                            {day.slice(0, 3)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="openingHours">Opening Time</Label>
                                    <Input
                                        id="openingHours"
                                        type="time"
                                        value={formData.openingHours}
                                        onChange={(e) => handleInputChange('openingHours', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="closingHours">Closing Time</Label>
                                    <Input
                                        id="closingHours"
                                        type="time"
                                        value={formData.closingHours}
                                        onChange={(e) => handleInputChange('closingHours', e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">Design & Theme</h4>
                            </div>
                            
                            <div>
                                <Label htmlFor="designSlug">Design Theme</Label>
                                <Select value={formData.designSlug} onValueChange={(value) => handleInputChange('designSlug', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a design theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="medical">Medical</SelectItem>
                                        <SelectItem value="beauty">Beauty</SelectItem>
                                        <SelectItem value="automotive">Automotive</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 pt-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">Shop Location</h4>
                            </div>
                            
                            <MapPicker
                                defaultLat={parseFloat(formData.locationLat || '30.0444')}
                                defaultLng={parseFloat(formData.locationLon || '31.2357')}
                                onLocationSelect={(lat, lng) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        locationLat: lat.toString(),
                                        locationLon: lng.toString()
                                    }));
                                }}
                            />
                            
                            <div className="space-y-2 pt-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">Shop Images</h4>
                            </div>
                            
                            <ImageUploader
                                label="Shop Logo"
                                currentImage={formData.logo}
                                aspectRatio="aspect-square"
                                onUpload={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                            />
                            
                            <ImageUploader
                                label="Cover Image"
                                currentImage={formData.coverImage}
                                aspectRatio="aspect-video"
                                onUpload={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                            />
                            
                            <MultiImageUploader
                                label="Shop Gallery (3-10 images)"
                                currentImages={formData.images}
                                maxImages={10}
                                onUpload={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateShop} disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Store className="w-4 h-4 mr-2" />
                                        Create Shop
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Shops ({shops.length})</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage and view all your shops
                        </p>
                    </div>
                    <Button onClick={fetchShops} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {shops.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Store className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No shops yet</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                                Create your first shop to start offering services and products to customers.
                            </p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Shop
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shop Name</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Services</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Design</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shops.map((shop) => (
                                        <TableRow key={shop.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{shop.name}</div>
                                                    {shop.description && (
                                                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                            {shop.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {shop.city}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {shop.phone && (
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="w-3 h-3 mr-1" />
                                                            {shop.phone}
                                                        </div>
                                                    )}
                                                    {shop.email && (
                                                        <div className="flex items-center text-sm">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {shop.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={shop.isVerified ? "default" : "secondary"}>
                                                    {shop.isVerified ? "Verified" : "Pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Wrench className="w-4 h-4 mr-1" />
                                                    {shop._count.services}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Package className="w-4 h-4 mr-1" />
                                                    {shop._count.products}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {shop.design && (
                                                    <Badge variant="outline">
                                                        {shop.design.name}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(shop.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => window.open(`/shop/${shop.slug}`, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
