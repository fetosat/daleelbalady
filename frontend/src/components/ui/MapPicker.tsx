import { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface MapPickerProps {
  defaultLat?: number;
  defaultLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function MapPicker({ defaultLat = 30.0444, defaultLng = 31.2357, onLocationSelect }: MapPickerProps) {
  const [lat, setLat] = useState<number>(defaultLat);
  const [lng, setLng] = useState<number>(defaultLng);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    onLocationSelect(lat, lng);
  }, [lat, lng]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          setLat(newLat);
          setLng(newLng);
          onLocationSelect(newLat, newLng);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [onLocationSelect]);

  const searchAddress = useCallback(async () => {
    if (!address.trim()) return;
    
    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setLat(newLat);
        setLng(newLng);
        onLocationSelect(newLat, newLng);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  }, [address, onLocationSelect]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Shop Location
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Enter coordinates manually or use the buttons below
        </p>
      </div>

      {/* Manual coordinate input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="map-lat" className="text-xs">Latitude</Label>
          <Input
            id="map-lat"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            placeholder="30.0444"
          />
        </div>
        <div>
          <Label htmlFor="map-lng" className="text-xs">Longitude</Label>
          <Input
            id="map-lng"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            placeholder="31.2357"
          />
        </div>
      </div>

      {/* Address search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search for address (e.g., Cairo, Egypt)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              searchAddress();
            }
          }}
        />
        <Button type="button" onClick={searchAddress} variant="outline">
          Search
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Use My Location
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')}
          className="flex-1"
        >
          View on Map
        </Button>
      </div>

      {/* Map preview */}
      <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`}
          allowFullScreen
        />
      </div>
    </div>
  );
}

