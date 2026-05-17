'use client';

import { useMemo } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './lp.module.css';

type PoiKind = 'reminder' | 'saved' | 'place' | 'user';

type Poi = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  color: string;
  icon: string;
  kind: PoiKind;
  subtitle: string;
};

const center: [number, number] = [-22.8268, -43.0634];

const pois: Poi[] = [
  {
    id: 'user',
    name: 'Você',
    category: 'Localização atual',
    lat: -22.8268,
    lng: -43.0634,
    color: '#2563eb',
    icon: '➤',
    kind: 'user',
    subtitle: 'Centro do mapa',
  },
  {
    id: 'reminder-1',
    name: 'Comprar manteiga',
    category: 'Mercado',
    lat: -22.8248,
    lng: -43.0662,
    color: '#19c37d',
    icon: 'N',
    kind: 'reminder',
    subtitle: 'Lembrete ativo • 100m',
  },
  {
    id: 'reminder-2',
    name: 'Buscar remédio',
    category: 'Farmácia',
    lat: -22.8292,
    lng: -43.0587,
    color: '#ef4444',
    icon: 'N',
    kind: 'reminder',
    subtitle: 'Prioridade urgente • 250m',
  },
  {
    id: 'saved-1',
    name: 'Casa',
    category: 'Meus Lugares',
    lat: -22.8314,
    lng: -43.0671,
    color: '#35d0c0',
    icon: '★',
    kind: 'saved',
    subtitle: 'Lugar favorito salvo',
  },
  {
    id: 'saved-2',
    name: 'Trabalho',
    category: 'Meus Lugares',
    lat: -22.8215,
    lng: -43.0574,
    color: '#d7a900',
    icon: 'B',
    kind: 'saved',
    subtitle: 'Atalho para criar lembretes',
  },
  {
    id: 'poi-1',
    name: 'Mercado São Jorge',
    category: 'Mercado',
    lat: -22.8279,
    lng: -43.0712,
    color: '#10b981',
    icon: '🛒',
    kind: 'place',
    subtitle: 'Estabelecimento próximo',
  },
  {
    id: 'poi-2',
    name: 'Farmácia Popular',
    category: 'Farmácia',
    lat: -22.8238,
    lng: -43.0554,
    color: '#dc2626',
    icon: '💊',
    kind: 'place',
    subtitle: '230m de distância',
  },
  {
    id: 'poi-3',
    name: 'Banco 24h',
    category: 'Banco',
    lat: -22.8332,
    lng: -43.0606,
    color: '#2563eb',
    icon: '🏦',
    kind: 'place',
    subtitle: 'Caixa eletrônico próximo',
  },
  {
    id: 'poi-4',
    name: 'Padaria Central',
    category: 'Padaria',
    lat: -22.8198,
    lng: -43.0644,
    color: '#d97706',
    icon: '🥖',
    kind: 'place',
    subtitle: 'Aberto agora',
  },
];

function makeIcon(poi: Poi, compact: boolean) {
  if (poi.kind === 'user') {
    return L.divIcon({
      className: styles.leafletCleanIcon,
      html: `<div class="${styles.lpUserMarker}"><span>${poi.icon}</span></div>`,
      iconSize: compact ? [34, 34] : [42, 42],
      iconAnchor: compact ? [17, 17] : [21, 21],
    });
  }

  if (poi.kind === 'reminder' || poi.kind === 'saved') {
    return L.divIcon({
      className: styles.leafletCleanIcon,
      html: `
        <div class="${styles.lpReminderMarker}" style="--pin-color:${poi.color}">
          <img src="/logob.png" alt="" />
          <span>${poi.icon}</span>
        </div>
      `,
      iconSize: compact ? [40, 52] : [48, 62],
      iconAnchor: compact ? [20, 40] : [24, 48],
      popupAnchor: [0, -40],
    });
  }

  return L.divIcon({
    className: styles.leafletCleanIcon,
    html: `
      <div class="${styles.lpPoiMarker}" style="--pin-color:${poi.color}">
        <b>${poi.icon}</b>
        ${compact ? '' : `<span>${poi.name}</span>`}
      </div>
    `,
    iconSize: compact ? [32, 32] : [150, 34],
    iconAnchor: compact ? [16, 16] : [17, 17],
    popupAnchor: [0, -18],
  });
}

export function LpRealMap({ compact = false }: { compact?: boolean }) {
  const markerIcons = useMemo(
    () => Object.fromEntries(pois.map((poi) => [poi.id, makeIcon(poi, compact)])),
    [compact]
  );

  return (
    <div className={compact ? styles.realMapCompact : styles.realMap}>
      <MapContainer
        center={center}
        zoom={compact ? 15 : 14}
        scrollWheelZoom={false}
        dragging={!compact}
        touchZoom={!compact}
        doubleClickZoom={!compact}
        zoomControl={false}
        className={styles.realMapCanvas}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap & Carto"
        />
        {!compact && <ZoomControl position="bottomright" />}
        <Circle
          center={center}
          radius={compact ? 420 : 680}
          pathOptions={{
            color: '#19c37d',
            fillColor: '#19c37d',
            fillOpacity: 0.08,
            weight: 1,
          }}
        />
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={markerIcons[poi.id]}
          >
            <Popup className="custom-popup">
              <div className={styles.lpPopup}>
                <strong>{poi.name}</strong>
                <span>{poi.category}</span>
                <p>{poi.subtitle}</p>
                {poi.kind !== 'user' ? <button>Criar lembrete aqui</button> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
