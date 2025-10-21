'use client'

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';
import ClientOnly from './ClientOnly';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomMarkerIcon = (color: string = '#3b82f6') => {
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
        font-size: 20px;
      ">📍</span>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface MarkerData {
  position: [number, number];
  title?: string;
  description?: string;
}

interface SingleLocationMapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  height?: string;
  markerColor?: string;
}

const SingleLocationMapView: React.FC<SingleLocationMapViewProps> = ({
  center,
  zoom = 15,
  markers = [],
  height = '300px',
  markerColor = '#3b82f6'
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark';
  
  // If no markers provided, create one at center
  const displayMarkers = markers.length > 0 ? markers : [{ position: center }];
  
  return (
    <div style={{ height, width: '100%' }} className="relative">
      <ClientOnly fallback={<div className="h-full bg-muted animate-pulse rounded-lg" />}>
        <MapContainer
          key={`single-map-${center[0]}-${center[1]}-${zoom}`}
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          {/* Tile Layer - OpenStreetMap (with dark mode support) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />
          
          {/* Markers */}
          {displayMarkers.map((marker, idx) => (
            <Marker 
              key={idx} 
              position={marker.position}
              icon={createCustomMarkerIcon(markerColor)}
            >
              {(marker.title || marker.description) && (
                <Popup>
                  <div className="min-w-[200px]">
                    {marker.title && (
                      <h3 className="font-bold text-base mb-1">{marker.title}</h3>
                    )}
                    {marker.description && (
                      <p className="text-sm text-muted-foreground">{marker.description}</p>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </ClientOnly>
    </div>
  );
};

export default SingleLocationMapView;

