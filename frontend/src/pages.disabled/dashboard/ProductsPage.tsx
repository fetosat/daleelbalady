import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search,
  Filter,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { admin } from "@/lib/api";

type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  shop: {
    name: string;
    isVerified: boolean;
  };
  lister: {
    name: string;
    email: string;
  } | null;
  _count: {
    orderItems: number;
  };
};

// Mock data - replace with real API data
const mockProducts: AdminProduct[] = [
  {
    id: "PROD001",
    name: "هاتف ذكي Samsung Galaxy S23",
    description: "هاتف ذكي بتقنية 5G مع كاميرا 108 ميجابكسل",
    price: 15000,
    currency: "EGP",
    stock: 25,
    isActive: true,
    createdAt: "2025-09-10T10:00:00Z",
    shop: {
      name: "متجر الالكترونيات",
      isVerified: true
    },
    lister: {
      name: "أحمد محمد",
      email: "ahmed@electronics.com"
    },
    _count: {
      orderItems: 45
    }
  },
  {
    id: "PROD002",
    name: "لابتوب Dell Inspiron",
    description: "لابتوب للأعمال مع معالج Intel Core i7",
    price: 25000,
    currency: "EGP",
    stock: 10,
    isActive: true,
    createdAt: "2025-09-09T14:30:00Z",
    shop: {
      name: "معرض الكمبيوتر",
      isVerified: true
    },
    lister: {
      name: "محمد علي",
      email: "mohamed@computerstore.com"
    },
    _count: {
      orderItems: 12
    }
  },
  {
    id: "PROD003",
    name: "ساعة ذكية Apple Watch",
    description: "ساعة ذكية مع مراقبة الصحة واللياقة البدنية",
    price: 8000,
    currency: "EGP",
    stock: 0,
    isActive: false,
    createdAt: "2025-09-08T09:15:00Z",
    shop: {
      name: "متجر الساعات",
      isVerified: false
    },
    lister: {
      name: "فاطمة حسن",
      email: "fatima@watchstore.com"
    },
    _count: {
      orderItems: 8
    }
  }
];

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load products data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 20,
        };
        
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        
        if (statusFilter === 'active') {
          params.active = true;
        } else if (statusFilter === 'inactive') {
          params.active = false;
        }
        
        const data = await admin.getProducts(params);
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل المنتجات");
        console.error('Error fetching products:', error);
        // Fallback to mock data for development
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, statusFilter]);

  // Use debouncing for search to avoid too many API calls
  const debouncedSearch = searchQuery;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        // Trigger refresh if we're on page 1
        const fetchProducts = async () => {
          setLoading(true);
          try {
            const params: any = {
              page: 1,
              limit: 20,
            };
            
            if (debouncedSearch.trim()) {
              params.search = debouncedSearch.trim();
            }
            
            if (statusFilter === 'active') {
              params.active = true;
            } else if (statusFilter === 'inactive') {
              params.active = false;
            }
            
            const data = await admin.getProducts(params);
            setProducts(data.products);
            setTotalPages(data.pagination.pages);
            setTotal(data.pagination.total);
          } catch (error) {
            console.error('Search error:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchProducts();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearch, statusFilter]);

  const handleToggleStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      await admin.updateProduct(productId, { isActive: !product.isActive });
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, isActive: !p.isActive }
          : p
      ));
      toast.success("تم تحديث حالة المنتج");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث المنتج");
      console.error('Error toggling product status:', error);
    }
  };

  const getStatusBadge = (product: AdminProduct) => {
    if (!product.isActive) {
      return <Badge variant="secondary" className="bg-stone-100 text-stone-800">معطل</Badge>;
    }
    if (product.stock === 0) {
      return <Badge variant="destructive">نفد المخزون</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">متوفر</Badge>;
  };

  const stats = {
    total: total, // Use total from API instead of current page products
    active: products.filter(p => p.isActive).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المنتجات</h1>
          <p className="text-muted-foreground">مراقبة وإدارة جميع المنتجات في المنصة</p>
        </div>
        <Button className="bg-green-primary hover:bg-green-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <Package className="w-3 h-3 mr-1" />
              المنتجات المسجلة
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المنتجات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              متاح للشراء
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              نفد المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              يحتاج إعادة تجديد
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيمة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} جنيه</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <DollarSign className="w-3 h-3 mr-1" />
              إجمالي قيمة المنتجات
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
          <CardDescription>مراجعة وإدارة جميع المنتجات المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة المنتج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">جميع المنتجات</SelectItem>
                    <SelectItem value="active">المنتجات النشطة</SelectItem>
                    <SelectItem value="inactive">المنتجات المعطلة</SelectItem>
                    <SelectItem value="outOfStock">نفد المخزون</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>المتجر</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>المبيعات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      لا توجد منتجات
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.shop.name}</span>
                        {product.shop.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.lister?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.price.toLocaleString()} {product.currency}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${
                        product.stock === 0 ? "text-red-600" : 
                        product.stock < 10 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {product.stock} قطعة
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product._count.orderItems}</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product)}</TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">فتح القائمة</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            تعديل المنتج
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(product.id)}
                            className={product.isActive ? "text-red-600" : "text-green-600"}
                          >
                            {product.isActive ? (
                              <>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                تعطيل المنتج
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                تفعيل المنتج
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف المنتج
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
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  عرض {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)} من {total} منتج
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  السابق
                </Button>
                <span className="text-sm font-medium">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
