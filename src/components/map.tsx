'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLng } from 'leaflet';
import { useGeolocation } from '@/hooks/use-geolocation';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Tipos ───────────────────────────────────────────────
export type Marcador = { lat: number; lng: number; nome: string; };

interface OverpassPlace {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

// ─── Config de categorias Overpass ───────────────────────
const OVERPASS_FILTERS = [
  { label: 'Supermercado',        color: '#16a34a', icon: '🛒', query: '["shop"="supermarket"]' },
  { label: 'Mercadinho',          color: '#22c55e', icon: '🏪', query: '["shop"="convenience"]' },
  { label: 'Padaria',             color: '#f59e0b', icon: '🥖', query: '["shop"="bakery"]' },
  { label: 'Farmácia',            color: '#ef4444', icon: '💊', query: '["amenity"="pharmacy"]' },
  { label: 'Banco',               color: '#3b82f6', icon: '🏦', query: '["amenity"="bank"]' },
  { label: 'Caixa Eletrônico',    color: '#6366f1', icon: '🏧', query: '["amenity"="atm"]' },
  { label: 'Posto de Gasolina',   color: '#f97316', icon: '⛽', query: '["amenity"="fuel"]' },
  { label: 'Material Construção', color: '#78716c', icon: '⛏️', query: '["shop"="doityourself"]' },
  { label: 'Material Construção', color: '#78716c', icon: '🔨', query: '["shop"="hardware"]' },
  { label: 'Hortifruti',          color: '#84cc16', icon: '🍎', query: '["shop"="greengrocer"]' },
  { label: 'Açougue',             color: '#dc2626', icon: '🥩', query: '["shop"="butcher"]' },
  { label: 'Restaurante',         color: '#ec4899', icon: '🍽️', query: '["amenity"="restaurant"]' },
  { label: 'Lanchonete',          color: '#f43f5e', icon: '🍔', query: '["amenity"="fast_food"]' },
  { label: 'Hospital/UPA',        color: '#0ea5e9', icon: '🏥', query: '["amenity"="hospital"]' },
  { label: 'Clínica',             color: '#38bdf8', icon: '🩺', query: '["amenity"="clinic"]' },
  { label: 'Escola',              color: '#a855f7', icon: '🏫', query: '["amenity"="school"]' },
  { label: 'Igreja',              color: '#8b5cf6', icon: '⛪', query: '["amenity"="place_of_worship"]' },
  { label: 'Lotérica',            color: '#10b981', icon: '🎰', query: '["shop"="lottery"]' },
  { label: 'Pet Shop',            color: '#f472b6', icon: '🐕', query: '["shop"="pet"]' },
];

// ─── Busca Overpass ───────────────────────────────────────
async function buscarEstabelecimentos(lat: number, lng: number, raio = 2000): Promise<OverpassPlace[]> {
  const filters = OVERPASS_FILTERS.map(f => `node${f.query}(around:${raio},${lat},${lng});`).join('\n');
  const query = `[out:json][timeout:25];\n(\n${filters}\n);\nout body;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
  });
  const data = await res.json();
  return data.elements || [];
}

function getCategoryInfo(tags: Record<string, string>) {
  for (const cat of OVERPASS_FILTERS) {
    const [key, value] = cat.query.replace(/["\[\]]/g, '').split('=');
    if (tags[key] === value) return cat;
  }
  return { label: 'Local', color: '#6b7280', icon: '📍' };
}

// ─── Componente de localização + busca Overpass ──────────
function LocationMarker({ onLocationFound, onAdicionar }: { onLocationFound?: (lat: number, lng: number) => void; onAdicionar?: (latlng: LatLng) => void }) {
  const { location, startWatching, stopWatching } = useGeolocation();
  const [position, setPosition] = React.useState<LatLng | null>(null);
  const [places, setPlaces] = React.useState<OverpassPlace[]>([]);
  const [loading, setLoading] = React.useState(false);
  const buscado = React.useRef(false);
  const map = useMap(); // Pegando a instância do mapa diretamente

  // Inicia o rastreamento real-time assim que montar
  React.useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, [startWatching, stopWatching]);

  // Atualiza mapa, pino e busca no overpass se posição existir
  React.useEffect(() => {
    if (location) {
      const newPos = new L.LatLng(location.lat, location.lng);
      setPosition(newPos);
      
      // O flyTo roda só a primeira vez para não ficar puxando mapa se user mexer no zoom e mapa
      if (!buscado.current) {
        buscado.current = true;
        map.flyTo(newPos, 15, { animate: true, duration: 1.5 });
        
        setLoading(true);
        buscarEstabelecimentos(location.lat, location.lng, 3000)
          .then(setPlaces)
          .catch(console.error)
          .finally(() => setLoading(false));
      }

      onLocationFound?.(location.lat, location.lng);
    }
  }, [location, map, onLocationFound]);

  return (
    <>
      {/* Marcador do usuário */}
      {position && (
        <CircleMarker
          center={position}
          pathOptions={{ fillColor: '#2563EB', color: '#ffffff', weight: 3, fillOpacity: 1 }}
          radius={8}
        >
          <Popup>Você está aqui!</Popup>
        </CircleMarker>
      )}

      {/* Loading indicator */}
      {loading && position && (
        <CircleMarker
          center={position}
          pathOptions={{ color: '#2563EB', fillOpacity: 0, weight: 2, dashArray: '5,5' }}
          radius={40}
        />
      )}

      {/* Marcadores Overpass */}
      {places.map(place => {
        const cat = getCategoryInfo(place.tags);
        const nome = place.tags.name || cat.label;
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:24px;height:24px;border-radius:50%;
            background:${cat.color};
            border:2px solid white;
            box-shadow:0 1px 3px rgba(0,0,0,0.4);
            display:flex;align-items:center;justify-content:center;
            font-size:12px;
          ">${cat.icon}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        return (
          <Marker key={place.id} position={[place.lat, place.lon]} icon={icon}>
            <Popup className="custom-popup">
              <div className="p-3 flex flex-col gap-1 min-w-[220px]">
                <div className="flex items-start justify-between gap-3 mb-1 pr-4">
                  <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2">{nome}</h3>
                  <span className="text-xl leading-none pt-0.5">{cat.icon}</span>
                </div>
                
                <div 
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit" 
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {cat.label}
                </div>
                
                {place.tags['addr:street'] && (
                  <p className="text-xs text-muted-foreground mt-2 leading-snug flex items-start gap-1">
                    <span className="mt-0.5 text-xs">📍</span>
                    <span>
                      {place.tags['addr:street']}{place.tags['addr:housenumber'] ? `, ${place.tags['addr:housenumber']}` : ''}
                    </span>
                  </p>
                )}
                
                {place.tags.opening_hours && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <span className="text-xs">🕒</span>
                    <span>{place.tags.opening_hours}</span>
                  </p>
                )}

                <button 
                  className="mt-3 w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs py-2 rounded-lg transition-colors border border-primary/20 flex items-center justify-center gap-1.5"
                  onClick={(e) => {
                     e.stopPropagation();
                     if (onAdicionar) {
                       onAdicionar({ lat: place.lat, lng: place.lon } as LatLng);
                     }
                  }}
                >
                  <span className="text-sm">📌</span> Criar Lembrete
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function AdicionarMarcador({ onAdicionar }: { onAdicionar: (latlng: LatLng) => void }) {
  useMapEvents({ click(e) { onAdicionar(e.latlng); } });
  return null;
}

// ─── Componente principal ─────────────────────────────────
export default function Mapa({
  marcadores,
  onAdicionar,
}: {
  marcadores: Marcador[];
  onAdicionar: (latlng: LatLng) => void;
}) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={4}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onAdicionar={onAdicionar} />
        <AdicionarMarcador onAdicionar={onAdicionar} />

        {marcadores.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            <Popup>{m.nome}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}