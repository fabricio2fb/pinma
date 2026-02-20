'use client';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const MapPin = ({ priority }: { priority: 'Normal' | 'Urgente' }) => (
    <div 
      className={`w-4 h-4 rounded-full shadow-md
        ${priority === 'Urgente' 
          ? 'bg-destructive' 
          : 'bg-card border-2 border-secondary'
        }`
      } 
    />
);


export default function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <div className="text-center text-muted-foreground p-8 bg-card rounded-lg m-4 border">
          <h3 className="font-bold text-lg mb-2 text-foreground">Mapa indisponível</h3>
          <p className="text-sm">
            A chave da API do Google Maps não foi configurada.
          </p>
        </div>
      </div>
    );
  }

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
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: -23.55052, lng: -46.633308 }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
            {reminderPositions.map((pos, i) => (
                <AdvancedMarker key={i} position={pos}>
                    <MapPin priority={pos.priority} />
                </AdvancedMarker>
            ))}
        </Map>
      </APIProvider>
    </div>
  );
}
