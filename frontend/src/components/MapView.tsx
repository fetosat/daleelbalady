'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, CheckCircle, Store, User, Package, Navigation, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StarDisplay } from '@/components/StarRating';
import { useTheme } from 'next-themes';
import ClientOnly from '@/components/ClientOnly';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  results: {
    shops: any[];
    services: any[];
    users: any[];
    products: any[];
  };
  userLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  selectedRadius?: number;
}

interface MarkerData {
  id: string;
  type: 'shop' | 'service' | 'user' | 'product';
  position: [number, number];
  data: any;
}

// Custom marker icons for different types
const createCustomIcon = (type: 'shop' | 'service' | 'user' | 'product', color: string) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 16px;
        color: white;
      ">${type === 'shop' ? '🏪' : type === 'service' ? '🔧' : type === 'user' ? '👤' : '📦'}</span>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// User location marker
const createUserLocationIcon = () => {
  const iconHtml = `
    <div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.5); }
        100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
      }
    </style>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to handle map centering
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

// Popup content components
const ShopPopup: React.FC<{ shop: any }> = ({ shop }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-w-[250px] max-w-[300px]">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xl">
          🏪
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base flex items-center gap-2">
            {shop.name}
            {shop.isVerified && <CheckCircle className="h-4 w-4 text-blue-500" />}
          </h3>
          <p className="text-xs text-stone-500">{shop.owner?.name}</p>
        </div>
      </div>
      
      <p className="text-sm text-stone-600 mb-3 line-clamp-2">
        {shop.description || 'No description available'}
      </p>
      
      {shop.stats?.averageRating > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <StarDisplay rating={shop.stats.averageRating} size="sm" showNumber={false} />
          <span className="text-xs text-stone-500">({shop.stats.totalReviews} reviews)</span>
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-1 text-stone-500">
          <MapPin className="h-4 w-4" />
          <span>{shop.city || 'Location not specified'}</span>
        </div>
        <span className="text-xs text-stone-400">{shop.stats?.totalServices} services</span>
      </div>
      
      <Button
        size="sm"
        className="w-full bg-teal-600 hover:bg-teal-700"
        onClick={() => navigate(`/shop/${shop.id}`)}
      >
        View Shop
      </Button>
    </div>
  );
};

const ServicePopup: React.FC<{ service: any }> = ({ service }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-w-[250px] max-w-[300px]">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
          🔧
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base flex items-center gap-2">
            {service.translation?.name_en || service.embeddingText?.substring(0, 30) || 'Service'}
            {service.ownerUser?.isVerified && <CheckCircle className="h-4 w-4 text-blue-500" />}
          </h3>
          <p className="text-xs text-stone-500">{service.ownerUser?.name || 'Provider'}</p>
        </div>
      </div>
      
      <p className="text-sm text-stone-600 mb-3 line-clamp-2">
        {service.translation?.description_en || service.embeddingText?.substring(0, 80) || 'No description'}
      </p>
      
      <div className="flex items-center gap-3 text-sm mb-3">
        {service.price && (
          <div className="flex items-center gap-1 text-stone-700 font-medium">
            <DollarSign className="h-4 w-4" />
            <span>{service.price}</span>
          </div>
        )}
        {service.durationMins && (
          <div className="flex items-center gap-1 text-stone-500">
            <Clock className="h-4 w-4" />
            <span>{service.durationMins}min</span>
          </div>
        )}
      </div>
      
      {service.city && (
        <div className="flex items-center gap-1 text-sm text-stone-500 mb-3">
          <MapPin className="h-4 w-4" />
          <span>{service.city}</span>
        </div>
      )}
      
      <Button
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700"
        onClick={() => navigate(`/service/${service.id}`)}
      >
        View Service
      </Button>
    </div>
  );
};

const UserPopup: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-w-[250px] max-w-[300px]">
      <div className="flex items-start gap-3 mb-2">
        {user.profilePic ? (
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-stone-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl">
            👤
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-base flex items-center gap-2">
            {user.name}
            {user.isVerified && <CheckCircle className="h-4 w-4 text-blue-500" />}
          </h3>
          <p className="text-xs text-stone-500 capitalize">{user.role?.toLowerCase() || 'Member'}</p>
        </div>
      </div>
      
      <p className="text-sm text-stone-600 mb-3 line-clamp-2">
        {user.bio || 'No bio available'}
      </p>
      
      {user.stats?.averageRating > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <StarDisplay rating={user.stats.averageRating} size="sm" showNumber={false} />
          <span className="text-xs text-stone-500">({user.stats.totalReviews} reviews)</span>
        </div>
      )}
      
      <div className="flex gap-3 text-xs text-stone-500 mb-3">
        {user.stats?.totalServices > 0 && <span>{user.stats.totalServices} services</span>}
        {user.stats?.totalShops > 0 && <span>{user.stats.totalShops} shops</span>}
      </div>
      
      <Button
        size="sm"
        className="w-full bg-purple-600 hover:bg-purple-700"
        onClick={() => navigate(`/user/${user.id}`)}
      >
        View Profile
      </Button>
    </div>
  );
};

const ProductPopup: React.FC<{ product: any }> = ({ product }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-w-[250px] max-w-[300px]">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl">
          📦
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base flex items-center gap-2">
            {product.name}
            {product.shop?.isVerified && <CheckCircle className="h-4 w-4 text-blue-500" />}
          </h3>
          <p className="text-xs text-stone-500">{product.shop?.name || product.lister?.name}</p>
        </div>
      </div>
      
      <p className="text-sm text-stone-600 mb-3 line-clamp-2">
        {product.description || 'No description available'}
      </p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-lg font-bold text-stone-900">
          <DollarSign className="h-5 w-5 text-stone-500" />
          <span>{product.price}</span>
        </div>
        <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'} className="text-xs">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </Badge>
      </div>
      
      <Button
        size="sm"
        className="w-full bg-orange-600 hover:bg-orange-700"
        onClick={() => navigate(`/product/${product.id}`)}
        disabled={product.stock <= 0}
      >
        {product.stock > 0 ? 'View Product' : 'Out of Stock'}
      </Button>
    </div>
  );
};

const MapView: React.FC<MapViewProps> = ({ results, userLocation, selectedRadius = 5 }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.0444, 31.2357]); // Default: Cairo
  const [mapZoom, setMapZoom] = useState(13);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Determine if we're in dark mode
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark';

  // Animate pulse effect
  useEffect(() => {
    if (!userLocation) return;
    
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 3); // 0, 1, 2 cycle
    }, 800); // Change every 800ms

    return () => clearInterval(interval);
  }, [userLocation]);

  // Collect all markers from results
  const markers = useMemo<MarkerData[]>(() => {
    const allMarkers: MarkerData[] = [];

    // Add shops with location (using locationLat/locationLon)
    results.shops.forEach((shop) => {
      if (shop.locationLat && shop.locationLon) {
        allMarkers.push({
          id: `shop-${shop.id}`,
          type: 'shop',
          position: [shop.locationLat, shop.locationLon],
          data: shop,
        });
      }
    });

    // Add services with location (using locationLat/locationLon)
    results.services.forEach((service) => {
      if (service.locationLat && service.locationLon) {
        allMarkers.push({
          id: `service-${service.id}`,
          type: 'service',
          position: [service.locationLat, service.locationLon],
          data: service,
        });
      }
    });

    // Add users with location (check if they have location fields)
    results.users.forEach((user) => {
      if (user.locationLat && user.locationLon) {
        allMarkers.push({
          id: `user-${user.id}`,
          type: 'user',
          position: [user.locationLat, user.locationLon],
          data: user,
        });
      } else if (user.latitude && user.longitude) {
        allMarkers.push({
          id: `user-${user.id}`,
          type: 'user',
          position: [user.latitude, user.longitude],
          data: user,
        });
      }
    });

    // Add products with location
    results.products.forEach((product) => {
      // Products might have their own location or inherit from shop
      if (product.locationLat && product.locationLon) {
        allMarkers.push({
          id: `product-${product.id}`,
          type: 'product',
          position: [product.locationLat, product.locationLon],
          data: product,
        });
      } else if (product.latitude && product.longitude) {
        allMarkers.push({
          id: `product-${product.id}`,
          type: 'product',
          position: [product.latitude, product.longitude],
          data: product,
        });
      } else if (product.shop?.locationLat && product.shop?.locationLon) {
        allMarkers.push({
          id: `product-${product.id}`,
          type: 'product',
          position: [product.shop.locationLat, product.shop.locationLon],
          data: product,
        });
      } else if (product.shop?.latitude && product.shop?.longitude) {
        allMarkers.push({
          id: `product-${product.id}`,
          type: 'product',
          position: [product.shop.latitude, product.shop.longitude],
          data: product,
        });
      }
    });

    return allMarkers;
  }, [results]);

  // Set map center based on user location or first marker
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(14);
    } else if (markers.length > 0) {
      // Center on first marker if no user location
      setMapCenter(markers[0].position);
      setMapZoom(13);
    }
  }, [userLocation, markers]);

  // Get marker icon based on type
  const getMarkerIcon = (type: 'shop' | 'service' | 'user' | 'product') => {
    const colors = {
      shop: '#14b8a6', // teal
      service: '#3b82f6', // blue
      user: '#a855f7', // purple
      product: '#f97316', // orange
    };
    return createCustomIcon(type, colors[type]);
  };

  // Get popup component based on type
  const getPopupComponent = (marker: MarkerData) => {
    switch (marker.type) {
      case 'shop':
        return <ShopPopup shop={marker.data} />;
      case 'service':
        return <ServicePopup service={marker.data} />;
      case 'user':
        return <UserPopup user={marker.data} />;
      case 'product':
        return <ProductPopup product={marker.data} />;
      default:
        return null;
    }
  };

  const totalMarkers = markers.length;
  const hasUserLocation = !!userLocation;

  // Pulse animation radii (in km)
  const pulseRadii = [
    selectedRadius * 1000, // Main radius
    selectedRadius * 1000 * 1.15, // Pulse ring 1 (+15%)
    selectedRadius * 1000 * 1.3, // Pulse ring 2 (+30%)
  ];

  // Calculate opacity based on pulse phase
  const getPulseOpacity = (ringIndex: number) => {
    if (pulsePhase === ringIndex) return 0.25;
    if (pulsePhase === (ringIndex + 1) % 3) return 0.15;
    return 0.08;
  };

  // Render map only after mount to avoid double-initialization in React dev/replay effects
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardContent className="p-0 h-full relative">
        {/* Map Info Badge */}
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {totalMarkers} {totalMarkers === 1 ? 'result' : 'results'} on map
            </span>
          </div>
          {hasUserLocation && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Navigation className="h-4 w-4" />
              <span className="text-xs">Your location · {selectedRadius}km radius</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 p-3 space-y-2">
          <div className="text-xs font-semibold mb-2 text-stone-900 dark:text-stone-100">Legend</div>
          <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏪</span>
              <span>Shops</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔧</span>
              <span>Services</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        {isMounted && (
          <ClientOnly fallback={<div className="w-full min-h-[600px] bg-muted animate-pulse rounded" />}> 
            <MapContainer
              key={`map-${mapCenter[0]}-${mapCenter[1]}`}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full min-h-[600px]"
              scrollWheelZoom={true}
            >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {/* Tile Layer - OpenStreetMap (with dark mode support) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          {/* User Location Marker and Radius */}
          {userLocation && (
            <>
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={createUserLocationIcon()}
              >
                <Popup>
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Your Location</span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Search radius: {selectedRadius}km
                    </p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Animated Pulsing Radius Circles */}
              {/* Outer pulse ring */}
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={pulseRadii[2]}
                pathOptions={{
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fillColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fillOpacity: getPulseOpacity(2),
                  weight: 1,
                  opacity: 0.4,
                }}
              />
              
              {/* Middle pulse ring */}
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={pulseRadii[1]}
                pathOptions={{
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fillColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fillOpacity: getPulseOpacity(1),
                  weight: 1.5,
                  opacity: 0.5,
                }}
              />
              
              {/* Main search radius circle */}
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={pulseRadii[0]}
                pathOptions={{
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fillColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fillOpacity: getPulseOpacity(0),
                  weight: 2,
                  opacity: 0.6,
                }}
              />
            </>
          )}

          {/* Result Markers */}
          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position} icon={getMarkerIcon(marker.type)}>
              <Popup maxWidth={320}>
                {getPopupComponent(marker)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
          </ClientOnly>
        )}

        {/* Empty State */}
        {totalMarkers === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm z-[999]">
            <div className="text-center p-8">
              <MapPin className="h-16 w-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">No results with location data</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md">
                The current search results don't have location coordinates.
                Try adjusting your filters or search query.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;

