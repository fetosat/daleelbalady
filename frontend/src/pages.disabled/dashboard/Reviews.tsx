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
  Star,
  Eye,
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

type AdminReview = {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  status: "PUBLISHED" | "PENDING" | "REJECTED";
  reportCount: number;
  author: {
    name: string;
    email: string;
    avatar?: string | null;
    isVerified: boolean;
  };
  target: {
    type: 'service' | 'product' | 'shop';
    name: string;
    shopName?: string;
    id: string;
  };
};

// Unified mock data for fallback
const mockReviews: AdminReview[] = [
  {
    id: "REV001",
    author: {
      name: "أحمد محمد",
      email: "ahmed@example.com",
      avatar: null,
      isVerified: true
    },
    rating: 5,
    comment: "خدمة ممتازة جداً، أنصح بها بشدة. الموظفين محترمين والخدمة سريعة.",
    target: {
      type: "service" as const,
      name: "خدمة تصليح السيارات",
      shopName: "مركز الأمانة للسيارات",
      id: "SVC001"
    },
    status: "PUBLISHED" as const,
    isVerified: true,
    reportCount: 0,
    createdAt: "2025-09-10T10:00:00Z",
  },
  {
    id: "REV002", 
    author: {
      name: "فاطمة علي",
      email: "fatima@example.com",
      avatar: null,
      isVerified: false
    },
    rating: 2,
    comment: "الخدمة بطيئة والأسعار مرتفعة.",
    target: {
      type: "product" as const,
      name: "هاتف محمول",
      shopName: "متجر الالكترونيات",
      id: "PRD001"
    },
    status: "PENDING" as const,
    isVerified: false,
    reportCount: 2,
    createdAt: "2025-09-09T10:00:00Z",
  },
  {
    id: "REV003",
    author: {
      name: "محمد حسن",
      email: "mohamed@example.com", 
      avatar: null,
      isVerified: true
    },
    rating: 4,
    comment: "جيد جداً ولكن يحتاج لتحسين في السرعة.",
    target: {
      type: "service" as const,
      name: "خدمة توصيل الطعام",
      shopName: "مطعم البيت",
      id: "SVC002"
    },
    status: "PUBLISHED" as const,
    isVerified: true,
    reportCount: 0,
    createdAt: "2025-09-08T10:00:00Z",
  }
];

export default function Reviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load reviews data
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 20,
        };
        
        if (statusFilter !== 'all') {
          params.status = statusFilter.toUpperCase();
        }
        if (ratingFilter !== 'all') {
          params.rating = parseInt(ratingFilter);
        }
        const data = await admin.getReviews(params);
        setReviews(data.reviews);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل التقييمات");
        console.error('Error fetching reviews:', error);
        // Fallback to mock data for development
  setReviews(mockReviews);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage, statusFilter, ratingFilter]);

  const handleApproveReview = async (reviewId: string) => {
    try {
      await admin.updateReview(reviewId, 'approve');
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, isVerified: true }
          : review
      ));
      toast.success("تم الموافقة على التقييم");
    } catch (error) {
      toast.error("حدث خطأ أثناء الموافقة على التقييم");
      console.error('Error approving review:', error);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      await admin.updateReview(reviewId, 'reject');
      setReviews(reviews.filter(review => review.id !== reviewId));
      toast.success("تم رفض وحذف التقييم");
    } catch (error) {
      toast.error("حدث خطأ أثناء رفض التقييم");
      console.error('Error rejecting review:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PUBLISHED") {
      return <Badge variant="default" className="bg-green-100 text-green-800">منشور</Badge>;
    } else if (status === "PENDING") {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">مرفوض</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-stone-300"
        }`}
      />
    ));
  };

  const stats = {
    total: total,
    published: reviews.filter(r => r.status === "PUBLISHED").length,
    pending: reviews.filter(r => r.status === "PENDING").length,
    reported: reviews.filter(r => r.reportCount > 0).length,
  };
  // Filtering logic
  const filteredReviews = reviews.filter(r => {
    let match = true;
    if (searchQuery.trim()) {
      match = (
        r.author.name.includes(searchQuery) ||
        r.author.email.includes(searchQuery) ||
        r.comment.includes(searchQuery) ||
        r.target.name.includes(searchQuery)
      );
    }
    if (statusFilter !== "all" && r.status !== statusFilter.toUpperCase()) {
      return false;
    }
    if (ratingFilter !== "all" && r.rating !== parseInt(ratingFilter)) {
      return false;
    }
    return match;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة التقييمات</h1>
          <p className="text-muted-foreground">مراقبة والموافقة على تقييمات المستخدمين</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي التقييمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              التقييمات المنشورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تقييمات مبلغ عنها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.reported}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التقييمات</CardTitle>
          <CardDescription>مراجعة وإدارة جميع التقييمات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في التقييمات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">جميع التقييمات</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="4">4 نجوم</SelectItem>
                    <SelectItem value="3">3 نجوم</SelectItem>
                    <SelectItem value="2">نجمتان</SelectItem>
                    <SelectItem value="1">نجمة واحدة</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المراجع</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>التعليق</TableHead>
                  <TableHead>الهدف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.author.avatar || ""} />
                          <AvatarFallback>{review.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.author.name}</div>
                          <div className="text-sm text-muted-foreground">{review.author.email}</div>
                          {review.reportCount > 0 && (
                            <div className="flex items-center gap-1 text-red-600 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              {review.reportCount} بلاغ
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm">{review.rating}/5</span>
                        {review.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm">{review.comment}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{review.target.name}</div>
                        {review.target.shopName && (
                          <div className="text-sm text-muted-foreground">{review.target.shopName}</div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {review.target.type === "service" ? "خدمة" : review.target.type === "product" ? "منتج" : "متجر"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>{review.createdAt.split("T")[0]}</TableCell>
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
                          {review.status === "PENDING" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleApproveReview(review.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                الموافقة
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectReview(review.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                رفض
                              </DropdownMenuItem>
                            </>
                          )}
                          {review.status === "PUBLISHED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                إخفاء
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
