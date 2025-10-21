'use client'

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column, Action, Filter } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  X,
  Store,
  Package,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import UniversalConversionDialog from '@/components/admin/UniversalConversionDialog';

interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  role: 'GUEST' | 'CUSTOMER' | 'PROVIDER' | 'DELIVERY' | 'ADMIN';
  bio?: string;
  isVerified: boolean;
  verifiedBadge?: string;
  profilePic?: string;
  coverImage?: string;
  createdAt: string;
  _count: {
    shops: number;
    services: number;
    bookings: number;
    orders: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ROLE_LABELS = {
  GUEST: 'زائر',
  CUSTOMER: 'عميل',
  PROVIDER: 'مقدم خدمة',
  DELIVERY: 'توصيل',
  ADMIN: 'مدير'
};

const ROLE_COLORS = {
  GUEST: 'bg-stone-100 text-stone-800',
  CUSTOMER: 'bg-blue-100 text-blue-800',
  PROVIDER: 'bg-green-100 text-green-800',
  DELIVERY: 'bg-orange-100 text-orange-800',
  ADMIN: 'bg-purple-100 text-purple-800'
};

// Helper function to normalize image URLs
const normalizeImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  // If URL already includes the domain, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If URL is relative, prepend the API proxy path
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  // If URL doesn't have /uploads/ prefix, add it
  return `/api/uploads/${url}`;
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [conversionDialog, setConversionDialog] = useState({
    isOpen: false,
    sourceType: 'user' as 'user'|'shop'|'service'|'product',
    sourceId: '',
    sourceName: '',
    targetType: 'shop' as 'user'|'shop'|'service'|'product'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...filters
      });

      const response = await fetch(`/api/dashboard/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
        setError(null);
      } else {
        throw new Error('فشل في تحميل المستخدمين');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('فشل في تحميل المستخدمين');
      // Mock data for development
      setUsers([
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+201234567890',
          role: 'CUSTOMER',
          isVerified: true,
          verifiedBadge: 'verified',
          createdAt: '2024-01-15T10:30:00Z',
          _count: { shops: 0, services: 0, bookings: 5, orders: 3 }
        },
        {
          id: '2',
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          phone: '+201234567891',
          role: 'PROVIDER',
          isVerified: true,
          verifiedBadge: 'gold',
          createdAt: '2024-01-10T14:20:00Z',
          _count: { shops: 2, services: 8, bookings: 0, orders: 0 }
        },
        {
          id: '3',
          name: 'محمد حسن',
          email: 'mohamed@example.com',
          phone: '+201234567892',
          role: 'DELIVERY',
          isVerified: false,
          createdAt: '2024-01-20T09:15:00Z',
          _count: { shops: 0, services: 0, bookings: 0, orders: 0 }
        }
      ]);
      setPagination({ page: 1, limit: 50, total: 3, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  const handleCoverUpload = async (file: File) => {
    try {
      setUploadingCover(true);
      
      // Show local preview immediately while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cover upload response:', data);
        const imageUrl = data.url || data.path;
        
        // Update both editing user and preview with server URL
        setEditingUser(prev => prev ? { ...prev, coverImage: imageUrl } : null);
        setCoverPreview(imageUrl);
        toast.success('تم رفع صورة الغلاف بنجاح');
      } else {
        throw new Error('فشل رفع صورة الغلاف');
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      toast.error('فشل في رفع صورة الغلاف');
      setCoverPreview(null);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      // Show local preview immediately while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload response:', data);
        const imageUrl = data.url || data.path;
        
        // Update both editing user and preview with server URL
        setEditingUser(prev => prev ? { ...prev, profilePic: imageUrl } : null);
        setImagePreview(imageUrl);
        toast.success('تم رفع الصورة بنجاح');
      } else {
        throw new Error('فشل رفع الصورة');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('فشل في رفع الصورة');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    if (!editingUser.name) {
      toast.error('الرجاء إدخال اسم المستخدم');
      return;
    }

    // For create mode, password is required
    if (!editingUser.id && !editingUser.password) {
      toast.error('الرجاء إدخال كلمة المرور');
      return;
    }

    try {
      const url = editingUser.id
        ? `/api/dashboard/admin/users/${editingUser.id}`
        : '/api/dashboard/admin/users';

      const payload: any = {
        name: editingUser.name,
        role: editingUser.role,
        isVerified: editingUser.isVerified
      };

      // Optional fields
      if (editingUser.email) payload.email = editingUser.email;
      if (editingUser.phone) payload.phone = editingUser.phone;
      if (editingUser.bio) payload.bio = editingUser.bio;
      if (editingUser.profilePic) payload.profilePic = editingUser.profilePic;
      if (editingUser.coverImage) payload.coverImage = editingUser.coverImage;
      if (editingUser.verifiedBadge) payload.verifiedBadge = editingUser.verifiedBadge;
      
      // Password only for create or if explicitly set in edit
      if (editingUser.password) payload.password = editingUser.password;

      const response = await fetch(url, {
        method: editingUser.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingUser.id ? 'تم تحديث المستخدم بنجاح' : 'تم إنشاء المستخدم بنجاح');
        setDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'فشل في حفظ المستخدم');
      }
    } catch (err: any) {
      toast.error(err.message || 'فشل في حفظ المستخدم');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
      try {
        const response = await fetch(`/api/dashboard/admin/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          toast.success('تم حذف المستخدم بنجاح');
          fetchUsers();
        } else {
          throw new Error('فشل في حذف المستخدم');
        }
      } catch (err) {
        toast.error('فشل في حذف المستخدم');
      }
    }
  };

  const handleConvertToShop = async (user: User) => {
    const shopName = prompt(`أدخل اسم المتجر للمستخدم "${user.name}":`); 
    if (!shopName) return;
    
    const shopCity = prompt('أدخل مدينة المتجر:');
    if (!shopCity) return;
    
    if (confirm(`هل أنت متأكد من تحويل المستخدم "${user.name}" إلى متجر باسم "${shopName}"؟`)) {
      try {
        const response = await fetch(`/api/dashboard/admin/users/${user.id}/convert-to-shop`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            shopName,
            city: shopCity,
            description: `متجر ${shopName} - تم إنشاؤه من حساب ${user.name}`
          })
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`تم تحويل المستخدم إلى متجر بنجاح! معرف المتجر: ${result.shop?.id}`);
          fetchUsers(); // تحديث قائمة المستخدمين
        } else {
          const errorData = await response.json();
          throw new Error((errorData as any).message || 'فشل في تحويل المستخدم إلى متجر');
        }
      } catch (err: any) {
        toast.error(err.message || 'فشل في تحويل المستخدم إلى متجر');
      }
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'الاسم',
      sortable: true,
      render: (value, user) => {
        const profilePicUrl = normalizeImageUrl(user.profilePic);
        return (
          <div className="flex items-center space-x-3 space-x-reverse">
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-stone-200"
                onError={(e) => {
                  // If image fails to load, hide it and show placeholder
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling;
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center"
              style={{ display: profilePicUrl ? 'none' : 'flex' }}
            >
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-xs text-stone-500">{user.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'role',
      header: 'الدور',
      render: (value) => (
        <Badge className={ROLE_COLORS[value as keyof typeof ROLE_COLORS]}>
          {ROLE_LABELS[value as keyof typeof ROLE_LABELS]}
        </Badge>
      )
    },
    {
      key: 'isVerified',
      header: 'الحالة',
      render: (value, user) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          {value ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={value ? 'text-green-700' : 'text-red-700'}>
            {value ? 'مؤكد' : 'غير مؤكد'}
          </span>
          {user.verifiedBadge && (
            <Badge variant="outline" className="text-xs">
              {user.verifiedBadge}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'الهاتف',
      render: (value) => (
        <div className="flex items-center">
          {value ? (
            <>
              <Phone className="w-4 h-4 text-stone-400 ml-2" />
              <span dir="ltr">{value}</span>
            </>
          ) : (
            <span className="text-stone-500">غير متوفر</span>
          )}
        </div>
      )
    },
    {
      key: '_count',
      header: 'الإحصائيات',
      render: (value: any) => {
        const counts = value ?? {};
        return (
          <div className="text-sm space-y-1">
            <div>المتاجر: {counts.shops ?? 0}</div>
            <div>الخدمات: {counts.services ?? 0}</div>
            <div>الحجوزات: {counts.bookings ?? 0}</div>
            <div>الطلبات: {counts.orders ?? 0}</div>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'تاريخ التسجيل',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-stone-400 ml-2" />
          {new Date(value).toLocaleDateString('ar-EG')}
        </div>
      )
    }
  ];

  const actions: Action<User>[] = [
    {
      label: 'فتح الملف الشخصي',
      icon: ExternalLink,
      onClick: (user) => {
        // Navigate to public user profile page
        window.open(`/listing/${user.id}`, '_blank');
      }
    },
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (user) => {
        // Navigate to user details page
        window.open(`/admin/users/${user.id}`, '_blank');
      }
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (user) => {
        setEditingUser(user);
        setDialogOpen(true);
      }
    },
    {
      label: 'تحويل إلى متجر',
      icon: Store,
      onClick: (user) => {
        setConversionDialog({
          isOpen: true,
          sourceType: 'user',
          sourceId: user.id,
          sourceName: user.name,
          targetType: 'shop'
        });
      },
      show: (user) => user.role === 'CUSTOMER' && (user._count?.shops ?? 0) === 0
    },
    {
      label: 'تحويل إلى خدمة',
      icon: Briefcase,
      onClick: (user) => {
        setConversionDialog({
          isOpen: true,
          sourceType: 'user',
          sourceId: user.id,
          sourceName: user.name,
          targetType: 'service'
        });
      },
      show: (user) => user.role === 'CUSTOMER'
    },
    {
      label: 'تحويل إلى منتج',
      icon: Package,
      onClick: (user) => {
        setConversionDialog({
          isOpen: true,
          sourceType: 'user',
          sourceId: user.id,
          sourceName: user.name,
          targetType: 'product'
        });
      },
      show: (user) => user.role === 'CUSTOMER'
    },
    {
      label: 'حذف',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDeleteUser,
      show: (user) => user.role !== 'ADMIN' // Don't allow deleting admin users
    }
  ];

  const tableFilters: Filter[] = [
    {
      key: 'role',
      label: 'الدور',
      options: [
        { label: 'عميل', value: 'CUSTOMER' },
        { label: 'مقدم خدمة', value: 'PROVIDER' },
        { label: 'توصيل', value: 'DELIVERY' },
        { label: 'مدير', value: 'ADMIN' },
        { label: 'زائر', value: 'GUEST' }
      ]
    },
    {
      key: 'isVerified',
      label: 'حالة التأكيد',
      options: [
        { label: 'مؤكد', value: 'true' },
        { label: 'غير مؤكد', value: 'false' }
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <DataTable
          title="إدارة المستخدمين"
          description="عرض وإدارة جميع المستخدمين في المنصة"
          data={users}
          columns={columns}
          actions={actions}
          filters={tableFilters}
          searchPlaceholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف"
          loading={loading}
          error={error}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            pages: pagination.pages,
            onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
            onLimitChange: (limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))
          }}
          onSearch={setSearchQuery}
          onFilter={setFilters}
          onRefresh={fetchUsers}
          onExport={() => {
            // Export users data
            const csv = users.map(user => 
              `${user.name},${user.email},${user.phone || ''},${ROLE_LABELS[user.role]},${user.isVerified ? 'مؤكد' : 'غير مؤكد'},${new Date(user.createdAt).toLocaleDateString('ar-EG')}`
            ).join('\n');
            const blob = new Blob([`الاسم,البريد الإلكتروني,الهاتف,الدور,حالة التأكيد,تاريخ التسجيل\n${csv}`], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users.csv';
            a.click();
          }}
        >
          <Button onClick={() => {
            setEditingUser({
              id: '',
              name: '',
              email: '',
              phone: '',
              role: 'CUSTOMER',
              isVerified: false,
              createdAt: new Date().toISOString(),
              _count: { shops: 0, services: 0, bookings: 0, orders: 0 }
            });
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مستخدم جديد
          </Button>
        </DataTable>

        {/* Edit User Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setImagePreview(null);
            setCoverPreview(null);
            setEditingUser(null);
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser?.id ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingUser?.id ? 
                  'قم بتعديل بيانات المستخدم أدناه' : 
                  'املأ البيانات لإضافة مستخدم جديد'
                }
              </DialogDescription>
            </DialogHeader>
            
            {editingUser && (
              <div className="space-y-6">
                {/* Cover Image Upload */}
                <div className="space-y-3">
                  <Label>صورة الغلاف</Label>
                  <div className="space-y-3">
                    {/* Cover Image Preview */}
                    <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                      {coverPreview || editingUser.coverImage ? (
                        <>
                          <img
                            src={coverPreview || normalizeImageUrl(editingUser.coverImage)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setEditingUser({ ...editingUser, coverImage: undefined });
                              setCoverPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <ImageIcon className="w-16 h-16 text-stone-400" />
                        </div>
                      )}
                    </div>

                    {/* Cover Upload Button */}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="coverImageUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleCoverUpload(file);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('coverImageUpload')?.click()}
                        disabled={uploadingCover}
                        className="w-full"
                      >
                        {uploadingCover ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-900 ml-2"></div>
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 ml-2" />
                            رفع صورة الغلاف
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-stone-500">صورة عريضة تظهر في أعلى الملف الشخصي (1200x400 موصى به)</p>
                  </div>
                </div>

                <div className="border-t pt-4" />

                {/* Profile Picture Upload */}
                <div className="space-y-3">
                  <Label>صورة الملف الشخصي</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Image Preview */}
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
                      {imagePreview || editingUser.profilePic ? (
                        <>
                          <img
                            src={imagePreview || normalizeImageUrl(editingUser.profilePic)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setEditingUser({ ...editingUser, profilePic: undefined });
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Users className="w-12 h-12 text-stone-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="file"
                        id="profilePicUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Just upload to server - handleImageUpload will handle preview
                            handleImageUpload(file);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('profilePicUpload')?.click()}
                        disabled={uploadingImage}
                        className="w-full"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-900 ml-2"></div>
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 ml-2" />
                            رفع صورة
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-stone-500 mt-2">PNG, JPG, GIF حتى 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4" />

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">الاسم <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        placeholder="أدخل الاسم"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role">الدور</Label>
                      <Select
                        value={editingUser.role}
                        onValueChange={(value) => setEditingUser({ ...editingUser, role: value as User['role'] })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GUEST">زائر</SelectItem>
                          <SelectItem value="CUSTOMER">عميل</SelectItem>
                          <SelectItem value="PROVIDER">مقدم خدمة</SelectItem>
                          <SelectItem value="DELIVERY">توصيل</SelectItem>
                          <SelectItem value="ADMIN">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4" />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات التواصل</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="email"
                          type="email"
                          value={editingUser.email || ''}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          placeholder="example@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="phone"
                          value={editingUser.phone || ''}
                          onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                          placeholder="+201234567890"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4" />

                {/* Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الأمان</h3>
                  {!editingUser.id && (
                    <div>
                      <Label htmlFor="password">كلمة المرور <span className="text-red-500">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        value={editingUser.password || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                        placeholder="كلمة المرور"
                        className="mt-2"
                      />
                    </div>
                  )}
                  
                  {editingUser.id && (
                    <div>
                      <Label htmlFor="password">كلمة المرور الجديدة (اختياري)</Label>
                      <Input
                        id="password"
                        type="password"
                        value={editingUser.password || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                        placeholder="اتركها فارغة لعدم التغيير"
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4" />
                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات إضافية</h3>
                  
                  <div>
                    <Label htmlFor="bio">النبذة الشخصية</Label>
                    <Textarea
                      id="bio"
                      value={editingUser.bio || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                      placeholder="نبذة عن المستخدم"
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="border-t pt-4" />

                {/* Verification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">التحقق والشارات</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <Label htmlFor="verified" className="cursor-pointer">مستخدم مؤكد</Label>
                        <p className="text-xs text-stone-500">تفعيل شارة التحقق للمستخدم</p>
                      </div>
                    </div>
                    <Switch
                      id="verified"
                      checked={editingUser.isVerified}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, isVerified: checked })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="badge">شارة التحقق</Label>
                    <Select
                      value={editingUser.verifiedBadge || 'none'}
                      onValueChange={(value) => setEditingUser({ ...editingUser, verifiedBadge: value === 'none' ? undefined : value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="اختر شارة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون شارة</SelectItem>
                        <SelectItem value="verified">✓ موثق</SelectItem>
                        <SelectItem value="gold">🏆 ذهبي</SelectItem>
                        <SelectItem value="premium">⭐ مميز</SelectItem>
                        <SelectItem value="business">💼 أعمال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSaveUser}>
                    {editingUser.id ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Universal Conversion Dialog */}
        <UniversalConversionDialog
          isOpen={conversionDialog.isOpen}
          onClose={() => setConversionDialog({...conversionDialog, isOpen: false})}
          sourceType={conversionDialog.sourceType}
          sourceId={conversionDialog.sourceId}
          sourceName={conversionDialog.sourceName}
          targetType={conversionDialog.targetType}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
