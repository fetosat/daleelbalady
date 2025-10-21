import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Settings,
  Package,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  DollarSign,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  getAllUserListings,
  getUserServices,
  getUserProducts,
  deleteUserService,
  deleteUserProduct,
  handleUserListingsError,
  type IndependentService,
  type IndependentProduct
} from '@/api/userListings';
import ServiceForm from '@/components/forms/ServiceForm';
import ProductForm from '@/components/forms/ProductForm';

const IndependentListingsPage: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [services, setServices] = useState<IndependentService[]>([]);
  const [products, setProducts] = useState<IndependentProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<IndependentService | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IndependentProduct | null>(null);
  
  // Dialog states
  const [deleteServiceDialog, setDeleteServiceDialog] = useState<string | null>(null);
  const [deleteProductDialog, setDeleteProductDialog] = useState<string | null>(null);
  
  // Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingService, setEditingService] = useState<IndependentService | null>(null);
  const [editingProduct, setEditingProduct] = useState<IndependentProduct | null>(null);

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getAllUserListings();
      setServices(data.services);
      setProducts(data.products);
    } catch (err: any) {
      console.error('Error fetching user listings:', err);
      setError(handleUserListingsError(err));
      toast({
        title: "Error",
        description: "Failed to load your listings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteUserService(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
      setDeleteServiceDialog(null);
      toast({
        title: "Success",
        description: "Service deleted successfully!"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: handleUserListingsError(err),
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteUserProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setDeleteProductDialog(null);
      toast({
        title: "Success",
        description: "Product deleted successfully!"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: handleUserListingsError(err),
        variant: "destructive"
      });
    }
  };

  // Form handlers
  const handleCreateService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (service: IndependentService) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: IndependentProduct) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleServiceFormSuccess = (service: IndependentService) => {
    if (editingService) {
      // Update existing service
      setServices(services.map(s => s.id === service.id ? service : s));
    } else {
      // Add new service
      setServices([service, ...services]);
    }
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleProductFormSuccess = (product: IndependentProduct) => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      // Add new product
      setProducts([product, ...products]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const filteredServices = services.filter(service =>
    searchQuery === '' ||
    service.translation?.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.translation?.name_ar.includes(searchQuery) ||
    service.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    searchQuery === '' ||
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <title>My Independent Listings - Daleel Balady</title>
      <meta name="description" content="Manage your independent services and products without needing a shop." />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Independent Listings
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage your services and products without needing a shop
                </p>
              </div>
              <Button onClick={fetchUserListings} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Statistics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {services.length}
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {products.length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {services.length + products.length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Services ({services.length})
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products ({products.length})
                </TabsTrigger>
              </TabsList>

              {/* Search Bar */}
              {(activeTab === 'services' || activeTab === 'products') && (
                <div className="flex items-center gap-4 my-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              )}

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6">
                  {/* Getting Started Card */}
                  {services.length === 0 && products.length === 0 && (
                    <Card className="border-2 border-dashed border-stone-300">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-stone-100 p-3 mb-4">
                          <Plus className="h-8 w-8 text-stone-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Get Started with Independent Listings</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                          Create your first independent service or product listing to start reaching customers directly, 
                          without needing to set up a full shop.
                        </p>
                        <div className="flex gap-3">
                          <Button onClick={handleCreateService}>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Create Service
                          </Button>
                          <Button variant="outline" onClick={handleCreateProduct}>
                            <Package className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  {(services.length > 0 || products.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Recent Services */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Recent Services
                          </CardTitle>
                          <CardDescription>Your latest service listings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {services.slice(0, 3).length > 0 ? (
                            <div className="space-y-3">
                              {services.slice(0, 3).map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {service.translation?.name_en || 'Unnamed Service'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {service.price ? `$${service.price}` : 'Price on request'}
                                      {service.city && ` • ${service.city}`}
                                    </p>
                                  </div>
                                  <Badge variant={service.available ? "default" : "secondary"}>
                                    {service.available ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No services created yet</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Recent Products */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Recent Products
                          </CardTitle>
                          <CardDescription>Your latest product listings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {products.slice(0, 3).length > 0 ? (
                            <div className="space-y-3">
                              {products.slice(0, 3).map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {product.name || 'Unnamed Product'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {product.price ? `$${product.price}` : 'Price on request'} • Stock: {product.stock || 0}
                                    </p>
                                  </div>
                                  <Badge variant={product.isActive ? "default" : "secondary"}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No products created yet</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Your Services</h2>
                    <p className="text-muted-foreground">Manage your independent service listings</p>
                  </div>
                  <Button onClick={handleCreateService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </div>

                {filteredServices.length === 0 ? (
                  <Card className="border-2 border-dashed border-stone-300">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Briefcase className="h-12 w-12 text-stone-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No services found' : 'No services created yet'}
                      </h3>
                      <p className="text-muted-foreground text-center mb-6">
                        {searchQuery 
                          ? 'Try adjusting your search terms' 
                          : 'Create your first service to start offering your expertise independently'
                        }
                      </p>
                      {!searchQuery && (
                        <Button onClick={handleCreateService}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Service
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {filteredServices.map((service) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold">
                                    {service.translation?.name_en || 'Unnamed Service'}
                                  </h3>
                                  <Badge variant={service.available ? "default" : "secondary"}>
                                    {service.available ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {service.ownerUser.isVerified && (
                                    <Badge variant="outline">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-muted-foreground mb-4">
                                  {service.translation?.description_en || 'No description available'}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  {service.price && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" />
                                      ${service.price}
                                    </div>
                                  )}
                                  {service.durationMins && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {service.durationMins} mins
                                    </div>
                                  )}
                                  {service.city && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {service.city}
                                    </div>
                                  )}
                                  {service.stats && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4" />
                                      {service.stats.averageRating.toFixed(1)} ({service.stats.totalReviews})
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditService(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setDeleteServiceDialog(service.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Your Products</h2>
                    <p className="text-muted-foreground">Manage your independent product listings</p>
                  </div>
                  <Button onClick={handleCreateProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {filteredProducts.length === 0 ? (
                  <Card className="border-2 border-dashed border-stone-300">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-stone-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No products found' : 'No products added yet'}
                      </h3>
                      <p className="text-muted-foreground text-center mb-6">
                        {searchQuery 
                          ? 'Try adjusting your search terms' 
                          : 'Add your first product to start selling independently'
                        }
                      </p>
                      {!searchQuery && (
                        <Button onClick={handleCreateProduct}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Product
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold">
                                    {product.name || 'Unnamed Product'}
                                  </h3>
                                  <Badge variant={product.isActive ? "default" : "secondary"}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Badge variant={(product.stock || 0) > 0 ? "default" : "destructive"}>
                                    {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                  </Badge>
                                  {product.ownerUser?.isVerified && (
                                    <Badge variant="outline">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-muted-foreground mb-4">
                                  {product.description || 'No description available'}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    ${product.price}
                                  </div>
                                  {product.sku && (
                                    <div className="flex items-center gap-1">
                                      SKU: {product.sku}
                                    </div>
                                  )}
                                  {product.stats && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4" />
                                      {product.stats.averageRating.toFixed(1)} ({product.stats.totalReviews})
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setDeleteProductDialog(product.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Delete Service Dialog */}
      <Dialog 
        open={deleteServiceDialog !== null} 
        onOpenChange={(open) => !open && setDeleteServiceDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteServiceDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteServiceDialog && handleDeleteService(deleteServiceDialog)}
            >
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog 
        open={deleteProductDialog !== null} 
        onOpenChange={(open) => !open && setDeleteProductDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteProductDialog && handleDeleteProduct(deleteProductDialog)}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Form */}
      <ServiceForm
        service={editingService || undefined}
        isOpen={showServiceForm}
        onClose={() => {
          setShowServiceForm(false);
          setEditingService(null);
        }}
        onSuccess={handleServiceFormSuccess}
      />

      {/* Product Form */}
      <ProductForm
        product={editingProduct || undefined}
        isOpen={showProductForm}
        onClose={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
        onSuccess={handleProductFormSuccess}
      />
    </>
  );
};

export default IndependentListingsPage;
