import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Package,
  DollarSign,
  Eye,
  EyeOff,
  Search,
  Filter,
  Upload,
  Image as ImageIcon,
  Save,
  Copy,
  MoreVertical,
  TrendingUp,
  Users,
  ShoppingCart,
  AlertCircle,
  Crown,
  Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { provider, tags } from '@/lib/api';
import { uploadMultipleImages } from '@/utils/apiClient';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  currency: string;
  shopId: string;
  shop?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{ id: string; name: string }>;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    sales: number;
    views: number;
    avgRating: number;
    totalReviews: number;
  };
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  isActive: boolean;
  shopId: string;
  images: File[];
}

interface Shop {
  id: string;
  name: string;
  slug: string;
}

export default function ProviderProductsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProPlan, setIsProPlan] = useState(false); // Check user's subscription
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    isActive: true,
    shopId: '',
    images: []
  });

  // Check subscription status
  useEffect(() => {
    console.log('🔍 Checking subscription status...');
    console.log('👤 User:', user);
    
    if (user) {
      // Try subscription field first (from auth API)
      const subscription = (user as any).subscription;
      // Also try providerSubscription field (from direct DB query)
      const providerSub = (user as any).providerSubscription;
      
      const sub = subscription || providerSub;
      
      console.log('📦 Subscription data:', sub);
      
      if (sub) {
        // Check if plan allows product listings
        const canList = sub.canListProducts === true;
        // Or check if it's a top tier plan
        const planType = sub.planType;
        const isTopTier = ['TOP_BRONZE', 'TOP_SILVER', 'TOP_GOLD', 'PRODUCTS_PREMIUM'].includes(planType);
        const hasFeature = canList || isTopTier;
        
        console.log('✅ Subscription check:', {
          planType,
          canListProducts: sub.canListProducts,
          isTopTier,
          hasFeature
        });
        
        setIsProPlan(hasFeature);
      } else {
        console.log('❌ No subscription found');
        setIsProPlan(false);
      }
    }
  }, [user]);

  // Fetch shops for the dropdown
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await provider.getShops();
        if (response.shops && Array.isArray(response.shops)) {
          setShops(response.shops);
          // Set first shop as default if available
          if (response.shops.length > 0 && !formData.shopId) {
            setFormData(prev => ({ ...prev, shopId: response.shops[0].id }));
          }
        }
      } catch (error: any) {
        console.error('Error fetching shops:', error);
        toast({
          title: 'Error',
          description: 'Failed to load shops.',
          variant: 'destructive'
        });
      }
    };
    fetchShops();
  }, []);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await tags.getAllTags();
        if (response.success && response.tags) {
          console.log('✅ Loaded', response.tags.length, 'categories from API');
          setCategories(response.tags);
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        // Fallback to empty array if API fails
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params: any = {};
        
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (activeFilter !== 'all') params.status = activeFilter;
        
        const response = await provider.getProducts(params);
        
        if (response.success && response.products) {
          console.log('✅ Fetched', response.products.length, 'products from backend');
          setProducts(response.products);
        } else {
          console.log('ℹ️ No products in response, setting empty array');
          setProducts([]);
        }
      } catch (error: any) {
        // If 404, it means no products exist - treat as empty state (not an error)
        if (error.message?.includes('404') || error.response?.status === 404) {
          console.log('ℹ️ No products found (404), showing empty state');
          setProducts([]);
        } else {
          // Only log and show error toast for actual errors, not for empty states
          console.error('Error fetching products:', error);
          toast({
            title: 'Error',
            description: 'Failed to load products. Please try again.',
            variant: 'destructive'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchQuery, selectedCategory, activeFilter, toast]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      isActive: true,
      shopId: shops.length > 0 ? shops[0].id : '',
      images: []
    });
  };

  const handleAddProduct = async () => {
    if (!isProPlan) {
      toast({
        title: 'Subscription Required',
        description: 'Product listings are available in Pro and Enterprise plans only.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Validate form - only name and price are required, shop is optional
      if (!formData.name || !formData.price) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (name and price).',
          variant: 'destructive'
        });
        return;
      }

      setIsSaving(true);

      // Upload images first if any
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(formData.images);
          console.log('✅ Images uploaded:', imageUrls);
        } catch (error) {
          console.error('Error uploading images:', error);
          toast({
            title: 'Warning',
            description: 'Failed to upload some images. Product will be created without images.',
            variant: 'destructive'
          });
        }
      }

      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku,
        isActive: formData.isActive,
        category: formData.category || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined
      };
      
      // Only include shopId if it exists
      if (formData.shopId) {
        productData.shopId = formData.shopId;
      }

      console.log('📤 Sending product data to backend:', JSON.stringify(productData, null, 2));
      const response = await provider.createProduct(productData);
      
      if (response.success) {
        // Refresh products list
        const productsResponse = await provider.getProducts();
        if (productsResponse.success) {
          setProducts(productsResponse.products);
        }
        
        setIsAddDialogOpen(false);
        resetForm();

        toast({
          title: 'Success',
          description: 'Product added successfully!',
        });
      }
    } catch (error: any) {
      console.error('❌ Error adding product:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to add product';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      setIsSaving(true);

      // Upload new images if any
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(formData.images);
          console.log('✅ Images uploaded:', imageUrls);
        } catch (error) {
          console.error('Error uploading images:', error);
        }
      }

      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku,
        isActive: formData.isActive,
        category: formData.category || undefined,
        ...(imageUrls.length > 0 && { images: imageUrls })
      };

      const response = await provider.updateProduct(selectedProduct.id, productData);
      
      if (response.success) {
        // Refresh products list
        const productsResponse = await provider.getProducts();
        if (productsResponse.success) {
          setProducts(productsResponse.products);
        }
        
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        resetForm();

        toast({
          title: 'Success',
          description: 'Product updated successfully!',
        });
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await provider.deleteProduct(product.id);
      
      if (response.success) {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        toast({
          title: 'Success',
          description: 'Product deleted successfully!',
        });
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const response = await provider.toggleProductStatus(product.id);
      
      if (response.success) {
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, isActive: !p.isActive } : p
        ));
        
        toast({
          title: 'Success',
          description: response.message || `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    const category = product.tags && product.tags.length > 0 ? product.tags[0].name : '';
    setFormData({
      name: product.name,
      category,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      sku: product.sku || '',
      isActive: product.isActive,
      shopId: product.shopId,
      images: []
    });
    setIsEditDialogOpen(true);
  };

  // Note: Filtering is now done on the server side via API params
  // This is just for display purposes if we want client-side filtering
  const filteredProducts = products;

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    totalSales: products.reduce((sum, p) => sum + (p.stats?.sales || 0), 0),
    totalViews: products.reduce((sum, p) => sum + (p.stats?.views || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + ((p.stats?.sales || 0) * p.price), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المنتجات</h1>
          <p className="text-muted-foreground">
            إدارة منتجاتك وعرضها للعملاء
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isProPlan && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Crown className="w-3 h-3 mr-1" />
              يتطلب الخطة المدفوعة
            </Badge>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isProPlan}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <ProductFormDialog
              title="إضافة منتج جديد"
              formData={formData}
              setFormData={setFormData}
              onSave={handleAddProduct}
              onCancel={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              shops={shops}
              categories={categories}
              isSaving={isSaving}
            />
          </Dialog>
        </div>
      </div>

      {/* Subscription Alert */}
      {!isProPlan && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                قوائم المنتجات متاحة في الخطط المدفوعة فقط. ترقية حسابك لإضافة وإدارة منتجاتك.
              </span>
              <Button size="sm" variant="outline">
                ترقية الحساب
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المنتجات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نشط</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">غير نشط</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المبيعات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSales}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المشاهدات</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalViews}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalRevenue} جنيه</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={(value: any) => setActiveFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                {/* Product Image */}
                {product.images && product.images.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                    {product.images.length > 1 && (
                      <Badge className="absolute top-2 right-2 bg-black/60 text-white">
                        +{product.images.length - 1}
                      </Badge>
                    )}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {product.description}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">الفئة:</span>
                      <Badge variant="outline">
                        {t(`categories.${product.tags[0].name}`, product.tags[0].name)}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">السعر:</span>
                    <span className="font-semibold text-green-600">
                      {product.price} جنيه
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">المخزون:</span>
                    <span className={`font-medium ${
                      product.stock > 10 ? 'text-green-600' : 
                      product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {product.stock} قطعة
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">المبيعات:</span>
                      <p className="font-medium">{product.stats?.sales || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المشاهدات:</span>
                      <p className="font-medium">{product.stats?.views || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      تعديل
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={product.isActive ? "secondary" : "default"}
                      onClick={() => toggleProductStatus(product)}
                    >
                      {product.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' || activeFilter !== 'all'
                ? 'لم يتم العثور على منتجات تطابق المرشحات المحددة'
                : 'لم تقم بإضافة أي منتجات بعد'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && activeFilter === 'all' && isProPlan && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة منتج جديد
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ProductFormDialog
          title="تعديل المنتج"
          formData={formData}
          setFormData={setFormData}
          onSave={handleEditProduct}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setSelectedProduct(null);
            resetForm();
          }}
          shops={shops}
          categories={categories}
          isSaving={isSaving}
        />
      </Dialog>
    </div>
  );
}

// Product Form Dialog Component
interface ProductFormDialogProps {
  title: string;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSave: () => void;
  onCancel: () => void;
  shops: Shop[];
  categories: Array<{ id: string; name: string }>;
  isSaving: boolean;
}

function ProductFormDialog({ title, formData, setFormData, onSave, onCancel, shops, categories, isSaving }: ProductFormDialogProps) {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };
  
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          املأ المعلومات التالية لإضافة منتج جديد
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Shop selection - optional */}
        {shops.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="shopId">المتجر (اختياري)</Label>
            <Select value={formData.shopId || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, shopId: value === 'none' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر متجر أو اتركه فارغاً" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون متجر محدد</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              يمكنك ترك هذا الحقل فارغاً وسيتم إنشاء متجر افتراضي تلقائياً
            </p>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لا توجد متاجر حالياً. سيتم إنشاء متجر افتراضي لك تلقائياً عند إضافة المنتج.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المنتج *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسم المنتج"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر فئة المنتج" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="أخرى">أخرى</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="وصف تفصيلي للمنتج"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">السعر *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">المخزون</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">رقم المنتج (SKU)</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="PROD-001"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">منتج نشط</Label>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <Label>صور المنتج</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-200 rounded-lg p-6 text-center cursor-pointer hover:border-stone-300 transition"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-stone-400" />
            <p className="text-sm text-stone-600">اسحب الصور هنا أو انقر لتحديدها</p>
            <p className="text-xs text-stone-400 mt-1">PNG, JPG, JPEG حتى 10MB</p>
          </div>
          
          {/* Image preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          إلغاء
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
