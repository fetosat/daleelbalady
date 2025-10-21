import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Locate } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({
  latitude = 30.0444, // Default to Cairo
  longitude = 31.2357,
  onLocationSelect,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: latitude, lng: longitude });

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            initializeMap();
          }
        }, 100);
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: currentLocation.lat, lng: currentLocation.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new window.google.maps.Marker({
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        map: mapInstance,
        draggable: true,
        title: 'اختر الموقع'
      });

      // Add click listener to map
      mapInstance.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        markerInstance.setPosition({ lat, lng });
        setCurrentLocation({ lat, lng });
        onLocationSelect(lat, lng);
      });

      // Add drag listener to marker
      markerInstance.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setCurrentLocation({ lat, lng });
        onLocationSelect(lat, lng);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setIsLoaded(true);
    };

    loadGoogleMaps();
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (marker && (latitude !== currentLocation.lat || longitude !== currentLocation.lng)) {
      const newPos = { lat: latitude, lng: longitude };
      marker.setPosition(newPos);
      map?.panTo(newPos);
      setCurrentLocation(newPos);
    }
  }, [latitude, longitude, marker, map]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('الموقع الجغرافي غير مدعوم في هذا المتصفح');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newPos = { lat, lng };
        
        if (marker) {
          marker.setPosition(newPos);
        }
        if (map) {
          map.panTo(newPos);
          map.setZoom(16);
        }
        
        setCurrentLocation(newPos);
        onLocationSelect(lat, lng);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('فشل في الحصول على الموقع الحالي');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">الموقع على الخريطة (اختياري)</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="text-xs"
        >
          <Locate className="h-3 w-3 mr-1" />
          الموقع الحالي
        </Button>
      </div>
      
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-stone-300"
          style={{ minHeight: '256px' }}
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-stone-600">جارٍ تحميل الخريطة...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center text-xs text-stone-600">
        <MapPin className="h-3 w-3 mr-1" />
        انقر على الخريطة أو اسحب العلامة لاختيار الموقع
      </div>
      
      <div className="text-xs text-stone-500">
        الموقع الحالي: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
      </div>
    </div>
  );
};

export default MapPicker;
