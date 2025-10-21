import api from '@/lib/api';

// Customer Profile
export async function getCustomerProfile() {
  const { data } = await api.get('/dashboard/customer/profile');
  return data;
}

export async function updateCustomerProfile(profileData: {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profilePic?: string;
}) {
  const { data } = await api.put('/dashboard/customer/profile', profileData);
  return data;
}

// Types
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  role: string;
  bio?: string;
  isVerified: boolean;
  verifiedBadge?: string;
  createdAt: string;
  updatedAt: string;
}

// Favorites
export async function getFavoriteShops() {
  try {
    const { data } = await api.get('/user/favorites/shops');
    return data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorite shops:', error);
    return [];
  }
}

export async function addFavoriteShop(shopId: string) {
  const { data } = await api.post('/user/favorites/shops', { shopId });
  return data;
}

export async function removeFavoriteShop(shopId: string) {
  const { data } = await api.delete(`/user/favorites/shops/${shopId}`);
  return data;
}

export async function checkIfShopIsFavorited(shopId: string) {
  try {
    const { data } = await api.get(`/user/favorites/shops/${shopId}/check`);
    return data.isFavorited || false;
  } catch (error) {
    return false;
  }
}

// Legacy function for backward compatibility
export async function getUser(id: string) {
  // For now, return mock data since this is used by existing components
  // TODO: Replace with proper API call when needed
  return {
    id,
    name: "User Name",
    role: "CUSTOMER",
    phone: "01012345678",
    email: "user@example.com",
    isVerified: true,
    profilePic: "/avatar.png",
  };
}
