import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Locate } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
}

const MapPickerLeaflet: React.FC<MapPickerProps> = ({
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
    const loadLeaflet = async () => {
      try {
        // Dynamically import Leaflet
        const L = await import('leaflet');
        
        // Import CSS
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        // Fix default marker icons
        delete (L as any).Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (!mapRef.current) return;

        // Initialize map
        const mapInstance = L.map(mapRef.current).setView([currentLocation.lat, currentLocation.lng], 15);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Add marker
        const markerInstance = L.marker([currentLocation.lat, currentLocation.lng], {
          draggable: true
        }).addTo(mapInstance);

        // Handle map click
        mapInstance.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          markerInstance.setLatLng([lat, lng]);
          setCurrentLocation({ lat, lng });
          onLocationSelect(lat, lng);
        });

        // Handle marker drag
        markerInstance.on('dragend', (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          setCurrentLocation({ lat, lng });
          onLocationSelect(lat, lng);
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setIsLoaded(true);

      } catch (error) {
        console.error('Error loading Leaflet:', error);
        // Fallback to simple coordinate inputs
        setIsLoaded(false);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (marker && (latitude !== currentLocation.lat || longitude !== currentLocation.lng)) {
      const newPos = [latitude, longitude];
      marker.setLatLng(newPos);
      map?.setView(newPos);
      setCurrentLocation({ lat: latitude, lng: longitude });
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
        
        if (marker) {
          marker.setLatLng([lat, lng]);
        }
        if (map) {
          map.setView([lat, lng], 16);
        }
        
        setCurrentLocation({ lat, lng });
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

  if (!isLoaded) {
    // Fallback to coordinate inputs if map fails to load
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium">الموقع الجغرافي (اختياري)</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-stone-600">خط العرض</label>
            <input
              type="number"
              step="any"
              placeholder="30.0444"
              value={currentLocation.lat || ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value) || 0;
                setCurrentLocation({ ...currentLocation, lat });
                onLocationSelect(lat, currentLocation.lng);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-stone-600">خط الطول</label>
            <input
              type="number"
              step="any"
              placeholder="31.2357"
              value={currentLocation.lng || ''}
              onChange={(e) => {
                const lng = parseFloat(e.target.value) || 0;
                setCurrentLocation({ ...currentLocation, lng });
                onLocationSelect(currentLocation.lat, lng);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
            />
          </div>
        </div>
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
    );
  }

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

export default MapPickerLeaflet;
