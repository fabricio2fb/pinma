'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLng } from 'leaflet';

// Corrige ícone padrão do Leaflet no Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function AdicionarMarcador({ onAdicionar }: { onAdicionar: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (onAdicionar) {
        onAdicionar(e.latlng);
      }
    },
  });
  return null;
}

type Marcador = {
    lat: number;
    lng: number;
    nome: string;
}

function Mapa({ marcadores, onAdicionar }: { marcadores: Marcador[], onAdicionar: (latlng: LatLng) => void }) {
  return (
    <MapContainer
      center={[-15.7801, -47.9292]}
      zoom={4}
      style={{ width: '100%', height: '100%' }}
      className='z-0'
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <AdicionarMarcador onAdicionar={onAdicionar} />

      {marcadores.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng]}>
          <Popup>{m.nome}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default React.memo(Mapa);
