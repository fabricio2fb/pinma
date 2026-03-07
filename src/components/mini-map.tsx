'use client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige ícone padrão do Leaflet no Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


export default function MiniMap({ position }: { position?: { lat: number; lng: number }}) {
  if (!position) {
    return (
      <div className="flex items-center justify-center h-48 w-full bg-muted rounded-md">
        <div className="text-center text-muted-foreground p-4">
          <p className="text-xs">Localização não fornecida</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 w-full rounded-md overflow-hidden z-0">
      <MapContainer
          center={position}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
        >
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[position.lat, position.lng]} />
      </MapContainer>
    </div>
  );
}
