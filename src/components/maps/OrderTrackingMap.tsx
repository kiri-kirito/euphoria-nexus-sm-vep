'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Next.js/webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

interface OrderTrackingMapProps {
  pickup?: MapPoint;
  delivery?: MapPoint;
  agent?: MapPoint;
  status?: string;
  className?: string;
}

export default function OrderTrackingMap({
  pickup,
  delivery,
  agent,
  status = 'pending',
  className = '',
}: OrderTrackingMapProps) {
  const points = [pickup, delivery, agent].filter(Boolean) as MapPoint[];
  const center = points[0] || { lat: 23.8103, lng: 90.4125, label: 'Dhaka' };
  const routeCoords: [number, number][] = points.map((p) => [p.lat, p.lng]);

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-56 w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>{pickup.label} (Pickup)</Popup>
          </Marker>
        )}
        {delivery && (
          <Marker position={[delivery.lat, delivery.lng]}>
            <Popup>{delivery.label} (Delivery)</Popup>
          </Marker>
        )}
        {agent && status !== 'delivered' && (
          <Marker position={[agent.lat, agent.lng]}>
            <Popup>{agent.label} (Agent)</Popup>
          </Marker>
        )}
        {routeCoords.length >= 2 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#2563eb', weight: 3, dashArray: '8 8' }} />
        )}
      </MapContainer>
      <p className="text-xs text-slate-500 px-3 py-2 bg-slate-50 border-t border-slate-200">
        Live route via OpenStreetMap · Status: <span className="font-semibold capitalize">{status.replace(/_/g, ' ')}</span>
      </p>
    </div>
  );
}
