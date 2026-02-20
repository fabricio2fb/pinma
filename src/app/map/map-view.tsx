'use client';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { LogoIcon } from '@/components/icons/logo';
import { mockReminders } from '@/lib/data';

export default function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <div className="text-center text-muted-foreground p-8 glassmorphism rounded-2xl m-4">
          <h3 className="font-headline text-lg font-bold mb-2">Configuração do Mapa Necessária</h3>
          <p className="text-sm">
            A chave da API do Google Maps está faltando.
            <br />
            Por favor adicione <code className="bg-white/10 p-1 rounded-md text-accent">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> ao seu arquivo .env.local.
          </p>
        </div>
      </div>
    );
  }

  const mapStyle = [
      { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
      { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
      { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
      { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
      { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
      { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
      { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
      { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
      { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
      { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
      { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
      { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
      { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
      { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
  ];

  const reminderPositions = [
      {lat: -23.550520, lng: -46.633308, priority: 'Normal'},
      {lat: -23.5613, lng: -46.6565, priority: 'Urgente'},
      {lat: -23.5475, lng: -46.6361, priority: 'Normal'},
      {lat: -23.5869, lng: -46.6817, priority: 'Urgente'},
  ]

  return (
    <div className="h-full w-full">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={mapId}
          styles={mapStyle}
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: -23.55052, lng: -46.633308 }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
            {reminderPositions.map((pos, i) => (
                <AdvancedMarker key={i} position={pos}>
                    <LogoIcon className={pos.priority === 'Urgente' ? 'text-secondary' : 'text-primary'} />
                </AdvancedMarker>
            ))}
        </Map>
      </APIProvider>
    </div>
  );
}
