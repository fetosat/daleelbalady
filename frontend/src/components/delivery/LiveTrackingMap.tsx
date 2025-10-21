'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Package } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface LiveTrackingMapProps {
  deliveryLocation: Location;
  pickupLocation?: Location;
  currentLocation?: Location;
  path?: Location[];
  className?: string;
  showRoute?: boolean;
  onLocationUpdate?: (location: Location) => void;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  deliveryLocation,
  pickupLocation,
  currentLocation,
  path = [],
  className = '',
  showRoute = true,
  onLocationUpdate,
}) => {
  const mapRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [customIcons, setCustomIcons] = useState<any>({});

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Create custom icons when Leaflet is loaded
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        const deliveryIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full shadow-lg border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        const pickupIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full shadow-lg border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7.5 4.27c-.447.275-.65.567-.65 1.73 0 1.163.203 1.455.65 1.73C8.75 8.26 11 9.5 12 9.5s3.25-1.24 4.5-1.77c.447-.275.65-.567.65-1.73 0-1.163-.203-1.455-.65-1.73C15.25 3.74 13 2.5 12 2.5s-3.25 1.24-4.5 1.77Z"/>
                <path d="m4.27 9.27 3 1.734a2.5 2.5 0 0 0 2.73 0l4-2.308a2.5 2.5 0 0 0 1.16-1.596l.54-2.32c.16-.692-.19-1.4-.82-1.76L12 2.5l-.09.05L8.64 4.3a2.5 2.5 0 0 0-1.16 1.596l-.54 2.32c-.16.692.19 1.4.82 1.76l-3.49 1.584Z"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        const driverIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full shadow-xl border-3 border-white animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="m8 6 4-4 4 4"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48],
        });

        setCustomIcons({
          delivery: deliveryIcon,
          pickup: pickupIcon,
          driver: driverIcon,
        });
      });
    }
  }, [isClient]);

  // Update map view when currentLocation changes
  useEffect(() => {
    if (map && currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], map.getZoom());
    }
  }, [map, currentLocation]);

  // Fit map to show all markers
  useEffect(() => {
    if (map && isClient && customIcons.delivery) {
      import('leaflet').then((L) => {
        const bounds = L.latLngBounds([]);
        
        // Add all marker positions to bounds
        if (deliveryLocation) {
          bounds.extend([deliveryLocation.lat, deliveryLocation.lng]);
        }
        if (pickupLocation) {
          bounds.extend([pickupLocation.lat, pickupLocation.lng]);
        }
        if (currentLocation) {
          bounds.extend([currentLocation.lat, currentLocation.lng]);
        }

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    }
  }, [map, deliveryLocation, pickupLocation, currentLocation, isClient, customIcons]);

  if (!isClient) {
    return (
      <div className={`w-full h-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  // Default center (Cairo)
  const center: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : deliveryLocation
    ? [deliveryLocation.lat, deliveryLocation.lng]
    : [30.0444, 31.2357];

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg z-0"
        whenReady={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Location Marker */}
        {pickupLocation && customIcons.pickup && (
          <Marker
            position={[pickupLocation.lat, pickupLocation.lng]}
            icon={customIcons.pickup}
          >
            <Popup>
              <div className="text-center">
                <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm">موقع الاستلام</h4>
                {pickupLocation.address && (
                  <p className="text-xs text-gray-600 mt-1">
                    {pickupLocation.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery Location Marker */}
        {deliveryLocation && customIcons.delivery && (
          <Marker
            position={[deliveryLocation.lat, deliveryLocation.lng]}
            icon={customIcons.delivery}
          >
            <Popup>
              <div className="text-center">
                <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm">موقع التوصيل</h4>
                {deliveryLocation.address && (
                  <p className="text-xs text-gray-600 mt-1">
                    {deliveryLocation.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current Location (Driver) Marker */}
        {currentLocation && customIcons.driver && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={customIcons.driver}
          >
            <Popup>
              <div className="text-center">
                <Navigation className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm">المندوب الآن</h4>
                {currentLocation.address && (
                  <p className="text-xs text-gray-600 mt-1">
                    {currentLocation.address}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  تحديث مباشر
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Path */}
        {showRoute && path.length > 1 && (
          <Polyline
            positions={path.map((loc) => [loc.lat, loc.lng])}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">الرموز</h4>
        <div className="space-y-2 text-xs">
          {pickupLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">موقع الاستلام</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">موقع التوصيل</span>
          </div>
          {currentLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">المندوب (مباشر)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;

