import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Store,
  Briefcase,
  MessageSquare,
  CheckCircle,
  Crown,
  MapPin
} from 'lucide-react';
import { StarDisplay } from '../StarRating';

interface UserProfileCardProps {
  user: {
    id: string;
    name?: string | null;
    email?: string;
    phone?: string;
    profilePic?: string;
    bio?: string;
    isVerified?: boolean;
    verifiedBadge?: string;
    role?: string;
    city?: string;
    createdAt?: string;
    stats?: {
      totalShops?: number;
      totalServices?: number;
      totalReviews?: number;
      avgRating?: number;
    };
  };
  className?: string;
  showDetails?: boolean;
  showStats?: boolean;
  onClick?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  className = '',
  showDetails = true,
  showStats = false,
  onClick
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PROVIDER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELIVERY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CUSTOMER':
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200';
    }
  };

  const getRoleDisplayName = (role?: string) => {
    const roles = {
      ADMIN: isRTL ? 'مدير' : 'Admin',
      PROVIDER: isRTL ? 'مقدم خدمة' : 'Service Provider',
      DELIVERY: isRTL ? 'عامل توصيل' : 'Delivery Partner',
      CUSTOMER: isRTL ? 'عميل' : 'Customer'
    };
    return roles[role as keyof typeof roles] || (role || (isRTL ? 'مستخدم' : 'User'));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const cardContent = (
    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl">
      <CardContent className="p-6">

            {/* Header with Avatar and Basic Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-stone-200 dark:border-stone-700">
                  <AvatarImage src={user.profilePic} alt={user.name || 'User'} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {user.name || 'Local User'}
                  </h3>
                  {user.verifiedBadge && (
                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {user.role && (
                    <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {isRTL ? 'موثق' : 'Verified'}
                    </Badge>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-2">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Details */}
            {showDetails && (
              <div className="space-y-2 mb-4">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.city && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{user.city}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {isRTL ? 'عضو منذ' : 'Member since'} {formatDate(user.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            {showStats && user.stats && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                {(user.stats.totalShops || 0) > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                      <Store className="h-4 w-4" />
                      <span className="font-semibold">{user.stats.totalShops}</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isRTL ? 'متجر' : 'Shops'}
                    </p>
                  </div>
                )}

                {(user.stats.totalServices || 0) > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-semibold">{user.stats.totalServices}</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isRTL ? 'خدمة' : 'Services'}
                    </p>
                  </div>
                )}

                {(user.stats.totalReviews || 0) > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-semibold">{user.stats.totalReviews}</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isRTL ? 'تقييم' : 'Reviews'}
                    </p>
                  </div>
                )}

                {(user.stats.avgRating || 0) > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold">{user.stats.avgRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isRTL ? 'تقييم' : 'Rating'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rating Display for Users with Reviews */}
            {!showStats && user.stats && (user.stats.avgRating || 0) > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-700">
                <StarDisplay 
                  rating={user.stats.avgRating || 0} 
                  size="sm" 
                  showNumber={false}
                />
                <span className="text-sm text-stone-600 dark:text-stone-400">
                  ({user.stats.totalReviews || 0} {isRTL ? 'تقييم' : 'reviews'})
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      );

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {onClick ? (
        <div onClick={onClick}>
          {cardContent}
        </div>
      ) : (
        <Link to={`/user/${user.id}`}>
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
};

export default UserProfileCard;
