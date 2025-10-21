'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  Camera,
  Shield,
  Star,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isRTL = i18n.language === 'ar';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    bio: ''
  });

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        bio: (user as any).bio || ''
      });
    }
  }, [user, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      // Update user data
      updateUser(formData as any);
      
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم تحديث ملفك الشخصي بنجاح' : 'Your profile has been updated successfully',
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'CUSTOMER': isRTL ? 'عميل' : 'Customer',
      'PROVIDER': isRTL ? 'مزود خدمة' : 'Provider',
      'SHOP_OWNER': isRTL ? 'صاحب متجر' : 'Shop Owner',
      'DELIVERY': isRTL ? 'سائق توصيل' : 'Delivery',
      'ADMIN': isRTL ? 'مدير' : 'Admin',
    };
    return roles[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-green-subtle to-green-primary/20"></div>
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-12">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={user.profilePic} alt={user.name} />
                    <AvatarFallback className="text-3xl bg-green-subtle text-green-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-right mb-4 md:mb-0">
                  <h1 className="text-3xl font-bold text-text-primary">{user.name}</h1>
                  <div className="flex items-center gap-2 justify-center md:justify-end mt-2">
                    <span className="px-3 py-1 bg-green-subtle text-green-primary rounded-full text-sm font-medium">
                      {getRoleLabel(user.role)}
                    </span>
                    {user.isVerified && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        {isRTL ? 'موثق' : 'Verified'}
                      </span>
                    )}
                  </div>
                  {user.subscription && (
                    <div className="flex items-center gap-1 justify-center md:justify-end mt-2 text-yellow-600">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{user.subscription.planName}</span>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="gap-2 bg-green-primary hover:bg-green-hover"
                    >
                      <Save className="h-4 w-4" />
                      {isRTL ? 'حفظ' : 'Save'}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          address: (user as any).address || '',
                          city: (user as any).city || '',
                          bio: (user as any).bio || ''
                        });
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isRTL ? 'الاسم' : 'Name'}
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-right"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  dir="ltr"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {isRTL ? 'رقم الهاتف' : 'Phone'}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  dir="ltr"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {isRTL ? 'المدينة' : 'City'}
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-right"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {isRTL ? 'العنوان' : 'Address'}
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-right"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {isRTL ? 'عضو منذ' : 'Member Since'}
                </Label>
                <Input
                  value={user.createdAt ? new Date(user.createdAt as any).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : '-'}
                  disabled
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

