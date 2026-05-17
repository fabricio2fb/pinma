'use client';

import * as React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  CircleMarker,
  Circle,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLng } from 'leaflet';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Navigation, Moon, Sun } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─────────────────────────────────────────────
// Correção padrão dos ícones do Leaflet no Next
// ─────────────────────────────────────────────

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─────────────────────────────────────────────
// Tipos básicos usados pelo componente
// ─────────────────────────────────────────────

export type Marcador = {
  lat: number;
  lng: number;
  nome: string;
  id?: string;
  categoria?: string;
  descricao?: string;
  prioridade?: string;
  is_active?: boolean;
  kind?: 'reminder' | 'savedPlace';
};

interface OverpassPlace {
  id: number;
  lat?: number;
  lon?: number;
  tags: Record<string, string>;
  center?: {
    lat: number;
    lon: number;
  };
  type: 'node' | 'way' | 'relation';
}

type CategoryInfo = {
  label: string;
  color: string;
  icon: string;
  query: string;
  priority: number;
};

// ─────────────────────────────────────────────
// Categorias úteis para o MVP
// ─────────────────────────────────────────────
// IMPORTANTE:
// Hoje essas categorias são usadas para buscar lugares na Overpass API.
// Futuramente, quando você adicionar cache de mapa, esse array pode continuar
// sendo usado como "fonte de configuração" dos filtros.
//
// Exemplo futuro:
// - primeiro buscar no cache local/Supabase os pontos dessas categorias
// - se não tiver cache ou estiver vencido, buscar no Overpass
// - salvar no cache
// - renderizar no mapa
// ─────────────────────────────────────────────

const OVERPASS_FILTERS: CategoryInfo[] = [
  // Prioridade 1 — compras rápidas
  {
    label: 'Supermercado',
    color: '#059669',
    icon: '🛒',
    query: '["shop"="supermarket"]',
    priority: 1,
  },
  {
    label: 'Mercado',
    color: '#10b981',
    icon: '🏪',
    query: '["shop"="convenience"]',
    priority: 1,
  },
  {
    label: 'Mercadinho',
    color: '#22c55e',
    icon: '🛍️',
    query: '["shop"="general"]',
    priority: 1,
  },
  {
    label: 'Mercearia',
    color: '#16a34a',
    icon: '🥫',
    query: '["shop"="grocery"]',
    priority: 1,
  },
  {
    label: 'Padaria',
    color: '#d97706',
    icon: '🥖',
    query: '["shop"="bakery"]',
    priority: 1,
  },
  {
    label: 'Açougue',
    color: '#b91c1c',
    icon: '🥩',
    query: '["shop"="butcher"]',
    priority: 1,
  },
  {
    label: 'Hortifruti',
    color: '#65a30d',
    icon: '🥬',
    query: '["shop"="greengrocer"]',
    priority: 1,
  },
  {
    label: 'Shopping',
    color: '#ec4899',
    icon: '🛍️',
    query: '["shop"="mall"]',
    priority: 1,
  },

  // Prioridade 2 — saúde
  {
    label: 'Farmácia',
    color: '#dc2626',
    icon: '💊',
    query: '["amenity"="pharmacy"]',
    priority: 2,
  },
  {
    label: 'Hospital/UPA',
    color: '#0284c7',
    icon: '🏥',
    query: '["amenity"="hospital"]',
    priority: 2,
  },
  {
    label: 'Clínica',
    color: '#0ea5e9',
    icon: '🏥',
    query: '["amenity"="clinic"]',
    priority: 2,
  },
  {
    label: 'Consultório',
    color: '#38bdf8',
    icon: '🩺',
    query: '["amenity"="doctors"]',
    priority: 2,
  },
  {
    label: 'Dentista',
    color: '#06b6d4',
    icon: '🦷',
    query: '["amenity"="dentist"]',
    priority: 2,
  },
  {
    label: 'Veterinário',
    color: '#f97316',
    icon: '🐾',
    query: '["amenity"="veterinary"]',
    priority: 2,
  },
  {
    label: 'Pet Shop',
    color: '#fb923c',
    icon: '🐶',
    query: '["shop"="pet"]',
    priority: 2,
  },

  // Prioridade 3 — dinheiro e serviços públicos
  {
    label: 'Banco',
    color: '#2563eb',
    icon: '🏦',
    query: '["amenity"="bank"]',
    priority: 3,
  },
  {
    label: 'Caixa Eletrônico',
    color: '#4f46e5',
    icon: '🏧',
    query: '["amenity"="atm"]',
    priority: 3,
  },
  {
    label: 'Correios',
    color: '#ca8a04',
    icon: '📦',
    query: '["amenity"="post_office"]',
    priority: 3,
  },
  {
    label: 'Polícia',
    color: '#1d4ed8',
    icon: '👮',
    query: '["amenity"="police"]',
    priority: 3,
  },
  {
    label: 'Bombeiros',
    color: '#dc2626',
    icon: '🚒',
    query: '["amenity"="fire_station"]',
    priority: 3,
  },
  {
    label: 'Prefeitura/Órgão Público',
    color: '#334155',
    icon: '🏛️',
    query: '["office"="government"]',
    priority: 3,
  },
  {
    label: 'Repartição Pública',
    color: '#475569',
    icon: '🏢',
    query: '["amenity"="public_building"]',
    priority: 3,
  },
  {
    label: 'Cartório',
    color: '#7f1d1d',
    icon: '📜',
    query: '["office"="notary"]',
    priority: 3,
  },
  {
    label: 'Advocacia',
    color: '#78350f',
    icon: '⚖️',
    query: '["office"="lawyer"]',
    priority: 3,
  },

  // Prioridade 4 — comida
  {
    label: 'Restaurante',
    color: '#db2777',
    icon: '🍽️',
    query: '["amenity"="restaurant"]',
    priority: 4,
  },
  {
    label: 'Lanchonete',
    color: '#e11d48',
    icon: '🍔',
    query: '["amenity"="fast_food"]',
    priority: 4,
  },
  {
    label: 'Café',
    color: '#92400e',
    icon: '☕',
    query: '["amenity"="cafe"]',
    priority: 4,
  },
  {
    label: 'Bar',
    color: '#7c2d12',
    icon: '🍺',
    query: '["amenity"="bar"]',
    priority: 4,
  },
  {
    label: 'Sorveteria',
    color: '#db2777',
    icon: '🍦',
    query: '["amenity"="ice_cream"]',
    priority: 4,
  },

  // Prioridade 5 — rotina, educação e religião
  {
    label: 'Escola',
    color: '#9333ea',
    icon: '🏫',
    query: '["amenity"="school"]',
    priority: 5,
  },
  {
    label: 'Universidade',
    color: '#7c3aed',
    icon: '🎓',
    query: '["amenity"="university"]',
    priority: 5,
  },
  {
    label: 'Creche',
    color: '#a855f7',
    icon: '🧸',
    query: '["amenity"="kindergarten"]',
    priority: 5,
  },
  {
    label: 'Academia',
    color: '#f59e0b',
    icon: '🏋️',
    query: '["leisure"="fitness_centre"]',
    priority: 5,
  },
  {
    label: 'Igreja',
    color: '#7c3aed',
    icon: '⛪',
    query: '["amenity"="place_of_worship"]',
    priority: 5,
  },
  {
    label: 'Biblioteca',
    color: '#a855f7',
    icon: '📚',
    query: '["amenity"="library"]',
    priority: 5,
  },

  // Prioridade 6 — deslocamento útil
  {
    label: 'Posto de Gasolina',
    color: '#ea580c',
    icon: '⛽',
    query: '["amenity"="fuel"]',
    priority: 6,
  },
  {
    label: 'Estacionamento',
    color: '#64748b',
    icon: '🅿️',
    query: '["amenity"="parking"]',
    priority: 6,
  },
  {
    label: 'Lava Jato',
    color: '#0f766e',
    icon: '🚗',
    query: '["amenity"="car_wash"]',
    priority: 6,
  },
  {
    label: 'Aluguel de Carro',
    color: '#0369a1',
    icon: '🚘',
    query: '["amenity"="car_rental"]',
    priority: 6,
  },

  // Prioridade 7 — comércio e serviços úteis
  {
    label: 'Barbearia',
    color: '#0f172a',
    icon: '💈',
    query: '["shop"="hairdresser"]',
    priority: 7,
  },
  {
    label: 'Salão de Beleza',
    color: '#be185d',
    icon: '💇',
    query: '["shop"="beauty"]',
    priority: 7,
  },
  {
    label: 'Lavanderia',
    color: '#0891b2',
    icon: '🧺',
    query: '["shop"="laundry"]',
    priority: 7,
  },
  {
    label: 'Material de Construção',
    color: '#92400e',
    icon: '🧱',
    query: '["shop"="doityourself"]',
    priority: 7,
  },
  {
    label: 'Ferragens',
    color: '#78350f',
    icon: '🔩',
    query: '["shop"="hardware"]',
    priority: 7,
  },
  {
    label: 'Loja de Celular',
    color: '#0891b2',
    icon: '📱',
    query: '["shop"="mobile_phone"]',
    priority: 7,
  },
  {
    label: 'Eletrônicos',
    color: '#0e7490',
    icon: '💻',
    query: '["shop"="electronics"]',
    priority: 7,
  },
  {
    label: 'Roupas',
    color: '#be185d',
    icon: '👕',
    query: '["shop"="clothes"]',
    priority: 7,
  },
  {
    label: 'Calçados',
    color: '#9f1239',
    icon: '👟',
    query: '["shop"="shoes"]',
    priority: 7,
  },
  {
    label: 'Livraria',
    color: '#a855f7',
    icon: '📚',
    query: '["shop"="books"]',
    priority: 7,
  },
  {
    label: 'Papelaria',
    color: '#4f46e5',
    icon: '✏️',
    query: '["shop"="stationery"]',
    priority: 7,
  },
  {
    label: 'Móveis',
    color: '#854d0e',
    icon: '🪑',
    query: '["shop"="furniture"]',
    priority: 7,
  },
  {
    label: 'Florista',
    color: '#16a34a',
    icon: '🌹',
    query: '["shop"="florist"]',
    priority: 7,
  },
  {
    label: 'Ótica',
    color: '#0f766e',
    icon: '👓',
    query: '["shop"="optician"]',
    priority: 7,
  },
  {
    label: 'Oficina',
    color: '#475569',
    icon: '🔧',
    query: '["shop"="car_repair"]',
    priority: 7,
  },
  {
    label: 'Bicicletaria',
    color: '#15803d',
    icon: '🚲',
    query: '["shop"="bicycle"]',
    priority: 7,
  },
];

// ─────────────────────────────────────────────
// Bloqueios contra lixo do OSM
// ─────────────────────────────────────────────
// O OpenStreetMap pode retornar lugares ruins ou genéricos.
// Essas listas ajudam a limpar resultado ruim antes de mostrar no mapa.
// ─────────────────────────────────────────────

const BLOCKED_NAMES = new Set([
  '',
  'yes',
  'no',
  'null',
  'undefined',
  'local',
  'poi',
  'pitch',
  'park',
  'track',
  'guard',
  'swimming_pool',
  'sports_centre',
  'bus_stop',
  'platform',
  'stop_position',
  'bench',
  'shelter',
  'waste_basket',
  'crossing',
  'traffic_signals',
]);

const BLOCKED_TAGS: Record<string, string[]> = {
  leisure: [
    'pitch',
    'park',
    'track',
    'swimming_pool',
    'sports_centre',
    'playground',
  ],
  public_transport: ['platform', 'stop_position', 'station'],
  highway: ['bus_stop', 'crossing', 'traffic_signals'],
  railway: ['station', 'halt', 'tram_stop'],
  amenity: ['bench', 'shelter', 'waste_basket'],
};

// ─────────────────────────────────────────────
// Utilitários de texto e distância
// ─────────────────────────────────────────────

function normalizeText(value?: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function truncateLabel(value: string, max = 22) {
  if (value.length <= max) return value;
  return value.slice(0, max).trim() + '...';
}

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const earthRadius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────
// Extrai key/value da query do Overpass
// Exemplo:
// '["shop"="supermarket"]'
// vira:
// { key: 'shop', value: 'supermarket' }
// ─────────────────────────────────────────────

function extractQueryParts(query: string) {
  const cleanQuery = query.replace(/["\[\]]/g, '');
  const equalIndex = cleanQuery.indexOf('=');

  if (equalIndex === -1) {
    return null;
  }

  return {
    key: cleanQuery.substring(0, equalIndex),
    value: cleanQuery.substring(equalIndex + 1),
  };
}

// ─────────────────────────────────────────────
// Descobre a categoria de um lugar pelas tags do OSM
// ─────────────────────────────────────────────

function getCategoryInfo(tags: Record<string, string>) {
  for (const cat of OVERPASS_FILTERS) {
    const parts = extractQueryParts(cat.query);
    if (!parts) continue;

    if (tags[parts.key] === parts.value) {
      return cat;
    }
  }

  return null;
}

function shouldBlockByTags(tags: Record<string, string>) {
  return Object.entries(BLOCKED_TAGS).some(([key, values]) => {
    const value = tags[key];
    return value && values.includes(value);
  });
}

function getPlaceName(tags: Record<string, string>, fallbackLabel?: string) {
  const name = tags.name || tags['name:pt'] || tags.brand || tags.operator || '';
  const normalized = normalizeText(name);

  if (!normalized || BLOCKED_NAMES.has(normalized)) {
    return '';
  }

  if (fallbackLabel && normalized === normalizeText(fallbackLabel)) {
    return '';
  }

  return name.trim();
}

// ─────────────────────────────────────────────
// Normaliza node/way/relation do Overpass
// ─────────────────────────────────────────────
// Node vem com lat/lon direto.
// Way/relation normalmente vem com center.lat/center.lon.
// Essa função transforma tudo em _normalizedLat/_normalizedLng.
// ─────────────────────────────────────────────

function normalizeOverpassPlace(place: OverpassPlace) {
  let lat: number | null = null;
  let lng: number | null = null;
  let type: string | undefined = place.type;

  if (type === 'node') {
    lat = place.lat ?? null;
    lng = place.lon ?? null;
  } else if (type === 'way' || type === 'relation') {
    lat = place.center?.lat ?? null;
    lng = place.center?.lon ?? null;
  } else if (place.lat !== undefined && place.lon !== undefined) {
    lat = place.lat;
    lng = place.lon;
    type = 'node';
  }

  if (lat === null || lng === null) {
    return null;
  }

  return {
    ...place,
    _normalizedLat: lat,
    _normalizedLng: lng,
    _type: type || 'node',
  };
}

// ─────────────────────────────────────────────
// Busca estabelecimentos próximos usando Overpass
// ─────────────────────────────────────────────
// ATENÇÃO PARA CACHE FUTURO:
// Essa é a função principal para trocar depois.
//
// Hoje:
// - monta uma query para todas as categorias
// - chama Overpass
// - retorna os elementos
//
// Futuro com cache:
// 1. calcular uma chave de cache por região:
//    exemplo: cacheKey = `${Math.round(lat * 100)}:${Math.round(lng * 100)}:${raio}`
// 2. procurar no cache local/Supabase/IndexedDB
// 3. se existir e não estiver vencido, retornar cache
// 4. se não existir, chamar Overpass
// 5. salvar resultado no cache
// 6. retornar resultado
//
// Exemplo de TTL:
// - cache de 24 horas para lugares públicos
// - cache de 7 dias para mapa base
// ─────────────────────────────────────────────

async function buscarEstabelecimentos(
  lat: number,
  lng: number,
  raio = 3500
): Promise<OverpassPlace[]> {
  // TODO CACHE:
  // Aqui futuramente você pode tentar carregar primeiro do cache.
  // Exemplo:
  // const cached = await getPlacesFromCache(lat, lng, raio);
  // if (cached) return cached;

  const filters = OVERPASS_FILTERS.map((cat) => {
    const parts = extractQueryParts(cat.query);
    if (!parts) return '';

    return `
      node["${parts.key}"="${parts.value}"](around:${raio},${lat},${lng});
      way["${parts.key}"="${parts.value}"](around:${raio},${lat},${lng});
      relation["${parts.key}"="${parts.value}"](around:${raio},${lat},${lng});
    `;
  }).join('\n');

  const query = `
[out:json][timeout:25];
(
  ${filters}
);
out center tags;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
  });

  if (!res.ok) {
    throw new Error('Erro ao buscar estabelecimentos no Overpass');
  }

  const data = await res.json();
  const elements = data.elements || [];

  // TODO CACHE:
  // Depois que buscar na API, você poderá salvar no cache aqui.
  // Exemplo:
  // await savePlacesToCache(lat, lng, raio, elements);

  return elements;
}

// ─────────────────────────────────────────────
// Marcador de localização do usuário + POIs próximos
// ─────────────────────────────────────────────
// Esse componente fica dentro do MapContainer.
// Ele:
// - inicia o GPS
// - centraliza no usuário
// - busca os estabelecimentos próximos
// - filtra os pontos por categoria selecionada
// - renderiza os marcadores no mapa
// ─────────────────────────────────────────────

function LocationMarker({
  onLocationFound,
  onAdicionar,
  activeFilter,
}: {
  onLocationFound?: (lat: number, lng: number) => void;
  onAdicionar?: (latlng: LatLng) => void;
  activeFilter?: string;
}) {
  const { location, startWatching, stopWatching } = useGeolocation();

  const [position, setPosition] = React.useState<LatLng | null>(null);
  const [places, setPlaces] = React.useState<OverpassPlace[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Evita buscar várias vezes ao receber updates do GPS.
  // Hoje busca só uma vez na primeira localização encontrada.
  const buscado = React.useRef(false);

  const map = useMap();

  React.useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, [startWatching, stopWatching]);

  React.useEffect(() => {
    if (!location) return;

    const newPos = new L.LatLng(location.lat, location.lng);
    setPosition(newPos);

    if (!buscado.current) {
      buscado.current = true;

      map.flyTo(newPos, 15, {
        animate: true,
        duration: 1.5,
      });

      setLoading(true);

      // Aqui carrega os estabelecimentos próximos.
      // Futuramente, essa chamada pode vir do cache através da função buscarEstabelecimentos.
      buscarEstabelecimentos(location.lat, location.lng, 3500)
        .then(setPlaces)
        .catch(console.error)
        .finally(() => setLoading(false));
    }

    onLocationFound?.(location.lat, location.lng);
  }, [location, map, onLocationFound]);

  const centrarNoUsuario = () => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16, {
        animate: true,
      });
    }
  };

  // ─────────────────────────────────────────────
  // Filtragem dos POIs
  // ─────────────────────────────────────────────
  // Aqui NÃO busca de novo na API.
  // O filtro só pega os lugares já carregados e mostra/esconde.
  //
  // activeFilter === undefined:
  // - mostra todas as categorias
  //
  // activeFilter === 'Farmácia':
  // - mostra só farmácias
  //
  // Isso é melhor para performance e já prepara o app para cache.
  // ─────────────────────────────────────────────

  const filteredPlaces = React.useMemo(() => {
    if (!position) return [];

    return places
      .map((place) => {
        const normalized = normalizeOverpassPlace(place);
        if (!normalized) return null;

        const tags = normalized.tags || {};
        const cat = getCategoryInfo(tags);

        if (!cat) return null;
        if (shouldBlockByTags(tags)) return null;

        // Filtro escolhido no carrossel.
        if (activeFilter && cat.label !== activeFilter) {
          return null;
        }

        const nome = getPlaceName(tags, cat.label);

        if (!nome) return null;

        return {
          ...normalized,
          _category: cat,
          _name: nome,
          _label: truncateLabel(nome),
          _distance: getDistanceMeters(
            position.lat,
            position.lng,
            normalized._normalizedLat,
            normalized._normalizedLng
          ),
        };
      })
      .filter(
        (
          place
        ): place is OverpassPlace & {
          _normalizedLat: number;
          _normalizedLng: number;
          _type: string;
          _category: CategoryInfo;
          _name: string;
          _label: string;
          _distance: number;
        } => place !== null
      )

      // Remove duplicados exatos node/way/relation.
      .filter((place, index, self) => {
        return (
          index ===
          self.findIndex(
            (p) => `${p._type}-${p.id}` === `${place._type}-${place.id}`
          )
        );
      })

      // Remove lugares com mesmo nome muito próximos.
      .filter((place, index, self) => {
        const currentName = normalizeText(place._name);

        const duplicateIndex = self.findIndex((p) => {
          const sameName = normalizeText(p._name) === currentName;

          const close =
            getDistanceMeters(
              place._normalizedLat,
              place._normalizedLng,
              p._normalizedLat,
              p._normalizedLng
            ) <= 45;

          return sameName && close;
        });

        return duplicateIndex === index;
      })

      // Ordena por distância.
      // Quando tem filtro ativo, isso faz aparecer primeiro os mais próximos.
      .sort((a, b) => a._distance - b._distance)

      // Limite para não poluir o mapa.
      // Com filtro: até 40 pontos.
      // Sem filtro: até 80 pontos.
      .slice(0, activeFilter ? 40 : 80);
  }, [places, position, activeFilter]);

  return (
    <>
      <button
        onClick={centrarNoUsuario}
        className="absolute bottom-40 lg:bottom-28 right-4 lg:right-6 w-14 h-14 bg-card/85 backdrop-blur-xl border border-border/50 rounded-full flex items-center justify-center shadow-2xl z-[400] transition-all hover:scale-110 active:scale-90 text-primary"
        title="Centralizar no GPS"
      >
        <Navigation size={26} className="fill-current" />
      </button>

      {position && (
        <Marker
          position={position}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="user-location-container">
                <div class="user-location-dot"></div>
                <div class="user-location-pulse"></div>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
        >
          <Popup>Você está aqui!</Popup>
        </Marker>
      )}

      {loading && position && (
        <CircleMarker
          center={position}
          pathOptions={{
            color: '#2563EB',
            fillOpacity: 0,
            weight: 2,
            dashArray: '5,5',
          }}
          radius={40}
        />
      )}

      {filteredPlaces.map((place) => {
        const cat = place._category;
        const nome = place._name;
        const label = place._label;

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html:
            '<div class="poi-marker" style="--marker-color: ' +
            cat.color +
            '">' +
            '<span class="poi-emoji">' +
            cat.icon +
            '</span>' +
            '<div class="marker-label">' +
            label +
            '</div>' +
            '</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        return (
          <Marker
            key={`${place._type}-${place.id}`}
            position={[place._normalizedLat, place._normalizedLng]}
            icon={icon}
          >
            <Popup className="custom-popup">
              <div className="p-3 flex flex-col gap-1 min-w-[220px]">
                <div className="flex items-start justify-between gap-3 mb-1 pr-4">
                  <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2">
                    {nome}
                  </h3>

                  <span className="text-xl leading-none pt-0.5">
                    {cat.icon}
                  </span>
                </div>

                <div
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit"
                  style={{
                    backgroundColor: cat.color + '20',
                    color: cat.color,
                  }}
                >
                  {cat.label}
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Aproximadamente {Math.round(place._distance)}m de distância
                </p>

                {place.tags['addr:street'] && (
                  <p className="text-xs text-muted-foreground mt-1 leading-snug flex items-start gap-1">
                    <span className="mt-0.5 text-xs">📍</span>
                    <span>
                      {place.tags['addr:street']}
                      {place.tags['addr:housenumber']
                        ? ', ' + place.tags['addr:housenumber']
                        : ''}
                    </span>
                  </p>
                )}

                <button
                  className="mt-3 w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs py-2 rounded-lg transition-colors border border-primary/20 flex items-center justify-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();

                    onAdicionar?.({
                      lat: place._normalizedLat,
                      lng: place._normalizedLng,
                    } as LatLng);
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

// ─────────────────────────────────────────────
// Permite clicar no mapa para adicionar lembrete
// ─────────────────────────────────────────────

function AdicionarMarcador({
  onAdicionar,
  enabled,
}: {
  onAdicionar: (latlng: LatLng) => void;
  enabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onAdicionar(e.latlng);
    },
  });

  return null;
}

function FlyToPoint({ point }: { point?: [number, number] | null }) {
  const map = useMap();

  React.useEffect(() => {
    if (!point) return;
    map.flyTo(point, 16, { animate: true });
  }, [map, point]);

  return null;
}

// ─────────────────────────────────────────────
// Componente principal do mapa
// ─────────────────────────────────────────────

export default function Mapa({
  marcadores,
  onAdicionar,
  preview = false,
  center,
  forceStyle,
  createOnMapMode = false,
  focusPoint,
}: {
  marcadores: Marcador[];
  onAdicionar?: (latlng: LatLng) => void;
  preview?: boolean;
  center?: [number, number];
  forceStyle?: 'light' | 'dark';
  createOnMapMode?: boolean;
  focusPoint?: [number, number] | null;
}) {
  const [isClient, setIsClient] = React.useState(false);
  const mapRef = React.useRef<any>(null);

  const [mapStyle, setMapStyle] = React.useState<'light' | 'dark'>('light');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [preferredCategories, setPreferredCategories] = React.useState<string[]>([]);

  // Filtro ativo no carrossel.
  // null = todos.
  // "Farmácia" = só farmácia.
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // ─────────────────────────────────────────────
  // Carrega preferência de estilo do mapa
  // ─────────────────────────────────────────────

  React.useEffect(() => {
    if (!isClient) return;

    async function loadPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('map_style')
          .eq('id', user.id)
          .single();

        if (!error && data?.map_style) {
          setMapStyle(data.map_style as 'light' | 'dark');
          localStorage.setItem('AlertLoc_map_style', data.map_style);
        }

        const { data: preferencesData } = await supabase
          .from('profiles')
          .select('map_preferred_categories')
          .eq('id', user.id)
          .single();

        if (Array.isArray(preferencesData?.map_preferred_categories)) {
          setPreferredCategories(preferencesData.map_preferred_categories);
        }

        if (!error && data?.map_style) return;
      }

      const local = localStorage.getItem('AlertLoc_map_style');

      if (local === 'light' || local === 'dark') {
        setMapStyle(local);
      } else if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setMapStyle('dark');
      }

      const localPreferred = localStorage.getItem('AlertLoc_map_preferred_categories');
      if (localPreferred) {
        try {
          const parsed = JSON.parse(localPreferred);
          if (Array.isArray(parsed)) setPreferredCategories(parsed);
        } catch {
          setPreferredCategories([]);
        }
      }
    }

    loadPreferences();
  }, [isClient, supabase]);

  const updateMapStyle = async (newStyle: 'light' | 'dark') => {
    setMapStyle(newStyle);
    localStorage.setItem('AlertLoc_map_style', newStyle);

    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ map_style: newStyle })
          .eq('id', userId);
      } catch (e) {
        // Ignora erro se a coluna não existir.
      }
    }
  };

  if (!isClient) return null;

  const MAP_STYLES = {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  const initialCenter: [number, number] = center || [-15.7801, -47.9292];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      className="overflow-hidden"
    >
      {/* ════════════ UI FLUTUANTE ESTILO APP ════════════ */}
      {!preview && (
        <div className="absolute top-20 left-6 right-6 lg:top-6 lg:left-auto lg:right-6 z-[400] flex flex-col gap-3 lg:max-w-[420px]">
          {/* 
            Carrossel de filtros.
            
            Importante:
            - Agora NÃO usa slice(0, 10).
            - Mostra todas as categorias do OVERPASS_FILTERS.
            - O botão "Todos" limpa o filtro.
            - O clique NÃO busca novamente na API.
            - O clique só filtra os pontos já carregados.
            
            Futuro cache:
            - Pode trocar essa lógica para:
              1. clicar no filtro
              2. consultar cache específico daquela categoria
              3. se não existir, buscar Overpass só daquela categoria
          */}
          <div className="flex max-h-[260px] gap-2 overflow-auto no-scrollbar py-1 lg:flex-wrap lg:justify-end">
            <button
              onClick={() => setActiveFilter(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-xs font-bold shadow-lg transition-all hover:translate-y-[-2px] active:scale-95 border border-border/40 ${activeFilter === null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card/80 backdrop-blur-md text-foreground'
                }`}
            >
              <span className="text-sm">✨</span>
              <span>Todos</span>
            </button>

            {[...OVERPASS_FILTERS]
              .sort((a, b) => {
                const aIndex = preferredCategories.indexOf(a.label);
                const bIndex = preferredCategories.indexOf(b.label);
                const aRank = aIndex === -1 ? 999 : aIndex;
                const bRank = bIndex === -1 ? 999 : bIndex;
                if (aRank !== bRank) return aRank - bRank;
                return a.priority - b.priority;
              })
              .map((cat, i) => (
              <button
                key={`${cat.label}-${i}`}
                onClick={() => setActiveFilter(cat.label)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-xs font-bold shadow-lg transition-all hover:translate-y-[-2px] active:scale-95 border border-border/40 ${activeFilter === cat.label
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card/80 backdrop-blur-md text-foreground'
                  }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={initialCenter}
        zoom={preview ? 16 : 4}
        scrollWheelZoom={!preview}
        dragging={!preview}
        touchZoom={!preview}
        doubleClickZoom={!preview}
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
        }}
        className="z-0"
      >
        <TileLayer
          key={forceStyle || mapStyle}
          url={MAP_STYLES[forceStyle || mapStyle]}
          attribution="&copy; OpenStreetMap & Carto"
        />

        {!preview && <FlyToPoint point={focusPoint} />}

        {!preview && (
          <>
            <LocationMarker
              onAdicionar={onAdicionar}
              activeFilter={activeFilter || undefined}
            />

            {onAdicionar && (
              <AdicionarMarcador
                onAdicionar={onAdicionar}
                enabled={createOnMapMode}
              />
            )}
          </>
        )}

        {/* Marcadores de lembretes já criados pelo usuário */}
        {marcadores.map((m, i) => {
          const logoSrc = mapStyle === 'dark' ? '/logob.png' : '/logop.png';

          const glowColor =
            mapStyle === 'dark'
              ? 'drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))'
              : 'drop-shadow(0 0 6px rgba(0,0,0,0.8)) drop-shadow(0 0 12px rgba(0,0,0,0.4))';

          const markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                <img src="${logoSrc}" style="width:36px;height:36px;object-fit:contain;filter:${glowColor};" />
                <div class="marker-label">${m.nome}</div>
              </div>
            `,
            iconSize: [36, 56],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
          });

          return (
            <Marker key={i} position={[m.lat, m.lng]} icon={markerIcon}>
              <Popup className="custom-popup">
                <div className="p-3 min-w-[210px] space-y-2">
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{m.nome}</h3>
                    {m.categoria && (
                      <p className="text-xs text-muted-foreground mt-1">{m.categoria}</p>
                    )}
                  </div>
                  {m.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{m.descricao}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      Ver detalhes
                    </button>
                    {onAdicionar && (
                      <button
                        type="button"
                        className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdicionar({ lat: m.lat, lng: m.lng } as LatLng);
                        }}
                      >
                        Criar aqui
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Círculo usado no preview do detalhe/criação do lembrete */}
        {center && preview && (
          <Circle
            center={center}
            radius={100}
            pathOptions={{
              color: '#2563EB',
              fillColor: '#2563EB',
              fillOpacity: 0.2,
            }}
          />
        )}
      </MapContainer>

      {!preview && (
        <div className="absolute bottom-24 left-4 lg:top-6 lg:right-6 lg:bottom-auto lg:left-auto flex flex-col gap-3 z-[400]">
          <button
            onClick={(e) => {
              e.preventDefault();
              updateMapStyle(mapStyle === 'light' ? 'dark' : 'light');
            }}
            title={
              mapStyle === 'light'
                ? 'Ativar modo escuro'
                : 'Ativar modo claro'
            }
            className="w-14 h-14 bg-card/85 backdrop-blur-xl border border-border/50 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90"
          >
            {mapStyle === 'light' ? (
              <Moon size={24} className="text-foreground" />
            ) : (
              <Sun size={24} className="text-foreground" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
