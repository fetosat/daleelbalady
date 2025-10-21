'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Button } from './ui/button';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationSelectorMapProps {
  onLocationSelect: (lat: number, lon: number, address?: string) => void;
  initialLocation?: { lat: number; lon: number; address?: string } | null;
}

// Component to handle map click events
const LocationMarker = ({ 
  position, 
  setPosition 
}: { 
  position: [number, number] | null; 
  setPosition: (pos: [number, number]) => void;
}) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
};

// Component to handle map center changes
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

const LocationSelectorMap = ({ 
  onLocationSelect, 
  initialLocation 
}: LocationSelectorMapProps) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lon] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.0444, 31.2357]); // Cairo default
  const [isLocating, setIsLocating] = useState(false);

  // Get user's current location
  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(newPos);
          setPosition(newPos);
          onLocationSelect(pos.coords.latitude, pos.coords.longitude);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Update parent when position changes (only when position changes, not callback)
  const positionRef = useRef(position);
  useEffect(() => {
    if (position && position !== positionRef.current) {
      positionRef.current = position;
      onLocationSelect(position[0], position[1]);
    }
  }, [position]); // Remove onLocationSelect from dependencies

  return (
    <div className="relative w-full h-full">
      {/* Location Button */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-white hover:bg-stone-50 text-stone-700 shadow-lg border"
          size="sm"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span className="ml-2">My Location</span>
        </Button>
      </div>

      {/* Instructions */}
      {!position && (
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-stone-800 p-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-stone-700 dark:text-stone-300">
              Click anywhere on the map to set your location
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <MapController center={mapCenter} />
      </MapContainer>
    </div>
  );
};

export default LocationSelectorMap;
