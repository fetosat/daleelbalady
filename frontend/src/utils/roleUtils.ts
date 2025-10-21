import { UserRole } from '@/lib/auth';

export interface RoleInfo {
  role: UserRole;
  canAccessProvider: boolean;
  canCreateShops: boolean;
  canManageProducts: boolean;
  displayName: string;
  description: string;
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  GUEST: {
    role: 'GUEST',
    canAccessProvider: false,
    canCreateShops: false,
    canManageProducts: false,
    displayName: 'Guest',
    description: 'Limited browsing access'
  },
  CUSTOMER: {
    role: 'CUSTOMER',
    canAccessProvider: false,
    canCreateShops: false,
    canManageProducts: false,
    displayName: 'Customer',
    description: 'Can book services and purchase products'
  },
  PROVIDER: {
    role: 'PROVIDER',
    canAccessProvider: true,
    canCreateShops: true,
    canManageProducts: true,
    displayName: 'Service Provider',
    description: 'Can create shops and offer services'
  },
  SHOP_OWNER: {
    role: 'SHOP_OWNER',
    canAccessProvider: true,
    canCreateShops: true,
    canManageProducts: true,
    displayName: 'Shop Owner',
    description: 'Can manage shops and products'
  },
  DELIVERY: {
    role: 'DELIVERY',
    canAccessProvider: false,
    canCreateShops: false,
    canManageProducts: false,
    displayName: 'Delivery Personnel',
    description: 'Can manage deliveries and orders'
  },
  ADMIN: {
    role: 'ADMIN',
    canAccessProvider: true,
    canCreateShops: true,
    canManageProducts: true,
    displayName: 'Administrator',
    description: 'Full system access'
  }
};

export function getRoleInfo(role: UserRole): RoleInfo {
  return ROLE_INFO[role] || ROLE_INFO.GUEST;
}

export function canAccessProviderFeatures(role: UserRole): boolean {
  return getRoleInfo(role).canAccessProvider;
}

export function getProviderFeatureErrorMessage(currentRole: UserRole): string {
  const roleInfo = getRoleInfo(currentRole);
  
  if (currentRole === 'CUSTOMER') {
    return `You're currently registered as a ${roleInfo.displayName}. To access provider features and create shops, please upgrade your account to a Provider account.`;
  }
  
  if (currentRole === 'GUEST') {
    return 'Please create an account and register as a Provider to access these features.';
  }
  
  return `Your current role (${roleInfo.displayName}) doesn't have access to provider features. Please contact support if you need to upgrade your account.`;
}

export function getRequiredRolesForFeature(feature: 'shops' | 'products' | 'services'): UserRole[] {
  switch (feature) {
    case 'shops':
    case 'products':
    case 'services':
      return ['PROVIDER', 'SHOP_OWNER', 'ADMIN'];
    default:
      return ['ADMIN'];
  }
}

export function debugUserRole(user: any) {
  console.group('🔍 User Role Debug Information');
  console.log('👤 User:', user);
  console.log('🏷️ Current Role:', user?.role);
  console.log('📋 Role Info:', getRoleInfo(user?.role || 'GUEST'));
  console.log('🔓 Can Access Provider:', canAccessProviderFeatures(user?.role || 'GUEST'));
  console.log('🏪 Can Create Shops:', getRoleInfo(user?.role || 'GUEST').canCreateShops);
  console.log('📦 Can Manage Products:', getRoleInfo(user?.role || 'GUEST').canManageProducts);
  console.groupEnd();
}
